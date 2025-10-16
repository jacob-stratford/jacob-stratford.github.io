// API URL for the backend
const RENDER_API_URL = "https://nate-backend.onrender.com";

document.getElementById('greetingForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const name = document.getElementById('nameInput').value;
    const responseArea = document.getElementById('responseArea');
    responseArea.textContent = 'Sending request to backend...';

    try {
        // Send POST request to backend
        const response = await fetch(`${RENDER_API_URL}/greet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
        });

        // Parse JSON response
        const data = await response.json();

        if (response.ok) {
            // Display successful response
            responseArea.textContent = data.message;
        } else {
            // Handle server errors
            responseArea.textContent = `Error from server: ${data.message || 'Unknown error'}`;
        }

    } catch (error) {
        // Handle network errors
        responseArea.textContent = 'Network Error: Could not reach the Render service.';
        console.error('Fetch error:', error);
    }
});

// Magic 8 Ball functionality
document.getElementById('magic8ballForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const question = document.getElementById('questionInput').value;
    const responseArea = document.getElementById('magic8ballResponse');
    responseArea.textContent = 'Contacting the spirits...';

    try {
        // Set up EventSource to listen for SSE updates directly with GET request
        const eventSource = new EventSource(`${RENDER_API_URL}/magic8ball?question=${encodeURIComponent(question)}`);
        responseArea.textContent = ''; // Clear the initial message

        eventSource.onmessage = function(event) {
            // Append each message below the previous ones
            const messageDiv = document.createElement('div');
            messageDiv.textContent = event.data;
            messageDiv.style.marginBottom = '5px';
            responseArea.appendChild(messageDiv);
        };

        eventSource.onerror = function(event) {
            if (event.target.readyState === EventSource.CLOSED) {
                console.log('SSE connection closed');
            } else {
                responseArea.textContent = 'Error receiving updates from the ball.';
            }
            eventSource.close();
        };

        // Optional: Close the EventSource after a reasonable time (e.g., 15 seconds)
        setTimeout(() => {
            eventSource.close();
        }, 15000);

    } catch (error) {
        // Handle network errors
        responseArea.textContent = 'Network Error: Could not reach the Render service.';
        console.error('Fetch error:', error);
    }
});
