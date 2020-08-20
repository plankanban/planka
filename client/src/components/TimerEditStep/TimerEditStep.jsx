import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { useToggle } from '../../lib/hooks';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { createTimer, getTimerParts, startTimer, stopTimer, updateTimer } from '../../utils/timer';

import styles from './TimerEditStep.module.scss';

const createData = (timer) => {
  if (!timer) {
    return {
      hours: '0',
      minutes: '0',
      seconds: '0',
    };
  }

  const { hours, minutes, seconds } = getTimerParts(timer);

  return {
    hours: `${hours}`,
    minutes: `${minutes}`,
    seconds: `${seconds}`,
  };
};

const TimerEditStep = React.memo(({ defaultValue, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(() => createData(defaultValue));
  const [isEditing, toggleEdit] = useToggle();

  const hoursField = useRef(null);
  const minutesField = useRef(null);
  const secondsField = useRef(null);

  const handleStartClick = useCallback(() => {
    onUpdate(startTimer(defaultValue));
    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleStopClick = useCallback(() => {
    onUpdate(stopTimer(defaultValue));
  }, [defaultValue, onUpdate]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleToggleEditClick = useCallback(() => {
    setData(createData(defaultValue));
    toggleEdit();
  }, [defaultValue, setData, toggleEdit]);

  const handleSubmit = useCallback(() => {
    const parts = {
      hours: parseInt(data.hours, 10),
      minutes: parseInt(data.minutes, 10),
      seconds: parseInt(data.seconds, 10),
    };

    if (Number.isNaN(parts.hours)) {
      hoursField.current.select();
      return;
    }

    if (Number.isNaN(parts.minutes) || parts.minutes > 60) {
      minutesField.current.select();
      return;
    }

    if (Number.isNaN(parts.seconds) || parts.seconds > 60) {
      secondsField.current.select();
      return;
    }

    if (defaultValue) {
      if (!dequal(parts, getTimerParts(defaultValue))) {
        onUpdate(updateTimer(defaultValue, parts));
      }
    } else {
      onUpdate(createTimer(parts));
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, data]);

  useEffect(() => {
    if (isEditing) {
      hoursField.current.select();
    }
  }, [isEditing]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editTimer', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.hours')}</div>
              <Input.Mask
                ref={hoursField}
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
                ref={minutesField}
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
                ref={secondsField}
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
              onClick={handleToggleEditClick}
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

TimerEditStep.propTypes = {
  defaultValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

TimerEditStep.defaultProps = {
  defaultValue: undefined,
  onBack: undefined,
};

export default TimerEditStep;
