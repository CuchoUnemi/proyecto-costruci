from django.urls import path
from . import views

app_name = "home"

urlpatterns = [
    path('I', views.HomeTemplateView.as_view(), name='homeI'),
    path('admin/', views.AdminHomeTemplateView.as_view(), name='admin_home'),
]