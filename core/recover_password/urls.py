from django.urls import path
from . import views as v

app_name = "RecoverPassword"
urlpatterns = [
    path('reset_password/', v.CustomPasswordResetView.as_view(), name='reset_password'),
    path('reset_password_sent/', v.CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    # path('reset/<uidb64>/<token>/', v.test_password_reset_link, name='test_reset_link'),
    path('reset/<uidb64>/<token>/', v.CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset_password_complete/', v.CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),

    path('password_reset/token_invalid/', v.TokenInvalidPasswordResetView.as_view(), name='password_reset_token_invalid'),

]
