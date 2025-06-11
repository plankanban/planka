import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PopupHeader from '../../../lib/custom-ui/components/Popup/PopupHeader';
import styles from './ActionsStep.module.scss';
import selectors from '../../../selectors';

function BoardSelectStep({ currentBoardId, onSelect, onBack, onClose }) {
  const [t] = useTranslation();
  const projectId = useSelector((state) => selectors.selectPath(state).projectId);
  const boardIds = useSelector((state) => selectors.selectBoardIdsByProjectId(state, projectId));
  const boards = useSelector((state) => boardIds.map((id) => selectors.selectBoardById(state, id)));

  return (
    <div className={styles.boardSelectStep}>
      <PopupHeader onBack={onBack} onClose={onClose}>
        {t('action.moveListToBoard', { context: 'title' })}
      </PopupHeader>
      <div className={styles.menu}>
        {boards
          .filter((b) => b && b.id !== currentBoardId)
          .map((board) => (
            <button
              key={board.id}
              type="button"
              className={styles.boardButton}
              onClick={() => onSelect(board.id)}
            >
              {board.name}
            </button>
          ))}
        {boards.filter((b) => b && b.id !== currentBoardId).length === 0 && (
          <div className={styles.noBoards}>{t('common.noOtherBoards')}</div>
        )}
      </div>
    </div>
  );
}

BoardSelectStep.propTypes = {
  currentBoardId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

BoardSelectStep.defaultProps = {
  onClose: undefined,
};

export default BoardSelectStep;
