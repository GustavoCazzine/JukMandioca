export const EMPRESA = {
  nome: 'Grupo LGvans do Brasil',
  whatsapp: '5519996027307',
  telefone: '5519996027307',
  email: '',
  cnpj: '06.971.892/0001-54',
  endereco: 'Rio das Pedras – SP · Região de Piracicaba',
  horario: 'Atendimento das 7h às 17h',
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
  set('[data-wa]', el => { el.href = waLink(el.dataset.wa || 'Olá! Quero falar com um especialista logístico do Grupo LGvans.'); });
}
