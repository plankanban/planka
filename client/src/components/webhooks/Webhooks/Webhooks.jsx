/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Accordion, Button, Form, Segment } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useForm } from '../../../hooks';
import { isUrl } from '../../../utils/validator';
import Item from './Item';
import Editor from './Editor';

const DEFAULT_DATA = {
  name: '',
  url: '',
  accessToken: '',
  events: [],
  excludedEvents: [],
};

const Webhooks = React.memo(({ ids, onCreate }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const editorRef = useRef(null);

  const handleCreateSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      url: data.url.trim(),
      accessToken: data.accessToken.trim() || null,
      events: data.events.length === 0 ? null : data.events,
      excludedEvents: data.excludedEvents.length === 0 ? null : data.excludedEvents,
    };

    if (!cleanData.name) {
      editorRef.current.selectNameField();
      return;
    }

    if (!cleanData.url || !isUrl(cleanData.url)) {
      editorRef.current.selectUrlField();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    focusNameField();
  }, [onCreate, data, setData, focusNameField]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focusNameField();
    }
  }, []);

  useDidUpdate(() => {
    if (editorRef.current) {
      editorRef.current.focusNameField();
    }
  }, [focusNameFieldState]);

  return (
    <>
      {ids.length > 0 && (
        <Accordion styled fluid>
          {ids.map((id) => (
            <Item key={id} id={id} />
          ))}
        </Accordion>
      )}
      {ids.length < 10 && (
        <Segment>
          <Form onSubmit={handleCreateSubmit}>
            <Editor ref={editorRef} data={data} onFieldChange={handleFieldChange} />
            <Button positive>{t('action.addWebhook')}</Button>
          </Form>
        </Segment>
      )}
    </>
  );
});

Webhooks.propTypes = {
  ids: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
};

export default Webhooks;
