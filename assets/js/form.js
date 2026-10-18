import { waLink } from './config.js';

const formatCnpj = v =>
  v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

const formatPhone = v => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.length <= 10
    ? d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    : d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

const val = (f, n) => (f.elements[n]?.value || '').trim();
const label = el => el.selectedOptions ? el.selectedOptions[0].text : el.value;

function quoteMessage(f) {
  const linhas = [['Empresa', 'empresa'], ['CNPJ', 'cnpj'], ['E-mail', 'email'], ['Telefone', 'telefone'],
    ['Origem', 'origem'], ['Destino', 'destino'], ['Carga', 'carga'], ['Detalhes', 'detalhes']]
    .filter(([, n]) => f.elements[n] && val(f, n))
    .map(([t, n]) => `${t}: ${label(f.elements[n])}`);
  return `Olá! Quero uma cotação de frete.\n${linhas.join('\n')}`;
}

function showError(f, msg) {
  let box = f.querySelector('.form-error');
  if (!box) {
    box = document.createElement('p');
    box.className = 'form-error';
    box.setAttribute('role', 'alert');
    f.prepend(box);
  }
  box.textContent = msg;
  box.hidden = !msg;
}

export function initForm() {
  document.querySelectorAll('#cnpj').forEach(el => el.addEventListener('input', () => { el.value = formatCnpj(el.value); }));
  document.querySelectorAll('#telefone').forEach(el => el.addEventListener('input', () => { el.value = formatPhone(el.value); }));

  document.querySelectorAll('[data-quote-form]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const invalid = [...f.elements].find(el => el.required && !el.value.trim());
      if (invalid) { showError(f, 'Preencha os campos obrigatórios.'); invalid.focus(); return; }
      const cnpj = f.elements.cnpj;
      if (cnpj && cnpj.value && cnpj.value.replace(/\D/g, '').length !== 14) {
        showError(f, 'CNPJ incompleto. Confira os 14 números.'); cnpj.focus(); return;
      }
      showError(f, '');
      window.open(waLink(quoteMessage(f)), '_blank', 'noopener');
    });
  });
}
