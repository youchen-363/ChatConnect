// Redirect to auth.html if session is empty
if (!localStorage.getItem('chatconnect_user')) {
    window.location.href = 'auth.html';
}

// Main application module
const mainApp = {
    selectedContact: localStorage.getItem('chatconnect_selectedContact') || null,

    // DOM Elements
    contactsList: document.getElementById('contacts-list'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-text'),

    updateContactsList(users) {
        contactsList.innerHTML = '';
        const isAdmin = localStorage.getItem('chatconnect_isAdmin') === 'true';
        const selectedContact = localStorage.getItem('chatconnect_selectedContact');
        users.forEach(username => {
            if (isAdmin || username !== 'admin') {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'contact-item';
                if (username === selectedContact) {
                    contactDiv.classList.add('selected');
                }
                contactDiv.textContent = username;
                contactDiv.onclick = () => this.selectContact(username);
                contactsList.appendChild(contactDiv);
            }
        });
    },

    selectContact(username) {
        this.selectedContact = username;
        localStorage.setItem('chatconnect_selectedContact', username);
        console.log('Selected contact:', localStorage.getItem('chatconnect_selectedContact'));
        this.updateChatHeader();
        this.displayMessages();
        fetchAllUsers().then(users => {
            this.updateContactsList(users);
        });
    },

    updateChatHeader() {
        // Update the chat header bar
        const chatHeader = document.getElementById('chat-header');
        console.log('Selected contact:', this.selectedContact);
        if (chatHeader) {
            if (this.selectedContact) {
                chatHeader.textContent = this.selectedContact;
                chatHeader.style.display = 'flex';
                chatHeader.style.alignItems = 'center';
                chatHeader.style.padding = '12px 16px';
                chatHeader.style.background = '#f0f0f0';
                chatHeader.style.borderBottom = '1px solid #ddd';
                chatHeader.style.fontWeight = 'bold';
                chatHeader.style.fontSize = '1.1em';
            } else {
                chatHeader.textContent = '';
                chatHeader.style.display = 'none';
            }
        }
    },

    displayMessages() {
        console.log('Displaying messages for:', this.selectedContact), ' from ', currentUser;
        this.chatMessages.innerHTML = '';
        if (!this.selectedContact || !currentUser) return;
        fetch(`${apiUrl}/api/messages?user1=${currentUser}&user2=${this.selectedContact}`)
            .then(res => res.json())
            .then(messages => {
                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.from === currentUser ? 'sent' : 'received'}`;
                    const textDiv = document.createElement('div');
                    textDiv.textContent = msg.text;
                    messageDiv.appendChild(textDiv);
                    this.chatMessages.appendChild(messageDiv);
                });
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            });
    },

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.selectedContact || !currentUser) {
            alert('Please select a contact and enter a message');
            return;
        }
        fetch(apiUrl + '/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentUser, to: this.selectedContact, text : text, timestamp: new Date().toISOString() })
        })
        .then(res => res.json())
        .then(() => {
            this.messageInput.value = '';
            this.displayMessages();
        });
    },

    updateUIForAdmin() {
        // Remove existing debug button if any
        const existingDebugButton = document.querySelector('.debug-button');
        if (existingDebugButton) existingDebugButton.remove();

        const user = localStorage.getItem('chatconnect_user');
        // Optionally, fetch user info from backend to check isAdmin
        // For now, only show if username is 'admin'
        if (user === 'admin') {
            const debugButton = document.createElement('button');
            debugButton.textContent = 'Show Database';
            debugButton.className = 'debug-button';
            debugButton.style.position = 'fixed';
            debugButton.style.bottom = '70px';
            debugButton.style.left = '20px';
            debugButton.style.zIndex = '1000';
            debugButton.onclick = this.showDatabase;
            document.body.appendChild(debugButton);
        }
    },

    updateUIForAllUsers() {
        // Remove existing fun button if any
        const existingFunButton = document.querySelector('.fun-button');
        if (existingFunButton) existingFunButton.remove();

        // Add fun button for all logged-in users
        if (currentUser) {
            const funButton = document.createElement('button');
            funButton.textContent = 'Fun Features';
            funButton.className = 'fun-button';
            funButton.style.position = 'fixed';
            funButton.style.bottom = '20px';
            funButton.style.left = currentUser === 'admin' ? '150px' : '20px';
            funButton.style.zIndex = '1000';
            funButton.onclick = this.showFunMenu;
            document.body.appendChild(funButton);
        }
    },

    showDatabase() {
        // Optionally, fetch and display users/messages from backend
        fetch(apiUrl + '/api/users')
            .then(res => res.json())
            .then(users => {
                fetch(apiUrl + '/api/messages')
                    .then(res => res.json())
                    .then(messages => {
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
                            <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
                        `;
                        document.body.appendChild(debugWindow);
                    });
            });
    },

    insultAbortController: null,
    isStopSpam: false,

    showFunMenu() {
        // Remove any existing fun menu and overlay
        const existingFunMenu = document.querySelector('.fun-menu');
        const existingOverlay = document.querySelector('.fun-menu-overlay');
        if (existingFunMenu) existingFunMenu.remove();
        if (existingOverlay) existingOverlay.remove();

        // Find the chat area container
        const chatArea = document.querySelector('.chat-area');
        if (!chatArea) {
            alert('Chat area not found!');
            return;
        }
        chatArea.style.position = 'relative'; // Ensure chat area is relative for absolute children

        const funMenu = document.createElement('div');
        funMenu.className = 'fun-menu';
        funMenu.style.position = 'absolute';
        funMenu.style.top = '50%';
        funMenu.style.left = '50%';
        funMenu.style.transform = 'translate(-50%, -50%)';
        funMenu.style.backgroundColor = 'white';
        funMenu.style.padding = '20px';
        funMenu.style.borderRadius = '8px';
        funMenu.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        funMenu.style.zIndex = '1000';
        funMenu.style.maxHeight = '80vh';
        funMenu.style.overflowY = 'auto';
        funMenu.style.width = '400px';
        funMenu.style.position = 'absolute';

        funMenu.innerHTML = `
            <h3>Fun Features</h3>
            <div style="margin-bottom: 15px;">
                <h4>Spam Messages</h4>
                <label for="spam-count">Times to spam:</label>
                <input id="spam-count" type="number" min="1" value="5" style="width:60px; margin-left:5px; margin-bottom:5px;">
                <br>
                <label for="spam-text">Spam text:</label>
                <input id="spam-text" type="text" placeholder="Enter spam message..." style="width:200px; margin-left:5px; margin-bottom:5px;">
                <br>
                <button onclick="mainApp.startSpamMessages()">Start Spam</button>
                <button onclick="mainApp.stopSpamMessages()" style="background: #e53935; color: #fff; margin-left: 10px;">Stop Spam</button>
            </div>
            <div style="margin-bottom: 15px;">
                <h4>AI Insult Generator</h4>
                <label for="insult-context">What happened?</label>
                <input id="insult-context" type="text" placeholder="Describe the situation..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <label for="insult-target">Who is this insult aimed at?</label>
                <input id="insult-target" type="text" placeholder="Target user..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <label for="insult-tone">Describe the style/persona:</label>
                <input id="insult-tone" type="text" placeholder="e.g. sarcastic, muscular..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <button id="generate-insult-btn" onclick="mainApp.generateAndSendInsult()">Generate Insult & Send</button>
                <button id="stop-insult-btn" onclick="mainApp.stopGenerateInsult()" style="margin-left: 10px; background: #e53935; color: #fff;">Stop Generate</button>
            </div>
            <button onclick="mainApp.closeFunMenu()" style="margin-top: 10px; background: #e53935; color: #fff;">Close</button>
        `;

        // Create overlay for click-outside behavior
        const overlay = document.createElement('div');
        overlay.className = 'fun-menu-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.onclick = () => this.closeFunMenu();

        chatArea.appendChild(overlay);
        chatArea.appendChild(funMenu);
    },

    closeFunMenu() {
        const funMenu = document.querySelector('.fun-menu');
        const overlay = document.querySelector('.fun-menu-overlay');
        if (funMenu) funMenu.remove();
        if (overlay) overlay.remove();
    },

    startSpamMessages() {
        const countInput = document.getElementById('spam-count');
        let count = parseInt(countInput ? countInput.value : '5', 10);
        if (isNaN(count) || count < 1) count = 5;
        const spamTextInput = document.getElementById('spam-text');
        const spamText = spamTextInput ? spamTextInput.value : '';
        
        if (!this.selectedContact) {
            alert('Please select a contact to spam!');
            return;
        }
        if (!spamText.trim()) {
            alert('Please enter spam text!');
            return;
        }

        this.isStopSpam = false;

        let sentCount = 0;
        const sendSpam = async () => {
            for (let i = 0; i < count; i++) {
                if (this.isStopSpam) {
                    blockFrontend();
                    fetch(apiUrl + '/api/play_flappy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    document.body.removeChild(document.getElementById('block-overlay'));
                    break;
                }
                await fetch(apiUrl + '/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        from: currentUser, 
                        to: this.selectedContact, 
                        text: `${spamText}` 
                    })
                });
                sentCount++;
                this.displayMessages();
            }
        };
        sendSpam();
    },

    stopSpamMessages() {
        this.isStopSpam = true;
    },

    stopGenerateInsult() {
        if (this.insultAbortController) {
            this.insultAbortController.abort();
            this.insultAbortController = null;
        }
        // Optionally, remove spinner if present
        const loadingDiv = document.querySelector('.ai-insult-loading');
        if (loadingDiv) loadingDiv.remove();
        const style = document.getElementById('ai-insult-spinner-style');
        if (style) style.remove();
        // Re-enable the generate button
        const genBtn = document.getElementById('generate-insult-btn');
        if (genBtn) genBtn.disabled = false;
    },

    async generateAndSendInsult() {
        const context = document.getElementById('insult-context').value.trim();
        const target = document.getElementById('insult-target').value.trim();
        const tone = document.getElementById('insult-tone').value.trim();
        if (!this.selectedContact) {
            alert('Please select a contact to send the insult!');
            return;
        }
        if (!context || !target || !tone) {
            alert('Please fill in all fields for the AI insult.');
            return;
        }
        
        // Setup AbortController
        this.insultAbortController = new AbortController();
        const signal = this.insultAbortController.signal;

        try {
            // Call your backend to generate the insult
            const response = await fetch('/api/insult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context, tone, target }),
                signal
            });
            if (!response.ok) throw new Error('Request failed or aborted');
            const data = await response.json();
            const insult = data.insult || 'No insult generated.';
            console.log(insult);
            // Send the insult as a message
            console.log('Sending to /api/messages:', {
                from: currentUser,
                to: this.selectedContact,
                text: `${insult}`
            });
            sendInsult(insult);
            this.displayMessages();
        } catch (error) {
            if (error.name === 'AbortError') {
                alert('AI insult generation stopped.');
            } else {
                console.error('Error:', error);
                alert('Failed to generate or send insult. Please try again.');
            }
        } 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Add search bar above Contacts
    const contactsContainer = document.querySelector('.contacts');
    if (contactsContainer && !document.getElementById('contact-search')) {
        const searchBar = document.createElement('input');
        searchBar.type = 'text';
        searchBar.id = 'contact-search';
        searchBar.placeholder = 'Search users...';
        searchBar.style.margin = '12px 0 8px 0';
        searchBar.style.padding = '8px';
        searchBar.style.width = '100%';
        searchBar.style.boxSizing = 'border-box';
        contactsContainer.insertBefore(searchBar, contactsContainer.firstChild);
        searchBar.addEventListener('input', () => {
            const searchValue = searchBar.value.trim().toLowerCase();
            fetchAllUsers().then(users => {
                const filteredUsers = users.filter(username =>
                    username.toLowerCase().includes(searchValue)
                );
                mainApp.updateContactsList(filteredUsers);
            });
        });
    }
    // Add click handler to send message button
    const sendBtn = document.querySelector('button[onclick="mainApp.sendMessage()"]');
    if (sendBtn) sendBtn.onclick = () => mainApp.sendMessage();
    fetchAllUsers().then(users => {
        mainApp.updateContactsList(users);
    });
    mainApp.updateUIForAdmin();
    mainApp.updateUIForAllUsers();
    // Restore selected contact if exists
    if (localStorage.getItem('chatconnect_selectedContact')) {
        window.selectedContact = localStorage.getItem('chatconnect_selectedContact');
    }
    const currentUserSpan = document.getElementById('current-user');
    if (currentUserSpan) {
        currentUserSpan.textContent = localStorage.getItem('chatconnect_user') || '';
    }
});

fetch(apiUrl+'/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  if (data.username) {
    // Store the session in localStorage
    localStorage.setItem('chatconnect_user', data.username);
    // Redirect to main app
    window.location.replace('./index.html');
  } else {
    // Handle login error
    alert(data.error || 'Login failed');
  }
});

fetch(apiUrl+'/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  if (data.error) alert(data.error);
  else alert('Registration successful!');
});

fetch(apiUrl+'/api/users')
  .then(res => res.json())
  .then(users => {
    // Render user list
  });

fetch(apiUrl+`/api/messages?user1=${auth.currentUser}&user2=${mainApp.selectedContact}`)
  .then(res => res.json())
  .then(messages => {
    // Render messages
  }); 
  