from django.urls import path
from . import views

app_name = "LoginRegister"
urlpatterns = [
    path('login/', views.signin, name="auth_login"),
    path('signup/', views.signup, name="auth_signup"),
    path('logout', views.signout, name='auth_logout'),
]
