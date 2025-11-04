// API URL for the backend

const RENDER_API_URL = "https://nate-backend.onrender.com"; // deployed backend
//const RENDER_API_URL = "http://localhost:5000"; // dev backend

let accessCode = null; // Global variable to store the access code

document.addEventListener('DOMContentLoaded', () => {
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const accessCodeInput = document.getElementById('access-code-input');
    const accessCodeSubmit = document.getElementById('access-code-submit');
    const accessCodeStatus = document.getElementById('access-code-status');

    let currentConversationId = null;
    let eventSource = null;

    // Function to generate a unique conversation ID
    function generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Function to add a message to the chat display
    function addMessage(messageText, sender, type = 'message') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(type, `${sender}-message`);
        messageDiv.textContent = messageText;
        chatDisplay.appendChild(messageDiv);

        // Scroll to the bottom to show the newest message
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // Function to check access code
    async function checkAccessCode() {
        const code = accessCodeInput.value.trim();

        if (code === '') {
            return; // Don't send empty codes
        }

        // Disable input while processing
        accessCodeInput.disabled = true;
        accessCodeSubmit.disabled = true;
        accessCodeSubmit.textContent = 'Checking...';

        try {
            const response = await fetch(`${RENDER_API_URL}/api/chat/check_access_code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_code: code
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Access code response:', data);

            // Display emoji based on accepted status
            if (data.accepted === 'True') {
                accessCodeStatus.textContent = '✅';
            } else {
                accessCodeStatus.textContent = '❌';
            }

            // Save the access code regardless of acceptance
            accessCode = code;

        } catch (error) {
            console.error('Error checking access code:', error);
            accessCodeStatus.textContent = '❌';
        } finally {
            // Re-enable input
            accessCodeInput.disabled = false;
            accessCodeSubmit.disabled = false;
            accessCodeSubmit.textContent = 'Submit';
        }
    }

    // Function to handle sending a message
    async function sendMessage() {
        const messageText = userInput.value.trim();

        if (messageText === '') {
            return; // Don't send empty messages
        }

        // Disable input while processing
        userInput.disabled = true;
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        // Add user's message to UI
        addMessage(messageText, 'user');

        // Clear the input field
        userInput.value = '';

        try {
            // Generate conversation ID if this is the first message
            if (!currentConversationId) {
                currentConversationId = generateConversationId();
            }

            // Step 1: POST to send-message endpoint
            const sendResponse = await fetch(`${RENDER_API_URL}/api/chat/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message_text: messageText,
                    conversation_id: currentConversationId,
                    access_code: accessCode
                })
            });

            if (!sendResponse.ok) {
                throw new Error(`HTTP error! status: ${sendResponse.status}`);
            }

            const sendData = await sendResponse.json();
            console.log('Send response:', sendData);

            // Verify we got the expected response
            if (sendData.status !== 'processing') {
                throw new Error('Unexpected response from send-message endpoint');
            }

            // Update conversation ID if provided
            if (sendData.conversation_id) {
                currentConversationId = sendData.conversation_id;
            }

            // Step 2: Establish SSE connection for updates
            if (eventSource) {
                eventSource.close(); // Close any existing connection
            }

            eventSource = new EventSource(`${RENDER_API_URL}/api/chat/stream-updates/${currentConversationId}`);

            // Handle status updates
            eventSource.addEventListener('status', function(event) {
                const data = JSON.parse(event.data);
                addMessage(data.text, 'status', 'status-message');
            });

            // Handle tool calls
            eventSource.addEventListener('tool_call', function(event) {
                const data = JSON.parse(event.data);
                addMessage(`Calling tool: ${data.tool}`, 'tool', 'tool-message');
            });

            // Handle final answer
            eventSource.addEventListener('final_answer', function(event) {
                const data = JSON.parse(event.data);
                addMessage(data.text, 'bot');
                eventSource.close();
                eventSource = null;

                // Re-enable input
                userInput.disabled = false;
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
            });

            // Handle end event
            eventSource.addEventListener('end', function(event) {
                console.log('SSE connection ended');
                eventSource.close();
                eventSource = null;
            });

            // Handle SSE errors
            eventSource.onerror = function(event) {
                console.error('SSE Error:', event);
                addMessage('Connection error occurred', 'status', 'status-message');
                eventSource.close();
                eventSource = null;

                // Re-enable input
                userInput.disabled = false;
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
            };

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('Failed to send message. Please try again.', 'status', 'status-message');

            // Re-enable input
            userInput.disabled = false;
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
        }
    }

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key in the input field
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Event listener for the access code submit button
    accessCodeSubmit.addEventListener('click', checkAccessCode);

    // Initial bot greeting
    addMessage('Hello! I\'m Nate, your AI-powered zoologist assistant. How can I help you learn about animals today?', 'bot');
});
