const express = require('express');
const router = express.Router();
const yts = require('yt-search');
const config = require("./config");

router.get('/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const cleanChannelId = channelId.startsWith('@') ? channelId.substring(1) : channelId;

  try {
    // First try to find channel by custom URL (@handle)
    let searchResults;
    try {
      searchResults = await yts({ query: cleanChannelId, type: 'channel' });
      
      // If no results, try with the original ID
      if (!searchResults.channels.length) {
        searchResults = await yts({ channelId: cleanChannelId });
      }
    } catch (error) {
      console.error('Error searching channel:', error);
      return res.status(500).send(`
        <div style="text-align:center;padding:2rem;color:white;background:#121212;">
          <h1>Error al buscar el canal</h1>
          <p>Intenta nuevamente más tarde</p>
          <a href="/" style="color:#00C853;text-decoration:none;">Volver al inicio</a>
        </div>
      `);
    }

    if (!searchResults.channels.length && !searchResults.videos.length) {
      return res.status(404).send(`
        <div style="text-align:center;padding:2rem;color:white;background:#121212;">
          <h1>Canal no encontrado</h1>
          <p>No se encontró el canal: ${cleanChannelId}</p>
          <a href="/" style="color:#00C853;text-decoration:none;">Volver al inicio</a>
        </div>
      `);
    }

    const channelData = searchResults.channels[0] || {
      name: searchResults.videos[0].author.name,
      url: searchResults.videos[0].author.url,
      description: searchResults.videos[0].author.description,
      subscribers: searchResults.videos[0].author.subscribers,
      thumbnail: searchResults.videos[0].author.thumbnail
    };

    // Get channel videos
    const channelVideos = await yts({ channelId: channelData.channelId || channelData.url.split('/').pop() });
    
    if (!channelVideos.videos.length) {
      return res.status(404).send(`
        <div style="text-align:center;padding:2rem;color:white;background:#121212;">
          <h1>No hay videos disponibles</h1>
          <p>El canal no tiene videos públicos</p>
          <a href="/" style="color:#00C853;text-decoration:none;">Volver al inicio</a>
        </div>
      `);
    }

    // Complete HTML response
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${channelData.name} - ${config.title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #00C853;
            --primary-dark: #009624;
            --primary-light: #5EFC82;
            --dark: #121212;
            --dark-light: #1E1E1E;
            --light: #FFFFFF;
            --gray: #B3B3B3;
            --gray-dark: #606060;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--dark);
            color: var(--light);
            overflow-x: hidden;
            line-height: 1.6;
        }
        
        /* Header */
        .header {
            padding: 1rem;
            background: var(--dark);
            border-bottom: 1px solid var(--dark-light);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            font-size: 1.5rem;
            font-weight: bold;
            text-decoration: none;
        }
        
        .logo i {
            font-size: 1.8rem;
        }
        
        .search-bar {
            flex: 1;
            max-width: 600px;
            position: relative;
        }
        
        .search-input {
            width: 100%;
            padding: 0.8rem 1.2rem;
            padding-right: 3rem;
            background: var(--dark-light);
            border: none;
            border-radius: 2rem;
            color: var(--light);
            font-size: 1rem;
            outline: none;
        }
        
        .search-btn {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            background: none;
            border: none;
            color: var(--gray);
            padding: 0 1.2rem;
            cursor: pointer;
            transition: color 0.2s;
        }
        
        .search-btn:hover {
            color: var(--primary);
        }
        
        /* Back button */
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--dark-light);
            color: var(--light);
            border: none;
            padding: 0.7rem 1.3rem;
            border-radius: 2rem;
            margin: 1rem 0;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .back-btn:hover {
            background: var(--primary);
            color: var(--dark);
        }
        
        /* Channel header */
        .channel-header {
            padding: 2rem 0;
            text-align: center;
        }
        
        .channel-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--primary);
            margin: 0 auto 1rem;
            background: var(--dark-light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 2.5rem;
            font-weight: bold;
            overflow: hidden;
        }
        
        .channel-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .channel-name {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }
        
        .channel-stats {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-bottom: 1rem;
            color: var(--gray);
        }
        
        .channel-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .channel-description {
            max-width: 700px;
            margin: 0 auto;
            color: var(--gray);
            padding: 0 1rem;
        }
        
        /* Videos grid */
        .videos-section {
            padding: 1rem 0 3rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }
        
        .section-title i {
            color: var(--primary);
        }
        
        .videos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .video-card {
            background: var(--dark-light);
            border-radius: 0.8rem;
            overflow: hidden;
            transition: transform 0.2s;
        }
        
        .video-card:hover {
            transform: translateY(-5px);
        }
        
        .video-thumbnail {
            position: relative;
            aspect-ratio: 16/9;
            background: var(--dark);
        }
        
        .video-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        
        .video-duration {
            position: absolute;
            bottom: 0.5rem;
            right: 0.5rem;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 0.3rem;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .video-info {
            padding: 1rem;
        }
        
        .video-title {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .video-meta {
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .search-bar {
                width: 100%;
            }
            
            .channel-avatar {
                width: 100px;
                height: 100px;
                font-size: 2rem;
            }
            
            .channel-name {
                font-size: 1.5rem;
            }
            
            .videos-grid {
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            }
        }
        
        @media (max-width: 480px) {
            .videos-grid {
                grid-template-columns: 1fr;
            }
            
            .channel-stats {
                flex-direction: column;
                gap: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <i class="fas fa-play"></i>
                    <span>${config.title}</span>
                </a>
                
                <div class="search-bar">
                    <input type="text" class="search-input" placeholder="Buscar videos..." id="searchInput">
                    <button class="search-btn" id="searchBtn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>
    
    <main class="container">
        <button class="back-btn" onclick="window.location.href='/'">
            <i class="fas fa-arrow-left"></i>
            Volver al inicio
        </button>
        
        <section class="channel-header">
            <div class="channel-avatar">
                ${channelData.thumbnail ? 
                  `<img src="${channelData.thumbnail}" class="channel-avatar-img" alt="${channelData.name}">` : 
                  getInitials(channelData.name)}
            </div>
            <h1 class="channel-name">${channelData.name}</h1>
            
            <div class="channel-stats">
                <div class="channel-stat">
                    <i class="fas fa-users"></i>
                    <span>${formatNumber(channelData.subscribers)} suscriptores</span>
                </div>
                <div class="channel-stat">
                    <i class="fas fa-video"></i>
                    <span>${channelVideos.videos.length} videos</span>
                </div>
            </div>
            
            ${channelData.description ? `
                <p class="channel-description">${channelData.description}</p>
            ` : ''}
        </section>
        
        <section class="videos-section">
            <h2 class="section-title">
                <i class="fas fa-play-circle"></i>
                Videos del canal
            </h2>
            
            <div class="videos-grid">
                ${channelVideos.videos.map(video => `
                    <div class="video-card" onclick="window.location.href='/watch/${video.videoId}'">
                        <div class="video-thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                            ${video.duration?.timestamp ? `
                                <span class="video-duration">${video.duration.timestamp}</span>
                            ` : ''}
                        </div>
                        <div class="video-info">
                            <h3 class="video-title">${video.title}</h3>
                            <div class="video-meta">
                                ${video.views ? formatNumber(video.views) + ' vistas' : ''}
                                ${video.ago ? ' • ' + video.ago : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    </main>
    
    <script>
        // Helper functions
        function formatNumber(num) {
            if (!num || isNaN(num)) return 'N/A';
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num;
        }
        
        function getInitials(name) {
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', search);
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') search();
        });
        
        function search() {
            const query = document.getElementById('searchInput').value.trim();
            if (query) {
                window.location.href = '/search?q=' + encodeURIComponent(query);
            }
        }
    </script>
</body>
</html>
    `);

  } catch (error) {
    console.error('Error loading channel:', error);
    res.status(500).send(`
      <div style="text-align:center;padding:2rem;color:white;background:#121212;">
        <h1>Error del servidor</h1>
        <p>Ocurrió un error al cargar el canal</p>
        <a href="/" style="color:#00C853;text-decoration:none;">Volver al inicio</a>
      </div>
    `);
  }
});

module.exports = router;
