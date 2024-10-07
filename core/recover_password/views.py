from django.contrib.auth.views import (PasswordResetView,
                                       PasswordResetDoneView,
                                       PasswordResetConfirmView,
                                       PasswordResetCompleteView
                                       )
from django.urls import reverse_lazy
from django.contrib.auth.forms import PasswordResetForm
# from app.security.models import User
from django.contrib import messages
from django.shortcuts import redirect
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.views.generic.edit import FormView
from ..profiles.models import User





from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.http import HttpResponse
from ..profiles.models import User  # Ajusta la importación según tu proyecto

def test_password_reset_link(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        if default_token_generator.check_token(user, token):
            return HttpResponse("Token válido")
        else:
            return redirect('RecoverPassword:password_reset_token_invalid')
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Token inválidoooooooo")

class CustomPasswordResetView(PasswordResetView):
    template_name = 'password_reset_form.html'
    email_template_name = 'password_reset_email.html'
    success_url = reverse_lazy('RecoverPassword:password_reset_done')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            return super().form_valid(form)
        else:
            messages.error(self.request, "No hay una cuenta asociada con ese correo electrónico.")
            return redirect('RecoverPassword:reset_password')


class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'password_reset_done.html'


class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'password_reset_complete.html'


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'password_reset_confirm.html'
    success_url = reverse_lazy('RecoverPassword:password_reset_complete')

    # def dispatch(self, *args, **kwargs,):
    #     try:
    #         # Intenta decodificar el UID y validar el token
    #         uid = urlsafe_base64_decode(self.kwargs['uidb64']).decode()
    #         user = User.objects.get(pk=uid)
    #         if default_token_generator.check_token(user, self.kwargs['token']):
    #             print("!!!!!!!!!!!!!!!!!!")
    #             return super().dispatch(*args, **kwargs)
    #         else:
    #             print("WWWWWWWWWWWWWWWWWWWWWWWW")
    #             raise ValueError("Token inválido o expirado")
    #     except (TypeError, ValueError, OverflowError, User.DoesNotExist):
    #         # Si el token es inválido o ha expirado, muestra la plantilla de expiración
    #         return redirect('RecoverPassword:password_reset_token_invalid')
    #

    # def form_invalid(self, form):
    #     # Enviar un mensaje de error y redirigir a la página de token inválido
    #     messages.error(self.request, "El enlace de recuperación de contraseña es inválido o ha expirado.")
    #     return redirect('RecoverPassword:password_reset_token_invalid')
    #
    # def test_password_reset_link(self, request, uidb64, token):
    #     try:
    #         uid = force_str(urlsafe_base64_decode(uidb64))
    #         user = User.objects.get(pk=uid)
    #         if not default_token_generator.check_token(user, token):
    #             return redirect('RecoverPassword:password_reset_token_invalid')
    #     except (TypeError, ValueError, OverflowError, User.DoesNotExist):
    #         return redirect('RecoverPassword:password_reset_token_invalid')

class TokenInvalidPasswordResetView(PasswordResetView):
    template_name = 'password_reset_token_invalid.html'
    email_template_name = 'password_reset_email.html'
    success_url = reverse_lazy('RecoverPassword:password_reset_done')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            return super().form_valid(form)
        else:
            messages.error(self.request, "No hay una cuenta asociada con ese correo electrónico.")
            return redirect('RecoverPassword:reset_password')
