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

    // ===== 程式碼複製按鈕 =====
    // 按鈕掛在 div.highlight（不會捲動的外層），不是掛在 <pre> 上。
    // 掛在 <pre> 的話它會跟著程式碼一起橫向捲走 —— 長指令捲到一半，
    // 按鈕就跑到句子中間去了。
    //
    // 另外開了行號之後，Chroma 的結構是
    //   div.highlight > div.chroma > table.lntable > tr > td.lntd > pre  ×2
    // 左邊那個 pre 裝行號、右邊裝程式碼。舊寫法對「每個 pre」都加按鈕，
    // 所以一個區塊會冒出兩顆，其中一顆還蓋住第 1 行的行號。
    var isZh = document.documentElement.lang === 'zh' ||
               document.documentElement.lang === 'zh-Hant' ||
               window.location.pathname.indexOf('/zh/') !== -1;
    var copyLabel = isZh ? '複製' : 'Copy';
    var copiedLabel = isZh ? '已複製' : 'Copied!';

    document.querySelectorAll('.post-content .highlight, .container.page article .highlight').forEach(function (block) {
      // 有行號時取右欄（程式碼），沒有行號時就是唯一那個 pre。
      // 取錯的話複製出來會夾帶一整排行號。
      var code = block.querySelector('.lntd:last-child code') || block.querySelector('code');
      if (!code) return;
      if (block.querySelector('.copy-code-button')) return;

      block.style.position = 'relative';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-button';
      copyBtn.type = 'button';
      copyBtn.textContent = copyLabel;
      copyBtn.setAttribute('aria-label', isZh ? '複製程式碼' : 'Copy code');
      block.appendChild(copyBtn);

      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          copyBtn.textContent = copiedLabel;
          setTimeout(function () { copyBtn.textContent = copyLabel; }, 2000);
        }).catch(function () {
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
    // 兩種容器都要收：文章是 .post-content，
    // 「專案」「關於」這類頁面走的是主題的 page.html，容器是 .container.page article。
    // 只寫前者的話，那些頁面雖然標題一堆卻完全沒有側邊導覽。
    var headings = document.querySelectorAll(
      '.post-content h2[id], .post-content h3[id], .post-content h4[id],' +
      '.container.page article h2[id], .container.page article h3[id], .container.page article h4[id]'
    );
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

    // ===== 內容放大檢視 =====
    // 圖、程式碼、表格、公式常常比 860px 的內文欄寬。橫向捲動難讀，
    // 所以每一塊都能「放大」：整塊搬到全螢幕覆蓋層裡看，可縮放、可平移。
    //
    // 設計決定：
    //   1. 預設比例分類。圖用 max(1, min(3, 符合畫面))——永遠不低於原尺寸，
    //      否則在手機上「放大」後跟內嵌一樣小，等於沒有作用。
    //      程式碼／表格／公式一律 100%，fit 會把字縮小，那不是放大該做的事。
    //   2. 用「搬移」而不是「複製」。Mermaid 的 <style> 以 #mermaid-xxx 綁定，
    //      複製會產生重複 id；搬移保證放大後跟原本一模一樣，
    //      關閉時再用 placeholder 節點放回原位。
    //   3. 搬移的代價是狀態必須嚴謹。第一版就因為「圖在覆蓋層裡仍然響應
    //      點擊放大」而重複開啟：第二次開啟時 placeholder 被插進覆蓋層，
    //      關閉就把圖還原到覆蓋層裡 —— 圖直接從頁面上消失。
    //      現在用 isOpen 擋重入，觸發點也一律先檢查自己在不在覆蓋層裡。
    (function () {
      var zh = document.documentElement.lang.indexOf('zh') === 0;
      var T = zh
        ? { open: '放大檢視', close: '關閉（Esc）', zin: '放大', zout: '縮小',
            fit: '符合畫面', actual: '原尺寸', hint: '拖曳平移 · Ctrl＋滾輪縮放 · Esc 關閉' }
        : { open: 'Enlarge', close: 'Close (Esc)', zin: 'Zoom in', zout: 'Zoom out',
            fit: 'Fit', actual: 'Actual size', hint: 'Drag to pan · Ctrl+wheel to zoom · Esc to close' };

      var groups = [
        { sel: '.diagram-canvas', kind: 'diagram' },
        { sel: '.highlight', kind: 'code' },
        { sel: 'table:not(.lntable)', kind: 'table' },
        { sel: '.katex-display', kind: 'math' }
      ];

      var targets = [];
      ['.post-content', '.container.page article'].forEach(function (root) {
        groups.forEach(function (g) {
          document.querySelectorAll(root + ' ' + g.sel).forEach(function (el) {
            targets.push({ el: el, kind: g.kind });
          });
        });
      });
      if (!targets.length) return;

      var overlay, scroller, sizer, stage, levelEl, titleEl;
      var isOpen = false, current = null, placeholder = null;
      var scale = 1, natural = { w: 0, h: 0 }, lastFocus = null, dragMoved = false;

      function clamp(k) { return Math.max(0.1, Math.min(8, k)); }

      function build() {
        overlay = document.createElement('div');
        overlay.className = 'zoomview';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.hidden = true;

        var bar = document.createElement('div');
        bar.className = 'zoomview-bar';

        titleEl = document.createElement('span');
        titleEl.className = 'zoomview-title';

        var tools = document.createElement('div');
        tools.className = 'zoomview-tools';

        function mk(act, text, label, cls) {
          var b = document.createElement('button');
          b.type = 'button';
          b.dataset.act = act;
          b.textContent = text;
          b.setAttribute('aria-label', label);
          b.title = label;
          if (cls) b.className = cls;
          return b;
        }

        levelEl = document.createElement('button');
        levelEl.type = 'button';
        levelEl.dataset.act = 'toggle';
        levelEl.className = 'zoomview-level';
        levelEl.title = T.fit + ' / ' + T.actual;

        tools.appendChild(mk('out', '−', T.zout));
        tools.appendChild(levelEl);
        tools.appendChild(mk('in', '+', T.zin));

        var hint = document.createElement('span');
        hint.className = 'zoomview-hint';
        hint.textContent = T.hint;

        bar.appendChild(titleEl);
        bar.appendChild(hint);
        bar.appendChild(tools);
        bar.appendChild(mk('close', '×', T.close, 'zoomview-close'));

        scroller = document.createElement('div');
        scroller.className = 'zoomview-scroll';
        sizer = document.createElement('div');
        sizer.className = 'zoomview-sizer';
        stage = document.createElement('div');
        stage.className = 'zoomview-stage';
        sizer.appendChild(stage);
        scroller.appendChild(sizer);

        overlay.appendChild(bar);
        overlay.appendChild(scroller);
        document.body.appendChild(overlay);

        bar.addEventListener('click', function (e) {
          var b = e.target.closest('button');
          if (!b) return;
          var a = b.dataset.act;
          if (a === 'close') close();
          else if (a === 'in') setScale(scale * 1.25);
          else if (a === 'out') setScale(scale / 1.25);
          else if (a === 'toggle') setScale(Math.abs(scale - 1) < 0.01 ? fitScale() : 1);
        });

        // 點空白處關閉。但拖曳平移放開時也會派送 click，
        // 所以只有「這次按下到放開沒有明顯位移」才算點擊。
        scroller.addEventListener('click', function (e) {
          if (dragMoved) return;
          if (e.target === scroller || e.target === sizer) close();
        });

        scroller.addEventListener('dblclick', function () {
          setScale(Math.abs(scale - 1) < 0.01 ? fitScale() : 1);
        });

        scroller.addEventListener('wheel', function (e) {
          if (!e.ctrlKey && !e.metaKey) return;
          e.preventDefault();
          setScale(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
        }, { passive: false });

        var dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
        scroller.addEventListener('pointerdown', function (e) {
          if (e.button !== 0 || e.target.closest('a, button')) return;
          dragging = true; dragMoved = false;
          sx = e.clientX; sy = e.clientY;
          sl = scroller.scrollLeft; st = scroller.scrollTop;
        });
        window.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var dx = e.clientX - sx, dy = e.clientY - sy;
          if (!dragMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragMoved = true;
            scroller.classList.add('is-dragging');
          }
          if (dragMoved) { scroller.scrollLeft = sl - dx; scroller.scrollTop = st - dy; }
        });
        window.addEventListener('pointerup', function () {
          dragging = false;
          if (scroller) scroller.classList.remove('is-dragging');
          // dragMoved 要留到 click 判斷完才清掉
          setTimeout(function () { dragMoved = false; }, 0);
        });

        document.addEventListener('keydown', function (e) {
          if (!isOpen) return;
          if (e.key === 'Escape' || e.key === 'Esc') { close(); return; }
          if (e.key === '+' || e.key === '=') { e.preventDefault(); setScale(scale * 1.25); }
          else if (e.key === '-' || e.key === '_') { e.preventDefault(); setScale(scale / 1.25); }
          else if (e.key === '0') { e.preventDefault(); setScale(1); }
          else if (e.key === '1') { e.preventDefault(); setScale(fitScale()); }
          else if (e.key === 'Tab') trapFocus(e);
        });
      }

      // 覆蓋層是 modal，Tab 不該跑到底下的頁面去
      function trapFocus(e) {
        var f = overlay.querySelectorAll('button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      function fitScale() {
        if (!natural.w || !natural.h) return 1;
        var availW = scroller.clientWidth - 32;
        var availH = scroller.clientHeight - 32;
        return clamp(Math.min(availW / natural.w, availH / natural.h));
      }

      function setScale(k) {
        scale = clamp(k);
        stage.style.transform = 'scale(' + scale + ')';
        sizer.style.width = (natural.w * scale) + 'px';
        sizer.style.height = (natural.h * scale) + 'px';
        levelEl.textContent = Math.round(scale * 100) + '%';
      }

      function labelFor(entry) {
        var fig = entry.el.closest('figure');
        var cap = fig && fig.querySelector('figcaption');
        if (cap && cap.textContent.trim()) return cap.textContent.trim();
        return { diagram: zh ? '圖表' : 'Diagram', code: zh ? '程式碼' : 'Code',
                 table: zh ? '表格' : 'Table', math: zh ? '算式' : 'Formula' }[entry.kind] || '';
      }

      function open(entry) {
        if (isOpen) return;                       // 擋重入：重複開啟會弄丟原本的位置
        if (entry.el.closest('.zoomview')) return; // 已經在覆蓋層裡的東西不再觸發
        if (!overlay) build();

        isOpen = true;
        lastFocus = document.activeElement;
        // 標題要在搬移「之前」取：搬進舞台之後元素就不在 <figure> 裡了，
        // closest('figure') 會找不到，圖說就變成通用的「圖表」。
        var title = labelFor(entry);
        current = entry.el;
        placeholder = document.createComment('zoomview');
        current.parentNode.insertBefore(placeholder, current);

        stage.textContent = '';                   // 保險：確保舞台是空的
        stage.appendChild(current);
        stage.style.transform = 'none';
        sizer.style.width = ''; sizer.style.height = '';
        titleEl.textContent = title;
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';

        // 原尺寸要在沒有 transform、且覆蓋層已顯示的狀態下量
        natural.w = Math.max(stage.scrollWidth, current.scrollWidth || 0, 1);
        natural.h = Math.max(stage.scrollHeight, current.scrollHeight || 0, 1);

        setScale(entry.kind === 'diagram' ? Math.max(1, Math.min(3, fitScale())) : 1);

        // 內容比畫面寬時，從水平中央開始看，比從最左邊開始自然
        scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
        scroller.scrollTop = 0;
        overlay.querySelector('.zoomview-close').focus();
      }

      function close() {
        if (!isOpen) return;
        if (current) {
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.replaceChild(current, placeholder);
          } else if (current.parentNode === stage) {
            // placeholder 不見了也不能把內容留在覆蓋層裡
            current.parentNode.removeChild(current);
          }
        }
        if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        stage.textContent = '';
        current = null; placeholder = null; isOpen = false;
        overlay.hidden = true;
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      targets.forEach(function (entry) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'zoom-button';
        btn.setAttribute('aria-label', T.open);
        btn.title = T.open;
        btn.textContent = '⤢';
        btn.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          open(entry);
        });

        if (entry.kind === 'table') {
          // 表格沒有自己的定位容器，包一層再放按鈕
          var wrap = document.createElement('div');
          wrap.className = 'table-wrap has-zoom';
          entry.el.parentNode.insertBefore(wrap, entry.el);
          wrap.appendChild(entry.el);
          wrap.appendChild(btn);
          entry.el = wrap;          // 放大時連同外框一起搬，位置才好還原
        } else {
          entry.el.classList.add('has-zoom');
          entry.el.appendChild(btn);
        }

        // 圖沒有選字需求，點整塊都可以放大；程式碼與表格只認按鈕
        if (entry.kind === 'diagram') {
          entry.el.classList.add('is-clickable');
          entry.el.addEventListener('click', function (e) {
            if (isOpen) return;                       // 覆蓋層開著就不再觸發
            if (this.closest('.zoomview')) return;
            if (e.target.closest('a, button')) return;
            open(entry);
          });
        }
      });
    })();

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
