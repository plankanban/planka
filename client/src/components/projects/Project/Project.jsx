/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import ModalTypes from '../../../constants/ModalTypes';
import ProjectSettingsModal from '../ProjectSettingsModal';
import Boards from '../../boards/Boards';
import BoardSettingsModal from '../../boards/BoardSettingsModal';

import styles from './Project.module.scss';

const Project = React.memo(() => {
  const modal = useSelector(selectors.selectCurrentModal);

  let modalNode = null;
  if (modal) {
    switch (modal.type) {
      case ModalTypes.PROJECT_SETTINGS:
        modalNode = <ProjectSettingsModal />;

        break;
      case ModalTypes.BOARD_SETTINGS:
        modalNode = <BoardSettingsModal />;

        break;
      default:
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Boards />
      </div>
      {modalNode}
    </>
  );
});

export default Project;
