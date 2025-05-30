const express = require('express');
const path = require('path');
const app = express();

// Configuración básica


app.use('/img', express.static(__dirname + '/img'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', require('./routes/home'));
app.use('/watch', require('./routes/watch'));
app.use('/search', require('./routes/search'));
app.use('/api', require('./routes/api'));

// Manejo de errores
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

module.exports = app;
