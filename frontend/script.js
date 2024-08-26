document.addEventListener('DOMContentLoaded', () => {
    const leaveChatBtn = document.getElementById('leaveChatBtn');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    const chatArea = document.getElementById('chatArea');
    const chatContainer = document.getElementById('chatContainer');
    let socket;
    let username;

    // Check if the username is already stored in localStorage
    if (localStorage.getItem('username')) {
        username = localStorage.getItem('username');
        chatContainer.classList.remove('hidden');
        initializeWebSocket();
    } else {
        // Redirect to the name input page if no username is found
        window.location.href = '/';
    }

    leaveChatBtn.addEventListener('click', () => {
        if (socket) {
            socket.close();
        }
        localStorage.removeItem('username'); // Clear the username from cache when leaving
        chatContainer.classList.add('hidden');
        window.location.href = '/';
        chatArea.innerHTML = '';
    });

    sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
            messageInput.value = '';
        }
    });

    function initializeWebSocket() {
        socket = new WebSocket('wss://161d-27-6-169-190.ngrok-free.app/chatbs');

        socket.onopen = () => {
            console.log('Connected to WebSocket server.');
            socket.send(JSON.stringify({ type: 'join', username: username }));
        };

        socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            displayMessage(messageData);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server.');
            displayMessage({ username: 'System', message: 'You have been disconnected.' });
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error: ', error);
        };
    }

    function sendMessage(message) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messageData = { username: username, message: message };
            socket.send(JSON.stringify(messageData));
        }
    }

    function displayMessage({ username, message }) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`;
        chatArea.appendChild(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to the latest message
    }
});
