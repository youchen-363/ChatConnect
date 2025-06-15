function fetchAllUsers() {
    return fetch(apiUrl + '/api/users')
        .then(res => res.json());
} 

function registerUser(username, password) {
    return fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json());
}