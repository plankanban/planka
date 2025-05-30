/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from 'semantic-ui-react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import DroppableTypes from '../../../constants/DroppableTypes';
import DraggableCard from '../../cards/DraggableCard';
import Header from '../../common/Header';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './UserCardsPage.module.scss';

function UserCardsPage() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const loading = useRef(false);

  const currentUserId = useSelector(selectors.selectCurrentUserId);
  const user = useSelector(selectors.selectCurrentUser);
  const projectsToCard = useSelector(selectors.selectProjectsToCardsWithEditorRightsForCurrentUser);

  console.log('Projects to Cards Data:', projectsToCard);

  const isDataReady = currentUserId && user && projectsToCard !== null;

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
  };

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (loading.current || !isDataReady) return;

    if (projectsToCard && projectsToCard.length > 0) {
      projectsToCard.forEach((project) => {
        project.boards?.forEach((board) => {
          dispatch(entryActions.fetchBoard(board.id));
        });
      });
    }

    loading.current = true;
  }, [currentUserId, projectsToCard, dispatch, isDataReady]);

  if (!isDataReady) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader active size="massive" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>{t('common.myCards')}</h1>
        {projectsToCard && projectsToCard.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className={styles.projectsContainer}>
              {projectsToCard.map((project) => (
                <div key={project.id} className={styles.projectSection}>
                  <h2 className={styles.projectTitle}>{project.name}</h2>

                  {project.boards && project.boards.length > 0 ? (
                    project.boards.map((board) => (
                      <div key={board.id} className={styles.boardSection}>
                        <h3 className={styles.boardTitle}>{board.name}</h3>

                        {board.cards && board.cards.length > 0 ? (
                          <Droppable droppableId={`board:${board.id}`} type={DroppableTypes.CARD}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                data-rbd-droppable-id={`board:${board.id}`}
                                data-rbd-droppable-context-id={
                                  provided.droppableProps['data-rbd-droppable-context-id']
                                }
                                className={styles.cardsGrid}
                              >
                                {board.cards.map((card, index) => {
                                  const cardId = card.id || card._fields?.id;
                                  if (!cardId) {
                                    console.warn('Card missing ID:', card);
                                    return null;
                                  }

                                  return (
                                    <div key={cardId} className={styles.card}>
                                      <DraggableCard id={cardId} index={index} />
                                    </div>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ) : (
                          <p className={styles.emptyMessage}>{t('common.noCards')}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyMessage}>{t('common.noBoards')}</p>
                  )}
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className={styles.emptyState}>
            <p>{t('common.noProjects')}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default UserCardsPage;
