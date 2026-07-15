// ===== Meta Pixel: seguimiento de eventos =====
// Envía un evento al Pixel solo si fbq cargó correctamente. Si el navegador
// bloquea el script (adblock, etc.) esto evita que se rompa el resto del sitio.
const trackPixel = (eventName, params) => {
  if (typeof fbq === 'function') {
    fbq('track', eventName, params);
  }
};

// Vista del catálogo: se dispara una sola vez al cargar la página
trackPixel('ViewContent', { content_category: 'Cookies' });

// Nav background switches once the hero has scrolled past
const nav = document.getElementById('siteNav');
const setNavState = () => {
  if (window.scrollY > 40) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
};
setNavState();
window.addEventListener('scroll', setNavState, { passive: true });

// ===== Cómo llegar (Meta Pixel: FindLocation) =====
const locationCta = document.getElementById('locationCta');
if (locationCta) {
  locationCta.addEventListener('click', () => {
    trackPixel('FindLocation');
  });
}

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

// Número de WhatsApp de Dolce Nena (formato internacional, sin "+")
const WHATSAPP_NUMBER = '59168535424';

document.querySelectorAll('.card').forEach(card => {
  const qtySelector = card.querySelector('.qty-selector');
  const priceEl = card.querySelector('.price');
  if (!qtySelector || !priceEl) return;

  const qtyValueEl = qtySelector.querySelector('.qty-value');
  const decreaseBtn = qtySelector.querySelector('.qty-decrease');
  const increaseBtn = qtySelector.querySelector('.qty-increase');
  const whatsappBtn = card.querySelector('.btn-whatsapp');
  const unitPrice = parseFloat(priceEl.dataset.unitPrice);
  const flavorName = whatsappBtn ? whatsappBtn.dataset.flavor : card.querySelector('h3').textContent.trim();

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
      trackPixel('AddToCart', {
        content_name: flavorName,
        content_ids: [flavorName],
        content_type: 'product',
        value: unitPrice,
        currency: 'BOB',
      });
      render();
    }
  });

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (event) => {
      event.preventDefault();
      const total = (unitPrice * qty).toFixed(2);
      const unidad = qty === 1 ? 'galleta' : 'galletas';
      const mensaje = `¡Hola Dolce Nena! Quiero pedir ${qty} ${unidad} de *${flavorName}*. Total a pagar: Bs. ${total}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
      trackPixel('Contact', {
        content_name: flavorName,
        content_ids: [flavorName],
        content_type: 'product',
        value: Number(total),
        currency: 'BOB',
      });
      window.open(url, '_blank');
    });
  }

  render();
});

// ===== Arma tu pack =====
const packBuilder = document.getElementById('packBuilder');

if (packBuilder) {
  const PACK_MAX_PER_FLAVOR = 20;

  // Tramos de descuento por volumen total del pack (normal + premium cuentan igual)
  const PACK_TIERS = [
    { min: 8, rate: 0.15 },
    { min: 5, rate: 0.12 },
    { min: 3, rate: 0.08 },
  ];

  const getDiscountRate = (totalQty) => {
    for (const tier of PACK_TIERS) {
      if (totalQty >= tier.min) return tier.rate;
    }
    return 0;
  };

  const packTotalQtyEl = document.getElementById('packTotalQty');
  const packSubtotalEl = document.getElementById('packSubtotal');
  const packDiscountRowEl = document.getElementById('packDiscountRow');
  const packDiscountPctEl = document.getElementById('packDiscountPct');
  const packDiscountAmountEl = document.getElementById('packDiscountAmount');
  const packTotalEl = document.getElementById('packTotal');
  const packNudgeEl = document.getElementById('packNudge');
  const packClearBtn = document.getElementById('packClear');
  const packWhatsappBtn = document.getElementById('packWhatsappBtn');
  const packTierEls = document.querySelectorAll('#packDiscountTiers li');
  const packFloatEl = document.getElementById('packFloat');
  const packFloatQtyEl = document.getElementById('packFloatQty');
  const packFloatTotalEl = document.getElementById('packFloatTotal');

  const packItems = Array.from(packBuilder.querySelectorAll('.pack-row')).map(row => ({
    row,
    flavor: row.dataset.flavor,
    unitPrice: parseFloat(row.dataset.unitPrice),
    qty: 0,
    qtyValueEl: row.querySelector('.qty-value'),
    decreaseBtn: row.querySelector('.qty-decrease'),
    increaseBtn: row.querySelector('.qty-increase'),
  }));

  const renderPackSummary = () => {
    const totalQty = packItems.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = packItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const rate = getDiscountRate(totalQty);
    const discountAmount = subtotal * rate;
    const total = subtotal - discountAmount;

    packTotalQtyEl.textContent = totalQty;
    packSubtotalEl.textContent = `Bs. ${subtotal.toFixed(2)}`;

    if (rate > 0) {
      packDiscountRowEl.hidden = false;
      packDiscountPctEl.textContent = Math.round(rate * 100);
      packDiscountAmountEl.textContent = `− Bs. ${discountAmount.toFixed(2)}`;
    } else {
      packDiscountRowEl.hidden = true;
    }

    packTotalEl.textContent = `Bs. ${total.toFixed(2)}`;

    // Resalta en los tramos de arriba cuál(es) ya se alcanzaron
    packTierEls.forEach(li => {
      const tierMin = parseInt(li.dataset.tier, 10);
      li.classList.toggle('is-active', totalQty >= tierMin);
    });

    // Empujoncito práctico: cuánto falta para el siguiente descuento
    if (totalQty === 0) {
      packNudgeEl.textContent = 'Elige tus galletas favoritas para armar tu pack.';
    } else if (totalQty < 3) {
      packNudgeEl.textContent = `Agrega ${3 - totalQty} galleta(s) más y obtén 8% de descuento.`;
    } else if (totalQty < 5) {
      packNudgeEl.textContent = `Agrega ${5 - totalQty} galleta(s) más y obtén 12% de descuento.`;
    } else if (totalQty < 8) {
      packNudgeEl.textContent = `Agrega ${8 - totalQty} galleta(s) más y obtén 15% de descuento.`;
    } else {
      packNudgeEl.textContent = '¡Descuento máximo del 15% aplicado! 🎉';
    }

    const isEmpty = totalQty === 0;
    packWhatsappBtn.classList.toggle('is-disabled', isEmpty);
    packWhatsappBtn.setAttribute('aria-disabled', String(isEmpty));

    // Resumen flotante: visible mientras el usuario navega el resto de la página
    if (packFloatEl) {
      packFloatEl.hidden = isEmpty;
      if (!isEmpty) {
        packFloatQtyEl.textContent = totalQty;
        packFloatTotalEl.textContent = `Bs. ${total.toFixed(2)}`;
      }
    }
  };

  packItems.forEach(item => {
    const updateItem = () => {
      item.qtyValueEl.textContent = item.qty;
      item.decreaseBtn.disabled = item.qty <= 0;
      item.increaseBtn.disabled = item.qty >= PACK_MAX_PER_FLAVOR;
      renderPackSummary();
    };

    item.decreaseBtn.addEventListener('click', () => {
      if (item.qty > 0) {
        item.qty -= 1;
        updateItem();
      }
    });

    item.increaseBtn.addEventListener('click', () => {
      if (item.qty < PACK_MAX_PER_FLAVOR) {
        item.qty += 1;
        trackPixel('AddToCart', {
          content_name: item.flavor,
          content_ids: [item.flavor],
          content_type: 'product',
          value: item.unitPrice,
          currency: 'BOB',
        });
        updateItem();
      }
    });
  });

  packClearBtn.addEventListener('click', () => {
    packItems.forEach(item => {
      item.qty = 0;
      item.qtyValueEl.textContent = 0;
      item.decreaseBtn.disabled = true;
      item.increaseBtn.disabled = false;
    });
    renderPackSummary();
  });

  packWhatsappBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const totalQty = packItems.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty === 0) return;

    const subtotal = packItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const rate = getDiscountRate(totalQty);
    const discountAmount = subtotal * rate;
    const total = subtotal - discountAmount;

    const detalle = packItems
      .filter(item => item.qty > 0)
      .map(item => `- ${item.qty}x ${item.flavor} (Bs. ${(item.qty * item.unitPrice).toFixed(2)})`)
      .join('\n');

    let mensaje = `¡Hola Dolce Nena! Quiero armar este pack:\n${detalle}\n\nGalletas totales: ${totalQty}\nSubtotal: Bs. ${subtotal.toFixed(2)}`;
    if (rate > 0) {
      mensaje += `\nDescuento (${Math.round(rate * 100)}%): − Bs. ${discountAmount.toFixed(2)}`;
    }
    mensaje += `\nTotal a pagar: Bs. ${total.toFixed(2)}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    const contents = packItems
      .filter(item => item.qty > 0)
      .map(item => ({ id: item.flavor, quantity: item.qty, item_price: item.unitPrice }));

    trackPixel('InitiateCheckout', {
      value: Number(total.toFixed(2)),
      currency: 'BOB',
      num_items: totalQty,
      content_type: 'product',
      contents,
    });

    window.open(url, '_blank');
  });

  renderPackSummary();
}

// ===== Ayúdanos a mejorar (quejas anónimas guardadas en Firebase Firestore) =====
const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
  // 🔧 Reemplaza estos valores con los de TU proyecto de Firebase.
  // Los encuentras en: Firebase Console → ⚙️ Configuración del proyecto → "Tus apps" → SDK setup and configuration.
  const firebaseConfig = {
    apiKey: 'AIzaSyDyN_ltE4-ThckltFOtBqXMRYwsMagGMGY',
    authDomain: 'dolcenena7628.firebaseapp.com',
    projectId: 'dolcenena7628',
    storageBucket: 'dolcenena7628.firebasestorage.app',
    messagingSenderId: '958954567132',
    appId: '1:958954567132:web:1f2b438f480aaa90894b19',
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const feedbackMessage = document.getElementById('feedbackMessage');
  const feedbackFlavor = document.getElementById('feedbackFlavor');
  const feedbackWebsite = document.getElementById('feedbackWebsite'); // campo trampa (honeypot)
  const feedbackSubmit = document.getElementById('feedbackSubmit');
  const feedbackStatus = document.getElementById('feedbackStatus');
  const feedbackCount = document.getElementById('feedbackCount');
  const FEEDBACK_MAX_LEN = 600;

  feedbackMessage.addEventListener('input', () => {
    feedbackCount.textContent = feedbackMessage.value.length;
  });

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Si el campo trampa viene lleno, es un bot: lo ignoramos en silencio
    if (feedbackWebsite.value.trim() !== '') {
      feedbackForm.reset();
      feedbackCount.textContent = '0';
      return;
    }

    const mensaje = feedbackMessage.value.trim();
    if (!mensaje) {
      feedbackStatus.textContent = 'Por favor escribe un comentario antes de enviar.';
      feedbackStatus.classList.remove('is-success');
      feedbackStatus.classList.add('is-error');
      return;
    }

    feedbackSubmit.disabled = true;
    feedbackSubmit.textContent = 'Enviando...';
    feedbackStatus.textContent = '';

    try {
      await db.collection('quejas').add({
        mensaje: mensaje.slice(0, FEEDBACK_MAX_LEN),
        sabor: feedbackFlavor.value || 'No especificado',
        creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });

      trackPixel('SubmitApplication', {
        content_category: feedbackFlavor.value || 'No especificado',
      });

      feedbackForm.reset();
      feedbackCount.textContent = '0';
      feedbackStatus.textContent = '¡Gracias! Tu comentario fue enviado de forma anónima y lo tomaremos en cuenta.';
      feedbackStatus.classList.remove('is-error');
      feedbackStatus.classList.add('is-success');
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
      feedbackStatus.textContent = 'Hubo un problema al enviar tu comentario. Intenta de nuevo en unos minutos.';
      feedbackStatus.classList.remove('is-success');
      feedbackStatus.classList.add('is-error');
    } finally {
      feedbackSubmit.disabled = false;
      feedbackSubmit.textContent = 'Enviar de forma anónima';
    }
  });
}
