// Main application module
const mainApp = {
    selectedContact: null,

    // DOM Elements
    contactsList: document.getElementById('contacts-list'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-text'),

    updateContactsList() {
        this.contactsList.innerHTML = '';
        db.users.forEach(user => {
            // Don't show current user or admin (unless current user is admin)
            if (user.username !== auth.currentUser && (auth.isAdmin || !user.isAdmin)) {
                const contactDiv = document.createElement('div');
                contactDiv.className = `contact-item ${db.onlineUsers.has(user.username) ? 'online' : ''}`;
                contactDiv.textContent = user.username;
                contactDiv.onclick = () => this.selectContact(user.username);
                this.contactsList.appendChild(contactDiv);
            }
        });
    },

    selectContact(username) {
        this.selectedContact = username;
        this.updateChatHeader();
        this.displayMessages();
    },

    updateChatHeader() {
        // Remove existing header if any
        const existingHeader = document.querySelector('.chat-header');
        if (existingHeader) existingHeader.remove();

        if (this.selectedContact) {
            const chatArea = document.querySelector('.chat-area');
            const header = document.createElement('div');
            header.className = 'chat-header';
            header.style.padding = '10px';
            header.style.backgroundColor = '#f0f0f0';
            header.style.borderBottom = '1px solid #ddd';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';

            const contactName = document.createElement('span');
            contactName.textContent = this.selectedContact;
            contactName.style.fontWeight = 'bold';
            contactName.style.fontSize = '1.1em';

            const onlineStatus = document.createElement('span');
            onlineStatus.textContent = db.onlineUsers.has(this.selectedContact) ? '🟢 Online' : '⚪ Offline';
            onlineStatus.style.color = db.onlineUsers.has(this.selectedContact) ? '#2ecc71' : '#95a5a6';

            header.appendChild(contactName);
            header.appendChild(onlineStatus);

            // Insert header before the chat messages
            chatArea.insertBefore(header, this.chatMessages);
        }
    },

    displayMessages() {
        this.chatMessages.innerHTML = '';
        const messages = db.messages.filter(
            msg => (msg.from === auth.currentUser && msg.to === this.selectedContact) ||
                   (msg.from === this.selectedContact && msg.to === auth.currentUser)
        );

        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.from === auth.currentUser ? 'sent' : 'received'}`;
            
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
            
            this.chatMessages.appendChild(messageDiv);
        });

        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.selectedContact) {
            alert('Please select a contact and enter a message');
            return;
        }

        const message = {
            from: auth.currentUser,
            to: this.selectedContact,
            text,
            timestamp: new Date().toISOString()
        };

        db.messages.push(message);
        this.messageInput.value = '';
        this.displayMessages();

        fetch('https://chatconnect-tug4.onrender.com/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: auth.currentUser, to: this.selectedContact, text })
        });
    },

    updateUIForAdmin() {
        // Remove existing debug button if any
        const existingDebugButton = document.querySelector('.debug-button');
        if (existingDebugButton) existingDebugButton.remove();

        if (auth.isAdmin) {
            const debugButton = document.createElement('button');
            debugButton.textContent = 'Show Database';
            debugButton.className = 'debug-button';
            debugButton.style.position = 'fixed';
            debugButton.style.bottom = '20px';
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
        if (auth.currentUser) {
            const funButton = document.createElement('button');
            funButton.textContent = 'Fun Features';
            funButton.className = 'fun-button';
            funButton.style.position = 'fixed';
            funButton.style.bottom = '20px';
            funButton.style.left = auth.isAdmin ? '150px' : '20px';
            funButton.style.zIndex = '1000';
            funButton.onclick = this.showFunMenu;
            document.body.appendChild(funButton);
        }
    },

    showDatabase() {
        if (!auth.isAdmin) {
            alert('Access denied. Admin privileges required.');
            return;
        }

        console.log('=== Database Contents ===');
        console.log('Users:', db.users);
        console.log('Messages:', db.messages);
        console.log('Online Users:', Array.from(db.onlineUsers));
        
        // Create a debug window
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
            <pre>${JSON.stringify(db.users, null, 2)}</pre>
            <h4>Messages:</h4>
            <pre>${JSON.stringify(db.messages, null, 2)}</pre>
            <h4>Online Users:</h4>
            <pre>${JSON.stringify(Array.from(db.onlineUsers), null, 2)}</pre>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
        `;

        document.body.appendChild(debugWindow);
    },

    showFunMenu() {
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
                <label for="spam-count">Times to spam:</label>
                <input id="spam-count" type="number" min="1" value="5" style="width:60px; margin-left:5px; margin-bottom:5px;">
                <br>
                <button onclick="mainApp.startSpamMessages()">Start Spam</button>
                <button onclick="mainApp.stopSpamMessages()">Stop Spam</button>
            </div>
            <div>
                <h4>Spam Images</h4>
                <button onclick="mainApp.startSpamImages()">Start Image Spam</button>
                <button onclick="mainApp.stopSpamImages()">Stop Image Spam</button>
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
        `;

        document.body.appendChild(funMenu);
    },

    spamInterval: null,
    startSpamMessages() {
        const countInput = document.getElementById('spam-count');
        let count = parseInt(countInput ? countInput.value : '5', 10);
        if (isNaN(count) || count < 1) count = 5;
        if (!this.selectedContact) {
            alert('Please select a contact to spam!');
            return;
        }
        let sent = 0;
        this.stopSpamMessages();
        this.spamInterval = setInterval(() => {
            if (sent >= count) {
                this.stopSpamMessages();
                return;
            }
            const message = {
                from: auth.currentUser,
                to: this.selectedContact,
                text: 'Spam message #' + (sent + 1),
                timestamp: new Date().toISOString()
            };
            db.messages.push(message);
            this.displayMessages();
            sent++;
        }, 300);
    },
    stopSpamMessages() {
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
            this.spamInterval = null;
        }
    },

    startSpamImages() {
        // Implementation for starting image spam
    },

    stopSpamImages() {
        // Implementation for stopping image spam
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click handler to send message button
    document.querySelector('button[onclick="sendMessage()"]').onclick = () => mainApp.sendMessage();
});

fetch('https://chatconnect-tug4.onrender.com/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  if (data.error) alert(data.error);
  else {
    // Save user info, show main screen, etc.
  }
});

fetch('https://chatconnect-tug4.onrender.com/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  if (data.error) alert(data.error);
  else alert('Registration successful!');
});

fetch('https://chatconnect-tug4.onrender.com/api/users')
  .then(res => res.json())
  .then(users => {
    // Render user list
  });

fetch(`https://chatconnect-tug4.onrender.com/api/messages?user1=${auth.currentUser}&user2=${mainApp.selectedContact}`)
  .then(res => res.json())
  .then(messages => {
    // Render messages
  }); 