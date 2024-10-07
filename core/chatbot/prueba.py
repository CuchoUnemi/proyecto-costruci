class ChatBotView(View):
    def post(self, request, *args, **kwargs):
        print("ChatBotView(View)")
        data = json.loads(request.body)
        message_text = data.get('message', '')
        new_session = data.get('new_session', False)  # Si se debe iniciar una nueva sesión
        session_id = data.get('session_id', None)  # Intentar obtener el session_id del cliente

        chatbot_reply = chatbot_response(message_text)

        # Verificar si el usuario está autenticado
        if request.user.is_authenticated:
            print("Usuario autenticado")

            # Si se solicita una nueva sesión o no existe una sesión activa, crear una nueva
            if new_session or session_id is None:
                chat_session = ChatSession.objects.create(user=request.user, session_name=message_text[:50])
                session_id = chat_session.session_id
            else:
                # Buscar la sesión existente por el session_id y asegurarse de que está activa
                try:
                    chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)

                    # Verificar si la sesión sigue activa
                    if not chat_session.is_active:
                        return JsonResponse({'error': 'La sesión de chat está inactiva.'}, status=403)
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
