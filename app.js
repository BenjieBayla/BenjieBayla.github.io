'use strict';

document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
let menuCloseTimer;

function finishMenuClose() {
  clearTimeout(menuCloseTimer);
  menuCloseTimer = undefined;
  mobileNav.hidden = true;
  mobileNav.inert = false;
  mobileNav.classList.remove('is-opening', 'is-closing');
}

function closeMenu({ immediate = false, restoreFocus = false } = {}) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  if (restoreFocus) menuButton.focus({ preventScroll: true });
  if (mobileNav.hidden) return;
  mobileNav.classList.remove('is-opening');
  mobileNav.inert = true;
  if (immediate || reducedMotion.matches) {
    finishMenuClose();
    return;
  }
  mobileNav.classList.add('is-closing');
  clearTimeout(menuCloseTimer);
  menuCloseTimer = setTimeout(finishMenuClose, 140);
}

function openMenu() {
  clearTimeout(menuCloseTimer);
  mobileNav.hidden = false;
  mobileNav.inert = false;
  mobileNav.classList.remove('is-opening', 'is-closing');
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
  if (!reducedMotion.matches) mobileNav.classList.add('is-opening');
}

menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') closeMenu();
  else openMenu();
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu({ immediate: true, restoreFocus: true })));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu({ immediate: true, restoreFocus: true });
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu({ immediate: true });
});
reducedMotion.addEventListener('change', event => {
  if (event.matches && mobileNav.classList.contains('is-closing')) finishMenuClose();
});

const navLinks = document.querySelectorAll('.desktop-nav a');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const isCurrent = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
}

if (!reducedMotion.matches) document.documentElement.classList.add('motion-enabled');

const revealTargets = document.querySelectorAll(
  '#experience > .container, #skills > .container, #about > .container'
);
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });

  function reveal(target, immediate = false) {
    if (!target.classList.contains('motion-pending')) return;
    if (immediate) target.classList.add('motion-instant');
    target.classList.remove('motion-pending');
    revealObserver.unobserve(target);
    if (immediate) requestAnimationFrame(() => target.classList.remove('motion-instant'));
  }

  revealTargets.forEach(target => {
    const rect = target.getBoundingClientRect();
    if (rect.top <= innerHeight * .85 && rect.bottom >= 0) return;
    target.classList.add('motion-reveal', 'motion-pending');
    revealObserver.observe(target);
    target.addEventListener('focusin', () => reveal(target, true), { once: true });
  });

  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      revealObserver.disconnect();
      revealTargets.forEach(target => reveal(target, true));
    }
  });
}
