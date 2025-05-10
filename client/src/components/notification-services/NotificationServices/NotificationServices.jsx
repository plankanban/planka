/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Button, Dropdown, Form, Icon, Input, Message } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useEscapeInterceptor, useForm, useNestedRef } from '../../../hooks';
import { NotificationServiceFormats } from '../../../constants/Enums';
import Item from './Item';

import styles from './NotificationServices.module.scss';

const DEFAULT_DATA = {
  url: '',
  format: NotificationServiceFormats.MARKDOWN,
};

const NotificationServices = React.memo(({ ids, onCreate }) => {
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusUrlFieldState, focusUrlField] = useToggle();

  const [urlFieldRef, handleUrlFieldRef] = useNestedRef('inputRef');

  const handleUrlEscape = useCallback(() => {
    urlFieldRef.current.blur();
  }, [urlFieldRef]);

  const [activateEscapeInterceptor, deactivateEscapeInterceptor] =
    useEscapeInterceptor(handleUrlEscape);

  const handleCreateSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      url: data.url.trim(),
    };

    if (!cleanData.url) {
      urlFieldRef.current.select();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    focusUrlField();
  }, [onCreate, data, setData, focusUrlField, urlFieldRef]);

  const handleUrlFocus = useCallback(() => {
    activateEscapeInterceptor();
  }, [activateEscapeInterceptor]);

  const handleUrlBlur = useCallback(() => {
    deactivateEscapeInterceptor();
  }, [deactivateEscapeInterceptor]);

  useEffect(() => {
    if (urlFieldRef.current) {
      urlFieldRef.current.focus();
    }
  }, [urlFieldRef]);

  useDidUpdate(() => {
    if (urlFieldRef.current) {
      urlFieldRef.current.focus();
    }
  }, [focusUrlFieldState]);

  return (
    <>
      <Message>
        <Trans i18nKey="common.plankaUsesAppriseToSendNotificationsToOver100PopularServices">
          {'PLANKA uses '}
          <a href="https://github.com/caronc/apprise/wiki" target="_blank" rel="noreferrer">
            <b>Apprise</b>
          </a>
          {' to send notifications to over 100 popular services.'}
        </Trans>
      </Message>
      {ids.map((id) => (
        <div key={id} className={styles.item}>
          <Item id={id} />
        </div>
      ))}
      {ids.length < 5 && (
        <Form className={classNames(styles.item, styles.addItem)} onSubmit={handleCreateSubmit}>
          <Input
            ref={handleUrlFieldRef}
            name="url"
            value={data.url}
            placeholder="service://hostname/token"
            maxLength={512}
            label={
              <Dropdown
                basic
                compact
                name="format"
                value={data.format}
                options={[
                  NotificationServiceFormats.TEXT,
                  NotificationServiceFormats.MARKDOWN,
                  NotificationServiceFormats.HTML,
                ].map((format) => ({
                  text: format,
                  value: format,
                }))}
                onChange={handleFieldChange}
              />
            }
            labelPosition="right"
            className={styles.field}
            onFocus={handleUrlFocus}
            onChange={handleFieldChange}
            onBlur={handleUrlBlur}
          />
          <Button positive className={styles.button}>
            <Icon fitted name="plus" />
          </Button>
        </Form>
      )}
    </>
  );
});

NotificationServices.propTypes = {
  ids: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
};

export default NotificationServices;
