const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'medecine.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'LogIn.html'));
});

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ заборонено' });
    }
    next();
}

app.post('/add-medicine', requireAdmin, (req, res) => {

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

            res.status(200).send({
                message: 'Дані успішно збережено!'
            });

        });

    });

});

app.get('/medicine', requireAdmin, (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({ message: "Не передано назву" });
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Помилка читання" });
        }

        let medicines = [];

        try {
            medicines = JSON.parse(data);
        } catch {
            return res.status(500).json({ message: "Помилка JSON" });
        }

        const medicine = medicines.find(m =>
            m.tradeName?.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (!medicine) {
            return res.status(404).json({ message: "Не знайдено" });
        }

        res.json(medicine);
    });
});

app.put('/medicine', requireAdmin, (req, res) => {
    const updatedMedicine = req.body;

    if (!updatedMedicine.tradeName) {
        return res.status(400).json({ message: "Не передано назву" });
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Помилка читання" });
        }

        let medicines = [];

        try {
            medicines = JSON.parse(data);
        } catch {
            return res.status(500).json({ message: "Помилка JSON" });
        }

        const index = medicines.findIndex(m =>
            m.tradeName?.toLowerCase().trim() === updatedMedicine.tradeName.toLowerCase().trim()
        );

        if (index === -1) {
            return res.status(404).json({ message: "Не знайдено" });
        }

        // 🔹 ОНОВЛЕННЯ
        medicines[index] = updatedMedicine;

        fs.writeFile(DATA_FILE, JSON.stringify(medicines, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Помилка запису" });
            }

            res.json({ message: "Успішно оновлено!" });
        });
    });
});

app.get('/medicines', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Помилка читання" });
        }

        try {
            const medicines = JSON.parse(data);
            res.json(medicines);
        } catch {
            res.status(500).json({ message: "Помилка JSON" });
        }
    });
});

app.delete('/medicine', requireAdmin, (req, res) => {
    const { tradeName } = req.body;

    if (!tradeName) {
        return res.status(400).json({ message: "Не передано назву" });
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Помилка читання" });
        }

        let medicines = [];

        try {
            medicines = JSON.parse(data);
        } catch {
            return res.status(500).json({ message: "Помилка JSON" });
        }

        const newMedicines = medicines.filter(m =>
            m.tradeName?.toLowerCase().trim() !== tradeName.toLowerCase().trim()
        );

        if (newMedicines.length === medicines.length) {
            return res.status(404).json({ message: "Не знайдено" });
        }

        fs.writeFile(DATA_FILE, JSON.stringify(newMedicines, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Помилка запису" });
            }

            res.json({ message: "Успішно видалено!" });
        });
    });
});

app.use(express.static(__dirname));

app.get('/categories', (req, res) => {
    fs.readFile(CATEGORIES_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Помилка читання" });
        }

        try {
            const categories = JSON.parse(data);
            res.json(categories);
        } catch {
            res.status(500).json({ message: "Помилка JSON" });
        }
    });
});


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
            return res.status(400).send({
                message: 'Такий логін вже існує'
            });
        }

        users.push({
            login: newUser.login?.trim(),
            password: newUser.password?.trim(),
            isAdmin: false
        });

        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {

            if (err) {
                return res.status(500).send({
                    message: 'Помилка запису'
                });
            }

            res.send({
                message: 'Реєстрація успішна'
            });

        });

    });

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
            return res.status(401).json({
                message: 'Неправильний логін або пароль'
            });
        }

        // 🔹 ВАЖЛИВО: запис у сесію
        req.session.user = {
            login: user.login,
            isAdmin: user.isAdmin || false
        };

        res.json({
            message: 'Вхід успішний'
        });
    });
});

app.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ isAuth: false });
    }

    res.json({
        isAuth: true,
        isAdmin: req.session.user.isAdmin
    });
});

app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
});