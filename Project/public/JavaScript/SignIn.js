document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login: login,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(() => {
        alert("Помилка з'єднання з сервером");
    });
});