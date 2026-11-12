/**============================================
 * VIDEO SCREENSHOT + IMAGE DOWNLOADER EXTENSION v16.4
 * Supports: Video screenshots + Image downloads
 * Sites: Instagram, Twitter/X, Facebook, YouTube, TikTok, xFree, etc.
 * Fixed: Stacking Contexts, Invisible Overlays, and Capture-Phase Clicks
 *=============================================**/

// 1. Dynamic Style Generator
function getButtonStyle(isImage = false) {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let css = `
        position: absolute;
        z-index: 2147483647; 
        display: grid;
        place-items: center; 
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        opacity: 0.6; 
        cursor: pointer;
        transition: all 0.2s ease;
        pointer-events: auto;
    `;

    if (hostname.includes('facebook.com') || url.includes('youtube.com/shorts/')) {
        css += `top: 85px; right: 16px;`;
    } 
    else if (hostname.includes('instagram.com')) {
        css += isImage ? `top: 8px; right: 8px;` : `top: 25px; right: 15px;`;
    }
    else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        css += `top: 15px; right: 15px;`;
    }
    else {
        css += `top: 20px; right: 20px;`;
    }

    return css;
}

// 2. Icons
const CAMERA_ICON = `
<svg fill="white" height="22" viewBox="0 0 24 24" width="22" style="display: block; pointer-events: none;">
    <path d="M12 9.75A4.25 4.25 0 1 0 16.25 14 4.25 4.25 0 0 0 12 9.75Zm0 7A2.75 2.75 0 1 1 14.75 14 2.75 2.75 0 0 1 12 16.75Z"></path>
    <path d="M20.5 7h-2.12a2 2 0 0 1-1.85-1.25L15.93 4.2a2 2 0 0 0-1.85-1.2h-4.16a2 2 0 0 0-1.85 1.2l-.6 1.55A2 2 0 0 1 5.62 7H3.5A2.5 2.5 0 0 0 1 9.5v9A2.5 2.5 0 0 0 3.5 21h17a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 20.5 7Zm1 11.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.12a3.51 3.51 0 0 0 3.24-2.18l.6-1.55a.5.5 0 0 1 .46-.32h4.16a.5.5 0 0 1 .46.32l.6 1.55a3.51 3.51 0 0 0 3.24 2.18H20.5a1 1 0 0 1 1 1Z"></path>
</svg>`;

const SUCCESS_ICON = `
<svg fill="#4caf50" height="22" viewBox="0 0 24 24" width="22" style="display: block; pointer-events: none;">
    <polyline points="20 6 9 17 4 12" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
</svg>`;

// 3. Video Capture Engine
function captureFrame(video) {
    if (video.videoWidth === 0 || video.videoHeight === 0) return false;
    try {
        if (!video.crossOrigin && video.src && !video.src.startsWith('blob:')) {
            video.crossOrigin = "anonymous";
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const site = window.location.hostname.replace('www.', '').split('.')[0];
            link.download = `${site}_screenshot_${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
        return true;
    } catch (err) {
        console.error("Capture Failed (likely cross-origin):", err);
        return false;
    }
}

// 4. Image Download Engine
function downloadImage(img) {
    try {
        const src = img.dataset.originalSrc || getBestImageSrc(img) || img.src;
        if (!src || src.startsWith('data:image/gif') || isTrackingPixel(img)) return false;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const site = window.location.hostname.replace('www.', '').split('.')[0];

        let filename;
        try {
            const urlObj = new URL(src);
            const pathParts = urlObj.pathname.split('/');
            const rawName = pathParts[pathParts.length - 1].split('?')[0];
            filename = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(rawName) ? `${site}_${rawName}` : `${site}_image_${timestamp}.jpg`;
        } catch {
            filename = `${site}_image_${timestamp}.jpg`;
        }

        fetch(src, { mode: 'cors' })
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
                const link = document.createElement('a');
                link.href = src;
                link.download = filename;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        return true;
    } catch (err) {
        console.error("Image Download Failed:", err);
        return false;
    }
}

function getBestImageSrc(img) {
    if (img.srcset) {
        const candidates = img.srcset.split(',').map(s => {
            const parts = s.trim().split(/\s+/);
            const url = parts[0];
            const width = parts[1] ? parseInt(parts[1]) : 0;
            return { url, width };
        });
        candidates.sort((a, b) => b.width - a.width);
        if (candidates.length > 0) return candidates[0].url;
    }
    return img.dataset.src || img.dataset.lazySrc || img.dataset.original || img.getAttribute('data-full-src') || img.currentSrc || img.src || null;
}

function isTrackingPixel(img) {
    return (img.naturalWidth <= 2 && img.naturalHeight <= 2) || (img.width <= 2 && img.height <= 2);
}

function isContentImage(img) {
    if (isTrackingPixel(img)) return false;
    const src = (img.src || '').toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    const classList = (img.className || '').toLowerCase();

    const uiKeywords = ['logo', 'icon', 'avatar', 'emoji', 'badge', 'button', 'spinner', 'loader', 'pixel', 'tracking', 'placeholder'];
    if (uiKeywords.some(kw => src.includes(kw) || classList.includes(kw))) return false;
    if (src.startsWith('data:image/svg')) return false;

    const rect = img.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 80) return false;

    return true;
}

// 5. Smart Container Finder 
function findBestContainer(el, isImage = false) {
    const hostname = window.location.hostname;

    if (hostname.includes('youtube.com')) {
        return el.closest('#movie_player') || el.closest('.html5-video-player') || el.parentElement;
    }
    
    if (hostname.includes('instagram.com')) {
        if (isImage) return el.closest('article') || el.closest('div[role="dialog"]') || el.parentElement;
        
        // Elevating the injection point 3 DOM layers up for Reels.
        // This attempts to put the button outside of the invisible click-catcher wrapper.
        return el.parentElement?.parentElement?.parentElement || el.parentElement?.parentElement || el.parentElement; 
    }

    let currentEl = el.parentElement;
    for (let i = 0; i < 5; i++) {
        if (!currentEl) break;
        const classes = (currentEl.className || '').toString().toLowerCase();
        if (classes.includes('swiper-slide') ||
            classes.includes('item') ||
            classes.includes('card') ||
            classes.includes('video-wrapper') ||
            classes.includes('post') ||
            (isImage && classes.includes('media')) ||
            classes.includes('active')) {
            return currentEl;
        }
        currentEl = currentEl.parentElement;
    }

    return el.parentElement;
}

// 6. Video Button Injector
function addDownloadButton(video) {
    const container = findBestContainer(video, false);
    if (!container || container.querySelector('.univ-frame-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'univ-frame-btn';
    btn.innerHTML = CAMERA_ICON;
    btn.style.cssText = getButtonStyle(false);
    btn.title = "Screenshot Frame";

    container.addEventListener('mouseenter', () => btn.style.opacity = '1');
    container.addEventListener('mouseleave', () => btn.style.opacity = '0.6');
    
    btn.onmouseenter = () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = () => { btn.style.opacity = '0.6'; btn.style.transform = 'scale(1)'; };

    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = 'scale(1.1)', 150);
        if (captureFrame(video)) {
            btn.innerHTML = SUCCESS_ICON;
            setTimeout(() => btn.innerHTML = CAMERA_ICON, 1500);
        }
    };

    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    container.appendChild(btn);
}

// 7. Image Button Injector 
function addImageDownloadButton(img) {
    if (!isContentImage(img)) return;

    const container = findBestContainer(img, true);
    if (!container || container.querySelector('.univ-img-dl-btn')) return;

    if (container.querySelector('.univ-frame-btn') && container !== img.parentElement) return;

    const btn = document.createElement('button');
    btn.className = 'univ-img-dl-btn';
    btn.innerHTML = CAMERA_ICON;
    btn.style.cssText = getButtonStyle(true);
    btn.title = "Download Image";

    container.addEventListener('mouseenter', () => btn.style.opacity = '1');
    container.addEventListener('mouseleave', () => btn.style.opacity = '0.6');
    
    btn.onmouseenter = () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = () => { btn.style.opacity = '0.6'; btn.style.transform = 'scale(1)'; };

    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = 'scale(1.1)', 150);
        if (downloadImage(img)) {
            btn.innerHTML = SUCCESS_ICON;
            setTimeout(() => btn.innerHTML = CAMERA_ICON, 1500);
        }
    };

    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    container.appendChild(btn);
}

// 8. Site-specific image selectors
function querySiteImages() {
    const hostname = window.location.hostname;
    const imgs = new Set();

    document.querySelectorAll('img').forEach(img => imgs.add(img));

    if (hostname.includes('instagram.com')) {
        document.querySelectorAll('article img, div[role="dialog"] img').forEach(img => imgs.add(img));
    }
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        document.querySelectorAll('article img, div[data-testid="tweetPhoto"] img').forEach(img => imgs.add(img));
    }
    if (hostname.includes('facebook.com')) {
        document.querySelectorAll('div[data-pagelet] img, div[role="main"] img').forEach(img => imgs.add(img));
    }
    if (hostname.includes('pinterest.com')) {
        document.querySelectorAll('div[data-test-id="pin-closeup-image"] img, img[srcset]').forEach(img => imgs.add(img));
    }
    if (hostname.includes('reddit.com')) {
        document.querySelectorAll('img[alt="Post image"], figure img').forEach(img => imgs.add(img));
    }

    return imgs;
}

// 9. Watcher
function initObserver() {
    document.querySelectorAll('video').forEach(addDownloadButton);
    querySiteImages().forEach(addImageDownloadButton);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    if (node.tagName === 'VIDEO') {
                        addDownloadButton(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('video').forEach(addDownloadButton);
                    }

                    if (node.tagName === 'IMG') {
                        addImageDownloadButton(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(addImageDownloadButton);
                    }
                });
            }

            if (mutation.type === 'attributes') {
                if (mutation.target.tagName === 'IMG') {
                    const img = mutation.target;
                    const container = findBestContainer(img, true);
                    if (container && !container.querySelector('.univ-img-dl-btn')) {
                        addImageDownloadButton(img);
                    }
                } else if (mutation.target.tagName === 'VIDEO') {
                    const video = mutation.target;
                    const container = findBestContainer(video, false);
                    if (container && !container.querySelector('.univ-frame-btn')) {
                        addDownloadButton(video);
                    }
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'data-src', 'srcset', 'poster']
    });
}

// 10. Ultimate Click Failsafe (Bypasses Overlays)
window.addEventListener('click', (e) => {
    // If clicked directly on our button normally, ignore (the normal logic handles it)
    if (e.target.closest('.univ-frame-btn') || e.target.closest('.univ-img-dl-btn')) return;

    // Check all our buttons
    const btns = document.querySelectorAll('.univ-frame-btn, .univ-img-dl-btn');
    for (let btn of btns) {
        const rect = btn.getBoundingClientRect();
        
        // Ensure the button is actually visible
        if (rect.width > 0 && rect.height > 0) {
            
            // Check if the user's mouse click coordinates fall precisely within the button's boundaries
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                
                // Aggressively block the social media site from registering this click
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Force our screenshot logic to trigger
                btn.click();
                return;
            }
        }
    }
}, true); // The 'true' activates the Capture Phase, intercepting the click before Instagram sees it

initObserver();