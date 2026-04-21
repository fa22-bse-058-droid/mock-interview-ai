from django.urls import path

from .views import EvaluateAnswerView, InterviewReportView, QuestionListView

urlpatterns = [
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('evaluate/', EvaluateAnswerView.as_view(), name='evaluate-answer'),
    path('report/', InterviewReportView.as_view(), name='interview-report'),
]
