
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Неправильний логін або пароль');
        }
        return res.json();
    })
    .then(data => {
        window.location.href = 'index.html';
    })
    .catch(err => {
        document.getElementById('error').textContent = err.message;
    });
});