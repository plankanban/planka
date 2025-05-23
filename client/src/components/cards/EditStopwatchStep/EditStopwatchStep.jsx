/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import {
  createStopwatch,
  getStopwatchParts,
  startStopwatch,
  stopStopwatch,
  updateStopwatch,
} from '../../../utils/stopwatch';

import styles from './EditStopwatchStep.module.scss';

const createData = (stopwatch) => {
  if (!stopwatch) {
    return {
      hours: '0',
      minutes: '0',
      seconds: '0',
    };
  }

  const { hours, minutes, seconds } = getStopwatchParts(stopwatch);

  return {
    hours: `${hours}`,
    minutes: `${minutes}`,
    seconds: `${seconds}`,
  };
};

const EditStopwatchStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const defaultValue = useSelector((state) => selectCardById(state, cardId).stopwatch);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(() => createData(defaultValue));
  const [isEditing, toggleEditing] = useToggle();

  const [hoursFieldRef, handleHoursFieldRef] = useNestedRef('inputRef');
  const [minutesFieldRef, handleMinutesFieldRef] = useNestedRef('inputRef');
  const [secondsFieldRef, handleSecondsFieldRef] = useNestedRef('inputRef');

  const update = useCallback(
    (stopwatch) => {
      dispatch(
        entryActions.updateCard(cardId, {
          stopwatch,
        }),
      );
    },
    [cardId, dispatch],
  );

  const handleSubmit = useCallback(() => {
    const parts = {
      hours: parseInt(data.hours, 10),
      minutes: parseInt(data.minutes, 10),
      seconds: parseInt(data.seconds, 10),
    };

    if (Number.isNaN(parts.hours)) {
      hoursFieldRef.current.select();
      return;
    }

    if (Number.isNaN(parts.minutes) || parts.minutes > 60) {
      minutesFieldRef.current.select();
      return;
    }

    if (Number.isNaN(parts.seconds) || parts.seconds > 60) {
      secondsFieldRef.current.select();
      return;
    }

    if (defaultValue) {
      if (!dequal(parts, getStopwatchParts(defaultValue))) {
        update(updateStopwatch(defaultValue, parts));
      }
    } else {
      update(createStopwatch(parts));
    }

    onClose();
  }, [onClose, defaultValue, data, hoursFieldRef, minutesFieldRef, secondsFieldRef, update]);

  const handleStartClick = useCallback(() => {
    update(startStopwatch(defaultValue));
    onClose();
  }, [onClose, defaultValue, update]);

  const handleStopClick = useCallback(() => {
    update(stopStopwatch(defaultValue));
  }, [defaultValue, update]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      update(null);
    }

    onClose();
  }, [onClose, defaultValue, update]);

  const handleToggleEditingClick = useCallback(() => {
    setData(createData(defaultValue));
    toggleEditing();
  }, [defaultValue, setData, toggleEditing]);

  useDidUpdate(() => {
    if (isEditing) {
      hoursFieldRef.current.select();
    }
  }, [isEditing]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editStopwatch', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.hours')}</div>
              <Input.Mask
                ref={handleHoursFieldRef}
                name="hours"
                value={data.hours}
                mask="9999"
                maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.minutes')}</div>
              <Input.Mask
                ref={handleMinutesFieldRef}
                name="minutes"
                value={data.minutes}
                mask="99"
                maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.seconds')}</div>
              <Input.Mask
                ref={handleSecondsFieldRef}
                name="seconds"
                value={data.seconds}
                mask="99"
                maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <Button
              type="button"
              icon={isEditing ? 'close' : 'edit'}
              className={styles.iconButton}
              onClick={handleToggleEditingClick}
            />
          </div>
          {isEditing && <Button positive content={t('action.save')} />}
        </Form>
        {!isEditing &&
          (defaultValue && defaultValue.startedAt ? (
            <Button positive content={t('action.stop')} icon="pause" onClick={handleStopClick} />
          ) : (
            <Button positive content={t('action.start')} icon="play" onClick={handleStartClick} />
          ))}
        <Button
          negative
          content={t('action.remove')}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );
});

EditStopwatchStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditStopwatchStep.defaultProps = {
  onBack: undefined,
};

export default EditStopwatchStep;
