const formatCnpj = v =>
  v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/,           '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/,  '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,          '.$1/$2')
    .replace(/(\d{4})(\d)/,            '$1-$2');

const formatPhone = v => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.length <= 10
    ? d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    : d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

export function initForm() {
  const cnpjEl  = document.querySelector('#cnpj');
  const phoneEl = document.querySelector('#telefone');
  const form    = document.querySelector('#contact-form');

  cnpjEl?.addEventListener('input',  () => { cnpjEl.value  = formatCnpj(cnpjEl.value);  });
  phoneEl?.addEventListener('input', () => { phoneEl.value = formatPhone(phoneEl.value); });

  form?.addEventListener('submit', e => {
    if (cnpjEl && cnpjEl.value.replace(/\D/g, '').length !== 14) {
      alert('Por favor, insira um CNPJ válido.');
      e.preventDefault();
    }
  });
}
