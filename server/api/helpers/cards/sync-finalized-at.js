/*!
 * Keeps the per-card "Chamado finalizado em" custom field value in sync with
 * the card's list type:
 *
 *   - When the card moves INTO a list of type `closed`, sets (or refreshes)
 *     the value with the current timestamp.
 *   - When the card moves OUT of a `closed` list into any other type, the
 *     value is cleared (the card is no longer finalized).
 *
 * The board-level custom field group + field used to host the value are
 * created on demand the first time a card is finalized in a given board.
 */

const FIELD_GROUP_NAME = 'Sistema';
const FIELD_NAME = 'Chamado finalizado em';
const POSITION_GAP = 65536;

const CLOSED_TYPE = 'closed';

const formatTimestamp = (date) => date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

async function ensureBoardFieldGroup(boardId) {
  const existing = await CustomFieldGroup.findOne({
    boardId,
    name: FIELD_GROUP_NAME,
  });
  if (existing) return { record: existing, created: false };

  const last = await CustomFieldGroup.find({ boardId }).sort('position DESC').limit(1);
  const lastPosition = last.length > 0 ? last[0].position : 0;

  const record = await CustomFieldGroup.create({
    boardId,
    name: FIELD_GROUP_NAME,
    position: lastPosition + POSITION_GAP,
  }).fetch();

  // Critical: broadcast so the frontend learns about the new group, otherwise
  // the customFieldValueUpdate that follows will be silently ignored.
  // Note: we deliberately don't pass `request` here so the broadcast also
  // reaches the client that triggered the move (otherwise the field would
  // only show up after a manual refresh).
  sails.sockets.broadcast(`board:${boardId}`, 'customFieldGroupCreate', { item: record });
  return { record, created: true };
}

async function ensureField(group) {
  const existing = await CustomField.findOne({
    customFieldGroupId: group.id,
    name: FIELD_NAME,
  });
  if (existing) return { record: existing, created: false };

  const last = await CustomField.find({ customFieldGroupId: group.id })
    .sort('position DESC')
    .limit(1);
  const lastPosition = last.length > 0 ? last[0].position : 0;

  const record = await CustomField.create({
    customFieldGroupId: group.id,
    name: FIELD_NAME,
    position: lastPosition + POSITION_GAP,
    showOnFrontOfCard: false,
  }).fetch();

  sails.sockets.broadcast(`board:${group.boardId}`, 'customFieldCreate', { item: record });
  return { record, created: true };
}

async function findExistingValue(cardId, boardId) {
  const group = await CustomFieldGroup.findOne({
    boardId,
    name: FIELD_GROUP_NAME,
  });
  if (!group) return null;

  const field = await CustomField.findOne({
    customFieldGroupId: group.id,
    name: FIELD_NAME,
  });
  if (!field) return null;

  const value = await CustomFieldValue.findOne({
    cardId,
    customFieldGroupId: group.id,
    customFieldId: field.id,
  });
  return value ? { group, field, value } : { group, field, value: null };
}

module.exports = {
  inputs: {
    card: { type: 'ref', required: true },
    boardId: { type: 'string', required: true },
    fromType: { type: 'string', allowNull: true },
    toType: { type: 'string', allowNull: true },
    request: { type: 'ref' },
  },

  async fn(inputs) {
    const { card, boardId, fromType, toType } = inputs;

    const movedIntoClosed = toType === CLOSED_TYPE;
    const movedOutOfClosed = fromType === CLOSED_TYPE && toType !== CLOSED_TYPE;

    if (!movedIntoClosed && !movedOutOfClosed) return;

    if (movedIntoClosed) {
      const { record: group } = await ensureBoardFieldGroup(boardId);
      const { record: field } = await ensureField(group);
      const content = formatTimestamp(new Date());

      const existingValue = await CustomFieldValue.findOne({
        cardId: card.id,
        customFieldGroupId: group.id,
        customFieldId: field.id,
      });

      let saved;
      if (existingValue) {
        saved = await CustomFieldValue.updateOne(existingValue.id).set({ content });
      } else {
        try {
          saved = await CustomFieldValue.create({
            cardId: card.id,
            customFieldGroupId: group.id,
            customFieldId: field.id,
            content,
          }).fetch();
        } catch (error) {
          if (error.code === 'E_UNIQUE') {
            saved = await CustomFieldValue.updateOne({
              cardId: card.id,
              customFieldGroupId: group.id,
              customFieldId: field.id,
            }).set({ content });
          } else {
            throw error;
          }
        }
      }

      if (saved) {
        sails.sockets.broadcast(`board:${boardId}`, 'customFieldValueUpdate', { item: saved });
      }
      return;
    }

    // movedOutOfClosed
    const found = await findExistingValue(card.id, boardId);
    if (!found || !found.value) return;

    await CustomFieldValue.destroyOne(found.value.id);

    sails.sockets.broadcast(`board:${boardId}`, 'customFieldValueDelete', { item: found.value });
  },
};
