from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # gender = models.CharField(verbose_name='Sexo',
    #                           max_length=1,
    #                           choices=(('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro Genero')),
    #                           blank=False, null=False)

    image = models.ImageField(
        verbose_name='Archive image',
        upload_to='users/',
        max_length=1024,
        blank=True,
        null=True
    )
    email = models.EmailField(verbose_name='Email', unique=True)
    USERNAME_FIELD = "email"  # cambia el login
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    def __str__(self):
        return '{}'.format(self.username)

    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_image(self):
        if self.image:
            return self.image.url
        else:
            return '/static/img/usuario_anonimo.png'
