document.addEventListener('DOMContentLoaded', function () {
    const chatInput = document.getElementById('chat-input');
    const chatbox = document.getElementById('chatbox');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', function () {
        sendMessage();
    });

    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();

        if (message === '') return;

        appendUserMessage(message);
        chatInput.value = '';

        fetch('api/chatbot/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            appendBotMessage(data.response);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function appendUserMessage(message) {
        const userMessage = document.createElement('div');
        userMessage.className = 'flex justify-end mb-4';
        userMessage.innerHTML = `
            <div class="bg-blue-500 text-white p-3 rounded-lg">
                ${message}
            </div>
        `;
        chatbox.appendChild(userMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function appendBotMessage(message) {
        const botMessage = document.createElement('div');
        botMessage.className = 'flex items-start mb-4';
        botMessage.innerHTML = `
            <img src="{% static 'img/mmmmmmmmmmmmmmm.jpg' %}" alt="Avatar de UnemIA" class="w-6 h-6 rounded-full mr-2">
            <div class="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 p-3 rounded-lg">
                ${message}
            </div>
        `;
        chatbox.appendChild(botMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
