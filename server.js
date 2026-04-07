const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'medecine.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'LogIn.html'));
});

function readJSON(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback([]);

    try {
      callback(JSON.parse(data));
    } catch {
      callback([]);
    }
  });
}

app.get('/categories', (req, res) => {
  readJSON(CATEGORIES_FILE, (categories) => {
    res.json(categories);
  });
});

app.get('/medicines', (req, res) => {
  readJSON(DATA_FILE, (medicines) => {
    res.json(medicines);
  });
});

app.post('/add-medicine', (req, res) => {
  const newMedicine = req.body;

  newMedicine.categoryID = Number(newMedicine.categoryID);

  readJSON(DATA_FILE, (medicines) => {
    medicines.push(newMedicine);

    fs.writeFile(DATA_FILE, JSON.stringify(medicines, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Помилка запису' });
      }

      res.json({ message: 'Ліки додано успішно' });
    });
  });
});

app.post('/register', (req, res) => {
  const newUser = req.body;

  readJSON(USERS_FILE, (users) => {

    const userExists = users.find(u =>
      String(u.login).trim() === String(newUser.login).trim()
    );

    if (userExists) {
      return res.status(400).json({ message: 'Такий логін вже існує' });
    }

    users.push({
      login: newUser.login?.trim(),
      password: newUser.password?.trim()
    });

    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Помилка запису' });
      }

      res.json({ message: 'Реєстрація успішна' });
    });
  });
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;

  readJSON(USERS_FILE, (users) => {

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

// 🔍 пошук по назві
app.get('/medicine', (req, res) => {
  const name = req.query.name;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.json(null);

    const medicines = JSON.parse(data);

    const medicine = medicines.find(m =>
      m.tradeName.toLowerCase().includes(name.toLowerCase())
    );

    res.json(medicine || null);
  });
});

app.put('/medicine', (req, res) => {
  const updated = req.body;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let medicines = JSON.parse(data || "[]");

    const index = medicines.findIndex(m =>
      m.tradeName === updated.tradeName
    );

    if (index === -1) {
      return res.status(404).json({ message: "Не знайдено" });
    }

    medicines[index] = updated;

    fs.writeFile(DATA_FILE, JSON.stringify(medicines, null, 2), () => {
      res.json({ message: "Оновлено" });
    });
  });
});

app.delete('/medicine', (req, res) => {
  const { tradeName } = req.body;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let medicines = JSON.parse(data || "[]");

    medicines = medicines.filter(m => m.tradeName !== tradeName);

    fs.writeFile(DATA_FILE, JSON.stringify(medicines, null, 2), () => {
      res.json({ message: "Видалено" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});