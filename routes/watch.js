// En tu archivo routes/watch.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validación mejorada del ID
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return res.redirect('/');
  }

  try {
    const searchResults = await yts({ videoId: id });
    
    if (!searchResults.videos.length) {
      return res.redirect('/');
    }
    
    const video = searchResults.videos[0];
    const htmlPath = path.join(__dirname, '../public/index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Datos iniciales para el cliente
    const initialData = {
      video: {
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        views: video.views,
        ago: video.ago,
        author: video.author
      },
      directAccess: true
    };

    // Inyectar datos en el HTML
    const initialDataScript = `
      <script>
        window.initialData = ${JSON.stringify(initialData)};
      </script>
    `;
    
    html = html.replace('</head>', `${initialDataScript}</head>`);
    
    // Enviar respuesta
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error al cargar el video:', error);
    res.redirect('/');
  }
});

module.exports = router;
  
