export const EMPRESA = {
  nome: 'JukMandioca Transportes',
  whatsapp: '5519900000000',
  telefone: '5519900000000',
  email: 'contato@jukmandioca.com.br',
  cnpj: '00.000.000/0001-00',
  endereco: 'Piracicaba – SP',
  horario: 'Seg. a sex. 8h–18h · Sáb. 8h–12h',
};

const fmtTel = n => {
  const d = n.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
};

export const waLink = msg =>
  `https://wa.me/${EMPRESA.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;

export function initConfig() {
  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  set('[data-cfg="telefone"]', el => { el.textContent = fmtTel(EMPRESA.telefone); el.href = `tel:+${EMPRESA.telefone}`; });
  set('[data-cfg="whatsapp-num"]', el => { el.textContent = fmtTel(EMPRESA.whatsapp); el.href = waLink(); });
  set('[data-cfg="email"]', el => { el.textContent = EMPRESA.email; el.href = `mailto:${EMPRESA.email}`; });
  set('[data-cfg="cnpj"]', el => { el.textContent = `CNPJ: ${EMPRESA.cnpj}`; });
  set('[data-cfg="endereco"]', el => { el.textContent = EMPRESA.endereco; });
  set('[data-cfg="horario"]', el => { el.textContent = EMPRESA.horario; });
  set('[data-cfg="ano"]', el => { el.textContent = new Date().getFullYear(); });
  set('[data-wa]', el => { el.href = waLink(el.dataset.wa || 'Olá! Quero uma cotação de frete.'); });
}
