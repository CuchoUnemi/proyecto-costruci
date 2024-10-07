from django.db import models
from django.conf import settings
import uuid

# Modelo para las sesiones de chat
class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Identificador único de la sesión
    session_name = models.CharField(max_length=255, blank=True)  # Nombre de la sesión
    started_at = models.DateTimeField(auto_now_add=True)  # Tiempo en el que la sesión se inicia
    is_active = models.BooleanField(default=True)  # Campo para eliminación lógica

    def __str__(self):
        return f"Chat session for {self.user.username} at {self.started_at}"

    def delete(self, *args, **kwargs):
        """
        Realiza una eliminación lógica al marcar la sesión como inactiva.
        """
        self.is_active = False
        self.save()

# Modelo para los mensajes individuales dentro de cada sesión
class Message(models.Model):
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)  # Relación con la sesión de chat
    sender = models.CharField(max_length=255)  # Remitente del mensaje: usuario o bot
    text = models.TextField()  # Contenido del mensaje
    timestamp = models.DateTimeField(auto_now_add=True)  # Marca de tiempo del mensaje

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"