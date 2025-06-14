// This file is now a placeholder for shared utilities if needed.
// All database logic is now handled by the Flask backend via API calls.

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const currentUserSpan = document.getElementById('current-user');
const contactsList = document.getElementById('contacts-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-text');

/*
// Authentication Functions
function register() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    // Check if username exists via API
    fetch(apiUrl + '/api/users')
        .then(res => res.json())
        .then(users => {
            if (users.includes(username)) {
                alert('Username already exists');
                return;
            }
            // Register user via API
            fetch(apiUrl + '/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Registration successful! Please login.');
                    usernameInput.value = '';
                    passwordInput.value = '';
                }
            });
        });
}

function login() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    fetch(apiUrl + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            // Set current user in localStorage
            localStorage.setItem('chatconnect_user', data.username);
            localStorage.setItem('chatconnect_isAdmin', data.isAdmin);
            showMainScreen();
            updateContactsList();
        }
    });
}

function logout() {
    localStorage.removeItem('chatconnect_user');
    localStorage.removeItem('chatconnect_isAdmin');
    showLoginScreen();
}

// UI Functions
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
}

function showMainScreen() {
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    currentUserSpan.textContent = localStorage.getItem('chatconnect_user');
}
*/
function updateUIForAdmin() {
    // Remove existing debug button if any
    const existingDebugButton = document.querySelector('.debug-button');
    if (existingDebugButton) existingDebugButton.remove();

    const isAdmin = localStorage.getItem('chatconnect_isAdmin') === 'true';
    if (isAdmin) {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Show Database';
        debugButton.className = 'debug-button';
        debugButton.style.position = 'fixed';
        debugButton.style.bottom = '20px';
        debugButton.style.left = '20px';
        debugButton.style.zIndex = '1000';
        debugButton.onclick = showDatabase;
        document.body.appendChild(debugButton);
    }
}

function updateUIForAllUsers() {
    // Remove existing fun button if any
    const existingFunButton = document.querySelector('.fun-button');
    if (existingFunButton) existingFunButton.remove();

    // Add fun button for all logged-in users
    if (localStorage.getItem('chatconnect_user')) {
        const isAdmin = localStorage.getItem('chatconnect_isAdmin') === 'true';
        const funButton = document.createElement('button');
        funButton.textContent = 'Fun Features';
        funButton.className = 'fun-button';
        funButton.style.position = 'fixed';
        funButton.style.bottom = '20px';
        funButton.style.left = isAdmin ? '150px' : '20px';
        funButton.style.zIndex = '1000';
        funButton.onclick = showFunMenu;
        document.body.appendChild(funButton);
    }
}

function updateContactsList() {
    contactsList.innerHTML = '';
    const isAdmin = localStorage.getItem('chatconnect_isAdmin') === 'true';
    const selectedContact = localStorage.getItem('chatconnect_selectedContact');
    fetch(apiUrl + '/api/users')
        .then(res => res.json())
        .then(users => {
            users.forEach(username => {
                if (isAdmin || username !== 'admin') {
                    const contactDiv = document.createElement('div');
                    contactDiv.className = 'contact-item';
                    if (username === selectedContact) {
                        contactDiv.classList.add('selected');
                    }
                    contactDiv.textContent = username;
                    contactDiv.onclick = () => selectContact(username);
                    contactsList.appendChild(contactDiv);
                }
            });
        });
}

function selectContact(username) {
    localStorage.setItem('chatconnect_selectedContact', username);
    updateChatHeader();
    displayMessages();
    updateContactsList();
}

function displayMessages() {
    chatMessages.innerHTML = '';
    const currentUser = localStorage.getItem('chatconnect_user');
    const selectedContact = localStorage.getItem('chatconnect_selectedContact');
    if (!currentUser || !selectedContact) return;
    fetch(apiUrl + `/api/messages?user1=${currentUser}&user2=${selectedContact}`)
        .then(res => res.json())
        .then(messages => {
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.from === currentUser ? 'sent' : 'received'}`;
                if (msg.image) {
                    const img = document.createElement('img');
                    img.src = msg.image;
                    img.style.maxWidth = '200px';
                    img.style.marginBottom = '5px';
                    messageDiv.appendChild(img);
                }
                const textDiv = document.createElement('div');
                textDiv.textContent = msg.text;
                messageDiv.appendChild(textDiv);
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

function sendInsult(text) {
    const currentUser = localStorage.getItem('chatconnect_user');
    const selectedContact = localStorage.getItem('chatconnect_selectedContact');
    if (!text || !selectedContact) {
        alert('Please select a contact and enter a message');
        return;
    }
    fetch(apiUrl + '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: currentUser, to: selectedContact, text: text })
    })
    .then(res => res.json())
    .then(() => {
        messageInput.value = '';
        displayMessages();
    });
}

function sendMessage() {
    const text = messageInput.value.trim();
    const currentUser = localStorage.getItem('chatconnect_user');
    const selectedContact = localStorage.getItem('chatconnect_selectedContact');
    if (!text || !selectedContact) {
        alert('Please select a contact and enter a message');
        return;
    }
    fetch(apiUrl + '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: currentUser, to: selectedContact, text })
    })
    .then(res => res.json())
    .then(() => {
        messageInput.value = '';
        displayMessages();
    });
}

// Debug Functions
function showDatabase() {
    const isAdmin = localStorage.getItem('chatconnect_isAdmin') === 'true';
    if (!isAdmin) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    // Fetch and show users and messages from backend
    Promise.all([
        fetch(apiUrl + '/api/users').then(res => res.json()),
        fetch(apiUrl + '/api/messages?user1=admin&user2=admin').then(res => res.json()),
        fetch(apiUrl + '/api/online_users').then(res => res.json())
    ]).then(([users, messages, onlineUsers]) => {
        const debugWindow = document.createElement('div');
        debugWindow.style.position = 'fixed';
        debugWindow.style.bottom = '20px';
        debugWindow.style.right = '20px';
        debugWindow.style.backgroundColor = 'white';
        debugWindow.style.padding = '20px';
        debugWindow.style.borderRadius = '8px';
        debugWindow.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        debugWindow.style.maxHeight = '400px';
        debugWindow.style.overflowY = 'auto';
        debugWindow.style.zIndex = '1000';
        debugWindow.innerHTML = `
            <h3>Database Contents (Admin View)</h3>
            <h4>Users:</h4>
            <pre>${JSON.stringify(users, null, 2)}</pre>
            <h4>Messages:</h4>
            <pre>${JSON.stringify(messages, null, 2)}</pre>
            <h4>Online Users:</h4>
            <pre>${JSON.stringify(onlineUsers, null, 2)}</pre>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
        `;
        document.body.appendChild(debugWindow);
    });
}

// Admin Fun Functions
function showFunMenu() {
    const funMenu = document.createElement('div');
    funMenu.style.position = 'fixed';
    funMenu.style.top = '20px';
    funMenu.style.left = '20px';
    funMenu.style.backgroundColor = 'white';
    funMenu.style.padding = '20px';
    funMenu.style.borderRadius = '8px';
    funMenu.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    funMenu.style.zIndex = '1000';

    funMenu.innerHTML = `
        <h3>Fun Features</h3>
        <div style="margin-bottom: 15px;">
            <h4>Spam Messages</h4>
            <input type="number" id="spam-count" placeholder="Number of messages" min="1" max="100" style="width: 150px; margin-right: 10px;">
            <input type="text" id="spam-message" placeholder="Message to spam" style="width: 200px;">
            <button onclick="startSpamMessages()" style="margin-top: 10px;">Start Spam</button>
        </div>
        <div>
            <h4>Spam Images</h4>
            <input type="file" id="spam-image" accept="image/*" style="margin-bottom: 10px;">
            <input type="number" id="spam-image-count" placeholder="Number of times" min="1" max="100" style="width: 150px; margin-right: 10px;">
            <button onclick="startSpamImages()" style="margin-top: 10px;">Start Image Spam</button>
        </div>
        <button onclick="this.parentElement.remove()" style="margin-top: 20px;">Close Menu</button>
    `;

    document.body.appendChild(funMenu);
}

function startSpamMessages() {
    const count = parseInt(document.getElementById('spam-count').value);
    const message = document.getElementById('spam-message').value;
    
    if (!count || !message || !selectedContact) {
        alert('Please select a contact, enter message count and message text');
        return;
    }

    let sentCount = 0;
    const interval = setInterval(() => {
        if (sentCount >= count) {
            clearInterval(interval);
            return;
        }

        const spamMessage = {
            from: currentUser,
            to: selectedContact,
            text: `${message}`,
            timestamp: new Date().toISOString()
        };

        fetch(apiUrl + '/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentUser, to: selectedContact, text: spamMessage.text })
        });
        sentCount++;
    }, 100); // Send message every 500ms
}

function startSpamImages() {
    const count = parseInt(document.getElementById('spam-image-count').value);
    const imageInput = document.getElementById('spam-image');
    
    if (!count || !imageInput.files[0] || !selectedContact) {
        alert('Please select a contact, enter count and choose an image');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        let sentCount = 0;
        
        const interval = setInterval(() => {
            if (sentCount >= count) {
                clearInterval(interval);
                return;
            }

            const spamMessage = {
                from: currentUser,
                to: selectedContact,
                text: `[Image Spam ${sentCount + 1}/${count}]`,
                image: imageData,
                timestamp: new Date().toISOString()
            };

            fetch(apiUrl + '/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: currentUser, to: selectedContact, text: spamMessage.text, image: spamMessage.image })
            });
            sentCount++;
        }, 200); // Send image every 500ms
    };
    
    reader.readAsDataURL(imageInput.files[0]);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listener to the send button
    const sendButton = document.querySelector('.message-input button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Add keypress event listener to the message input
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
/*
    // Show login screen by default
    auth.showLoginScreen();*/
});

// Simulate online status changes (for demo purposes)
setInterval(() => {
    if (localStorage.getItem('chatconnect_user')) {
        updateContactsList();
    }
}, 10000);

fetch(apiUrl+'/api/users')
  .then(res => res.json())
  .then(users => { /* render user list */ }); 