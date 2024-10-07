from django.urls import path
from .views import *

app_name = "ChatBot"
urlpatterns = [
    path('chat/', ChatBotTemplateView.as_view(), name='chat_ia'),
    path('api/chatbot/', ChatBotView.as_view(), name='chatbot_api'),
    path('get_session_messages/<str:session_id>/', get_session_messages, name='get_session_messages'),
    path('delete_session/<str:session_id>/', delete_session, name='delete_session'),
]
