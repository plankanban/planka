import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Divider, Menu } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Input, Popup, FilePicker } from '../../lib/custom-ui';

import { useForm } from '../../hooks';

import styles from './AddPopup.module.scss';

const AddStep = React.memo(({ onCreate, onImport, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm({
    name: '',
    file: null,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      type: 'kanban',
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    if (data.file) {
      onImport(cleanData);
    } else {
      onCreate(cleanData);
    }

    onClose();
  }, [onClose, data, onImport, onCreate]);

  const handleFileSelect = useCallback(
    (file) => {
      handleFieldChange(null, {
        name: 'file',
        value: file,
      });
      setSelectedFile(file);
    },
    [handleFieldChange, setSelectedFile],
  );

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Divider />
          <FilePicker onSelect={handleFileSelect} accept=".json">
            <Menu.Item className={styles.menuItem}>
              {selectedFile
                ? selectedFile.name
                : t('common.uploadTrelloFile', {
                    context: 'title',
                  })}
            </Menu.Item>
          </FilePicker>
          <Divider />
          <Button
            positive
            content={selectedFile ? t('action.importTrelloBoard') : t('action.createBoard')}
          />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(AddStep);
