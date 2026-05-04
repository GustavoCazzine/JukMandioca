// script.js
(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
  }

  const track = document.querySelector('.clients-track');

  if (track) {
    const items = Array.from(track.children);

    // Duplica os itens para suportar rolagem contínua sem "buraco".
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  const contactForm = document.querySelector('#contact-form');
  const cnpjInput = document.querySelector('#cnpj');
  const phoneInput = document.querySelector('#telefone');

  const formatCnpj = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  if (cnpjInput) {
    cnpjInput.addEventListener('input', () => {
      cnpjInput.value = formatCnpj(cnpjInput.value);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  if (contactForm && cnpjInput) {
    contactForm.addEventListener('submit', (e) => {
      const cnpjDigits = cnpjInput.value.replace(/\D/g, '');

      if (cnpjDigits.length !== 14) {
        alert('Por favor, insira um CNPJ válido.');
        e.preventDefault();
      }
    });
  }
})();