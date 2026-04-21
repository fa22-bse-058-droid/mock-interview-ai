from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .evaluator import evaluate_answer
from .models import AnswerEvaluation
from .questions_data import get_questions_for_role
from .serializers import AnswerEvaluationSerializer


class QuestionListView(APIView):
    def get(self, request):
        role = request.query_params.get('role', 'general')
        return Response({'role': role, 'questions': get_questions_for_role(role)})


class EvaluateAnswerView(APIView):
    def post(self, request):
        serializer = AnswerEvaluationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        scores = evaluate_answer(
            question=data['question'],
            answer=data.get('answer', ''),
            eye_contact_score=data.get('eye_contact_score', 50),
        )
        evaluation = AnswerEvaluation.objects.create(
            session=data.get('session'),
            question=data['question'],
            answer=data.get('answer', ''),
            eye_contact_score=scores['eye_contact_score'],
            relevance_score=scores['relevance_score'],
            confidence_score=scores['confidence_score'],
            overall_score=scores['overall_score'],
            feedback=scores['feedback'],
        )
        output = AnswerEvaluationSerializer(evaluation)
        return Response(output.data, status=status.HTTP_201_CREATED)


class InterviewReportView(APIView):
    def post(self, request):
        evaluations = request.data.get('evaluations', [])
        if not evaluations:
            return Response(
                {
                    'overall_score': 0,
                    'average_relevance': 0,
                    'average_confidence': 0,
                    'average_eye_contact': 0,
                    'improvement_tips': ['Provide at least one answer to generate a report.'],
                }
            )

        count = len(evaluations)
        avg_relevance = sum(item.get('relevance_score', 0) for item in evaluations) / count
        avg_confidence = sum(item.get('confidence_score', 0) for item in evaluations) / count
        avg_eye = sum(item.get('eye_contact_score', 0) for item in evaluations) / count
        overall = sum(item.get('overall_score', 0) for item in evaluations) / count

        tips = []
        if avg_relevance < 65:
            tips.append('Focus on directly addressing the asked question before adding extra context.')
        if avg_confidence < 65:
            tips.append('Reduce filler words and structure answers into short, clear points.')
        if avg_eye < 65:
            tips.append('Keep your gaze near the screen/camera to improve interviewer engagement.')
        if not tips:
            tips.append('Great work—maintain this structure and add role-specific examples.')

        return Response(
            {
                'overall_score': round(overall, 2),
                'average_relevance': round(avg_relevance, 2),
                'average_confidence': round(avg_confidence, 2),
                'average_eye_contact': round(avg_eye, 2),
                'improvement_tips': tips,
            }
        )
