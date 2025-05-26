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
app.use('/api', (req, res, next) => {
  const allowedOrigin = 'https://micTube.vercel.app';
  const origin = req.get('origin') || req.get('referer');

  if (origin && origin.startsWith(allowedOrigin)) {
    next(); // Permitir acceso
  } else {
    res.status(403).json({ error: 'Acceso no autorizado' });
  }
}, require('./routes/api'));

// Manejo de errores
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

module.exports = app;
