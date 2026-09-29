(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Mobile nav toggle ---------------- */
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main .section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  function setActiveNav() {
    var scrollPos = window.scrollY + window.innerHeight * 0.3;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navAnchors.forEach(function (a) {
      var match = a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('active', match);
    });
  }
  window.addEventListener('scroll', throttle(setActiveNav, 100), { passive: true });
  setActiveNav();

  function throttle(fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= wait) { last = now; fn(); }
    };
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Network node canvas background ---------------- */
  function initNodeCanvas(canvasId, opts) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;
    var width, height, nodes, dpr;
    var nodeCount = opts && opts.nodeCount ? opts.nodeCount : 42;
    var linkDist = opts && opts.linkDist ? opts.linkDist : 150;
    var color = opts && opts.color ? opts.color : '77, 141, 255';

    function resize() {
      width = parent.offsetWidth;
      height = parent.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNodes() {
      nodes = [];
      for (var i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = 'rgba(' + color + ', ' + (1 - dist / linkDist) * 0.35 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(' + color + ', 0.7)';
      for (var j = 0; j < nodes.length; j++) {
        ctx.beginPath();
        ctx.arc(nodes[j].x, nodes[j].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    var raf;
    resize();
    makeNodes();

    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(step);
    } else {
      // Draw a single static frame so the motif is still present without motion.
      step();
      cancelAnimationFrame(raf);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        makeNodes();
      }, 200);
    });

    // Pause work when the section is off-screen.
    if ('IntersectionObserver' in window) {
      var visObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!prefersReducedMotion) {
            if (entry.isIntersecting && !raf) raf = requestAnimationFrame(step);
            if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
          }
        });
      }, { threshold: 0 });
      visObserver.observe(parent);
    }
  }

  initNodeCanvas('node-canvas-profile', { nodeCount: 46, linkDist: 160, color: '77, 141, 255' });
  initNodeCanvas('node-canvas-cyber', { nodeCount: 36, linkDist: 140, color: '52, 211, 153' });
  initNodeCanvas('node-canvas-contact', { nodeCount: 30, linkDist: 150, color: '77, 141, 255' });

})();
