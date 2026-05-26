'use strict';

const {
  createCardInList,
  createCardCustomFieldGroups,
  getComercialListId,
} = require('./planka');
const supabase = require('./supabase');

// Per-flow display name + the fields we surface in the card custom-field group.
// Keys are the form's submitted names (TIPO/VENDEDOR + the per-flow prefixed
// ones). New fields added to the form just need to be listed here to show up
// on the card.
const FLOW_DEFS = {
  POSTO: {
    label: 'Posto',
    sectionTitle: 'Dados do Posto',
    nameField: 'POSTO_NOME',
    requiredFields: ['POSTO_NOME', 'POSTO_CIDADE', 'POSTO_ESTADO'],
    fieldOrder: [
      ['POSTO_NOME', 'Nome do Posto', true],
      ['POSTO_BANDEIRA', 'Bandeira'],
      ['POSTO_CNPJ', 'CNPJ'],
      ['POSTO_CIDADE', 'Cidade', true],
      ['POSTO_ESTADO', 'Estado'],
      ['POSTO_RESPONSAVEL', 'Responsável'],
      ['POSTO_TELEFONE', 'Telefone'],
      ['POSTO_STATUS', 'Status da Negociação'],
      ['POSTO_OBSERVACOES', 'Observações'],
    ],
  },
  VAREJO: {
    label: 'Varejo',
    sectionTitle: 'Dados do Varejo',
    nameField: 'VAREJO_NOME',
    requiredFields: ['VAREJO_NOME', 'VAREJO_CIDADE', 'VAREJO_ESTADO'],
    fieldOrder: [
      ['VAREJO_NOME', 'Nome do Estabelecimento', true],
      ['VAREJO_SEGMENTO', 'Segmento'],
      ['VAREJO_CNPJ', 'CNPJ'],
      ['VAREJO_CIDADE', 'Cidade', true],
      ['VAREJO_ESTADO', 'Estado'],
      ['VAREJO_RESPONSAVEL', 'Responsável'],
      ['VAREJO_TELEFONE', 'Telefone'],
      ['VAREJO_STATUS', 'Status da Negociação'],
      ['VAREJO_OBSERVACOES', 'Observações'],
    ],
  },
  IGREJA: {
    label: 'Igreja',
    sectionTitle: 'Dados da Igreja',
    nameField: 'IGREJA_NOME',
    requiredFields: ['IGREJA_NOME', 'IGREJA_CIDADE', 'IGREJA_ESTADO'],
    fieldOrder: [
      ['IGREJA_NOME', 'Nome da Igreja', true],
      ['IGREJA_DENOMINACAO', 'Denominação'],
      ['IGREJA_CNPJ', 'CNPJ'],
      ['IGREJA_CIDADE', 'Cidade', true],
      ['IGREJA_ESTADO', 'Estado'],
      ['IGREJA_RESPONSAVEL', 'Pastor / Responsável'],
      ['IGREJA_TELEFONE', 'Telefone'],
      ['IGREJA_MEMBROS', 'Qtd. Membros'],
      ['IGREJA_STATUS', 'Status da Negociação'],
      ['IGREJA_OBSERVACOES', 'Observações'],
    ],
  },
};

async function comercialHandler(req, res) {
  const data = req.body || {};

  const tipoRaw = String(data.TIPO || '').toUpperCase().trim();
  const flow = FLOW_DEFS[tipoRaw];
  if (!flow) {
    return res.status(400).json({ error: 'Tipo inválido. Escolha Posto, Varejo ou Igreja.' });
  }
  if (!data.VENDEDOR || String(data.VENDEDOR).trim() === '') {
    return res.status(400).json({ error: 'Campo obrigatório ausente: VENDEDOR' });
  }
  for (const field of flow.requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      return res.status(400).json({ error: `Campo obrigatório ausente: ${field}` });
    }
  }

  let comercialListId;
  try {
    comercialListId = await getComercialListId();
  } catch (err) {
    console.error('[ticket-form] failed to resolve Comercial board:', err.message);
    return res.status(500).json({
      error:
        'Não foi possível localizar o board "Comercial". Verifique se ele existe no Planka.',
    });
  }

  const now = new Date();
  const openedAt = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const dataAbertura = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const cardName = `[${flow.label}] ${String(data[flow.nameField]).trim()}`;

  const flowFields = flow.fieldOrder
    .filter(([key]) => data[key] != null && String(data[key]).trim() !== '')
    .map(([key, label, showOnFront]) => ({
      name: label,
      value: String(data[key]).trim(),
      showOnFrontOfCard: !!showOnFront,
    }));

  const customFieldGroups = [
    {
      name: 'Comercial',
      fields: [
        { name: 'Tipo', value: flow.label, showOnFrontOfCard: true },
        { name: 'Vendedor', value: data.VENDEDOR, showOnFrontOfCard: true },
        { name: 'Data de Abertura', value: dataAbertura },
      ],
    },
    {
      name: flow.sectionTitle,
      fields: flowFields,
    },
  ];

  try {
    const { item: card } = await createCardInList(comercialListId, cardName, '');
    await createCardCustomFieldGroups(card.id, customFieldGroups);

    // Mirror to Supabase (best-effort).
    Promise.all([
      supabase.logFormSubmission({
        formType: 'comercial',
        payload: data,
        plankaCardId: card.id,
        status: 'created',
      }),
      supabase.upsertCard({
        planka_id: String(card.id),
        board_id: card.boardId ? String(card.boardId) : null,
        list_id: card.listId ? String(card.listId) : null,
        project_name: 'PDView ERP',
        board_name: 'Comercial',
        list_name: 'Em Espera',
        name: cardName,
        description: card.description || null,
        labels: [],
        custom_fields: customFieldGroups.reduce((acc, group) => {
          acc[group.name] = group.fields.reduce((m, f) => {
            m[f.name] = f.value;
            return m;
          }, {});
          return acc;
        }, {}),
      }),
      supabase.logCardEvent({
        plankaCardId: card.id,
        eventType: 'form_submit_comercial',
        data: {
          source: 'ticket-form',
          tipo: flow.label,
          vendedor: data.VENDEDOR,
          opened_at: openedAt,
        },
      }),
    ]).catch(() => undefined);

    return res.json({ ok: true, tipo: flow.label });
  } catch (err) {
    console.error('[ticket-form] comercial card creation failed:', err.message);
    supabase
      .logFormSubmission({
        formType: 'comercial',
        payload: data,
        status: 'failed',
        errorMessage: err.message,
      })
      .catch(() => undefined);
    return res.status(502).json({ error: 'Erro ao registrar a atualização. Tente novamente.' });
  }
}

module.exports = { comercialHandler };
