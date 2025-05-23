/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import LIST_COLORS from '../../../constants/ListColors';

import styles from './EditColorStep.module.scss';
import globalStyles from '../../../styles.module.scss';

const EditColorStep = React.memo(({ listId, onBack, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const defaultValue = useSelector((state) => selectListById(state, listId).color);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value: color }) => {
      dispatch(
        entryActions.updateList(listId, {
          color,
        }),
      );
    },
    [listId, dispatch],
  );

  const handleClearClick = useCallback(() => {
    dispatch(
      entryActions.updateList(listId, {
        color: null,
      }),
    );

    onClose();
  }, [listId, onClose, dispatch]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editColor', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.colorButtons}>
          {LIST_COLORS.map((color) => (
            <Button
              key={color}
              type="button"
              value={color}
              className={classNames(
                styles.colorButton,
                color === defaultValue && styles.colorButtonActive,
                globalStyles[`background${upperFirst(camelCase(color))}`],
              )}
              onClick={handleSelectClick}
            />
          ))}
        </div>
        {defaultValue && (
          <Button
            fluid
            content={t('action.removeColor')}
            className={styles.clearButton}
            onClick={handleClearClick}
          />
        )}
      </Popup.Content>
    </>
  );
});

EditColorStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditColorStep;
