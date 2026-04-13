document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include', // 🔥 ОБОВ'ЯЗКОВО
    body: JSON.stringify({ login, password })
})
    .then(res => {
        if (!res.ok) {
            throw new Error('Неправильний логін або пароль');
        }
        return res.json();
    })
    .then(data => {
        // 🔹 зберігаємо роль
    localStorage.setItem('isAdmin', data.isAdmin);

    // (опційно) можна зберегти логін
    localStorage.setItem('userLogin', data.login);

    window.location.href = 'index.html';
    })
    .catch(err => {
        document.getElementById('error').textContent = err.message;
    });
    
});
