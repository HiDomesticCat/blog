// Custom JavaScript for hugo-coder blog
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // ===== Back to top button =====
    var btn = document.createElement('button');
    btn.textContent = '\u2191';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Reading progress bar =====
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.appendChild(bar);

    // Shared scroll handler for progress bar + back-to-top
    window.addEventListener('scroll', function () {
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Progress bar
      if (scrollHeight > 0) {
        bar.style.width = ((scrollTop / scrollHeight) * 100) + '%';
      }

      // Back to top visibility
      if (scrollTop > 300) {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      } else {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
      }
    });

    // ===== Code copy buttons =====
    var isZh = document.documentElement.lang === 'zh' ||
               window.location.pathname.indexOf('/zh/') !== -1;
    var copyLabel = isZh ? '\u8907\u88FD' : 'Copy';
    var copiedLabel = isZh ? '\u5DF2\u8907\u88FD' : 'Copied!';

    document.querySelectorAll('pre').forEach(function (block) {
      var code = block.querySelector('code');
      if (!code) return;

      block.style.position = 'relative';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-button';
      copyBtn.textContent = copyLabel;
      block.appendChild(copyBtn);

      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          copyBtn.textContent = copiedLabel;
          setTimeout(function () { copyBtn.textContent = copyLabel; }, 2000);
        }).catch(function () {
          // Fallback: select text
          var range = document.createRange();
          range.selectNodeContents(code);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      });
    });

    // ===== 點圖放大（lightbox）=====
    // 包在連結裡的圖（例如單位 logo）維持原本的連結行為，不攔截。
    var zoomable = Array.prototype.filter.call(
      document.querySelectorAll('.post-content img, .container.page article img'),
      function (img) { return !img.closest('a'); }
    );

    if (zoomable.length) {
      var overlay = null;
      var lastFocused = null;

      var closeLightbox = function () {
        if (!overlay || overlay.hidden) return;
        overlay.hidden = true;
        overlay.querySelector('.lightbox-img').removeAttribute('src');
        document.body.style.overflow = '';
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      };

      var buildOverlay = function () {
        overlay = document.createElement('div');
        overlay.className = 'lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.hidden = true;

        var btn = document.createElement('button');
        btn.className = 'lightbox-close';
        btn.type = 'button';
        btn.setAttribute('aria-label', '關閉');
        btn.textContent = '×';

        var big = document.createElement('img');
        big.className = 'lightbox-img';
        big.alt = '';

        overlay.appendChild(btn);
        overlay.appendChild(big);
        document.body.appendChild(overlay);

        // 點背景或叉叉都關閉；點圖片本身也關（游標是 zoom-out）
        overlay.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
        });
      };

      var openLightbox = function (img) {
        if (!overlay) buildOverlay();
        lastFocused = document.activeElement;
        var big = overlay.querySelector('.lightbox-img');
        big.src = img.currentSrc || img.src;
        big.alt = img.alt || '';
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
        overlay.querySelector('.lightbox-close').focus();
      };

      zoomable.forEach(function (img) {
        img.classList.add('zoomable');
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', function () { openLightbox(img); });
        img.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(img);
          }
        });
      });
    }

    // ===== External links open in new tab =====
    document.querySelectorAll('a[href^="http"]').forEach(function (link) {
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // ===== Dark mode transition animation =====
    var toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(function () { document.body.style.transition = ''; }, 350);
      });
    }

    // ===== 側邊章節導覽（rail）+ 目前位置高亮 =====
    // 平常只顯示幾條短線靠在畫面左緣，滑過去才展開文字標籤。
    // 目前讀到的那一節會標成強調色。寬螢幕才出現，窄螢幕沿用內文裡的目錄。
    var tocLinks = document.querySelectorAll('#TableOfContents a');
    var headings = document.querySelectorAll('.post-content h2[id], .post-content h3[id], .post-content h4[id]');
    var railLinks = [];

    if (headings.length >= 3) {
      var rail = document.createElement('nav');
      rail.className = 'toc-rail';
      rail.setAttribute('aria-label', '章節導覽');

      var railList = document.createElement('ul');
      Array.prototype.forEach.call(headings, function (h) {
        var li = document.createElement('li');
        li.className = 'toc-rail-' + h.tagName.toLowerCase();

        var a = document.createElement('a');
        a.href = '#' + h.id;

        var dash = document.createElement('span');
        dash.className = 'toc-rail-dash';
        dash.setAttribute('aria-hidden', 'true');

        var label = document.createElement('span');
        label.className = 'toc-rail-label';
        // 標題裡含有主題插入的「Link to heading」錨點，取第一個文字節點就好
        label.textContent = (h.childNodes[0] && h.childNodes[0].textContent || h.textContent).trim();

        a.appendChild(dash);
        a.appendChild(label);
        li.appendChild(a);
        railList.appendChild(li);
        railLinks.push(a);
      });
      rail.appendChild(railList);
      document.body.appendChild(rail);

      // 展開／收合改用 class 驅動，不單靠 :hover。
      // 理由：觸控裝置沒有 hover，而且純 CSS 偽類在某些情況下不好驗證。
      var openRail = function () { rail.classList.add('is-open'); };
      var closeRail = function () { rail.classList.remove('is-open'); };
      rail.addEventListener('mouseenter', openRail);
      rail.addEventListener('mouseleave', closeRail);
      rail.addEventListener('focusin', openRail);
      rail.addEventListener('focusout', function (e) {
        if (!rail.contains(e.relatedTarget)) closeRail();
      });
      // 觸控：點一下先展開，再點連結才跳轉
      rail.addEventListener('touchstart', openRail, { passive: true });
    }

    if ((tocLinks.length || railLinks.length) && headings.length) {
      var syncActive = function () {
        var current = '';
        Array.prototype.forEach.call(headings, function (h) {
          if (h.getBoundingClientRect().top <= 120) current = h.id;
        });
        // 還沒捲到第一個標題時，highlight 第一節
        if (!current && headings.length) current = headings[0].id;

        var mark = function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        };
        Array.prototype.forEach.call(tocLinks, mark);
        railLinks.forEach(mark);
      };
      window.addEventListener('scroll', syncActive, { passive: true });
      syncActive();
    }

    // ===== Smooth scroll for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  });
})();
