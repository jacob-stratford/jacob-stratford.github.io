
// API URL for the backend


//const RENDER_API_URL = "https://nate-backend.onrender.com"; // deployed backend
const RENDER_API_URL = "http://localhost:5000"; // dev backend 


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
    responseArea.innerHTML = ''; // Clear previous responses

    // Display an initial status message immediately
    const initialDiv = document.createElement('div');
    initialDiv.textContent = 'Contacting the spirits...';
    initialDiv.style.marginBottom = '5px';
    responseArea.appendChild(initialDiv);

    try {
	// Set up EventSource to listen for SSE updates
        // (Keeping GET for simplicity, but consider POST + Job ID for robust apps)
        const eventSource = new EventSource(`${RENDER_API_URL}/magic8ball?question=${encodeURIComponent(question)}`);
        
        // --- 1. Listener for Intermediate 'status' Updates ---
        eventSource.addEventListener('status', function(event) {
            // Overwrite the initial message with the first status update, 
            // then append new updates.
            if (responseArea.children.length === 1 && responseArea.firstChild === initialDiv) {
                responseArea.removeChild(initialDiv);
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.textContent = event.data;
            messageDiv.style.marginBottom = '5px';
            responseArea.appendChild(messageDiv);
        });

        // --- 2. Listener for 'final' Answer ---
        eventSource.addEventListener('final', function(event) {
            // Append the final response prominently
            const finalDiv = document.createElement('div');
            finalDiv.innerHTML = `<strong>Final Answer: ${event.data}</strong>`;
            finalDiv.style.marginTop = '15px';
            finalDiv.style.marginBottom = '5px';
            responseArea.appendChild(finalDiv);

            // **Crucial: Close the SSE connection after receiving the final event**
            eventSource.close();
            console.log('SSE connection closed by client after receiving final message.');
        });

        // --- 3. Error/Close Handler ---
        eventSource.onerror = function(event) {
            if (event.target.readyState === EventSource.CLOSED) {
                // This state is reached if the server closes the connection
                // OR if eventSource.close() was called (which is expected here)
                console.log('SSE connection closed (expected).');
            } else {
                // This handles actual network or server errors
                responseArea.innerHTML = '<div>Error receiving updates from the ball.</div>';
                console.error('SSE Error:', event);
                eventSource.close();
            }
        };

        // Note: The original setTimeout has been removed.
        // The server-side completion handles the closing now.

    } catch (error) {
        // Handle initial connection or setup errors (not SSE errors)
        responseArea.innerHTML = '<div>Network Error: Could not start the magic 8 ball service.</div>';
        console.error('Initial error:', error);
    }
});

