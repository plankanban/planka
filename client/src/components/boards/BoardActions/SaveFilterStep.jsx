/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import { useNestedRef } from '../../../hooks';

import styles from './SaveFilterStep.module.scss';

// Small naming popup. The filter being saved is whatever is active on
// the board right now, so this step only hands the name back through
// `onSave` — Filters does the writing, which also lets it kick the
// re-render that exposes the new entry in the saved-filters list.
const SaveFilterStep = React.memo(({ defaultName, onSave, onClose }) => {
  const [t] = useTranslation();
  const [name, setName] = useState(defaultName);

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });

    nameFieldRef.current.select();
  }, [nameFieldRef]);

  const handleChange = useCallback((_, { value }) => {
    setName(value);
  }, []);

  const handleSubmit = useCallback(() => {
    const cleanName = name.trim();

    if (!cleanName) {
      nameFieldRef.current.select();
      return;
    }

    onSave(cleanName);
    onClose();
  }, [name, nameFieldRef, onClose, onSave]);

  return (
    <>
      <Popup.Header>
        {t('common.saveFilter', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={name}
            placeholder={t('common.filterName')}
            maxLength={64}
            className={styles.field}
            onChange={handleChange}
          />
          <Button positive content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

SaveFilterStep.propTypes = {
  defaultName: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

SaveFilterStep.defaultProps = {
  defaultName: '',
};

export default SaveFilterStep;
