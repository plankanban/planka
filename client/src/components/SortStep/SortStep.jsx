import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import styles from './SortStep.module.scss';

const SortStep = React.memo(
  ({ title, content, buttonContent, onBack, onConfirm, selectedOption, setSelectedOption }) => {
    const [t] = useTranslation();

    const [checked, setChecked] = useState(false);

    function handleChange(event) {
      setSelectedOption(event.target.id);
    }

    const updateState = () => {
      if (checked) {
        setChecked(false);
      } else {
        setChecked(true);
      }
    };

    function changeEvent(event) {
      handleChange(event);
      updateState();
    }

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <div className={styles.content}>{t(content)}</div>
          <div>
            <label htmlFor="name">
              <input
                type="radio"
                id="name"
                name="sort"
                value="name"
                onChange={changeEvent}
                checked={selectedOption === 'name'}
              />
              {t('action.sortByTitleList', {
                context: 'title',
              })}
            </label>
            <br />

            <label htmlFor="id">
              <input
                type="radio"
                id="id"
                name="sort"
                value="id"
                onChange={changeEvent}
                checked={selectedOption === 'id'}
              />
              {t('action.sortByIdList', {
                context: 'title',
              })}
            </label>
            <br />
            <label htmlFor="position">
              <input
                type="radio"
                id="position"
                name="sort"
                value="position"
                onChange={changeEvent}
                checked={selectedOption === 'position'}
              />
              {t('action.sortByPositionList', {
                context: 'title',
              })}
            </label>
            <br />
            <label htmlFor="createdAt">
              <input
                type="radio"
                id="createdAt"
                name="sort"
                value="createdAt"
                onChange={changeEvent}
                checked={selectedOption === 'createdAt'}
              />
              {t('action.sortByCreatedAt', {
                context: 'title',
              })}
            </label>
            <br />
            <label htmlFor="updatedAt">
              <input
                type="radio"
                id="updatedAt"
                name="sort"
                value="updatedAt"
                onChange={changeEvent}
                checked={selectedOption === 'updatedAt'}
              />
              {t('action.sortByUpdatedAtList', {
                context: 'title',
              })}
            </label>
            <br />
            <label htmlFor="dueDate">
              <input
                type="radio"
                id="dueDate"
                name="sort"
                value="dueDate"
                onChange={changeEvent}
                checked={selectedOption === 'dueDate'}
              />
              {t('action.sortByDueDateList', {
                context: 'title',
              })}
            </label>
            <br />
            <label htmlFor="creatorUserId">
              <input
                type="radio"
                id="creatorUserId"
                name="sort"
                value="creatorUserId"
                onChange={changeEvent}
                checked={selectedOption === 'creatorUserId'}
              />
              {t('action.sortByCreatorUserIdList', {
                context: 'title',
              })}
            </label>
            <br />
          </div>

          <Button fluid negative content={t(buttonContent)} onClick={onConfirm} />
        </Popup.Content>
      </>
    );
  },
);

SortStep.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonContent: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  selectedOption: PropTypes.string.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};

SortStep.defaultProps = {
  onBack: undefined,
};

export default SortStep;
