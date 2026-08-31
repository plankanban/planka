/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import {
  CARD_PRIORITY_MAX,
  CARD_PRIORITY_MIN,
  getCardPriorityColor,
} from '../../../constants/CardPriorities';
import PriorityChip from '../PriorityChip';

import styles from './EditPriorityStep.module.scss';

const EditPriorityStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const defaultValue = useSelector((state) => selectCardById(state, cardId).priority);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [value, setValue] = useState(defaultValue || CARD_PRIORITY_MIN);

  const handleRangeChange = useCallback((event) => {
    setValue(Number(event.target.value));
  }, []);

  const handleSubmit = useCallback(() => {
    if (value !== defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          priority: value,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch, value]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          priority: 0,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.priority', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.previewWrapper}>
            <PriorityChip value={value} />
          </div>
          <input
            type="range"
            min={CARD_PRIORITY_MIN}
            max={CARD_PRIORITY_MAX}
            step={1}
            value={value}
            style={{
              '--priority-color': getCardPriorityColor(value),
            }}
            className={styles.range}
            onChange={handleRangeChange}
          />
          <Button positive content={t('action.save')} />
        </Form>
        {!!defaultValue && (
          <Button
            negative
            content={t('action.remove')}
            className={styles.deleteButton}
            onClick={handleClearClick}
          />
        )}
      </Popup.Content>
    </>
  );
});

EditPriorityStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditPriorityStep.defaultProps = {
  onBack: undefined,
};

export default EditPriorityStep;
