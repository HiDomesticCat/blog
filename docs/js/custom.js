// 自定義 JavaScript - 增強部落格功能

document.addEventListener('DOMContentLoaded', function() {
    // ===== 平滑滾動 =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== 回到頂部按鈕 =====
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'translateY(0)';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'translateY(20px)';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ===== 程式碼複製功能 =====
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.textContent = '複製';
        copyButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // 設置父元素為相對定位
        block.style.position = 'relative';
        block.appendChild(copyButton);
        
        copyButton.addEventListener('click', async function() {
            const code = block.querySelector('code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                copyButton.textContent = '已複製！';
                setTimeout(() => {
                    copyButton.textContent = '複製';
                }, 2000);
            } catch (err) {
                console.error('複製失敗:', err);
            }
        });
    });

    // ===== 閱讀進度條 =====
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--primary-color);
        z-index: 1001;
        transition: width 0.2s;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // ===== 圖片懶加載 =====
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));

    // ===== 搜索功能增強 =====
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                const posts = document.querySelectorAll('.posts article');
                
                posts.forEach(post => {
                    const title = post.querySelector('.post-title').textContent.toLowerCase();
                    const content = post.textContent.toLowerCase();
                    
                    if (title.includes(searchTerm) || content.includes(searchTerm)) {
                        post.style.display = 'block';
                        // 高亮搜索詞
                        highlightSearchTerm(post, searchTerm);
                    } else {
                        post.style.display = 'none';
                    }
                });
            }, 300);
        });
    }

    // ===== 高亮搜索詞 =====
    function highlightSearchTerm(element, term) {
        if (!term) return;
        
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }
        
        textNodes.forEach(node => {
            const text = node.textContent;
            const regex = new RegExp(`(${term})`, 'gi');
            if (regex.test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(regex, '<mark>$1</mark>');
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    // ===== 深色模式切換動畫 =====
    const colorSchemeToggle = document.querySelector('.color-mode__btn');
    if (colorSchemeToggle) {
        colorSchemeToggle.addEventListener('click', function() {
            document.body.style.transition = 'background-color 0.3s, color 0.3s';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }

    // ===== 文章目錄自動高亮 =====
    const tocLinks = document.querySelectorAll('.toc a');
    const headings = document.querySelectorAll('h2, h3, h4');
    
    if (tocLinks.length > 0 && headings.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 100) {
                    current = heading.id;
                }
            });
            
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ===== 打字機效果 =====
    const typewriterElements = document.querySelectorAll('.typewriter');
    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        }
        
        type();
    });

    // ===== 統計閱讀時間 =====
    const articleContent = document.querySelector('.post-content');
    if (articleContent) {
        const text = articleContent.textContent;
        const wordsPerMinute = 200; // 中文閱讀速度
        const words = text.length; // 中文字數
        const readingTime = Math.ceil(words / wordsPerMinute);
        
        const readingTimeElement = document.querySelector('.reading-time');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} 分鐘閱讀`;
        }
    }

    // ===== 外部連結新視窗開啟 =====
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // ===== 控制台歡迎訊息 =====
    console.log('%c歡迎來到我的技術部落格！', 'color: #2563eb; font-size: 20px; font-weight: bold;');
    console.log('%c如果您對網站有任何建議或發現問題，歡迎聯絡我！', 'color: #666; font-size: 14px;');
});

// ===== 效能優化：防抖函數 =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== 效能優化：節流函數 =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
