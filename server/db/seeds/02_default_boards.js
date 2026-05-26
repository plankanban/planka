/*!
 * Seeds the default Planka workspace expected by the ticket-form service:
 *   - Project   "PDView ERP"   (created if no project of that name exists)
 *   - Board     "Design"       — kanban view, lists: Demanda, Produção,
 *                                Aprovação, Entregue, Falar com o cliente
 *   - Board     "Chamados Técnicos" — table view, lists: Em Espera, Em
 *                                Execução, Executados, Falar com o cliente,
 *                                plus 8 priority labels.
 *
 * Fully idempotent: nothing is recreated when the records already exist.
 * Safe to re-run on every deploy via `npm run db:init`.
 */

const PROJECT_NAME = 'PDView ERP';
const POSITION_GAP = 65536;

// `type: 'active'` is the default. `type: 'closed'` represents the
// "Finalizado/Concluído" column — moving a card into it triggers the
// auto "Chamado finalizado em" timestamp + 30-day auto-archive sweep.
const DESIGN_LISTS = [
  { name: 'Demanda' },
  { name: 'Produção' },
  { name: 'Aprovação' },
  { name: 'Entregue' },
  { name: 'Falar com o cliente' },
  { name: 'Finalizado', type: 'closed' },
];

// "Executados" is the natural "concluded" column on the Chamados board, so
// it doubles as the `closed`-typed list. No separate "Finalizado" list here.
const CHAMADOS_LISTS = [
  { name: 'Em Espera' },
  { name: 'Em Execução' },
  { name: 'Executados', type: 'closed' },
];

// Board Comercial — mesma estrutura inicial do Chamados (3 listas, sendo
// "Executados" o estado `closed`). O time pode renomear/extender depois.
const COMERCIAL_LISTS = [
  { name: 'Em Espera' },
  { name: 'Em Execução' },
  { name: 'Executados', type: 'closed' },
];

const PRIORITY_LABELS = [
  { name: 'BAIXA PRIORIDADE', color: 'bright-moss' },
  { name: 'MÉDIA GRAVIDADE', color: 'egg-yellow' },
  { name: 'URGÊNCIA', color: 'berry-red' },
  { name: 'EM TRATAMENTO', color: 'turquoise-sea' },
  { name: 'ATUALIZAÇÃO DO TRATAMENTO', color: 'midnight-blue' },
  { name: 'PENDÊNCIAS DE INSTALAÇÃO', color: 'pumpkin-orange' },
  { name: 'EM ESPERA', color: 'pink-tulip' },
  { name: 'MÁXIMA PRIORIDADE', color: 'lilac-eyes' },
];

async function ensureProject(knex, adminUserId) {
  const existing = await knex('project').where('name', PROJECT_NAME).first();
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const [{ id: projectId }] = await knex('project')
    .insert({
      name: PROJECT_NAME,
      is_hidden: false,
      created_at: now,
      updated_at: now,
    })
    .returning('id');

  // Add the admin as project manager (also marks them as owner).
  if (adminUserId) {
    const [{ id: managerId }] = await knex('project_manager')
      .insert({
        project_id: projectId,
        user_id: adminUserId,
        created_at: now,
        updated_at: now,
      })
      .returning('id');

    await knex('project').where('id', projectId).update({ owner_project_manager_id: managerId });
  }

  return projectId;
}

// Reuses an existing board with the given name (in ANY project) before
// creating a new one. Returns { boardId, projectId }.
async function ensureBoard(knex, fallbackProjectId, name, defaultView, position) {
  const existing = await knex('board').where({ name }).first();
  if (existing) {
    return { boardId: existing.id, projectId: existing.project_id };
  }

  const now = new Date().toISOString();
  const [{ id: boardId }] = await knex('board')
    .insert({
      project_id: fallbackProjectId,
      position,
      name,
      default_view: defaultView,
      default_card_type: 'project',
      limit_card_types_to_default_one: false,
      always_display_card_creator: false,
      expand_task_lists_by_default: true,
      display_card_ages: false,
      created_at: now,
      updated_at: now,
    })
    .returning('id');

  return { boardId, projectId: fallbackProjectId };
}

async function ensureBoardMembership(knex, projectId, boardId, userId) {
  if (!userId) return;
  const existing = await knex('board_membership')
    .where({ board_id: boardId, user_id: userId })
    .first();
  if (existing) return;

  const now = new Date().toISOString();
  await knex('board_membership').insert({
    project_id: projectId,
    board_id: boardId,
    user_id: userId,
    role: 'editor',
    can_comment: true,
    created_at: now,
    updated_at: now,
  });
}

async function ensureList(knex, boardId, name, position, type = 'active') {
  // Reuse a list with the same name if it already exists. Promote it to the
  // requested type when the seed asks for `closed` and the row is still
  // active (idempotent — does nothing on subsequent runs).
  const existing = await knex('list').where({ board_id: boardId, name }).first();
  if (existing) {
    if (type === 'closed' && existing.type === 'active') {
      await knex('list').where({ id: existing.id }).update({ type: 'closed' });
      // Reflect the closed state on cards that already live in the list.
      await knex('card').where({ list_id: existing.id }).update({ is_closed: true });
    }
    return existing.id;
  }

  const now = new Date().toISOString();
  const [{ id }] = await knex('list')
    .insert({
      board_id: boardId,
      type,
      position,
      name,
      created_at: now,
      updated_at: now,
    })
    .returning('id');
  return id;
}

async function ensureLabel(knex, boardId, name, color, position) {
  const existing = await knex('label').where({ board_id: boardId, name }).first();
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const [{ id }] = await knex('label')
    .insert({
      board_id: boardId,
      position,
      name,
      color,
      created_at: now,
      updated_at: now,
    })
    .returning('id');
  return id;
}

exports.seed = async (knex) => {
  const admin = await knex('user_account').where('role', 'admin').orderBy('id').first();
  if (!admin) {
    // No admin yet (DEFAULT_ADMIN_EMAIL not set) — nothing to own the project.
    return;
  }

  const fallbackProjectId = await ensureProject(knex, admin.id);

  // --- Design board ---
  const { boardId: designBoardId, projectId: designProjectId } = await ensureBoard(
    knex,
    fallbackProjectId,
    'Design',
    'kanban',
    POSITION_GAP,
  );
  await ensureBoardMembership(knex, designProjectId, designBoardId, admin.id);

  for (let i = 0; i < DESIGN_LISTS.length; i += 1) {
    const { name, type } = DESIGN_LISTS[i];
    // eslint-disable-next-line no-await-in-loop
    await ensureList(knex, designBoardId, name, (i + 1) * POSITION_GAP, type);
  }

  // --- Chamados Técnicos board ---
  const { boardId: chamadosBoardId, projectId: chamadosProjectId } = await ensureBoard(
    knex,
    fallbackProjectId,
    'Chamados Técnicos',
    'table',
    POSITION_GAP * 2,
  );
  await ensureBoardMembership(knex, chamadosProjectId, chamadosBoardId, admin.id);

  for (let i = 0; i < CHAMADOS_LISTS.length; i += 1) {
    const { name, type } = CHAMADOS_LISTS[i];
    // eslint-disable-next-line no-await-in-loop
    await ensureList(knex, chamadosBoardId, name, (i + 1) * POSITION_GAP, type);
  }

  // Get Executados id for migrations below.
  const executados = await knex('list')
    .where({ board_id: chamadosBoardId, name: 'Executados' })
    .first();

  // Remove redundant lists from the Chamados board:
  //   - "Falar com o cliente"        (kept only on Design)
  //   - "Finalizado" / "Finalizados" (Executados already plays that role)
  // Cards living on stray "Finalizado*" lists are migrated to Executados; the
  // stale list is then deleted. "Falar com o cliente" is only deleted when
  // empty (cards on it would be lost — not safe to migrate elsewhere).
  const FINALIZED_DUPES = ['Finalizado', 'Finalizados'];
  if (executados) {
    const dupes = await knex('list')
      .where({ board_id: chamadosBoardId })
      .whereIn('name', FINALIZED_DUPES);
    await Promise.all(
      dupes.map(async (dupe) => {
        await knex('card')
          .where({ list_id: dupe.id })
          .update({ list_id: executados.id, is_closed: true });
        await knex('list').where({ id: dupe.id }).delete();
      }),
    );
  }

  const stray = await knex('list')
    .where({ board_id: chamadosBoardId, name: 'Falar com o cliente' })
    .first();
  if (stray) {
    const cardCount = await knex('card').where({ list_id: stray.id }).count('id as n').first();
    if (Number(cardCount.n) === 0) {
      await knex('list').where({ id: stray.id }).delete();
    }
  }

  for (let i = 0; i < PRIORITY_LABELS.length; i += 1) {
    const { name, color } = PRIORITY_LABELS[i];
    // eslint-disable-next-line no-await-in-loop
    await ensureLabel(knex, chamadosBoardId, name, color, (i + 1) * POSITION_GAP);
  }

  // --- Comercial board ---
  const { boardId: comercialBoardId, projectId: comercialProjectId } = await ensureBoard(
    knex,
    fallbackProjectId,
    'Comercial',
    'table',
    POSITION_GAP * 3,
  );
  await ensureBoardMembership(knex, comercialProjectId, comercialBoardId, admin.id);

  for (let i = 0; i < COMERCIAL_LISTS.length; i += 1) {
    const { name, type } = COMERCIAL_LISTS[i];
    // eslint-disable-next-line no-await-in-loop
    await ensureList(knex, comercialBoardId, name, (i + 1) * POSITION_GAP, type);
  }
};
