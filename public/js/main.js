// Manejo del modal de compartir
document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.querySelector('.share-button');
    const closeShare = document.querySelector('.close-share');
    const shareModal = document.querySelector('.share-modal');
    const copyButton = document.querySelector('.copy-button');
    const shareInput = document.querySelector('.share-input');
    
    if (shareButton && shareModal) {
        shareButton.addEventListener('click', () => {
            shareModal.style.display = 'flex';
        });
        
        closeShare.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
        
        // Cerrar modal al hacer clic fuera
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
        
        // Copiar enlace
        copyButton.addEventListener('click', () => {
            shareInput.select();
            document.execCommand('copy');
            
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copiado!';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        });
    }
    
    // Mini player (si se implementa)
    const minimizeButton = document.querySelector('.minimize-button');
    const miniPlayer = document.querySelector('.mini-player');
    const closeMiniPlayer = document.querySelector('.close-mini-player');
    const maximizeButton = document.querySelector('.maximize-button');
    
    if (minimizeButton && miniPlayer) {
        minimizeButton.addEventListener('click', () => {
            miniPlayer.style.display = 'block';
        });
        
        closeMiniPlayer.addEventListener('click', () => {
            miniPlayer.style.display = 'none';
        });
        
        maximizeButton.addEventListener('click', () => {
            miniPlayer.style.display = 'none';
        });
    }
});
