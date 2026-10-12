'use strict';

// ===== Ждём загрузки DOM =====
document.addEventListener('DOMContentLoaded', function () {

  // ===== 1. БУРГЕР-МЕНЮ =====
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== 2. ХЕДЕР ПРИ СКРОЛЛЕ =====
  const header = document.getElementById('header');
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // ===== 3. ПОЯВЛЕНИЕ СЕКЦИЙ =====
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== 4. СЧЁТЧИКИ ЦИФР =====
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  // ===== 5. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ =====
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });

  // ===== 6. ПАРАЛЛАКС ДЕКОРА В HERO =====
  const heroDecor = document.querySelectorAll('.hero__decor');
  if (heroDecor.length) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          const y = window.scrollY;
          if (y < 1200) {
            heroDecor.forEach(function (el, i) {
              const speed = i === 0 ? 0.15 : i === 1 ? -0.1 : 0.08;
              el.style.
              transform = 'translateY(' + (y * speed) + 'px)';
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ===== 7. ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ В TELEGRAM =====
  const form = document.getElementById('booking-form');
  if (form) {
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^\d+\-()\s]/g, '');
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = form.querySelector('input[name="name"]').value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
      const dates = form.querySelector('input[name="dates"]').value.trim();
      const guests = form.querySelector('input[name="guests"]').value;
      const comment = form.querySelector('textarea[name="comment"]').value.trim();

      if (name.length < 2) { alert('Пожалуйста, введите ваше имя.'); return; }
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 7) { alert('Пожалуйста, введите корректный номер телефона.'); return; }
      if (!dates || dates.length < 3) { alert('Пожалуйста, укажите даты заезда и выезда.'); return; }
      if (!guests || parseInt(guests, 10) < 1 || parseInt(guests, 10) > 9) {
        alert('Укажите количество гостей от 1 до 9.'); return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';

      try {
        const response = await fetch('/.netlify/functions/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, dates, guests, comment })
        });
        const result = await response.json();

        if (response.ok && result.ok) {
          alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
          form.reset();
        } else {
          alert('Ошибка отправки. Пожалуйста, позвоните по телефону.');
        }
      } catch (err) {
        alert('Не удалось отправить заявку. Пожалуйста, позвоните по телефону.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ===== 8. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav__link');

  if (sections.length && navLinksAll.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinksAll.forEach(function (link) {
            const isActive = link.getAttribute('href') === '#' + id;
            link.style.color = isActive ? 'var(--terracotta)' : '';
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-80px 0px -50% 0px'
    });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  // ===== ЛОГ В КОНСОЛЬ =====
  console.log('%c🏡 Дом на сутки · Орша', 'font-size:18px; color:#c66a3f; font-weight:bold;');

});