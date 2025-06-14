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

    updateContactsList(usersCache) {
        // If usersCache is not provided, fetch from API
        if (!usersCache) {
            fetch(apiUrl + '/api/users')
                .then(res => res.json())
                .then(users => {
                    this.updateContactsList(users);
                });
            return;
        }
        this.contactsList.innerHTML = '';
        // Get search value
        const searchInput = document.getElementById('contact-search');
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
        usersCache.forEach(user => {
            if (user !== 'admin' && (!searchValue || user.toLowerCase().includes(searchValue))) {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'contact-item';
                contactDiv.textContent = user;
                if (user === this.selectedContact) {
                    contactDiv.classList.add('selected');
                }
                contactDiv.onclick = () => {
                    this.selectContact(user);
                    this.updateContactsList(usersCache);
                };
                this.contactsList.appendChild(contactDiv);
            }
        });
    },

    selectContact(username) {
        this.selectedContact = username;
        localStorage.setItem('chatconnect_selectedContact', username);
        this.updateChatHeader();
        this.displayMessages();
    },

    updateChatHeader() {
        // Update the chat header bar
        const chatHeader = document.getElementById('chat-header');
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
        console.log('Displaying messages for:', this.selectedContact);
        this.chatMessages.innerHTML = '';
        const currentUser = localStorage.getItem('chatconnect_user');
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
        const currentUser = localStorage.getItem('chatconnect_user');
        if (!text || !this.selectedContact || !currentUser) {
            alert('Please select a contact and enter a message');
            return;
        }
        fetch(apiUrl + '/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentUser, to: this.selectedContact, text })
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
        const user = localStorage.getItem('chatconnect_user');
        if (user) {
            const funButton = document.createElement('button');
            funButton.textContent = 'Fun Features';
            funButton.className = 'fun-button';
            funButton.style.position = 'fixed';
            funButton.style.bottom = '20px';
            funButton.style.left = user === 'admin' ? '150px' : '20px';
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

    showFunMenu() {
        // Remove any existing fun menu
        const existingFunMenu = document.querySelector('.fun-menu');
        if (existingFunMenu) existingFunMenu.remove();

        const funMenu = document.createElement('div');
        funMenu.className = 'fun-menu';
        funMenu.style.position = 'fixed';
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
                <button onclick="mainApp.stopSpamMessages()">Stop Spam</button>
            </div>
            <div style="margin-bottom: 15px;">
                <h4>AI Insult Generator</h4>
                <label for="insult-context">What happened?</label>
                <input id="insult-context" type="text" placeholder="Describe the situation..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <label for="insult-target">Who is this insult aimed at?</label>
                <input id="insult-target" type="text" placeholder="Target user..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <label for="insult-tone">Describe the style/persona:</label>
                <input id="insult-tone" type="text" placeholder="e.g. sarcastic, muscular..." style="width:200px; margin-left:5px; margin-bottom:5px;"><br>
                <button onclick="mainApp.generateAndSendInsult()">Generate Insult & Send</button>
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
        `;

        // Create overlay for click-outside behavior
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.onclick = () => {
            overlay.remove();
            funMenu.remove();
        };

        document.body.appendChild(overlay);
        document.body.appendChild(funMenu);

        // Prevent clicks inside the menu from closing it
        funMenu.onclick = (e) => {
            e.stopPropagation();
        };
    },

    spamInterval: null,
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

        const currentUser = localStorage.getItem('chatconnect_user');
        let sentCount = 0;

        const sendNextMessage = async () => {
            if (sentCount >= count) {
                return;
            }

            try {
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
                this.displayMessages(); // Update display after each message
                
                if (sentCount < count) {
                    setTimeout(sendNextMessage, 100); // Send next message after 100ms
                }
            } catch (error) {
                console.error('Error sending spam message:', error);
            }
        };

        sendNextMessage();
    },
    stopSpamMessages() {
        // This function is now just a placeholder since we're using setTimeout
        console.log('Spam messages stopped');
    },

    generateAndSendInsult: async function() {
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
        // Call your backend to generate the insult
        const response = await fetch('/api/insult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situation: context, target, tone })
        });
        const data = await response.json();
        const insult = data.insult || 'No insult generated.';
        const currentUser = localStorage.getItem('chatconnect_user');
        // Send the insult as a message
        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentUser, to: this.selectedContact, text: insult })
        }).then(() => {
            this.displayMessages();
            alert('Insult sent!');
        });
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
            // Fetch users and filter
            fetch(apiUrl + '/api/users')
                .then(res => res.json())
                .then(users => {
                    mainApp.updateContactsList(users);
                });
        });
    }
    // Add click handler to send message button
    const sendBtn = document.querySelector('button[onclick="mainApp.sendMessage()"]');
    if (sendBtn) sendBtn.onclick = () => mainApp.sendMessage();
    mainApp.updateContactsList();
    mainApp.updateUIForAdmin();
    mainApp.updateUIForAllUsers();
    // Restore selected contact if exists
    if (mainApp.selectedContact) {
        mainApp.updateChatHeader();
        mainApp.displayMessages();
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