import os
from django.conf import settings
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from ..profiles.models import User
from django import forms
class CustomUserCreationForm(UserCreationForm):
    image = forms.ImageField(required=False)
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')#, 'gender'


class CustomUserUpdateForm(UserChangeForm):
    password = None  # No incluir el campo de contraseña

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'image')
        widgets = {
            'image': forms.FileInput(attrs={'class': 'form-control-file'}),
        }

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            if not image.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise forms.ValidationError("Por favor, sube una imagen válida (jpg, jpeg, png).")
        return image

    def save(self, commit=True):
        user = super().save(commit=False)
        image = self.cleaned_data.get('image')
        print(image)
        # Guardar la imagen antigua ANTES de que sea sobreescrita
        old_image = User.objects.get(pk=user.pk).image  # Obtiene la imagen antes de ser modificada
        print(old_image)
        print("------------------222")
        if old_image != image and old_image is None:
            # despciptar para poder eliminar la fotor de perfil
            old_image_url = old_image.url
            print(f"URL de la imagen anterior: {old_image_url}")
            print("------------------")

            # Convertimos la URL a la ruta de archivo (quitamos el /media/ del principio)
            if old_image_url.startswith('/media/'):
                #eliminar no se ocupar ya que desde la base de datos no viene con el /media/  viene asi  "users/descarga_2.jpeg"
                old_image_path = os.path.join(settings.MEDIA_ROOT, old_image_url.replace('/media/', ''))

                print(f"Ruta completa de la imagen anterior: {old_image_path}")

                # Verificar que el archivo existe y eliminar la imagen anterior
                if os.path.exists(old_image_path):
                    print(f"Eliminando la imagen anterior: {old_image_path}")
                    os.remove(old_image_path)

        if commit:
            user.save()
        return user

class RemoveProfileImageForm(forms.ModelForm):
    class Meta:
        model = User
        fields = []  # Indica que no hay campos que se mostrarán al usuario

    def save(self, commit=True):
        user = super().save(commit=False)
        # Guardar la imagen antigua ANTES de eliminarla
        old_image = user.image

        if old_image:  # Si hay una imagen existente
            old_image_path = old_image.path
            if os.path.exists(old_image_path):
                os.remove(old_image_path)

        # Establecer la imagen del perfil a `None`, lo que hará que se utilice la predeterminada en `get_image()`
        user.image = None

        if commit:
            user.save()
        return user