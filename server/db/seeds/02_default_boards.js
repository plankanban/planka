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

const DESIGN_LISTS = ['Demanda', 'Produção', 'Aprovação', 'Entregue', 'Falar com o cliente'];

const CHAMADOS_LISTS = ['Em Espera', 'Em Execução', 'Executados', 'Falar com o cliente'];

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

async function ensureList(knex, boardId, name, position) {
  const existing = await knex('list').where({ board_id: boardId, name, type: 'active' }).first();
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const [{ id }] = await knex('list')
    .insert({
      board_id: boardId,
      type: 'active',
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
    // eslint-disable-next-line no-await-in-loop
    await ensureList(knex, designBoardId, DESIGN_LISTS[i], (i + 1) * POSITION_GAP);
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
    // eslint-disable-next-line no-await-in-loop
    await ensureList(knex, chamadosBoardId, CHAMADOS_LISTS[i], (i + 1) * POSITION_GAP);
  }

  for (let i = 0; i < PRIORITY_LABELS.length; i += 1) {
    const { name, color } = PRIORITY_LABELS[i];
    // eslint-disable-next-line no-await-in-loop
    await ensureLabel(knex, chamadosBoardId, name, color, (i + 1) * POSITION_GAP);
  }
};
