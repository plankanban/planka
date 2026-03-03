/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Checkbox, Message, Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef } from '../../../../hooks';

import styles from './EditInformation.module.scss';

const EditInformation = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: board.name,
      isPublic: board.isPublic || false,
    }),
    [board.name, board.isPublic],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    isPublic: false,
    ...defaultData,
  }));

  const [copied, setCopied] = useState(false);

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
    }),
    [data],
  );

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.updateBoard(boardId, cleanData));
  }, [boardId, dispatch, cleanData, nameFieldRef]);

  const handlePublicToggle = useCallback(() => {
    handleFieldChange(null, {
      type: 'checkbox',
      name: 'isPublic',
      checked: !data.isPublic,
    });
  }, [data.isPublic, handleFieldChange]);

  const handleCopyUrl = useCallback(() => {
    if (board.publicId) {
      const publicUrl = `${window.location.origin}/public-boards/${board.publicId}`;
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [board.publicId]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.field}>
        <Checkbox
          toggle
          label={t('common.makePublic', 'Make board publicly accessible')}
          checked={data.isPublic}
          onChange={handlePublicToggle}
        />
      </div>
      {board.isPublic && board.publicId && (
        <Message info className={styles.field}>
          <Message.Header>
            <Icon name="globe" />
            {t('common.publicBoardUrl', 'Public Board URL')}
          </Message.Header>
          <p>
            <code>{`${window.location.origin}/public-boards/${board.publicId}`}</code>
          </p>
          <Button
            size="small"
            icon="copy"
            content={copied ? t('common.copied', 'Copied!') : t('common.copyUrl', 'Copy URL')}
            onClick={handleCopyUrl}
          />
        </Message>
      )}
      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

export default EditInformation;
