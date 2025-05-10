/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import { useForm } from '../../../hooks';

import styles from './AddCustomFieldGroupStep.module.scss';
import CustomFieldGroupEditor from '../CustomFieldGroupEditor/CustomFieldGroupEditor';

const AddCustomFieldGroupStep = React.memo(({ onCreate, onBack, onClose }) => {
  const baseCustomFieldGroups = useSelector(selectors.selectBaseCustomFieldGroupsForCurrentProject);

  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    baseCustomFieldGroupId: null,
    name: '',
  });

  const selectedBaseCustomFieldGroup = useMemo(() => {
    if (data.baseCustomFieldGroupId === 'without') {
      return null;
    }

    return baseCustomFieldGroups.find(
      (baseCustomFieldGroup) => baseCustomFieldGroup.id === data.baseCustomFieldGroupId,
    );
  }, [baseCustomFieldGroups, data.baseCustomFieldGroupId]);

  const [focusNameFieldState, focusNameField] = useToggle();

  const customFieldGroupEditorRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (selectedBaseCustomFieldGroup) {
      if (!cleanData.name || cleanData.name === selectedBaseCustomFieldGroup.name) {
        cleanData.name = null;
      }
    } else {
      if (!cleanData.name) {
        customFieldGroupEditorRef.current.selectNameField();
        return;
      }

      delete cleanData.baseCustomFieldGroupId;
    }

    onCreate(cleanData);
    onClose();
  }, [onCreate, onClose, data, selectedBaseCustomFieldGroup, customFieldGroupEditorRef]);

  const handleBaseCustomFieldGroupIdChange = useCallback(
    (_, { value }) => {
      setData((prevData) => {
        const baseCustomFieldGroupId = value === 'without' ? null : value; // FIXME: hack

        const nextSelectedBaseCustomFieldGroup =
          baseCustomFieldGroupId &&
          baseCustomFieldGroups.find(
            (baseCustomFieldGroup) => baseCustomFieldGroup.id === baseCustomFieldGroupId,
          );

        return {
          ...prevData,
          baseCustomFieldGroupId,
          name: nextSelectedBaseCustomFieldGroup ? nextSelectedBaseCustomFieldGroup.name : '',
        };
      });

      focusNameField();
    },
    [baseCustomFieldGroups, setData, focusNameField],
  );

  useDidUpdate(() => {
    customFieldGroupEditorRef.current.focusNameField();
  }, [focusNameFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.addCustomFieldGroup', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.baseGroup')}</div>
          <Dropdown
            fluid
            selection
            name="baseCustomFieldGroupId"
            options={[
              {
                value: 'without',
                text: t('common.withoutBaseGroup'),
              },
              ...baseCustomFieldGroups.map((baseCustomFieldGroup) => ({
                value: baseCustomFieldGroup.id,
                text: baseCustomFieldGroup.name,
                disabled: !baseCustomFieldGroup.isPersisted,
              })),
            ]}
            value={data.baseCustomFieldGroupId || 'without'}
            className={styles.field}
            onChange={handleBaseCustomFieldGroupIdChange}
          />
          <CustomFieldGroupEditor
            ref={customFieldGroupEditorRef}
            data={data}
            onFieldChange={handleFieldChange}
          />
          <Button positive content={t('action.addCustomFieldGroup')} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddCustomFieldGroupStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

AddCustomFieldGroupStep.defaultProps = {
  onBack: undefined,
};

export default AddCustomFieldGroupStep;
