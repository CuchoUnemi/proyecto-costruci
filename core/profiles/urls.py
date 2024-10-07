from django.urls import path
from . import views

app_name = "profiles"
urlpatterns = [
    path('profile/', views.profile, name='auth_profile'),
    path('update_profile/', views.update_profile, name='auth_update_profile'),
    path('remove_image/', views.remove_image, name='auth_remove_image'),
    path('update_contra/', views.actulizarcontra, name='auth_update_contra'),
]
