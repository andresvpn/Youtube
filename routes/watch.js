const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const isEmbed = req.path.includes('_embed');
  
  try {
    // Buscar información del video
    const searchResults = await yts({ videoId: id });
    if (!searchResults.videos.length) {
      return res.status(404).send('Video no encontrado');
    }
    
    const video = searchResults.videos[0];
    const htmlPath = path.join(__dirname, '../public/index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // SEO para la página de video
    const seo = {
      title: `${video.title} - PlayTube`,
      description: `Video de ${video.author.name} - ${video.timestamp}`,
      image: video.thumbnail,
      url: req.protocol + '://' + req.get('host') + req.originalUrl,
      embedUrl: `https://www.youtube.com/embed/${video.videoId}`
    };
    
    const head = `
      <title>${seo.title}</title>
      <meta name="description" content="${seo.description}">
      <meta property="og:title" content="${seo.title}">
      <meta property="og:description" content="${seo.description}">
      <meta property="og:image" content="${seo.image}">
      <meta property="og:url" content="${seo.url}">
      <meta property="og:type" content="video.other">
      <meta property="og:video:url" content="${seo.embedUrl}">
      <meta property="og:video:secure_url" content="${seo.embedUrl}">
      <meta property="og:video:type" content="text/html">
      <meta property="og:video:width" content="1280">
      <meta property="og:video:height" content="720">
      <meta name="twitter:card" content="player">
      <meta name="twitter:player" content="${seo.embedUrl}">
      <meta name="twitter:player:width" content="1280">
      <meta name="twitter:player:height" content="720">
    `;
    
    // Inyectar SEO y datos iniciales para el cliente
    html = html.replace('<title>PlayTube - Reproductor de Videos</title>', head);
    
    // Inyectar datos iniciales para el cliente
    const initialData = `
      <script>
        window.initialData = {
          video: ${JSON.stringify(video)},
          isEmbed: ${isEmbed},
          suggestedVideos: []
        };
      </script>
    `;
    
    html = html.replace('</head>', `${initialData}</head>`);
    res.send(html);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).send('Error al cargar el video');
  }
});

router.get('/:id/embed', (req, res) => {
  // Redirigir a la ruta normal pero con parámetro para el cliente
  res.redirect(`/watch/${req.params.id}?_embed=true`);
});

module.exports = router;
