(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 品牌色粒子背景 ---- */
  var canvas = document.getElementById('bgCanvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var BRAND_COLORS = [
      { r: 32, g: 144, b: 232 },
      { r: 144, g: 56, b: 184 },
      { r: 240, g: 56, b: 120 }
    ];
    var particles = [];
    var LINK_DIST = 120;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      var count = Math.min(90, Math.floor(canvas.width * canvas.height / 22000));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(new Particle());
    }

    function Particle() {
      this.color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
      this.reset(true);
    }
    Particle.prototype.reset = function (anywhere) {
      this.x = Math.random() * canvas.width;
      this.y = anywhere ? Math.random() * canvas.height : (Math.random() > 0.5 ? -10 : canvas.height + 10);
      this.size = Math.random() * 1.8 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.speedY = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.45 + 0.12;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) this.reset(false);
    };
    Particle.prototype.draw = function () {
      ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.opacity + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    };

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = 'rgba(150, 120, 220, ' + (0.05 * (1 - dist / LINK_DIST)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    if (!reduceMotion) animate();
  }

  /* ---- 导航栏滚动状态 ---- */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- 移动端菜单 ---- */
  var navToggle = document.getElementById('nav-toggle');
  var navMobile = document.getElementById('nav-mobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var open = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    var mobileLinks = navMobile.querySelectorAll('a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', function () {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ---- 滚动显现(fail-open:无 JS 时内容直接可见) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }
  function observeLater(el) {
    if (!el) return;
    if ('IntersectionObserver' in window && !reduceMotion && typeof io !== 'undefined') {
      io.observe(el);
    } else {
      el.classList.add('revealed');
    }
  }

  /* ---- 复制工具 ---- */
  function showCopied(btn) {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = old;
      btn.classList.remove('copied');
    }, 2000);
  }
  window.copyText = function (text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopied(btn);
      }).catch(function () { fallbackCopy(text); showCopied(btn); });
    } else {
      fallbackCopy(text);
      showCopied(btn);
    }
  };
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---- 新闻数据(仅首页渲染) ---- */
  var newsData = [
    {
      id: 1,
      title: 'bullet run正式版1.0即将上线!',
      date: '2026-07-24',
      tag: '公告',
      tagColor: '#ffc93c',
      summary: '我们很高兴地宣布,Bullet Run 的正式版发布将于本周六正式开启!抢先游玩玩家将获得独家测试奖励。',
      fullContent: '我们很高兴地宣布,Bullet Run 的正式版发布将于本周六正式开启!\n\n**发布时间:**\n2026年7月30日 00:00\n\n**版本内容:**\n- 修复了大量已知 Bug\n- 优化了游戏性能\n- 新增军衔系统\n- '
    },
    {
      id: 2,
      title: '新作曝光!',
      date: '2026-07-24',
      tag: '透露(重要)',
      tagColor: '#ff7b54',
      summary: '欢迎来到Vee工作室,我将细说我们工作室的新作《SUPER POTATO》(简称SPx1)的开发计划和测试安排。',
      fullContent: '说实话,我原本是想开发Bullet run的续作的,但是为了防止翻车,选择了开发新系列游戏。本游戏主抄土豆兄弟,素材 UI效果全面升级,不再选择使用代码编画角色了。\n\n**测试时间计划:**\n工作室准备在游戏联机模式开发完成后开启OPEN BETA公测试计划。\n\n**本地联机模式:**\n顺便透露一嘴,本地联机模式现在也开始开发了,你可以与同城的朋友一起快乐玩耍了!\n\n**测试详情:**\nOPEN BETA开始测试的时候我会通知并挂到官网上,测试时间为5天,反馈可以发在官方群或官网底下评论区。\n\n感谢各位的游玩!'
    },
    {
      id: 3,
      title: '军衔系统全面升级',
      date: '2026-07-20',
      tag: '系统',
      tagColor: '#4ade80',
      summary: '我们对军衔系统进行了全面优化,新增了更多视觉特效和专属奖励,让每一次升级都更有成就感。',
      fullContent: '我们对军衔系统进行了全面优化,让成长更有意义!\n\n**新增军衔特效:**\n- 达到上校军衔后,击杀敌人会显示专属击杀图标\n- 中将以上军衔拥有独特的武器光晕效果\n- 上将军衔解锁专属胜利姿势动画\n\n**军衔奖励:**\n- 每升一级获得金币奖励(100-500不等)\n- 特定军衔解锁新武器皮肤\n- 满级上将获得「战神」称号和永久 VIP 标识\n\n**XP 调整:**\n为了让升级体验更加流畅,我们优化了 XP 曲线,降低了前期升级难度。'
    },
    {
      id: 4,
      title: '联机模式性能优化',
      date: '2026-07-18',
      tag: '优化',
      tagColor: '#60a5fa',
      summary: '我们听取了玩家反馈,对联机模式进行了全面的性能优化,显著降低了延迟和卡顿问题。',
      fullContent: '我们听取了玩家反馈,对联机模式进行了全面优化!\n\n**优化内容:**\n- 优化网络传输协议,降低约 40% 的延迟\n- 改进同步算法,减少画面抖动和瞬移现象\n- 增加网络质量检测,自动调整同步频率\n- 修复了多人同时连接时的服务器卡顿问题\n\n**网络要求:**\n建议使用稳定的局域网或 5G/Wi-Fi 网络进行联机游戏,以获得最佳体验。\n\n我们会持续关注联机体验,欢迎大家反馈问题!'
    },
    {
      id: 5,
      title: '武器平衡性调整',
      date: '2026-07-15',
      tag: '平衡',
      tagColor: '#f472b6',
      summary: '为了打造更公平的竞技环境,我们对所有武器进行了平衡性调整,主要涉及伤害、射速和后坐力。',
      fullContent: '为了打造更公平的竞技环境,我们对所有武器进行了平衡性调整!\n\n**武器调整:**\n- 手枪:伤害提升 10%,增强近战能力\n- 步枪:略微降低射速,增加精准度\n- 狙击枪:增加开镜时间,降低移动射击精度\n- 机枪:弹匣容量减少至 80 发,降低压制能力\n- 刀:攻击距离增加 15%,提升近战威胁\n\n**装备调整:**\n- 医疗包:使用时间从 2 秒增加到 2.5 秒\n- 护甲:所有等级护甲减伤比例下调 5%\n\n这些调整将在下次更新中生效,欢迎大家体验并反馈!'
    },
    {
      id: 6,
      title: '官方直播预告',
      date: '2026-07-24',
      tag: '活动',
      tagColor: '#a78bfa',
      summary: '正式版发布第一天,我们将进行首次官方直播!开发者将亲自演示游戏,并回答观众问题。',
      fullContent: '正式版发布第一天,我们将进行首次官方直播!\n\n**直播内容:**\n- 开发者亲自演示大逃杀模式\n- 全面展示游戏\n- 实时回答观众提问\n- 抽奖送出限定周边\n\n**观看方式:**\n关注我们的 B 站账号「秋弟弟啊」,周日晚上 8 点准时开播!\n\n期待游戏发布那一天与大家见面!'
    }
  ];

  function renderNews() {
    var container = document.getElementById('news-container');
    if (!container) return;
    newsData.forEach(function (news) {
      var card = document.createElement('div');
      card.className = 'news-card reveal';
      card.onclick = function () { openNewsModal(news); };
      card.innerHTML = '<div class="news-tag" style="background:' + news.tagColor + '1a;color:' + news.tagColor + ';border-color:' + news.tagColor + '40;">' + news.tag + '</div>' +
        '<h3 class="news-title">' + news.title + '</h3>' +
        '<p class="news-summary">' + news.summary + '</p>' +
        '<div class="news-footer"><span class="news-date">' + news.date + '</span><span class="news-read">点击查看详情</span></div>';
      container.appendChild(card);
      observeLater(card);
    });
  }

  function openNewsModal(news) {
    var modal = document.getElementById('news-modal');
    var content = document.getElementById('news-modal-body');
    if (!modal || !content) return;
    var bodyHtml = news.fullContent.split('\n').map(function (line) {
      if (!line.trim()) return '';
      if (line.indexOf('**') === 0) return '<strong>' + line.replace(/\*\*/g, '') + '</strong>';
      return '<p>' + line + '</p>';
    }).join('');
    content.innerHTML = '<div class="news-modal-header">' +
      '<span class="news-modal-tag" style="background:' + news.tagColor + '1a;color:' + news.tagColor + ';border-color:' + news.tagColor + '40;">' + news.tag + '</span>' +
      '<span class="news-modal-date">' + news.date + '</span></div>' +
      '<h2 class="news-modal-title">' + news.title + '</h2>' +
      '<div class="news-modal-body-text">' + bodyHtml + '</div>';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  window.closeNewsModal = function () {
    var modal = document.getElementById('news-modal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeNewsModal();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNews);
  } else {
    renderNews();
  }
})();
