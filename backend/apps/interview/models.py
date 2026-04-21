import uuid

from django.db import models


class InterviewSession(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    STATUS_CHOICES = [
        ('setup', 'Setup'),
        ('round1', 'Round 1 - OOP & PF'),
        ('round2', 'Round 2 - DSA & DB'),
        ('round3', 'Round 3 - Domain & HR'),
        ('completed', 'Completed'),
    ]

    session_id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    candidate_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='setup')
    current_round = models.IntegerField(default=1)

    round1_score = models.FloatField(null=True, blank=True)
    round2_score = models.FloatField(null=True, blank=True)
    round3_score = models.FloatField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)

    communication_score = models.FloatField(null=True, blank=True)
    technical_score = models.FloatField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)

    eye_contact_percentage = models.FloatField(default=0)
    expressions_data = models.JSONField(default=dict)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    improvement_plan = models.JSONField(default=list)


class InterviewAnswer(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='answers',
    )
    round_number = models.IntegerField()
    question_text = models.TextField()
    question_category = models.CharField(max_length=50)
    answer_transcript = models.TextField()
    score = models.FloatField()
    keywords_matched = models.JSONField(default=list)
    keywords_missed = models.JSONField(default=list)
    time_taken_seconds = models.IntegerField()
    ai_feedback = models.TextField()
    hesitation_count = models.IntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)
