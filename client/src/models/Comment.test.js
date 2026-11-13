/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import ActionTypes from '../constants/ActionTypes';

const CARD_ID = '1';
const HEALTHY_COMMENT_ID = '10';

// A comment can outlive its card if the deletion did not cascade, so
// `comment.card` resolves to null. One such row exists in production today.
const MISSING_CARD_ID = '1808077422533281682';
const ORPHANED_COMMENT_ID = '1808077422550058893';

const createSession = () => {
  const session = orm.session(orm.getEmptyState());

  session.Card.upsert({
    id: CARD_ID,
    name: 'Card',
    commentsTotal: 2,
  });

  session.Comment.upsert({
    id: HEALTHY_COMMENT_ID,
    text: 'Healthy',
    cardId: CARD_ID,
  });

  session.Comment.upsert({
    id: ORPHANED_COMMENT_ID,
    text: 'Orphan',
    cardId: MISSING_CARD_ID,
  });

  return session;
};

const dispatch = (session, type, payload) =>
  session.Comment.reducer({ type, payload }, session.Comment);

describe('Comment reducer with an orphaned comment', () => {
  let session;

  beforeEach(() => {
    session = createSession();
  });

  test('the orphaned comment really has no card', () => {
    expect(session.Card.withId(MISSING_CARD_ID)).toBeNull();
    expect(session.Comment.withId(ORPHANED_COMMENT_ID).card).toBeNull();
  });

  test('COMMENT_DELETE removes the orphan without touching a missing card', () => {
    dispatch(session, ActionTypes.COMMENT_DELETE, { id: ORPHANED_COMMENT_ID });

    expect(session.Comment.withId(ORPHANED_COMMENT_ID)).toBeNull();
    expect(session.Card.withId(CARD_ID).commentsTotal).toBe(2);
  });

  test('COMMENT_DELETE still decrements the total of a surviving card', () => {
    dispatch(session, ActionTypes.COMMENT_DELETE, { id: HEALTHY_COMMENT_ID });

    expect(session.Comment.withId(HEALTHY_COMMENT_ID)).toBeNull();
    expect(session.Card.withId(CARD_ID).commentsTotal).toBe(1);
  });

  test('COMMENT_CREATE__FAILURE tolerates the orphan as well', () => {
    dispatch(session, ActionTypes.COMMENT_CREATE__FAILURE, {
      localId: ORPHANED_COMMENT_ID,
    });

    expect(session.Comment.withId(ORPHANED_COMMENT_ID)).toBeNull();
    expect(session.Card.withId(CARD_ID).commentsTotal).toBe(2);
  });

  test('COMMENT_CREATE__FAILURE still decrements the total of a surviving card', () => {
    dispatch(session, ActionTypes.COMMENT_CREATE__FAILURE, {
      localId: HEALTHY_COMMENT_ID,
    });

    expect(session.Comment.withId(HEALTHY_COMMENT_ID)).toBeNull();
    expect(session.Card.withId(CARD_ID).commentsTotal).toBe(1);
  });
});
