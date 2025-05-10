/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button, Form } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import parseTime from '../../../utils/parse-time';

import styles from './EditDueDateStep.module.scss';

const EditDueDateStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const defaultValue = useSelector((state) => selectCardById(state, cardId).dueDate);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => {
    const date = defaultValue || new Date().setHours(12, 0, 0, 0);

    return {
      date: t('format:date', {
        postProcess: 'formatDate',
        value: date,
      }),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: date,
      }),
    };
  });

  const [selectTimeFieldState, selectTimeField] = useToggle();

  const [dateFieldRef, handleDateFieldRef] = useNestedRef('inputRef');
  const [timeFieldRef, handleTimeFieldRef] = useNestedRef('inputRef');

  const nullableDate = useMemo(() => {
    const date = t('format:date', {
      postProcess: 'parseDate',
      value: data.date,
    });

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [data.date, t]);

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateFieldRef.current.select();
      return;
    }

    let value = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (Number.isNaN(value.getTime())) {
      value = parseTime(data.time, nullableDate);

      if (Number.isNaN(value.getTime())) {
        timeFieldRef.current.select();
        return;
      }
    }

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      dispatch(
        entryActions.updateCard(cardId, {
          dueDate: value,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch, t, data, dateFieldRef, timeFieldRef, nullableDate]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          dueDate: null,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch]);

  const handleDatePickerChange = useCallback(
    (date) => {
      setData((prevData) => ({
        ...prevData,
        date: t('format:date', {
          postProcess: 'formatDate',
          value: date,
        }),
      }));
      selectTimeField();
    },
    [t, setData, selectTimeField],
  );

  useEffect(() => {
    dateFieldRef.current.select();
  }, [dateFieldRef]);

  useDidUpdate(() => {
    timeFieldRef.current.select();
  }, [selectTimeFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editDueDate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.date')}</div>
              <Input
                ref={handleDateFieldRef}
                name="date"
                value={data.date}
                maxLength={16}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.time')}</div>
              <Input
                ref={handleTimeFieldRef}
                name="time"
                value={data.time}
                maxLength={16}
                onChange={handleFieldChange}
              />
            </div>
          </div>
          <DatePicker
            inline
            disabledKeyboardNavigation
            selected={nullableDate}
            onChange={handleDatePickerChange}
          />
          <Button positive content={t('action.save')} />
        </Form>
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

EditDueDateStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditDueDateStep.defaultProps = {
  onBack: undefined,
};

export default EditDueDateStep;
