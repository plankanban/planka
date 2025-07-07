/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Accordion, Button, Form, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, usePopupInClosableContext } from '../../../hooks';
import { isUrl } from '../../../utils/validator';
import Editor from './Editor';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './Item.module.scss';
import { useToggle } from '../../../lib/hooks';

const Item = React.memo(({ id }) => {
  const selectWebhookById = useMemo(() => selectors.makeSelectWebhookById(), []);

  const webhook = useSelector((state) => selectWebhookById(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isOpened, toggleOpened] = useToggle();

  const defaultData = useMemo(
    () => ({
      name: webhook.name,
      url: webhook.url,
      accessToken: webhook.accessToken,
      events: webhook.events,
      excludedEvents: webhook.excludedEvents,
    }),
    [webhook],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    url: '',
    ...defaultData,
    accessToken: defaultData.accessToken || '',
    events: defaultData.events || [],
    excludedEvents: defaultData.excludedEvents || [],
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
      url: data.url.trim(),
      accessToken: data.accessToken.trim() || null,
      events: data.events.length === 0 ? null : data.events,
      excludedEvents: data.excludedEvents.length === 0 ? null : data.excludedEvents,
    }),
    [data],
  );

  const editorRef = useRef(null);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteWebhook(id));
  }, [id, dispatch]);

  const handleSubmit = useCallback(() => {
    if (!cleanData.name) {
      editorRef.current.selectNameField();
      return;
    }

    if (!cleanData.url || !isUrl(cleanData.url)) {
      editorRef.current.selectUrlField();
      return;
    }

    dispatch(entryActions.updateWebhook(id, cleanData));
  }, [id, dispatch, cleanData]);

  const handleOpenClick = useCallback(() => {
    toggleOpened();
  }, [toggleOpened]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <>
      <Accordion.Title active={isOpened} className={styles.title} onClick={handleOpenClick}>
        <Icon name="dropdown" />
        {defaultData.name}
      </Accordion.Title>
      <Accordion.Content active={isOpened}>
        <div>
          <Form onSubmit={handleSubmit}>
            <Editor
              ref={editorRef}
              data={data}
              isReadOnly={!webhook.isPersisted}
              onFieldChange={handleFieldChange}
            />
            <div className={styles.controls}>
              <Button
                positive
                disabled={dequal(cleanData, defaultData)}
                content={t('action.save')}
              />
              <ConfirmationPopup
                title="common.deleteWebhook"
                content="common.areYouSureYouWantToDeleteThisWebhook"
                buttonContent="action.deleteWebhook"
                onConfirm={handleDeleteConfirm}
              >
                <Button
                  type="button"
                  disabled={!webhook.isPersisted}
                  className={styles.deleteButton}
                >
                  {t('action.delete')}
                </Button>
              </ConfirmationPopup>
            </div>
          </Form>
        </div>
      </Accordion.Content>
    </>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
