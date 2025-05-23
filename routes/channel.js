const express = require('express');
const router = express.Router();
const yts = require('yt-search');
const config = require("./config");

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Search for channel videos
    const searchResults = await yts({ channelId: id });
    
    if (!searchResults.videos.length) {
      return res.status(404).send('Canal no encontrado');
    }

    const channelInfo = {
      name: searchResults.videos[0].author.name,
      description: searchResults.videos[0].author.description || 'Sin descripción',
      subscriberCount: searchResults.videos[0].author.subscribers || 'N/A',
      videoCount: searchResults.videos.length,
      videos: searchResults.videos,
      thumbnail: searchResults.videos[0].author.thumbnail
    };

    // SEO for channel page
    const seo = {
      title: `${channelInfo.name} - ${config.title}`,
      description: channelInfo.description,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      image: channelInfo.thumbnail
    };

    // Complete HTML with embedded CSS and JS
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="description" content="${seo.description}">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:image" content="${seo.image}">
    <meta property="og:url" content="${seo.url}">
    <meta property="og:type" content="profile">
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
        }
        
        /* Header */
        header {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            background-color: var(--dark);
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid var(--dark-light);
            gap: 1rem;
        }
        
        .header-top {
            display: flex;
            justify-content: center;
            width: 100%;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--primary);
            text-decoration: none;
            white-space: nowrap;
        }
        
        .logo i {
            color: var(--primary);
        }
        
        .search-container {
            display: flex;
            width: 100%;
            max-width: 800px;
            position: relative;
        }
        
        .search-input {
            width: 100%;
            padding: 0.8rem 1.2rem;
            border: none;
            background: var(--dark-light);
            color: var(--light);
            border-radius: 30px;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .search-input:focus {
            box-shadow: 0 0 0 2px var(--primary);
        }
        
        .search-button {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            background: transparent;
            border: none;
            color: var(--gray);
            padding: 0 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 0 30px 30px 0;
        }
        
        .search-button:hover {
            color: var(--primary);
        }
        
        /* Main content */
        .main-content {
            padding: 1.5rem;
            max-width: 1600px;
            margin: 0 auto;
        }
        
        /* Back button */
        .back-button {
            display: flex;
            background: var(--dark-light);
            color: var(--light);
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 30px;
            margin: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
        }
        
        .back-button:hover {
            background: var(--primary);
            color: var(--dark);
        }
        
        /* Channel header */
        .channel-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(to bottom, var(--dark-light), var(--dark));
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-bottom: 1px solid var(--dark-light);
        }
        
        .channel-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: var(--dark-light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-weight: bold;
            font-size: 2rem;
            margin-bottom: 1rem;
            border: 3px solid var(--primary);
            background-size: cover;
            background-position: center;
        }
        
        .channel-name {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            color: var(--light);
        }
        
        .channel-stats {
            display: flex;
            gap: 1.5rem;
            color: var(--gray);
            margin-bottom: 1.5rem;
        }
        
        .channel-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .channel-description {
            max-width: 800px;
            color: var(--gray);
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        
        /* Videos grid */
        .videos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            padding: 0 1.5rem 2rem;
        }
        
        .video-card {
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .video-card:hover {
            transform: translateY(-5px);
        }
        
        .video-thumbnail {
            position: relative;
            margin-bottom: 0.8rem;
            border-radius: 12px;
            overflow: hidden;
            aspect-ratio: 16/9;
            background: var(--dark-light);
        }
        
        .video-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .video-card:hover .video-thumbnail img {
            transform: scale(1.05);
        }
        
        .video-duration {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .video-card-info h3 {
            font-size: 1.05rem;
            margin-bottom: 0.4rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            color: var(--light);
            line-height: 1.4;
        }
        
        .video-card-info p {
            color: var(--gray);
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        /* Section title */
        .section-title {
            font-size: 1.5rem;
            margin: 1.5rem;
            color: var(--light);
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }
        
        .section-title i {
            color: var(--primary);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            header {
                padding: 0.8rem;
            }
            
            .logo {
                font-size: 1.5rem;
            }
            
            .channel-header {
                padding: 1.5rem 1rem;
            }
            
            .channel-avatar {
                width: 80px;
                height: 80px;
                font-size: 1.5rem;
            }
            
            .channel-name {
                font-size: 1.5rem;
            }
            
            .videos-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1.2rem;
                padding: 0 1rem 1.5rem;
            }
        }
        
        @media (max-width: 576px) {
            .header-top {
                flex-direction: column;
                align-items: center;
                gap: 0.8rem;
            }
            
            .search-container {
                width: 100%;
            }
            
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
    <!-- Header -->
    <header>
        <div class="header-top">
            <a href="/" class="logo" id="home-link">
                <i class="fas fa-play"></i>
                <span>${config.title}</span>
            </a>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Buscar videos..." id="search-input">
            <button class="search-button" id="search-button">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </header>
    
    <!-- Back button -->
    <button class="back-button" id="back-button">
        <i class="fas fa-arrow-left"></i>
        Volver al inicio
    </button>
    
    <!-- Channel header -->
    <div class="channel-header">
        <div class="channel-avatar" id="channel-avatar" style="${channelInfo.thumbnail ? `background-image: url('${channelInfo.thumbnail}')` : ''}">
            ${!channelInfo.thumbnail ? getInitials(channelInfo.name) : ''}
        </div>
        <h1 class="channel-name">${channelInfo.name}</h1>
        <div class="channel-stats">
            <div class="channel-stat">
                <i class="fas fa-users"></i>
                <span>${formatNumber(channelInfo.subscriberCount)} suscriptores</span>
            </div>
            <div class="channel-stat">
                <i class="fas fa-video"></i>
                <span>${channelInfo.videoCount} videos</span>
            </div>
        </div>
        <p class="channel-description">${channelInfo.description}</p>
    </div>
    
    <!-- Channel videos -->
    <div class="main-content">
        <h2 class="section-title">
            <i class="fas fa-play-circle"></i>
            Videos del canal
        </h2>
        <div class="videos-grid" id="videos-grid">
            ${generateVideoCards(channelInfo.videos)}
        </div>
    </div>
    
    <script>
        // Helper functions
        function formatNumber(num) {
            if (!num || isNaN(num)) return 'N/A';
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }
        
        function getInitials(name) {
            return name.split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        
        // Event listeners
        document.getElementById('back-button').addEventListener('click', () => {
            window.location.href = '/';
        });
        
        document.getElementById('home-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
        
        document.getElementById('search-button').addEventListener('click', () => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                window.location.href = '/search?q=' + encodeURIComponent(query);
            }
        });
        
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = document.getElementById('search-input').value.trim();
                if (query) {
                    window.location.href = '/search?q=' + encodeURIComponent(query);
                }
            }
        });
        
        // Add click events to video cards
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                if (videoId) {
                    window.location.href = '/watch/' + videoId;
                }
            });
        });
    </script>
</body>
</html>
    `;

    // Helper functions for generating HTML
    function formatNumber(num) {
      if (!num || isNaN(num)) return 'N/A';
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }

    function getInitials(name) {
      return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    function generateVideoCards(videos) {
      return videos.map(video => `
        <div class="video-card" data-video-id="${video.videoId}">
          <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            ${video.duration?.timestamp ? `<div class="video-duration">${video.duration.timestamp}</div>` : ''}
          </div>
          <div class="video-card-info">
            <h3>${video.title}</h3>
            <p>${formatNumber(video.views)} vistas • ${video.ago || ''}</p>
          </div>
        </div>
      `).join('');
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error al cargar el canal:', error);
    res.status(500).send('Error interno al cargar el canal');
  }
});

module.exports = router;
