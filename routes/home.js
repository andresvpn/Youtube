const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // SEO básico para la página principal
  const seo = {
    title: "PlayTube - Reproductor de Videos",
    description: "Disfruta de los mejores videos en PlayTube. Busca, descubre y reproduce contenido de calidad.",
    image: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    url: req.protocol + '://' + req.get('host') + req.originalUrl
  };
  
  // Inyectar meta tags en el head
  const head = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:image" content="${seo.image}">
    <meta property="og:url" content="${seo.url}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
  `;
  
  html = html.replace('<title>PlayTube - Reproductor de Videos</title>', head);
  res.send(html);
});

module.exports = router;
