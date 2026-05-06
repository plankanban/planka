'use strict';

const config = require('./config');

const {
  PLANKA_URL,
  PLANKA_EMAIL,
  PLANKA_PASSWORD,
  PLANKA_PROJECT_NAME,
  PLANKA_DESIGN_BOARD_NAME,
  PLANKA_DESIGN_LIST_NAME,
  PLANKA_CHAMADOS_BOARD_NAME,
  PLANKA_CHAMADOS_LIST_NAME,
} = config;

// Module-level token cache shared across all requests in this process.
let tokenCache = { token: null, expiresAt: 0 };

// Decode the `exp` claim from a JWT payload without any library.
// Returns the expiry as Unix seconds, or Infinity if it cannot be decoded.
function decodeTokenExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    const { exp } = JSON.parse(json);
    return typeof exp === 'number' ? exp : Infinity;
  } catch {
    return Infinity;
  }
}

async function getToken() {
  const SAFETY_BUFFER_MS = 60_000; // refresh 60s before expiry
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - SAFETY_BUFFER_MS) {
    return tokenCache.token;
  }

  const res = await fetch(`${PLANKA_URL}/api/access-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: PLANKA_EMAIL, password: PLANKA_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Planka login failed with status ${res.status}`);
  }

  const { item: token } = await res.json();
  const expiresAt = decodeTokenExpiry(token) * 1000; // seconds → ms
  tokenCache = { token, expiresAt };
  return token;
}

// In-memory cache of discovered IDs (project, boards, lists, labels).
// First request resolves them via the API and they are reused afterwards.
const idCache = {
  designListId: config.PLANKA_LIST_ID,
  chamadosListId: config.PLANKA_CHAMADOS_LIST_ID,
  priorityLabels: { ...config.PRIORITY_LABELS },
  chamadosBoardId: null,
};

async function apiGet(path) {
  const token = await getToken();
  const res = await fetch(`${PLANKA_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    tokenCache = { token: null, expiresAt: 0 };
    return apiGet(path);
  }
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

async function findProjectByName(name) {
  const { items = [], included = {} } = await apiGet('/api/projects');
  const project = items.find((p) => p.name === name);
  return { project, boards: included.boards || [] };
}

async function findBoardId(projectName, boardName) {
  const { project, boards } = await findProjectByName(projectName);
  if (!project) return null;
  const board = boards.find((b) => b.projectId === project.id && b.name === boardName);
  return board ? board.id : null;
}

async function findListIdInBoard(boardId, listName) {
  const { included = {} } = await apiGet(`/api/boards/${boardId}`);
  const list = (included.lists || []).find((l) => l.name === listName && l.type === 'active');
  return list ? list.id : null;
}

async function indexLabelsInBoard(boardId) {
  const { included = {} } = await apiGet(`/api/boards/${boardId}`);
  const map = {};
  for (const label of included.labels || []) {
    if (label.name) map[label.name] = label.id;
  }
  return map;
}

async function getDesignListId() {
  if (idCache.designListId) return idCache.designListId;
  const boardId = await findBoardId(PLANKA_PROJECT_NAME, PLANKA_DESIGN_BOARD_NAME);
  if (!boardId) {
    throw new Error(
      `Could not find board "${PLANKA_DESIGN_BOARD_NAME}" inside project "${PLANKA_PROJECT_NAME}"`,
    );
  }
  const listId = await findListIdInBoard(boardId, PLANKA_DESIGN_LIST_NAME);
  if (!listId) {
    throw new Error(
      `Could not find list "${PLANKA_DESIGN_LIST_NAME}" on board "${PLANKA_DESIGN_BOARD_NAME}"`,
    );
  }
  idCache.designListId = listId;
  return listId;
}

async function getChamadosBoardId() {
  if (idCache.chamadosBoardId) return idCache.chamadosBoardId;
  const boardId = await findBoardId(PLANKA_PROJECT_NAME, PLANKA_CHAMADOS_BOARD_NAME);
  if (!boardId) {
    throw new Error(
      `Could not find board "${PLANKA_CHAMADOS_BOARD_NAME}" inside project "${PLANKA_PROJECT_NAME}"`,
    );
  }
  idCache.chamadosBoardId = boardId;
  return boardId;
}

async function getChamadosListId() {
  if (idCache.chamadosListId) return idCache.chamadosListId;
  const boardId = await getChamadosBoardId();
  const listId = await findListIdInBoard(boardId, PLANKA_CHAMADOS_LIST_NAME);
  if (!listId) {
    throw new Error(
      `Could not find list "${PLANKA_CHAMADOS_LIST_NAME}" on board "${PLANKA_CHAMADOS_BOARD_NAME}"`,
    );
  }
  idCache.chamadosListId = listId;
  return listId;
}

async function getPriorityLabelId(priorityName) {
  if (idCache.priorityLabels[priorityName]) {
    return idCache.priorityLabels[priorityName];
  }
  const boardId = await getChamadosBoardId();
  const labels = await indexLabelsInBoard(boardId);
  // Merge in any labels we hadn't cached yet (rather than replace, so admin
  // overrides via PRIORITY_LABELS env var keep precedence).
  for (const [name, id] of Object.entries(labels)) {
    if (!idCache.priorityLabels[name]) idCache.priorityLabels[name] = id;
  }
  return idCache.priorityLabels[priorityName] || null;
}

async function createCardInList(listId, name, descricao) {
  const token = await getToken();

  const res = await fetch(`${PLANKA_URL}/api/lists/${listId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: 'project',
      name,
      position: 65536,
      description: descricao,
    }),
  });

  if (res.status === 401) {
    tokenCache = { token: null, expiresAt: 0 };
    return createCardInList(listId, name, descricao);
  }

  if (!res.ok) {
    throw new Error(`Planka card creation failed with status ${res.status}`);
  }

  return res.json();
}

// Backward-compatible wrapper for the existing Pedido de Artes flow.
async function createCard(name, descricao) {
  const listId = await getDesignListId();
  return createCardInList(listId, name, descricao);
}

async function attachLabel(cardId, labelId) {
  const token = await getToken();
  const res = await fetch(`${PLANKA_URL}/api/cards/${cardId}/card-labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ labelId }),
  });
  if (!res.ok) {
    console.error(`[ticket-form] Failed to attach label ${labelId}: ${res.status}`);
  }
}

async function createCardCustomFieldGroups(cardId, groups) {
  const token = await getToken();

  let position = 65536;

  for (const group of groups) {
    if (!group.fields || group.fields.length === 0) continue;

    const groupRes = await fetch(`${PLANKA_URL}/api/cards/${cardId}/custom-field-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: group.name, position }),
    });

    if (!groupRes.ok) {
      console.error(`[ticket-form] Failed to create group "${group.name}": ${groupRes.status}`);
      continue;
    }

    const { item: groupItem } = await groupRes.json();
    const groupId = groupItem.id;
    position += 65536;

    let fieldPosition = 65536;
    for (const field of group.fields) {
      const fieldRes = await fetch(
        `${PLANKA_URL}/api/custom-field-groups/${groupId}/custom-fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: field.name,
            position: fieldPosition,
            showOnFrontOfCard: !!field.showOnFrontOfCard,
          }),
        },
      );

      if (!fieldRes.ok) {
        console.error(`[ticket-form] Failed to create field "${field.name}": ${fieldRes.status}`);
        continue;
      }

      const { item: fieldItem } = await fieldRes.json();
      const fieldId = fieldItem.id;
      fieldPosition += 65536;

      const valueRes = await fetch(
        `${PLANKA_URL}/api/cards/${cardId}/custom-field-values/customFieldGroupId:${groupId}:customFieldId:${fieldId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: field.value }),
        },
      );

      if (!valueRes.ok) {
        console.error(
          `[ticket-form] Failed to set value for "${field.name}": ${valueRes.status}`,
        );
      }
    }
  }
}

async function fetchBoardCards() {
  const token = await getToken();
  const designListId = await getDesignListId();

  // 1. Get the list to find its boardId
  const listRes = await fetch(`${PLANKA_URL}/api/lists/${designListId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) throw new Error(`Failed to fetch list: ${listRes.status}`);
  const listData = await listRes.json();
  const boardId = listData.item.boardId;

  // 2. Get the full board with all cards and lists
  const boardRes = await fetch(`${PLANKA_URL}/api/boards/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!boardRes.ok) throw new Error(`Failed to fetch board: ${boardRes.status}`);
  const boardData = await boardRes.json();

  const lists = (boardData.included?.lists || []).reduce((map, l) => {
    map[l.id] = l.name || l.type;
    return map;
  }, {});

  const cards = (boardData.included?.cards || []).map((card) => ({
    id: card.id,
    name: card.name,
    description: card.description || '',
    listName: lists[card.listId] || '',
    createdAt: card.createdAt,
    fields: parseDescription(card.description || ''),
  }));

  return cards;
}

// Parse structured markdown description into key-value pairs.
function parseDescription(description) {
  const data = {};
  const regex = /\*\*(.+?):\*\*\s*(.+)/g;
  let match;
  while ((match = regex.exec(description)) !== null) {
    data[match[1].trim()] = match[2].trim();
  }

  // Extract "Card aberto em" timestamp
  const tsMatch = description.match(/Card aberto via formulário(?: preenchido[^e]*)? em (.+)/);
  if (tsMatch) data['Aberto Em'] = tsMatch[1].trim();

  return data;
}

module.exports = {
  createCard,
  createCardInList,
  createCardCustomFieldGroups,
  attachLabel,
  fetchBoardCards,
  getDesignListId,
  getChamadosListId,
  getChamadosBoardId,
  getPriorityLabelId,
};
