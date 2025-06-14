// Authentication module
const auth = {
    // Current user state
    currentUser: null,
    isAdmin: false,

    // DOM Elements
    loginScreen: document.getElementById('login-screen'),
    mainScreen: document.getElementById('main-screen'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    currentUserSpan: document.getElementById('current-user'),
    contactsList: document.getElementById('contacts-list'),

    // Authentication Functions
    register() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        fetch(apiUrl + '/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                alert('Registration successful! Please login.');
                this.usernameInput.value = '';
                this.passwordInput.value = '';
            } else {
                alert(data.error || 'Registration failed');
            }
        })
        .catch(() => alert('Registration failed'));
    },

    login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

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
            if (data.username) {
                // Store session and redirect
                localStorage.setItem('chatconnect_user', data.username);
                window.location.href = 'index.html';
            } else {
                alert(data.error || 'Login failed');
            }
        })
        .catch(() => alert('Login failed'));
    },

    logout() {
        // Remove debug and fun buttons before logging out
        const debugButton = document.querySelector('.debug-button');
        if (debugButton) debugButton.remove();
        
        const funButton = document.querySelector('.fun-button');
        if (funButton) funButton.remove();

        // Remove any open debug or fun menus
        const debugWindow = document.querySelector('div[style*="position: fixed"][style*="bottom: 20px"][style*="right: 20px"]');
        if (debugWindow) debugWindow.remove();

        const funMenu = document.querySelector('div[style*="position: fixed"][style*="top: 20px"][style*="left: 20px"]');
        if (funMenu) funMenu.remove();

        this.currentUser = null;
        if (window.mainApp) mainApp.selectedContact = null;
        this.isAdmin = false;
        // Remove session and redirect to auth.html
        localStorage.removeItem('chatconnect_user');
        window.location.href = 'auth.html';
    },
/*
    // UI Functions
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        if (this.mainScreen) this.mainScreen.classList.add('hidden');
    },

    showMainScreen() {
        this.loginScreen.classList.add('hidden');
        if (this.mainScreen) this.mainScreen.classList.remove('hidden');
        if (this.currentUserSpan) this.currentUserSpan.textContent = localStorage.getItem('chatconnect_user') || '';
    },
*/
    updateContactsList(users) {
        this.contactsList.innerHTML = '';
        users.forEach(user => {
            if (user !== this.currentUser) {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'contact-item';
                contactDiv.textContent = user;
                contactDiv.onclick = () => mainApp.selectContact(user);
                this.contactsList.appendChild(contactDiv);
            }
        });
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to login and register buttons
    const loginBtn = document.querySelector('button[onclick="auth.login()"]');
    if (loginBtn) loginBtn.onclick = () => auth.login();
    const registerBtn = document.querySelector('button[onclick="auth.register()"]');
    if (registerBtn) registerBtn.onclick = () => auth.register();
    const logoutBtn = document.querySelector('button[onclick="auth.logout()"]');
    if (logoutBtn) logoutBtn.onclick = () => auth.logout();
});
/*
function sendMessage() {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: auth.currentUser, to: mainApp.selectedContact, text: messageInput.value })
    })
    .then(res => res.json())
    .then(() => {
        messageInput.value = '';
        fetchMessages(); // Immediately refresh messages
    });
} 
    */
