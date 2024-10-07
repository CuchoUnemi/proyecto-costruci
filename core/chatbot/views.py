import json

from django.shortcuts import get_object_or_404
from django.views import View
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView
from .chatbot import chatbot_response  # Importar la función de chatbot
from .models import ChatSession, Message


class ChatBotView(View):
    def post(self, request, *args, **kwargs):
        print("ChatBotView(View)")
        print("------------")
        data = json.loads(request.body)
        message_text = data.get('message', '')
        new_session = data.get('new_session', False)  # Si se debe iniciar una nueva sesión
        session_id = data.get('session_id', None)  # Intentar obtener el session_id del cliente

        chatbot_reply = chatbot_response(message_text)
        print(f'{data}')
        print("---------")
        print(f'{new_session}===new_session')
        print(f'{session_id}===session_id')
        # Verificar si el usuario está autenticado
        if request.user.is_authenticated:
            print("ChatBotView(View)--------autenticado ")
            # Si se solicita una nueva sesión o no existe una sesión activa, crear una nueva
            if new_session or session_id is None:
                chat_session = ChatSession.objects.create(user=request.user, session_name=message_text[:50])
                session_id = chat_session.session_id
            else:
                # Buscar la sesión existente por el session_id
                try:
                    chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)
                    users = request.user
                    print(users)
                    print("Wwwwwww")
                    print(session_id)
                    print("SADASFASDFASDFASDFASDF")
                    print(f'{chat_session.is_active}; secion activa ')

                    # Verificar si la sesión sigue activa
                    if not chat_session.is_active:
                        return JsonResponse({'error': 'La sesión de chat está inactiva.'}, status=403)
                        print("chat no activo")
                except ChatSession.DoesNotExist:
                    return JsonResponse({'error': 'Sesión no encontrada'}, status=404)

            # Guardar el mensaje del usuario
            Message.objects.create(chat_session=chat_session, sender='user', text=message_text)

            # Guardar la respuesta del chatbot
            Message.objects.create(chat_session=chat_session, sender='bot', text=chatbot_reply)

            # Retornar la respuesta y el session_id para que el cliente sepa qué sesión usar
            return JsonResponse({
                'response': chatbot_reply,
                'session_id': str(chat_session.session_id)
            })

        else:
            # Manejar a los usuarios invitados con un límite de 3 preguntas
            if 'guest_attempts' not in request.session:
                request.session['guest_attempts'] = 0  # Iniciar el contador si no existe

            if request.session['guest_attempts'] < 3:
                request.session['guest_attempts'] += 1  # Incrementar el contador
            else:
                return JsonResponse({'error': 'Límite de preguntas alcanzado. Regístrate para continuar.'}, status=403)

            return JsonResponse({
                'response': chatbot_reply,
                'session_id': 'guest'
            })


class ChatBotTemplateView(TemplateView):
    template_name = 'chat_ia.html'

    def get_context_data(self, **kwargs):
        context = {"title1": "Chat Bot"}

        if self.request.user.is_authenticated:
            # Obtener las sesiones de chat del usuario autenticado
            chat_sessions = ChatSession.objects.filter(user=self.request.user, is_active=True).order_by('-started_at')

            # Obtener el historial de mensajes para cada sesión de chat
            chat_history = []
            for session in chat_sessions:
                messages = Message.objects.filter(chat_session=session).order_by('timestamp')
                chat_history.append({
                    'id': session.id,
                    'session_id': session.session_id,
                    'session_name': session.session_name,
                    'messages': list(messages.values('timestamp', 'text'))
                })

            context['chat_history'] = chat_history

        return context


def get_session_messages(request, session_id):  # poner en el script para el manejo de errores cu
    if request.user.is_authenticated:
        try:
            # Obtener la sesión de chat correspondiente al session_id
            chat_session = ChatSession.objects.get(session_id=session_id, user=request.user, is_active=True)
            # Filtrar mensajes por la sesión de chat
            messages = Message.objects.filter(chat_session=chat_session).order_by('timestamp')
            messages_data = [{'sender': message.sender, 'text': message.text} for message in messages]
            print("____________________________")
            print(messages_data)
            return JsonResponse({'messages': messages_data, 'session_id': session_id})
        except ChatSession.DoesNotExist:
            return JsonResponse({'messages': [], 'error': 'Chat session not found.'}, status=404)
    return JsonResponse({'messages': []})



@require_POST
def delete_session(request, session_id):
    try:
        session = ChatSession.objects.get(session_id=session_id, is_active=True)
        session.delete()  # Esto llamará al método delete() que hace la eliminación lógica
        return JsonResponse({'success': True, 'message': 'Sesión eliminada exitosamente.'})
    except ChatSession.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Sesión no encontrada o ya eliminada.'})

