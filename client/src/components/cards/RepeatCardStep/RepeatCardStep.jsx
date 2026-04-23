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
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import parseTime from '../../../utils/parse-time';
import { CardRepeatTypes } from '../../../constants/Enums';

import styles from './RepeatCardStep.module.scss';

const Frequencies = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAY_LABEL_DATES = WEEKDAYS.map((weekday) => new Date(2020, 5, 7 + weekday));

const createStartsAt = (card) => {
  if (card.repeatNextAt) {
    return card.repeatNextAt;
  }

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(9, 0, 0, 0);

  return startsAt;
};

const detectFrequency = (repeatRule) => {
  if (!repeatRule) {
    return Frequencies.WEEKLY;
  }

  if (
    repeatRule.type === CardRepeatTypes.WEEKLY &&
    Array.isArray(repeatRule.weekdays) &&
    WEEKDAYS.every((weekday) => repeatRule.weekdays.includes(weekday))
  ) {
    return Frequencies.DAILY;
  }

  return repeatRule.type;
};

const buildRepeatRule = (frequency, weekdays, startsAt) => {
  const base = {
    startsAt,
    timezoneOffset: startsAt.getTimezoneOffset(),
  };

  switch (frequency) {
    case Frequencies.DAILY:
      return {
        ...base,
        type: CardRepeatTypes.WEEKLY,
        weekdays: WEEKDAYS,
      };
    case Frequencies.WEEKLY:
      return {
        ...base,
        type: CardRepeatTypes.WEEKLY,
        weekdays,
      };
    case Frequencies.MONTHLY:
      return {
        ...base,
        type: CardRepeatTypes.MONTHLY,
        dayOfMonth: startsAt.getDate(),
      };
    case Frequencies.YEARLY:
      return {
        ...base,
        type: CardRepeatTypes.YEARLY,
        month: startsAt.getMonth(),
        dayOfMonth: startsAt.getDate(),
      };
    default:
      return null;
  }
};

const RepeatCardStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const lists = useSelector(selectors.selectAvailableListsForCurrentBoard);

  const dispatch = useDispatch();
  const [t, i18n] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => {
    const startsAt = createStartsAt(card);
    const frequency = detectFrequency(card.repeatRule);
    const repeatList = lists.find((list) => list.id === card.repeatListId);
    const currentList = lists.find((list) => list.id === card.listId);

    return {
      frequency,
      weekdays: card.repeatRule
        ? card.repeatRule.weekdays || [startsAt.getDay()]
        : [startsAt.getDay()],
      date: t('format:date', {
        postProcess: 'formatDate',
        value: startsAt,
      }),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: startsAt,
      }),
      listId:
        (repeatList && repeatList.id) ||
        (currentList && currentList.id) ||
        (lists[0] && lists[0].id),
    };
  });

  const [dateFieldRef, handleDateFieldRef] = useNestedRef('inputRef');
  const [timeFieldRef, handleTimeFieldRef] = useNestedRef('inputRef');

  const frequencyOptions = useMemo(
    () => [
      {
        key: Frequencies.DAILY,
        value: Frequencies.DAILY,
        text: t('common.daily'),
      },
      {
        key: Frequencies.WEEKLY,
        value: Frequencies.WEEKLY,
        text: t('common.weekly'),
      },
      {
        key: Frequencies.MONTHLY,
        value: Frequencies.MONTHLY,
        text: t('common.monthly'),
      },
      {
        key: Frequencies.YEARLY,
        value: Frequencies.YEARLY,
        text: t('common.yearly'),
      },
    ],
    [t],
  );

  const listOptions = useMemo(
    () =>
      lists.map((list) => ({
        key: list.id,
        value: list.id,
        text: list.name || t(`common.${list.type}`),
      })),
    [lists, t],
  );

  const weekdayLabels = useMemo(
    () =>
      WEEKDAY_LABEL_DATES.map((date) =>
        new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          weekday: 'short',
        }).format(date),
      ),
    [i18n.resolvedLanguage],
  );

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

  const handleFrequencyChange = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        frequency: value,
      }));
    },
    [setData],
  );

  const handleListChange = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        listId: value,
      }));
    },
    [setData],
  );

  const handleWeekdayClick = useCallback(
    (weekday) => {
      setData((prevData) => {
        if (prevData.weekdays.includes(weekday)) {
          if (prevData.weekdays.length === 1) {
            return prevData;
          }

          return {
            ...prevData,
            weekdays: prevData.weekdays.filter((item) => item !== weekday),
          };
        }

        return {
          ...prevData,
          weekdays: [...prevData.weekdays, weekday].sort((a, b) => a - b),
        };
      });
    },
    [setData],
  );

  const handleDatePickerChange = useCallback(
    (date) => {
      setData((prevData) => ({
        ...prevData,
        date: t('format:date', {
          postProcess: 'formatDate',
          value: date,
        }),
      }));
    },
    [t, setData],
  );

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateFieldRef.current.select();
      return;
    }

    let startsAt = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (Number.isNaN(startsAt.getTime())) {
      startsAt = parseTime(data.time, nullableDate);

      if (Number.isNaN(startsAt.getTime())) {
        timeFieldRef.current.select();
        return;
      }
    }

    dispatch(
      entryActions.updateCard(cardId, {
        repeatRule: buildRepeatRule(data.frequency, data.weekdays, startsAt),
        repeatListId: data.listId,
      }),
    );

    onClose();
  }, [cardId, data, dateFieldRef, dispatch, nullableDate, onClose, t, timeFieldRef]);

  const handleRemoveClick = useCallback(() => {
    dispatch(
      entryActions.updateCard(cardId, {
        repeatRule: null,
      }),
    );

    onClose();
  }, [cardId, dispatch, onClose]);

  useEffect(() => {
    dateFieldRef.current.select();
  }, [dateFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.repeatCard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <div className={styles.text}>{t('common.repeatEvery')}</div>
            <Form.Select
              fluid
              selection
              value={data.frequency}
              options={frequencyOptions}
              onChange={handleFrequencyChange}
            />
          </div>
          {data.frequency === Frequencies.WEEKLY && (
            <div className={styles.field}>
              <div className={styles.text}>{t('common.daysOfWeek')}</div>
              <Button.Group className={styles.weekdayButtons}>
                {WEEKDAYS.map((weekday, index) => (
                  <Button
                    key={weekday}
                    type="button"
                    active={data.weekdays.includes(weekday)}
                    className={styles.weekdayButton}
                    onClick={() => handleWeekdayClick(weekday)}
                  >
                    {weekdayLabels[index]}
                  </Button>
                ))}
              </Button.Group>
            </div>
          )}
          <div className={styles.field}>
            <div className={styles.text}>{t('common.startRepeatingAt')}</div>
            <div className={styles.fieldWrapper}>
              <div className={styles.fieldBox}>
                <Input
                  ref={handleDateFieldRef}
                  name="date"
                  value={data.date}
                  maxLength={16}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.fieldBox}>
                <Input
                  ref={handleTimeFieldRef}
                  name="time"
                  value={data.time}
                  maxLength={16}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
          </div>
          <DatePicker
            inline
            disabledKeyboardNavigation
            selected={nullableDate}
            onChange={handleDatePickerChange}
          />
          <div className={styles.field}>
            <div className={styles.text}>{t('common.createCardInList')}</div>
            <Form.Select
              fluid
              selection
              value={data.listId}
              options={listOptions}
              onChange={handleListChange}
            />
          </div>
          <Button positive disabled={!data.listId} content={t('action.save')} />
        </Form>
        {card.repeatRule && (
          <Button
            negative
            content={t('action.remove')}
            className={styles.deleteButton}
            onClick={handleRemoveClick}
          />
        )}
      </Popup.Content>
    </>
  );
});

RepeatCardStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

RepeatCardStep.defaultProps = {
  onBack: undefined,
};

export default RepeatCardStep;
