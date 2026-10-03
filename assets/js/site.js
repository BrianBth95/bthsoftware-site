(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Nav: background on scroll + mobile toggle
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Platform chat demo
  var agents = [
    {
      slug: 'ohs-act',
      cache: '92%',
      q: 'What are the general duties of an employer to its employees?',
      a: 'Every employer must provide and maintain, as far as reasonably practicable, a working environment that is safe and without risk to the health of employees. That includes safe plant and machinery, and the information, training and supervision needed to work safely.',
      cites: ['OHS Act 85 of 1993 · s8']
    },
    {
      slug: 'construction-regs',
      cache: '88%',
      q: 'Who has to prepare the fall protection plan on site?',
      a: 'The contractor must appoint a competent person in writing to prepare a fall protection plan. The plan has to cover the risk assessment of all work at height and the procedures to prevent falls.',
      cites: ['Construction Regulations 2014 · Reg 10']
    },
    {
      slug: 'hr-policies',
      cache: '95%',
      q: 'How many days of annual leave can I carry over?',
      a: 'You can carry over up to 5 unused days into the next leave cycle. Anything above that lapses unless your manager approves an exception in writing.',
      cites: ['Leave Policy v3 · 4.2', 'Employee Handbook · p12']
    }
  ];

  var chat = document.getElementById('chat');
  var pills = document.querySelectorAll('.agent-pill');
  var chatAgent = document.getElementById('chatAgent');
  var chatCache = document.getElementById('chatCache');
  var current = 0;
  var timers = [];
  var autoTimer;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function render(i) {
    clearTimers();
    current = i;
    var agent = agents[i];

    pills.forEach(function (p, idx) {
      p.classList.toggle('active', idx === i);
      p.setAttribute('aria-selected', idx === i);
    });
    chatAgent.textContent = 'agent: ' + agent.slug;
    chatCache.textContent = agent.cache;
    chat.innerHTML = '';

    var user = el('div', 'msg user');
    user.textContent = agent.q;
    chat.appendChild(user);

    var typing = el('div', 'msg bot', '<span class="typing"><i></i><i></i><i></i></span>');

    var answer = el('div', 'msg bot');
    answer.appendChild(el('span', 'who', agent.slug));
    answer.appendChild(document.createTextNode(agent.a));
    var citeWrap = el('div');
    agent.cites.forEach(function (c) {
      var cite = el('span', 'cite');
      cite.textContent = '↗ ' + c;
      citeWrap.appendChild(cite);
    });
    answer.appendChild(citeWrap);

    if (reduceMotion) {
      chat.appendChild(answer);
      return;
    }

    timers.push(setTimeout(function () { chat.appendChild(typing); }, 500));
    timers.push(setTimeout(function () {
      typing.remove();
      chat.appendChild(answer);
    }, 1800));
  }

  function scheduleAuto() {
    clearInterval(autoTimer);
    if (reduceMotion) return;
    autoTimer = setInterval(function () {
      render((current + 1) % agents.length);
    }, 8000);
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      render(Number(p.dataset.agent));
      scheduleAuto();
    });
  });

  // Only start the demo when it scrolls into view
  if (chat) {
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      render(0);
      scheduleAuto();
    };
    if ('IntersectionObserver' in window) {
      var chatIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          start();
          chatIo.disconnect();
        }
      }, { threshold: 0.3 });
      chatIo.observe(chat);
    } else {
      start();
    }
  }
})();
