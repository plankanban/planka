import { createSelector as createReselectSelector } from 'reselect';
import { createSelector as createReduxOrmSelector } from 'redux-orm';

import orm from '../orm';
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
  ({ Project, Board, Card }, pathsMatch) => {
    if (pathsMatch) {
      switch (pathsMatch.path) {
        case Paths.PROJECTS: {
          const projectModel = Project.withId(pathsMatch.params.id);

          return {
            projectId: projectModel && projectModel.id,
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
