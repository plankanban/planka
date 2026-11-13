/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import { makeSelectShownOnFrontOfCardCustomFieldValueIdsByCardId } from './cards';
import { buildCustomFieldValueId } from '../models/CustomFieldValue';
import { ListTypes } from '../constants/Enums';

const PROJECT_ID = '5';
const BOARD_ID = '20';
const LIST_ID = '30';

const HEALTHY_CARD_ID = '100';
const ORPHANED_CARD_ID = '1808077422550058898';

// A card can outlive its board if the deletion did not cascade, so `card.board`
// resolves to null. The inner custom-field loop is guarded; the board hop is not.
const MISSING_BOARD_ID = '1808077422533281679';

const BOARD_GROUP_ID = '200';
const BOARD_FIELD_ID = '210';
const CARD_GROUP_ID = '300';
const CARD_FIELD_ID = '310';

const addCardCustomField = (session, cardId) => {
  session.CustomFieldGroup.upsert({
    id: `${CARD_GROUP_ID}-${cardId}`,
    name: 'Card group',
    position: 1,
    cardId,
    baseCustomFieldGroupId: null,
  });

  session.CustomField.upsert({
    id: `${CARD_FIELD_ID}-${cardId}`,
    name: 'Card field',
    position: 1,
    showOnFrontOfCard: true,
    customFieldGroupId: `${CARD_GROUP_ID}-${cardId}`,
  });

  session.CustomFieldValue.upsert({
    id: buildCustomFieldValueId({
      cardId,
      customFieldGroupId: `${CARD_GROUP_ID}-${cardId}`,
      customFieldId: `${CARD_FIELD_ID}-${cardId}`,
    }),
    content: 'value',
    cardId,
    customFieldGroupId: `${CARD_GROUP_ID}-${cardId}`,
    customFieldId: `${CARD_FIELD_ID}-${cardId}`,
  });

  return buildCustomFieldValueId({
    cardId,
    customFieldGroupId: `${CARD_GROUP_ID}-${cardId}`,
    customFieldId: `${CARD_FIELD_ID}-${cardId}`,
  });
};

const createState = () => {
  const session = orm.session(orm.getEmptyState());

  session.Project.upsert({
    id: PROJECT_ID,
    name: 'Project',
    ownerProjectManagerId: null,
  });

  session.Board.upsert({
    id: BOARD_ID,
    name: 'Board',
    projectId: PROJECT_ID,
  });

  session.List.upsert({
    id: LIST_ID,
    name: 'List',
    type: ListTypes.ACTIVE,
    position: 1,
    boardId: BOARD_ID,
  });

  session.Card.upsert({
    id: HEALTHY_CARD_ID,
    name: 'Healthy card',
    position: 1,
    boardId: BOARD_ID,
    listId: LIST_ID,
  });

  session.Card.upsert({
    id: ORPHANED_CARD_ID,
    name: 'Orphaned card',
    position: 2,
    boardId: MISSING_BOARD_ID,
    listId: LIST_ID,
  });

  // A board-level custom field group, reachable only through the board hop.
  session.CustomFieldGroup.upsert({
    id: BOARD_GROUP_ID,
    name: 'Board group',
    position: 1,
    boardId: BOARD_ID,
    baseCustomFieldGroupId: null,
  });

  session.CustomField.upsert({
    id: BOARD_FIELD_ID,
    name: 'Board field',
    position: 1,
    showOnFrontOfCard: true,
    customFieldGroupId: BOARD_GROUP_ID,
  });

  const boardValueId = buildCustomFieldValueId({
    cardId: HEALTHY_CARD_ID,
    customFieldGroupId: BOARD_GROUP_ID,
    customFieldId: BOARD_FIELD_ID,
  });

  session.CustomFieldValue.upsert({
    id: boardValueId,
    content: 'value',
    cardId: HEALTHY_CARD_ID,
    customFieldGroupId: BOARD_GROUP_ID,
    customFieldId: BOARD_FIELD_ID,
  });

  const healthyCardValueId = addCardCustomField(session, HEALTHY_CARD_ID);
  const orphanedCardValueId = addCardCustomField(session, ORPHANED_CARD_ID);

  return {
    state: {
      orm: session.state,
      router: { location: { pathname: '/' } },
      auth: { userId: null },
      core: { recentCardId: null },
    },
    boardValueId,
    healthyCardValueId,
    orphanedCardValueId,
  };
};

describe('selectShownOnFrontOfCardCustomFieldValueIds for a card whose board is missing', () => {
  test('the orphaned card really has no board', () => {
    const { state } = createState();
    const session = orm.session(state.orm);

    expect(session.Board.withId(MISSING_BOARD_ID)).toBeNull();
    expect(session.Card.withId(ORPHANED_CARD_ID).board).toBeNull();
  });

  test('the card-level custom field values are still returned', () => {
    const { state, orphanedCardValueId } = createState();
    const selector = makeSelectShownOnFrontOfCardCustomFieldValueIdsByCardId();

    expect(selector(state, ORPHANED_CARD_ID)).toEqual([orphanedCardValueId]);
  });

  test('a healthy card still returns board-level and card-level values', () => {
    const { state, boardValueId, healthyCardValueId } = createState();
    const selector = makeSelectShownOnFrontOfCardCustomFieldValueIdsByCardId();

    expect(selector(state, HEALTHY_CARD_ID)).toEqual([boardValueId, healthyCardValueId]);
  });
});
