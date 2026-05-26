'use strict';

const express = require('express');
const path = require('path');
const { PORT, CONTACT_REASONS } = require('./config');
const { submitHandler } = require('./handler');
const { gformsHandler } = require('./gformsHandler');
const { manutencaoHandler } = require('./manutencaoHandler');
const { comercialHandler } = require('./comercialHandler');
const { fetchBoardCards } = require('./planka');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Expose config to the frontend so the dropdown is always in sync with server validation.
app.get('/api/config', (_req, res) => {
  res.json({ reasons: CONTACT_REASONS });
});

app.post('/api/submit', submitHandler);

// Webhook called by Google Apps Script on form submission
app.post('/api/gforms', gformsHandler);

// Maintenance ticket form submission
app.post('/api/manutencao', manutencaoHandler);

// Atualização Comercial (Posto/Varejo/Igreja unificado)
app.post('/api/comercial', comercialHandler);

// Cards listing for table view
app.get('/api/cards', async (_req, res) => {
  try {
    const cards = await fetchBoardCards();
    res.json({ items: cards });
  } catch (err) {
    console.error('[ticket-form] Failed to fetch cards:', err.message);
    res.status(502).json({ error: 'Erro ao buscar os cards.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ticket-form] Listening on http://0.0.0.0:${PORT}`);
});
