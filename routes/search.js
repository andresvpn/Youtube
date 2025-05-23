const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require("../src/config")

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.redirect('/');
  }
  
  const htmlPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // SEO para página de búsqueda
  const seo = {
    title: `Buscar: ${q} - ${config.title}`,
    description: `Resultados de búsqueda para ${q} en ${config.title}`,
    url: req.protocol + '://' + req.get('host') + req.originalUrl
  };
  
  const head = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:url" content="${seo.url}">
    <meta property="og:type" content="website">
  `;
  
  // Inyectar SEO y datos iniciales para el cliente
  html = html.replace('<title></title>', head);
  
  const initialData = `
    <script>
      window.initialData = {
        searchQuery: "${q.replace(/"/g, '\\"')}",
        initialSearch: true
      };
    </script>
  `;
  
  html = html.replace('</head>', `${initialData}</head>`);
  res.send(html);
});

module.exports = router;
