document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;

        // Currency defaults to the visitor's browser region unless they chose one before.
        const currencySelect = document.querySelector('#currency-select');
        const prices = document.querySelectorAll('[data-price-usd]');
        const savedCurrency = localStorage.getItem('fixmo-currency');
        const localeRegion = (navigator.language || '').replace('_', '-').split('-').pop().toUpperCase();
        let currency = savedCurrency === 'USD' || savedCurrency === 'INR'
          ? savedCurrency
          : localeRegion === 'IN' ? 'INR' : 'USD';
        let usdToInr = 84;

        const renderPrices = () => {
          prices.forEach(price => {
            const amount = Number(price.dataset.priceUsd);
            price.textContent = currency === 'INR'
              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount * usdToInr)
              : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
          });
        };

        if (currencySelect) {
          currencySelect.value = currency;
          currencySelect.addEventListener('change', () => {
            currency = currencySelect.value;
            localStorage.setItem('fixmo-currency', currency);
            renderPrices();
          });
          renderPrices();
          fetch('https://open.er-api.com/v6/latest/USD')
            .then(response => response.json())
            .then(data => {
              if (data.result === 'success' && Number.isFinite(data.rates.INR)) {
                usdToInr = data.rates.INR;
                renderPrices();
              }
            })
            .catch(() => {});
        }

        // Theme
        const savedTheme = localStorage.getItem('fixmo-theme');
        if (savedTheme !== 'dark') {
          localStorage.setItem('fixmo-theme', 'light');
        }
        const useDarkMode = localStorage.getItem('fixmo-theme') === 'dark';
        body.classList.toggle('theme-dark', useDarkMode);
        body.classList.toggle('theme-light', !useDarkMode);

        const themeToggle = document.querySelector('[data-theme-toggle]');
        const updateThemeButton = () => {
          if (!themeToggle) return;
          const isLight = !body.classList.contains('theme-dark');
          themeToggle.textContent = isLight ? '🌙' : '☀️';
          themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        };
        updateThemeButton();

        if (themeToggle) {
          themeToggle.addEventListener('click', () => {
            const isDark = body.classList.toggle('theme-dark');
            body.classList.toggle('theme-light', !isDark);
            localStorage.setItem('fixmo-theme', isDark ? 'dark' : 'light');
            updateThemeButton();
          });
        }

        // Mobile navigation
        const mobileNav = document.querySelector('.mobile-nav');
        const navBurger = document.querySelector('[data-nav-burger]');
        const navClose = document.querySelector('[data-nav-close]');
        const navLinks = document.querySelectorAll('[data-nav-link]');

        const openMobileNav = () => {
          mobileNav?.classList.add('open');
          body.style.overflow = 'hidden';
        };
        const closeMobileNav = () => {
          mobileNav?.classList.remove('open');
          body.style.overflow = '';
        };

        navBurger?.addEventListener('click', openMobileNav);
        navClose?.addEventListener('click', closeMobileNav);
        navLinks.forEach(link => link.addEventListener('click', closeMobileNav));
        mobileNav?.addEventListener('click', (e) => {
          if (e.target === mobileNav) closeMobileNav();
        });

        // Scroll fade animations
        const animateTargets = [
          '.section-head', '.services', '.gallery',
          '.pricing-grid', '.review-grid', '.stack'
        ];
        document.querySelectorAll(animateTargets.join(', ')).forEach(el => {
          el.setAttribute('data-fade', '');
        });

        const fadeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              fadeObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-fade]').forEach(el => fadeObserver.observe(el));

        // Page transition
        const handleNavTransition = (event) => {
          const link = event.currentTarget;
          const href = link.getAttribute('href');
          if (!href || href.startsWith('#') || link.target === '_blank') return;
          event.preventDefault();
          body.classList.add('transitioning');
          setTimeout(() => { window.location.href = href; }, 260);
        };

        document.querySelectorAll('a[href$=".html"]').forEach(link => {
          link.addEventListener('click', handleNavTransition);
        });

        setTimeout(() => body.classList.add('loaded'), 40);
      });