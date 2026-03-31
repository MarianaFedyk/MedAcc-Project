const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'medecine.json');

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'LogIn.html'));
});

app.use(express.static(__dirname));

app.post('/add-medicine', (req, res) => {
    const newMedicine = req.body;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let json = [];
        
        if (!err && data) {
            json = JSON.parse(data);
        }

        json.push(newMedicine);

        fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Помилка при записі файлу');
            }
            res.status(200).send({ message: 'Дані успішно збережено!' });
        });
    });
});



const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));



app.post('/register', (req, res) => {
    const newUser = req.body;

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let users = [];

        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch {
                users = [];
            }
        }

        const userExists = users.find(u => u.login === newUser.login);
        if (userExists) {
            return res.status(400).send({ message: 'Такий логін вже існує' });
        }

        users.push({
    login: newUser.login?.trim(),
    password: newUser.password?.trim()
});

        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send({ message: 'Помилка запису' });
            }

            res.send({ message: 'Реєстрація успішна' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
});


app.post('/login', (req, res) => {
    const { login, password } = req.body;

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let users = [];

        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch {
                users = [];
            }
        }

        const user = users.find(u =>
    String(u.login).trim() === String(login).trim() &&
    String(u.password).trim() === String(password).trim()
);

        if (!user) {
            return res.status(401).json({ message: 'Неправильний логін або пароль' });
        }

        res.json({ message: 'Вхід успішний' });
    });
});