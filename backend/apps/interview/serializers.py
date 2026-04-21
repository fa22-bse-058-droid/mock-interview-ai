from rest_framework import serializers

from .models import InterviewAnswer, InterviewSession


class InterviewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSession
        fields = '__all__'
        read_only_fields = [
            'session_id',
            'status',
            'current_round',
            'round1_score',
            'round2_score',
            'round3_score',
            'overall_score',
            'communication_score',
            'technical_score',
            'confidence_score',
            'started_at',
            'completed_at',
            'strengths',
            'weaknesses',
            'improvement_plan',
        ]


class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnswer
        fields = '__all__'
        read_only_fields = [
            'score',
            'keywords_matched',
            'keywords_missed',
            'ai_feedback',
            'hesitation_count',
            'answered_at',
        ]
