const express = require('express');
const ytsr = require('yt-search');
const path = require('path');
const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Variables globales
const SITE_NAME = 'PlayTube';
const SITE_URL = 'https://playtube.vercel.app'; // Cambiar por tu dominio real
const PRIMARY_COLOR = '#00C853';

// Rutas
app.get('/', async (req, res) => {
    const query = req.query.q || 'twice';
    
    try {
        const searchResults = await ytsr(query);
        const videos = searchResults.videos.slice(0, 12);
        
        res.render('index', {
            title: `${SITE_NAME} - Buscar videos`,
            siteName: SITE_NAME,
            primaryColor: PRIMARY_COLOR,
            query,
            videos,
            currentUrl: `${SITE_URL}/?q=${encodeURIComponent(query)}`,
            shareImage: videos.length > 0 ? videos[0].thumbnail : `${SITE_URL}/default-thumbnail.jpg`
        });
    } catch (error) {
        console.error('Error searching videos:', error);
        res.render('index', {
            title: `${SITE_NAME} - Error`,
            siteName: SITE_NAME,
            primaryColor: PRIMARY_COLOR,
            query,
            videos: [],
            error: 'Error al buscar videos. Intenta nuevamente.'
        });
    }
});

app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    
    if (!videoId) {
        return res.redirect('/');
    }
    
    try {
        // Buscar el video específico
        const searchResults = await ytsr({ videoId });
        if (!searchResults.videos || searchResults.videos.length === 0) {
            return res.redirect('/');
        }
        
        const video = searchResults.videos[0];
        
        // Buscar videos relacionados
        const relatedResults = await ytsr(video.title);
        const relatedVideos = relatedResults.videos.slice(0, 6).filter(v => v.videoId !== videoId);
        
        res.render('video', {
            title: `${video.title} - ${SITE_NAME}`,
            siteName: SITE_NAME,
            primaryColor: PRIMARY_COLOR,
            video,
            relatedVideos,
            currentUrl: `${SITE_URL}/watch?v=${videoId}`,
            shareImage: video.thumbnail,
            videoEmbedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.redirect('/');
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
