require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt'); // 🔥 ДОДАЛИ
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// SUPABASE
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(__dirname));

// HOME
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ADMIN CHECK
function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ заборонено' });
    }
    next();
}

//////////////////////////
// MEDICINE (SUPABASE)
//////////////////////////

app.get('/medicines', async (req, res) => {
    const { data, error } = await supabase
        .from('medecine')
        .select('*');

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

app.get('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('medecine')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

app.post('/add-medicine', requireAdmin, async (req, res) => {
    const newMedicine = req.body;

    const { data, error } = await supabase
        .from('medecine')
        .insert([newMedicine])
        .select();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Додано!', data });
});

app.put('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const updatedMedicine = req.body;

    const { error } = await supabase
        .from('medecine')
        .update(updatedMedicine)
        .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Оновлено!' });
});

app.delete('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('medecine')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Видалено!' });
});

//////////////////////////
// CATEGORIES
//////////////////////////

app.get('/categories', async (req, res) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

//////////////////////////
// AUTH (FIXED)
//////////////////////////

const saltRounds = 10;

// REGISTER 🔥
app.post('/register', async (req, res) => {
    const { login, password } = req.body;

    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .maybeSingle();

    if (existingUser) {
        return res.status(400).json({ message: 'Такий логін вже існує' });
    }

    // 🔥 ХЕШУВАННЯ ПАРОЛЯ
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { error } = await supabase
        .from('users')
        .insert([{
            login,
            password_hash,
            is_admin: false
        }]);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Реєстрація успішна' });
});

// LOGIN 🔥
app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .maybeSingle();

    if (error || !user) {
        return res.status(401).json({ message: 'Неправильний логін або пароль' });
    }

    // 🔥 ПЕРЕВІРКА ХЕША
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: 'Неправильний логін або пароль' });
    }

    req.session.user = {
        id: user.id,
        login: user.login,
        isAdmin: user.is_admin
    };

    res.json({
        message: 'Вхід успішний',
        login: user.login,
        isAdmin: user.is_admin
    });
});

// CHECK AUTH
app.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ isAuth: false });
    }

    res.json({
        isAuth: true,
        isAdmin: req.session.user.isAdmin
    });
});

//////////////////////////

app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
});