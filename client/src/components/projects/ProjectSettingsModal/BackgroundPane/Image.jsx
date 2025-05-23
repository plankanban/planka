/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Label } from 'semantic-ui-react';

import { usePopupInClosableContext } from '../../../../hooks';
import ConfirmationStep from '../../../common/ConfirmationStep';

import styles from './Image.module.scss';

const Image = React.memo(({ url, isActive, onSelect, onDeselect, onDelete }) => {
  const handleClick = useCallback(() => {
    if (isActive) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [isActive, onSelect, onDeselect]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                jsx-a11y/no-static-element-interactions */
    <div
      className={styles.wrapper}
      style={{
        background: `url("${url}") center / cover`,
      }}
      onClick={handleClick}
    >
      {isActive && (
        <Label
          corner="left"
          size="mini"
          icon={{
            name: 'checkmark',
            color: 'grey',
            inverted: true,
          }}
          className={styles.label}
        />
      )}
      {onDelete && (
        <ConfirmationPopup
          title="common.deleteBackgroundImage"
          content="common.areYouSureYouWantToDeleteThisBackgroundImage"
          buttonContent="action.deleteBackgroundImage"
          onConfirm={onDelete}
        >
          <Button className={styles.deleteButton}>
            <Icon fitted name="trash alternate" size="small" />
          </Button>
        </ConfirmationPopup>
      )}
    </div>
  );
});

Image.propTypes = {
  url: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

Image.defaultProps = {
  onDelete: undefined,
};

export default Image;
