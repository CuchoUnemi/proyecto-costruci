# webscraping/urls.py
from django.urls import path
from .views import actualizar_chatbot, graph_info

urlpatterns = [
    path('actualizar_chatbot/', actualizar_chatbot, name='actualizar_chatbot'),
    path('graphinfo/', graph_info, name='graphinfo'),
]
