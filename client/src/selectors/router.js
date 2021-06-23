import { createSelector as createReselectSelector } from 'reselect';
import { createSelector as createReduxOrmSelector } from 'redux-orm';

import orm from '../orm';
import { currentUserIdSelector } from './user';
import matchPaths from '../utils/match-paths';
import Paths from '../constants/Paths';

export const pathnameSelector = ({
  router: {
    location: { pathname },
  },
}) => pathname;

export const pathsMatchSelector = createReselectSelector(pathnameSelector, (pathname) =>
  matchPaths(pathname, Object.values(Paths)),
);

export const pathSelector = createReduxOrmSelector(
  orm,
  pathsMatchSelector,
  (state) => currentUserIdSelector(state),
  ({ Project, Board, Card }, pathsMatch, currentUserId) => {
    if (pathsMatch) {
      switch (pathsMatch.path) {
        case Paths.PROJECTS: {
          const projectModel = Project.withId(pathsMatch.params.id);

          if (!projectModel) {
            return {
              projectId: null,
            };
          }

          if (!projectModel.hasManagerUser(currentUserId)) {
            if (!projectModel.hasMemberUserForAnyBoard(currentUserId)) {
              return {
                projectId: null,
              };
            }
          }

          return {
            projectId: projectModel.id,
          };
        }
        case Paths.BOARDS: {
          const boardModel = Board.withId(pathsMatch.params.id);
          const projectModel = boardModel && boardModel.project;

          if (!projectModel) {
            return {
              boardId: null,
              projectId: null,
            };
          }

          if (!projectModel.hasManagerUser(currentUserId)) {
            if (!boardModel.hasMemberUser(currentUserId)) {
              return {
                boardId: null,
                projectId: null,
              };
            }
          }

          return {
            boardId: boardModel.id,
            projectId: projectModel.id,
          };
        }
        case Paths.CARDS: {
          const cardModel = Card.withId(pathsMatch.params.id);
          const boardModel = cardModel && cardModel.board;
          const projectModel = boardModel && boardModel.project;

          if (!projectModel) {
            return {
              cardId: null,
              boardId: null,
              projectId: null,
            };
          }

          if (!projectModel.hasManagerUser(currentUserId)) {
            if (!boardModel.hasMemberUser(currentUserId)) {
              return {
                cardId: null,
                boardId: null,
                projectId: null,
              };
            }
          }

          return {
            cardId: cardModel.id,
            boardId: boardModel.id,
            projectId: projectModel.id,
          };
        }
        default:
      }
    }

    return {};
  },
);
