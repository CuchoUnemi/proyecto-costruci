from django.shortcuts import render

# Create your views here.
from django.shortcuts import redirect, render
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from ..profiles.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from ..profiles.forms import CustomUserCreationForm,CustomUserUpdateForm

# Cerrar Sesión
@login_required
def signout(request):
    logout(request)
    return redirect("home")

# Registro de Usuarios
def signup(request):
    data = {"title1": "IC - Registro", "title2": "Registro de Usuarios"}

    if request.method == "GET":
        # Renderiza el formulario vacío en caso de GET
        return render(request, "signup.html", {"form": CustomUserCreationForm, **data})
    else:
        # Procesa el formulario enviado por POST
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            # Si el formulario es válido, guarda el usuario y muestra un mensaje de éxito
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request,
                             f"Bienvenido {username}, tu cuenta ha sido creada exitosamente. Inicia sesión para continuar.")
            return redirect("LoginRegister:auth_login")  # Redirige a la página de inicio de sesión
        else:
            # Si hay errores en el formulario, muestra el formulario con los errores
            messages.error(request, "Error al registrar el usuario. Por favor, revisa los datos ingresados.")
            return render(request, "signup.html", {"form": form, **data})


# Iniciar Sesión
def signin(request):
    data = {"title1": "IC - Login", "title2": "Inicio de Sesión"}

    if request.method == "GET":
        success_messages = messages.get_messages(request)
        return render(request, "signin.html",
                      {"form": AuthenticationForm(), "success_messages": success_messages, **data})
    else:
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("home")
            else:
                messages.error(request, "El usuario o la contraseña son incorrectos")
        return render(request, "signin.html", {"form": form, "error": "Datos inválidos", **data})