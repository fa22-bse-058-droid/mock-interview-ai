from django.db import models


class InterviewSession(models.Model):
    role = models.CharField(max_length=120)
    level = models.CharField(max_length=50, default='beginner')
    created_at = models.DateTimeField(auto_now_add=True)


class AnswerEvaluation(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='evaluations',
        null=True,
        blank=True,
    )
    question = models.TextField()
    answer = models.TextField(blank=True)
    relevance_score = models.FloatField(default=0)
    confidence_score = models.FloatField(default=0)
    eye_contact_score = models.FloatField(default=0)
    overall_score = models.FloatField(default=0)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
