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
