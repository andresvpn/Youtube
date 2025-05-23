const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const isEmbed = req.path.includes('_embed');

  try {
    // Validar el ID
    if (!id || id.length < 11) {
      return res.status(400).send('ID de video inválido');
    }

    // Hacer una búsqueda por el ID como texto y filtrar
    let searchResults;
    try {
      const result = await yts(id);
      searchResults = result.videos.find(v => v.videoId === id);
    } catch (error) {
      console.error('Error en yt-search:', error);
      return res.status(502).send('Error al conectar con el servicio de búsqueda');
    }

    // Verificar si se encontró el video
    if (!searchResults) {
      return res.status(404).send('Video no encontrado');
    }

    const video = searchResults;

    const htmlPath = path.join(__dirname, '../public/index.html');
    let html;
    try {
      html = fs.readFileSync(htmlPath, 'utf8');
    } catch (error) {
      console.error('Error al leer el archivo HTML:', error);
      return res.status(500).send('Error interno del servidor');
    }

    const seo = {
      title: `${video.title} - PlayTube`,
      description: `Video de ${video.author?.name || 'este canal'} - ${video.timestamp || ''}`.trim(),
      image: video.thumbnail || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      embedUrl: `https://www.youtube.com/embed/${video.videoId}`
    };

    const head = `
      <title>${seo.title}</title>
      <meta name="description" content="${seo.description}">
      <meta property="og:type" content="video.other">
      <meta property="og:title" content="${seo.title}">
      <meta property="og:description" content="${seo.description}">
      <meta property="og:image" content="${seo.image}">
      <meta property="og:url" content="${seo.url}">
      <meta property="og:video:url" content="${seo.embedUrl}">
      <meta property="og:video:secure_url" content="${seo.embedUrl}">
      <meta property="og:video:type" content="text/html">
      <meta property="og:video:width" content="1280">
      <meta property="og:video:height" content="720">
      <meta name="twitter:card" content="player">
      <meta name="twitter:title" content="${seo.title}">
      <meta name="twitter:description" content="${seo.description}">
      <meta name="twitter:image" content="${seo.image}">
      <meta name="twitter:player" content="${seo.embedUrl}">
      <meta name="twitter:player:width" content="1280">
      <meta name="twitter:player:height" content="720">
    `;

    html = html.replace('<title>PlayTube - Reproductor de Videos</title>', head);

    const initialData = {
      video: {
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        timestamp: video.timestamp,
        views: video.views,
        ago: video.ago,
        author: video.author
      },
      isEmbed,
      suggestedVideos: []
    };

    const initialDataScript = `
      <script>
        window.initialData = ${JSON.stringify(initialData)};
      </script>
    `;

    html = html.replace('</head>', `${initialDataScript}</head>`);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).send('Error interno al cargar el video');
  }
});

router.get('/:id/embed', (req, res) => {
  try {
    const videoId = req.params.id;
    if (!videoId || videoId.length < 11) {
      return res.status(400).send('ID de video inválido');
    }
    res.redirect(`/watch/${videoId}?_embed=true`);
  } catch (error) {
    console.error('Error en embed:', error);
    res.status(500).send('Error interno');
  }
});

module.exports = router;
