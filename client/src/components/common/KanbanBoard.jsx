import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import styles from './KanbanBoard.module.scss';

const KanbanBoard = React.memo(({ board, included, isPublic }) => {
  const activeLists = useMemo(() => {
    return included.lists.filter((list) => list.type === 'active');
  }, [included.lists]);

  const cardsByListId = useMemo(() => {
    const result = {};
    included.cards.forEach((card) => {
      if (!result[card.listId]) {
        result[card.listId] = [];
      }
      result[card.listId].push(card);
    });
    return result;
  }, [included.cards]);

  const labelMap = useMemo(() => {
    const result = {};
    included.labels.forEach((label) => {
      result[label.id] = label;
    });
    return result;
  }, [included.labels]);

  const getCardLabels = (cardId) => {
    return included.cardLabels
      .filter((cl) => cl.cardId === cardId)
      .map((cl) => labelMap[cl.labelId])
      .filter(Boolean);
  };

  return (
    <div className={styles.kanbanBoard}>
      {activeLists.map((list) => (
        <div key={list.id} className={styles.list}>
          <div className={styles.listHeader}>
            <h3 className={styles.listName}>{list.name}</h3>
            <span className={styles.cardCount}>{(cardsByListId[list.id] || []).length}</span>
          </div>
          <div className={styles.cards}>
            {(cardsByListId[list.id] || []).map((card) => (
              <div key={card.id} className={styles.card}>
                <div className={styles.cardName}>{card.name}</div>
                {card.description && (
                  <div className={styles.cardDescription}>{card.description}</div>
                )}
                {getCardLabels(card.id).length > 0 && (
                  <div className={styles.cardLabels}>
                    {getCardLabels(card.id).map((label) => (
                      <span
                        key={label.id}
                        className={styles.label}
                        style={{ backgroundColor: label.color || '#ddd' }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
                {card.commentsTotal > 0 && (
                  <div className={styles.cardFooter}>
                    <span className={styles.comments}>
                      💬 {card.commentsTotal}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

KanbanBoard.propTypes = {
  board: PropTypes.object.isRequired,
  included: PropTypes.object.isRequired,
  isPublic: PropTypes.bool,
};

KanbanBoard.defaultProps = {
  isPublic: false,
};

export default KanbanBoard;
