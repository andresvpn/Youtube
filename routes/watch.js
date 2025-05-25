const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const config = require("./config")

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const isEmbed = req.path.includes('_embed');

  try {
    if (!id || id.length < 11) {
      return res.status(400).sendFile(path.join(__dirname, '..', 'public', '400.html')); 
    }

    let searchResults;
    try {
      const result = await yts(id);
      searchResults = result.videos.find(v => v.videoId === id);
    } catch (error) {
      console.error('Error en yt-search:', error);
      return res.status(502).sendFile(path.join(__dirname, '..', 'public', '502.html')); 
    }

    if (!searchResults) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'public', '504.html')); 
    }

    const video = searchResults;

    const htmlPath = path.join(__dirname, '../public/index.html');
    let html;
    try {
      html = fs.readFileSync(htmlPath, 'utf8');
    } catch (error) {
      console.error('Error al leer el archivo HTML:', error);
      return res.status(500).sendFile(path.join(__dirname, '..', 'public', '500.html')); 
    }

    const seo = {
      title: `${video.title} - ${config.title}`,
      description: `Video de ${video.author?.name || 'este canal'} - ${video.timestamp || ''}`.trim(),
      image: video.thumbnail || config.logo,
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
      <link rel="icon" href="${config.logo}" type="image/png">
    `;

    html = html.replace('<title></title>', head);

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
        window.addEventListener('DOMContentLoaded', () => {
          if (window.initialData && typeof playVideo === 'function') {
            playVideo(window.initialData.video);
          }
        });
      </script>
    `;

    html = html.replace('</head>', `${initialDataScript}</head>`);
    html = html.replace('<span id="dinamic_title"></span>', `<span id="dinamic_title">${config.title}</span>`);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error inesperado:', error);
   // Error 404
res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));

// Error 500
res.status(500).sendFile(path.join(__dirname, '..', 'public', '500.html')); 
  }
});

router.get('/:id/embed', (req, res) => {
  try {
    const videoId = req.params.id;
    if (!videoId || videoId.length < 11) {
      return res.status(400).sendFile(path.join(__dirname, '..', 'public', '404.html')); 
    }
    res.redirect(`/watch/${videoId}?_embed=true`);
  } catch (error) {
    console.error('Error en embed:', error);
    res.status(500).sendFile(path.join(__dirname, '..', 'public', '500.html')); 
  }
});

module.exports = router;
