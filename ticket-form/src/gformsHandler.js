'use strict';

const { createCard, createCardCustomFieldGroups } = require('./planka');
const supabase = require('./supabase');
const { WEBHOOK_SECRET } = require('./config');

// Maps the raw Google Form field titles to what we display in the card description.
const FIELD_SECTIONS = [
  {
    title: 'Identificação do Posto',
    fields: [
      'NOME DO POSTO',
      'BANDEIRA',
      'CIDADE',
      'ESTADO',
      'NOME RESPONSÁVEL',
      'TLEFONE RESPONSÁVEL',
    ],
  },
  {
    title: 'Equipamento',
    fields: [
      'EQUIPAMENTO',
      'PREVISÃO DA INSTALAÇÃO',
      'MEDIDA DO LED',
      'TIPO LED',
      'TIPO DE NEGOCIAÇÃO',
    ],
  },
  {
    title: 'Preços dos Combustíveis',
    fields: [
      'PREÇO GASOLINA COMUM',
      'PREÇO GASOLINA ADITIVADA',
      'GASOINA PODIUM',
      'PREÇO ETANOL',
      'PREÇO DIESEL',
      'PREÇO DIESEL S 10',
      'ARLA',
      'PREÇO GNV',
    ],
  },
  {
    title: 'Comercial',
    fields: ['RODAR COMERCIAL PDVIEW NO LOOP', 'VENDEDOR', 'DATA'],
  },
  {
    title: 'Observações',
    fields: ['OBSERVAÇÕES'],
  },
];

function buildDescription(data) {
  const lines = [];

  for (const section of FIELD_SECTIONS) {
    const sectionLines = [];
    for (const field of section.fields) {
      const value = data[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        sectionLines.push(`**${toTitleCase(field)}:** ${value}`);
      }
    }
    if (sectionLines.length > 0) {
      lines.push(`## ${section.title}`);
      lines.push(...sectionLines);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

// Display name overrides for fields with typos or awkward names in the original form.
const DISPLAY_NAMES = {
  'TLEFONE RESPONSÁVEL': 'Telefone Responsável',
};

function toTitleCase(str) {
  if (DISPLAY_NAMES[str]) return DISPLAY_NAMES[str];
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

// Build the custom field groups structure for the card, using clean display names.
function buildCustomFieldGroups(data, openedAt) {
  const get = (key) => String(data[key] || '').trim();

  const cidade = get('CIDADE');
  const estado = get('ESTADO');
  const cidadeEstado = [cidade, estado].filter(Boolean).join(' / ');

  const groups = [
    {
      name: 'Identificação do Posto',
      fields: [
        { name: 'Nome do Posto', value: get('NOME DO POSTO'), showOnFrontOfCard: true },
        { name: 'Bandeira', value: get('BANDEIRA') },
        { name: 'Cidade / Estado', value: cidadeEstado, showOnFrontOfCard: true },
        { name: 'Nome do Responsável', value: get('NOME RESPONSÁVEL') },
        { name: 'Telefone do Responsável', value: get('TLEFONE RESPONSÁVEL') },
      ],
    },
    {
      name: 'Equipamento',
      fields: [
        { name: 'Equipamento', value: get('EQUIPAMENTO') },
        { name: 'Previsão da Instalação', value: get('PREVISÃO DA INSTALAÇÃO') },
        { name: 'Medida do LED', value: get('MEDIDA DO LED') },
        { name: 'Tipo de LED', value: get('TIPO LED') },
        { name: 'Tipo de Negociação', value: get('TIPO DE NEGOCIAÇÃO') },
      ],
    },
    {
      name: 'Preços dos Combustíveis',
      fields: [
        { name: 'Gasolina Comum', value: get('PREÇO GASOLINA COMUM') },
        { name: 'Gasolina Aditivada', value: get('PREÇO GASOLINA ADITIVADA') },
        { name: 'Gasolina Pódium', value: get('GASOINA PODIUM') },
        { name: 'Etanol', value: get('PREÇO ETANOL') },
        { name: 'Diesel', value: get('PREÇO DIESEL') },
        { name: 'Diesel S10', value: get('PREÇO DIESEL S 10') },
        { name: 'ARLA', value: get('ARLA') },
        { name: 'GNV', value: get('PREÇO GNV') },
      ],
    },
    {
      name: 'Comercial',
      fields: [
        { name: 'Rodar Comercial PDVIEW no Loop', value: get('RODAR COMERCIAL PDVIEW NO LOOP') },
        { name: 'Vendedor', value: get('VENDEDOR') },
        { name: 'Data do Pedido', value: get('DATA') },
        { name: 'Data/Hora de Abertura do Card', value: openedAt },
      ],
    },
  ];

  const observacoes = get('OBSERVAÇÕES');
  if (observacoes) {
    groups.push({
      name: 'Observações',
      fields: [{ name: 'Observações', value: observacoes }],
    });
  }

  // Remove fields sem valor e grupos que ficaram vazios
  return groups
    .map((g) => ({ ...g, fields: g.fields.filter((f) => f.value && f.value.length > 0) }))
    .filter((g) => g.fields.length > 0);
}

async function gformsHandler(req, res) {
  // Optional secret check — if WEBHOOK_SECRET is set, the request must include it.
  if (WEBHOOK_SECRET) {
    const provided = req.headers['x-webhook-secret'] || req.query.secret;
    if (provided !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Título do card é apenas o motivo — as demais informações ficam nos
  // custom fields (e dois deles aparecem como badges no front do card).
  const cardName = 'TROCA DE ARTE';

  // Toda informação fica nos custom fields — descrição vazia.
  const now = new Date();
  const timestamp = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  try {
    const { item: card } = await createCard(cardName, '');
    const groups = buildCustomFieldGroups(data, timestamp);
    await createCardCustomFieldGroups(card.id, groups);

    // Mirror to Supabase (best-effort — never blocks the form response).
    Promise.all([
      supabase.logFormSubmission({
        formType: 'design',
        payload: data,
        plankaCardId: card.id,
        status: 'created',
      }),
      supabase.upsertCard({
        planka_id: String(card.id),
        board_id: card.boardId ? String(card.boardId) : null,
        list_id: card.listId ? String(card.listId) : null,
        project_name: 'PDView ERP',
        board_name: 'Design',
        list_name: 'Demanda',
        name: cardName,
        description: card.description || null,
        labels: [],
        custom_fields: groups.reduce((acc, g) => {
          acc[g.name] = g.fields.reduce((m, f) => {
            m[f.name] = f.value;
            return m;
          }, {});
          return acc;
        }, {}),
      }),
      supabase.logCardEvent({
        plankaCardId: card.id,
        eventType: 'form_submit_design',
        data: { source: 'ticket-form', opened_at: timestamp },
      }),
    ]).catch(() => undefined);

    return res.json({ ok: true });
  } catch (err) {
    console.error('[ticket-form] gforms card creation failed:', err.message);
    supabase
      .logFormSubmission({
        formType: 'design',
        payload: data,
        status: 'failed',
        errorMessage: err.message,
      })
      .catch(() => undefined);
    return res.status(502).json({ error: 'Failed to create card' });
  }
}

module.exports = { gformsHandler };
