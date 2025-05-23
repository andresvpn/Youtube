const express = require('express');
const router = express.Router();
const yts = require('yt-search');

// Endpoint para búsqueda de videos
router.get('/search', async (req, res) => {
  try {
    const { q, page } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const pages = Math.min(parseInt(page) || 3, 10); // usa 3 si no hay page, máximo 10

    const searchResults = await yts({ query: q, pages });

    res.json({
      status: true,
      data: searchResults.videos
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para obtener información de un video específico
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const searchResults = await yts({ videoId: id });
    
    if (!searchResults.videos.length) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({
      status: true,
      data: searchResults.videos[0]
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
