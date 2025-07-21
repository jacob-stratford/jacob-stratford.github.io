document.addEventListener('DOMContentLoaded', () => {
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to add a message to the chat display
    function addMessage(messageText, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = messageText;
        chatDisplay.appendChild(messageDiv);

        // Scroll to the bottom to show the newest message
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // Function to handle sending a message
    function sendMessage() {
        const messageText = userInput.value.trim(); // Get text and remove whitespace

        if (messageText === '') {
            return; // Don't send empty messages
        }

        // Add user's message
        addMessage(messageText, 'user');

        // Clear the input field
        userInput.value = '';

        // Simulate a bot response after a short delay
        setTimeout(() => {
            addMessage('message response', 'bot');
        }, 500); // Wait 0.5 seconds
    }

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key in the input field
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial bot message for greeting
    addMessage('Hello! How can I help you today?', 'bot');
});
