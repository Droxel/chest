document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatArea = document.getElementById('chat-area');

    // --- ФУНКЦИЯ АВТО-ВЫСОТЫ ---
    input.addEventListener('input', function() {
        this.style.height = 'auto'; // Сбрасываем высоту
        this.style.height = (this.scrollHeight) + 'px'; // Ставим высоту контента
    });

    function sendMessage() {
        const text = input.value.trim();
        if (text !== "") {
            addMessageToUI(text, 'me');
            input.value = ''; 
            input.style.height = 'auto'; // Сбрасываем высоту после отправки
            input.focus();
        }
    }

    function addMessageToUI(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        
        msgDiv.addEventListener('dblclick', function() {
            this.classList.toggle('liked');
        });

        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');

        // Используем innerHTML только после escapeHtml для безопасности
        // Replace(/\n/g, '<br>') превращает переносы строк в теги <br>
        const formattedText = escapeHtml(text).replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            ${formattedText}
            <span class="time">${timeString}</span>
            <div class="reaction">❤️</div>
        `;

        chatArea.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    sendBtn.addEventListener('click', sendMessage);

    // --- ОБРАБОТКА ENTER ---
    input.addEventListener('keydown', (e) => {
        // Если нажат Enter БЕЗ Shift — отправляем
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Запрещаем перенос строки
            sendMessage();
        }
        // Если нажат Enter + Shift — браузер сам сделает перенос строки
    });
});