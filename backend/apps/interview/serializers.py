from rest_framework import serializers

from .models import AnswerEvaluation, InterviewSession


class InterviewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSession
        fields = ['id', 'role', 'level', 'created_at']


class AnswerEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerEvaluation
        fields = [
            'id',
            'session',
            'question',
            'answer',
            'relevance_score',
            'confidence_score',
            'eye_contact_score',
            'overall_score',
            'feedback',
            'created_at',
        ]
        read_only_fields = [
            'relevance_score',
            'confidence_score',
            'overall_score',
            'feedback',
            'created_at',
        ]
