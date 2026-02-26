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

    // ===== External links open in new tab =====
    document.querySelectorAll('a[href^="http"]').forEach(function (link) {
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // ===== Dark mode transition animation =====
    var toggle = document.querySelector('#color-mode-switch') ||
                 document.querySelector('.color-mode__btn');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(function () { document.body.style.transition = ''; }, 350);
      });
    }

    // ===== TOC active heading highlight =====
    var tocLinks = document.querySelectorAll('#TableOfContents a');
    var headings = document.querySelectorAll('h2[id], h3[id], h4[id]');

    if (tocLinks.length > 0 && headings.length > 0) {
      window.addEventListener('scroll', function () {
        var current = '';
        headings.forEach(function (h) {
          if (h.getBoundingClientRect().top <= 120) {
            current = h.id;
          }
        });
        tocLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
      });
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
