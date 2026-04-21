from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .evaluator import AnswerEvaluator
from .models import InterviewAnswer, InterviewSession
from .questions_data import ROUND_1_QUESTIONS, ROUND_2_QUESTIONS, ROUND_3_QUESTIONS
from .serializers import InterviewSessionSerializer


ROUND_BANK = {
    1: ROUND_1_QUESTIONS,
    2: ROUND_2_QUESTIONS,
    3: ROUND_3_QUESTIONS,
}

ROUND_STATUS = {
    1: 'round1',
    2: 'round2',
    3: 'round3',
}

DIFFICULTY_ORDER = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
}


def _get_round_questions(round_number, session_difficulty):
    round_data = ROUND_BANK.get(round_number, {})
    categories = round_data.get('categories', {})
    max_level = DIFFICULTY_ORDER.get(session_difficulty, 3)

    questions = []
    for category, question_list in categories.items():
        for item in question_list:
            level = DIFFICULTY_ORDER.get(item.get('difficulty', 'hard'), 3)
            if level <= max_level:
                questions.append(
                    {
                        'question': item['question'],
                        'keywords': item['keywords'],
                        'difficulty': item['difficulty'],
                        'follow_up': item.get('follow_up', ''),
                        'category': category,
                    }
                )
    return questions


def _find_question(round_number, session_difficulty, question_text):
    for question in _get_round_questions(round_number, session_difficulty):
        if question['question'] == question_text:
            return question
    return None


def _update_round_scores(session):
    for round_number, field_name in ((1, 'round1_score'), (2, 'round2_score'), (3, 'round3_score')):
        avg_score = session.answers.filter(round_number=round_number).aggregate(avg=Avg('score'))['avg']
        setattr(session, field_name, round(avg_score, 1) if avg_score is not None else None)

    overall = session.answers.aggregate(avg=Avg('score'))['avg']
    session.overall_score = round(overall, 1) if overall is not None else None


class StartInterviewView(APIView):
    def post(self, request):
        candidate_name = request.data.get('candidate_name')
        role = request.data.get('role')
        difficulty = request.data.get('difficulty')

        if not candidate_name or not role or difficulty not in DIFFICULTY_ORDER:
            return Response(
                {
                    'detail': 'candidate_name, role, and valid difficulty (easy/medium/hard) are required.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = InterviewSession.objects.create(
            candidate_name=candidate_name,
            role=role,
            difficulty=difficulty,
            status='round1',
            current_round=1,
        )

        return Response(
            {
                'message': 'Interview session started.',
                'session': InterviewSessionSerializer(session).data,
            },
            status=status.HTTP_201_CREATED,
        )


class NextQuestionView(APIView):
    def get(self, request, id):
        session = get_object_or_404(InterviewSession, session_id=id)

        if session.status == 'completed':
            return Response({'detail': 'Interview is already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        round_number = session.current_round

        while round_number <= 3:
            eligible_questions = _get_round_questions(round_number, session.difficulty)
            answered_questions = set(
                session.answers.filter(round_number=round_number).values_list('question_text', flat=True)
            )

            for question_data in eligible_questions:
                if question_data['question'] not in answered_questions:
                    if session.current_round != round_number:
                        session.current_round = round_number
                        session.status = ROUND_STATUS[round_number]
                        session.save(update_fields=['current_round', 'status'])

                    return Response(
                        {
                            'session_id': str(session.session_id),
                            'round_number': round_number,
                            'round_title': ROUND_BANK[round_number]['title'],
                            'question': question_data['question'],
                            'category': question_data['category'],
                            'difficulty': question_data['difficulty'],
                            'follow_up': question_data['follow_up'],
                        }
                    )

            round_number += 1

        return Response({'message': 'All questions are completed. Submit interview completion.'})


class SubmitAnswerView(APIView):
    evaluator = AnswerEvaluator()

    def post(self, request, id):
        session = get_object_or_404(InterviewSession, session_id=id)

        if session.status == 'completed':
            return Response({'detail': 'Interview is already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        round_number = request.data.get('round_number', session.current_round)
        question_text = request.data.get('question_text')
        question_category = request.data.get('question_category')
        answer_text = request.data.get('answer_transcript', '')
        time_taken_seconds = request.data.get('time_taken_seconds', 0)

        if not question_text or not question_category:
            return Response(
                {'detail': 'question_text and question_category are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            round_number = int(round_number)
            time_taken_seconds = int(time_taken_seconds)
        except (TypeError, ValueError):
            return Response(
                {'detail': 'round_number and time_taken_seconds must be integers.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        question_data = _find_question(round_number, session.difficulty, question_text)
        if not question_data:
            return Response(
                {'detail': 'Question not found for this round/difficulty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        evaluation = self.evaluator.evaluate_answer(question_data, answer_text, time_taken_seconds)

        answer = InterviewAnswer.objects.create(
            session=session,
            round_number=round_number,
            question_text=question_text,
            question_category=question_category,
            answer_transcript=answer_text,
            score=evaluation['score'],
            keywords_matched=evaluation['keywords_matched'],
            keywords_missed=evaluation['keywords_missed'],
            time_taken_seconds=time_taken_seconds,
            ai_feedback=evaluation['feedback'],
            hesitation_count=evaluation['hesitation_count'],
        )

        _update_round_scores(session)
        if round_number in ROUND_STATUS and round_number > session.current_round:
            session.current_round = round_number
            session.status = ROUND_STATUS[round_number]
        session.save()

        return Response(
            {
                'answer_id': answer.id,
                'score': answer.score,
                'feedback': answer.ai_feedback,
                'keywords_matched': answer.keywords_matched,
                'keywords_missed': answer.keywords_missed,
                'hesitation_count': answer.hesitation_count,
                'round_scores': {
                    'round1_score': session.round1_score,
                    'round2_score': session.round2_score,
                    'round3_score': session.round3_score,
                    'overall_score': session.overall_score,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class CompleteInterviewView(APIView):
    evaluator = AnswerEvaluator()

    def post(self, request, id):
        session = get_object_or_404(InterviewSession, session_id=id)

        all_answers = list(session.answers.all())
        report = self.evaluator.generate_final_report(session, all_answers)

        session.status = 'completed'
        session.completed_at = timezone.now()
        session.current_round = 3

        _update_round_scores(session)

        if report:
            session.overall_score = report['overall_score']
            session.technical_score = report['technical_score']
            session.communication_score = report['communication_score']
            session.confidence_score = report['confidence_score']
            session.strengths = report['strengths']
            session.weaknesses = report['weaknesses']
            session.improvement_plan = report['improvement_plan']

        session.save()

        return Response(
            {
                'message': 'Interview completed successfully.',
                'session_id': str(session.session_id),
                'report': report,
            }
        )


class InterviewReportView(APIView):
    evaluator = AnswerEvaluator()

    def get(self, request, id):
        session = get_object_or_404(InterviewSession, session_id=id)
        all_answers = list(session.answers.all())

        report = self.evaluator.generate_final_report(session, all_answers)

        return Response(
            {
                'session': {
                    'session_id': str(session.session_id),
                    'candidate_name': session.candidate_name,
                    'role': session.role,
                    'difficulty': session.difficulty,
                    'status': session.status,
                    'current_round': session.current_round,
                    'started_at': session.started_at,
                    'completed_at': session.completed_at,
                    'round1_score': session.round1_score,
                    'round2_score': session.round2_score,
                    'round3_score': session.round3_score,
                    'overall_score': session.overall_score,
                    'communication_score': session.communication_score,
                    'technical_score': session.technical_score,
                    'confidence_score': session.confidence_score,
                    'strengths': session.strengths,
                    'weaknesses': session.weaknesses,
                    'improvement_plan': session.improvement_plan,
                },
                'answers_count': len(all_answers),
                'generated_report': report,
            }
        )
