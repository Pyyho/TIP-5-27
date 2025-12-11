const express = require('express');
const path = require('path');
const cors = require('cors');
const recipeRoutes = require('./routes/recipes');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Маршруты
app.use('/api/recipes', recipeRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;