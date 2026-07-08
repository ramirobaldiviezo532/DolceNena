// Nav background switches once the hero has scrolled past
const nav = document.getElementById('siteNav');
const setNavState = () => {
  if (window.scrollY > 40) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
};
setNavState();
window.addEventListener('scroll', setNavState, { passive: true });

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Selector de cantidad + cálculo dinámico del precio por tarjeta
const MIN_QTY = 1;
const MAX_QTY = 20;

document.querySelectorAll('.card').forEach(card => {
  const qtySelector = card.querySelector('.qty-selector');
  const priceEl = card.querySelector('.price');
  if (!qtySelector || !priceEl) return;

  const qtyValueEl = qtySelector.querySelector('.qty-value');
  const decreaseBtn = qtySelector.querySelector('.qty-decrease');
  const increaseBtn = qtySelector.querySelector('.qty-increase');
  const unitPrice = parseFloat(priceEl.dataset.unitPrice);

  let qty = MIN_QTY;

  const render = () => {
    qtyValueEl.textContent = qty;
    const total = (unitPrice * qty).toFixed(2);
    priceEl.textContent = `Bs. ${total}`;
    decreaseBtn.disabled = qty <= MIN_QTY;
    increaseBtn.disabled = qty >= MAX_QTY;
  };

  decreaseBtn.addEventListener('click', () => {
    if (qty > MIN_QTY) {
      qty -= 1;
      render();
    }
  });

  increaseBtn.addEventListener('click', () => {
    if (qty < MAX_QTY) {
      qty += 1;
      render();
    }
  });

  render();
});
