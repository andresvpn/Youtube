const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require("./config")

router.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // SEO básico para la página principal
  const seo = {
    title: config.title + "- Reproductor de Videos",
    description: "Disfruta de los mejores videos en " + config.title + ". Busca, descubre y reproduce contenido de calidad.",
    image: config.logo,
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
  
  html = html.replace('<title>andresvpn</title>', head);
  res.send(html);
});

module.exports = router;
