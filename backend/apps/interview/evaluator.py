from collections import Counter


class AnswerEvaluator:
    def evaluate_answer(self, question_data, answer_text, time_taken):
        if not answer_text or len(answer_text.strip()) < 10:
            return {
                'score': 0,
                'keywords_matched': [],
                'keywords_missed': question_data['keywords'],
                'feedback': 'No answer detected. Please speak clearly.',
                'hesitation_count': 0,
            }

        answer_lower = answer_text.lower()
        keywords = question_data['keywords']

        matched = [kw for kw in keywords if kw.lower() in answer_lower]
        missed = [kw for kw in keywords if kw.lower() not in answer_lower]
        keyword_score = (len(matched) / len(keywords)) * 100 if keywords else 0

        word_count = len(answer_text.split())
        if word_count < 10:
            length_score = 10
        elif word_count < 30:
            length_score = 50
        elif word_count < 50:
            length_score = 70
        elif word_count <= 150:
            length_score = 100
        else:
            length_score = 85

        expected_time = 90
        time_score = 100 if time_taken <= expected_time else max(50, 100 - (time_taken - expected_time))

        hesitation_words = ['um', 'uh', 'uhh', 'umm', 'like', 'you know', 'basically', 'literally']
        hesitation_count = sum(answer_lower.count(h) for h in hesitation_words)
        hesitation_penalty = min(20, hesitation_count * 3)

        final_score = (
            keyword_score * 0.5
            + length_score * 0.3
            + time_score * 0.2
        ) - hesitation_penalty

        final_score = max(0, min(100, final_score))

        if final_score >= 85:
            feedback = f"Excellent! Strong answer covering {', '.join(matched[:3])}."
        elif final_score >= 70:
            feedback = f"Good answer! Consider also mentioning: {', '.join(missed[:2])}."
        elif final_score >= 50:
            feedback = f"Average answer. Key concepts missing: {', '.join(missed[:3])}."
        else:
            feedback = f"Needs improvement. Focus on: {', '.join(missed)}."

        if hesitation_count > 3:
            feedback += f" Reduce filler words (detected {hesitation_count} hesitations)."

        return {
            'score': round(final_score, 1),
            'keywords_matched': matched,
            'keywords_missed': missed,
            'feedback': feedback,
            'hesitation_count': hesitation_count,
        }

    def generate_final_report(self, session, all_answers):
        if not all_answers:
            return {}

        scores = [a.score for a in all_answers]
        overall = sum(scores) / len(scores)

        tech_answers = [
            a for a in all_answers
            if a.question_category in ['oop', 'dsa', 'databases', 'programming_fundamentals']
        ]
        tech_score = sum(a.score for a in tech_answers) / len(tech_answers) if tech_answers else overall

        word_counts = [len(a.answer_transcript.split()) for a in all_answers]
        avg_words = sum(word_counts) / len(word_counts)
        comm_score = min(100, (avg_words / 80) * 100)

        total_hesitations = sum(a.hesitation_count for a in all_answers)
        conf_score = max(0, 100 - (total_hesitations * 2))

        strengths = []
        weaknesses = []
        improvement_plan = []

        if tech_score >= 70:
            strengths.append("Strong technical knowledge")
        else:
            weaknesses.append("Technical concepts need revision")

        if comm_score >= 70:
            strengths.append("Good communication and articulation")
        else:
            weaknesses.append("Work on explaining concepts more clearly")

        if conf_score >= 70:
            strengths.append("Confident delivery with minimal hesitations")
        else:
            weaknesses.append("Too many filler words (um, uh, like)")
            improvement_plan.append("Practice speaking without filler words")

        all_missed = []
        for answer in all_answers:
            all_missed.extend(answer.keywords_missed)

        top_missed = [kw for kw, _ in Counter(all_missed).most_common(5)]

        if top_missed:
            improvement_plan.append(f"Study these concepts: {', '.join(top_missed)}")

        improvement_plan.append("Practice answering in 60-90 seconds per question")
        improvement_plan.append("Use STAR method for behavioral questions")

        return {
            'overall_score': round(overall, 1),
            'technical_score': round(tech_score, 1),
            'communication_score': round(comm_score, 1),
            'confidence_score': round(conf_score, 1),
            'strengths': strengths,
            'weaknesses': weaknesses,
            'improvement_plan': improvement_plan,
            'grade': 'Excellent' if overall >= 85 else 'Good' if overall >= 70 else 'Average' if overall >= 50 else 'Needs Work',
            'top_missed_keywords': top_missed,
        }
