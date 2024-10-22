# webscraping/urls.py
from django.urls import path
from .views import actualizar_chatbot

urlpatterns = [
    path('actualizar_chatbot/', actualizar_chatbot, name='actualizar_chatbot'),
]
