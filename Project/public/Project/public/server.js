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
app.use(express.static(__dirname)); 

// Ендпоінт для отримання та збереження даних
app.post('/add-medicine', (req, res) => {
    const newMedicine = req.body;

    // Читаємо існуючий файл
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

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});