from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
from django.shortcuts import redirect, render
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from .forms import CustomUserCreationForm, CustomUserUpdateForm, RemoveProfileImageForm


# Perfil
@login_required
def profile(request):
    data = {"title1": "UIA - Perfil",
            "title2": "Perfil de Usuario"}

    return render(request, "profile.html", data)


# Actualizar perfil
@login_required
def update_profile(request):
    data = {"title1": "UIA - Actualizar Perfil", "title2": "Actualizar Perfil"}

    if request.method == 'POST':
        form = CustomUserUpdateForm(request.POST, request.FILES, instance=request.user)

        if form.is_valid():
            form.save()
            messages.success(request, '¡Tu perfil ha sido actualizado exitosamente!')
            return redirect('profiles:auth_profile')
        else:
            messages.error(request, 'Error en los datos del formulario.')
    else:
        form = CustomUserUpdateForm(instance=request.user)

    return render(request, 'update_profile.html', {'form': form, **data})


# Actualizar contraseña
@login_required
def actulizarcontra(request):
    # Cambiar contraseña del usuario
    data = {"title1": "CS-ACTUALIZAR", "title2": "Actualizar Contraseña"}
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        data["form"] = form
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Actualiza la sesión con la nueva contraseña
            return redirect('home:homeI')  # Redirige a la página de perfil o cualquier otra página
        else:
            messages.error(request, 'Por favor corrige los errores a continuación.', extra_tags='alert-error')
    else:
        form = PasswordChangeForm(request.user)
        data["form"] = form
    return render(request, 'contra_actualizar.html', data)



@login_required
def remove_image(request):
    data = {"title1": "CS-ACTUALIZAR", "title2": "Eliminar foto de perfil"}
    if request.method == 'POST':
        form = RemoveProfileImageForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False}, status=400)
    else:
        form = RemoveProfileImageForm(instance=request.user)
    return render(request, 'profile.html', data)
