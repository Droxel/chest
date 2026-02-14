document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatArea = document.getElementById('chat-area');

    // Структура сообщения (на будущее для сервера)
    // { id: 1, text: "Привет", sender: "me", timestamp: ... }
    
    // Функция отправки сообщения
    function sendMessage() {
        const text = input.value.trim();
        
        if (text !== "") {
            addMessageToUI(text, 'me');
            input.value = ''; // Очистить поле
            input.focus();    // Вернуть фокус
        }
    }

    // Добавление сообщения в DOM
    function addMessageToUI(text, sender) {
        // Создаем контейнер сообщения
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        
        // Добавляем двойной клик для реакции
        msgDiv.addEventListener('dblclick', function() {
            this.classList.toggle('liked');
        });

        // Время
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');

        // Собираем HTML
        msgDiv.innerHTML = `
            ${escapeHtml(text)}
            <span class="time">${timeString}</span>
            <div class="reaction">❤️</div>
        `;

        chatArea.appendChild(msgDiv);
        scrollToBottom();
    }

    // Авто-скролл вниз
    function scrollToBottom() {
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Защита от XSS (важно для безопасности в будущем)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Обработчики событий ---

    // Клик по кнопке
    sendBtn.addEventListener('click', sendMessage);

    // Нажатие Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});