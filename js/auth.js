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

    // Authentication Functions
    register() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        if (db.users.some(user => user.username === username)) {
            alert('Username already exists');
            return;
        }

        // Regular users cannot be admins
        db.users.push({ username, password, isAdmin: false });
        alert('Registration successful! Please login.');
        this.usernameInput.value = '';
        this.passwordInput.value = '';
    },

    login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        const user = db.users.find(u => u.username === username && u.password === password);
        if (!user) {
            alert('Invalid username or password');
            return;
        }

        this.currentUser = username;
        this.isAdmin = user.isAdmin;
        db.onlineUsers.add(username);
        this.showMainScreen();
        mainApp.updateContactsList();
        mainApp.updateUIForAdmin();
        mainApp.updateUIForAllUsers();
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

        db.onlineUsers.delete(this.currentUser);
        this.currentUser = null;
        mainApp.selectedContact = null;
        this.isAdmin = false;
        this.showLoginScreen();
    },

    // UI Functions
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.mainScreen.classList.add('hidden');
    },

    showMainScreen() {
        this.loginScreen.classList.add('hidden');
        this.mainScreen.classList.remove('hidden');
        this.currentUserSpan.textContent = this.currentUser;
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to login and register buttons
    document.querySelector('button[onclick="auth.login()"]').onclick = () => auth.login();
    document.querySelector('button[onclick="auth.register()"]').onclick = () => auth.register();
    document.querySelector('button[onclick="auth.logout()"]').onclick = () => auth.logout();
}); 