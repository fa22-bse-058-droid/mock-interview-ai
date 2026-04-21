from django.urls import path

from .views import (
    CompleteInterviewView,
    InterviewReportView,
    NextQuestionView,
    StartInterviewView,
    SubmitAnswerView,
)

urlpatterns = [
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('<uuid:id>/next-question/', NextQuestionView.as_view(), name='next-question'),
    path('<uuid:id>/submit-answer/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('<uuid:id>/complete/', CompleteInterviewView.as_view(), name='complete-interview'),
    path('<uuid:id>/report/', InterviewReportView.as_view(), name='interview-report'),
]
