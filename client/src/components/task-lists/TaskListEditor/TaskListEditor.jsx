/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Radio } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import { useNestedRef } from '../../../hooks';

import styles from './TaskListEditor.module.scss';

const TaskListEditor = React.forwardRef(({ data, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const selectNameField = useCallback(() => {
    nameFieldRef.current.select();
  }, [nameFieldRef]);

  useImperativeHandle(
    ref,
    () => ({
      selectNameField,
    }),
    [selectNameField],
  );

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={onFieldChange}
      />
      <Radio
        toggle
        name="showOnFrontOfCard"
        checked={data.showOnFrontOfCard}
        label={t('common.showOnFrontOfCard')}
        className={styles.fieldRadio}
        onChange={onFieldChange}
      />
      <Radio
        toggle
        name="hideCompletedTasks"
        checked={data.hideCompletedTasks}
        label={t('common.hideCompletedTasks')}
        className={styles.fieldRadio}
        onChange={onFieldChange}
      />
    </>
  );
});

TaskListEditor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onFieldChange: PropTypes.func.isRequired,
};

export default React.memo(TaskListEditor);
