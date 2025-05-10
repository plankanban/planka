/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';
import CustomFieldEditor from './CustomFieldEditor';

import styles from './CustomFieldAddStep.module.scss';

const CustomFieldAddStep = React.memo(({ baseCustomFieldGroupId, defaultData, onBack }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    showOnFrontOfCard: false,
    ...defaultData,
  }));

  const customFieldEditorRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    if (!cleanData.name) {
      customFieldEditorRef.current.selectNameField();
      return;
    }

    dispatch(entryActions.createCustomFieldInBaseGroup(baseCustomFieldGroupId, cleanData));
    onBack();
  }, [baseCustomFieldGroupId, onBack, dispatch, data]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.addCustomField', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <CustomFieldEditor
            ref={customFieldEditorRef}
            data={data}
            onFieldChange={handleFieldChange}
          />
          <Button positive content={t('action.addCustomField')} className={styles.submitButton} />
        </Form>
      </Popup.Content>
    </>
  );
});

CustomFieldAddStep.propTypes = {
  baseCustomFieldGroupId: PropTypes.string.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onBack: PropTypes.func.isRequired,
};

export default CustomFieldAddStep;
