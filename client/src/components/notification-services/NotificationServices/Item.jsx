/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Form, Icon, Input } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import {
  useEscapeInterceptor,
  useForm,
  useNestedRef,
  usePopupInClosableContext,
} from '../../../hooks';
import { NotificationServiceFormats } from '../../../constants/Enums';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectNotificationServiceById = useMemo(
    () => selectors.makeSelectNotificationServiceById(),
    [],
  );

  const notificationService = useSelector((state) => selectNotificationServiceById(state, id));

  const dispatch = useDispatch();

  const defaultData = useMemo(
    () => ({
      url: notificationService.url,
      format: notificationService.format,
    }),
    [notificationService.url, notificationService.format],
  );

  const prevDefaultData = usePrevious(defaultData);

  const [data, handleFieldChange, setData] = useForm(() => ({
    url: '',
    format: NotificationServiceFormats.MARKDOWN,
    ...defaultData,
  }));

  const [blurUrlFieldState, blurUrlField] = useToggle();

  const [urlFieldRef, handleUrlFieldRef] = useNestedRef('inputRef');
  const isUrlFocusedRef = useRef(false);

  const resetUrl = useCallback(() => {
    setData((prevData) => ({
      ...prevData,
      url: defaultData.url,
    }));
  }, [defaultData.url, setData]);

  const handleUrlEscape = useCallback(() => {
    resetUrl();
    blurUrlField();
  }, [blurUrlField, resetUrl]);

  const [activateEscapeInterceptor, deactivateEscapeInterceptor] =
    useEscapeInterceptor(handleUrlEscape);

  const handleUrlFocus = useCallback(() => {
    activateEscapeInterceptor();
    isUrlFocusedRef.current = true;
  }, [activateEscapeInterceptor]);

  const handleUrlBlur = useCallback(() => {
    deactivateEscapeInterceptor();
    isUrlFocusedRef.current = false;

    const cleanUrl = data.url.trim();

    if (!cleanUrl) {
      resetUrl();
      return;
    }

    if (cleanUrl !== defaultData.url) {
      dispatch(
        entryActions.updateNotificationService(id, {
          url: cleanUrl,
        }),
      );
    }
  }, [
    id,
    dispatch,
    defaultData.url,
    data.url,
    isUrlFocusedRef,
    resetUrl,
    deactivateEscapeInterceptor,
  ]);

  const handleFormatChange = useCallback(
    (_, { value: format }) => {
      setData((prevData) => ({
        ...prevData,
        format,
      }));

      dispatch(
        entryActions.updateNotificationService(id, {
          format,
        }),
      );
    },
    [id, dispatch, setData],
  );

  const handleTestClick = useCallback(() => {
    dispatch(entryActions.testNotificationService(id));
  }, [id, dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteNotificationService(id));
  }, [id, dispatch]);

  const handleSubmit = useCallback(() => {
    urlFieldRef.current.blur();
  }, [urlFieldRef]);

  useDidUpdate(() => {
    const nextData = {};
    if (!isUrlFocusedRef.current && defaultData.url !== prevDefaultData.url) {
      nextData.url = defaultData.url;
    }
    if (defaultData.format !== prevDefaultData.format) {
      nextData.format = defaultData.format;
    }

    if (Object.keys(nextData).length > 0) {
      setData((prevData) => ({
        ...prevData,
        ...nextData,
      }));
    }
  }, [defaultData, prevDefaultData]);

  useDidUpdate(() => {
    urlFieldRef.current.blur();
  }, [blurUrlFieldState]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <Input
        ref={handleUrlFieldRef}
        name="url"
        value={data.url}
        maxLength={512}
        readOnly={!notificationService.isPersisted}
        label={
          <Dropdown
            basic
            compact
            value={data.format}
            options={[
              NotificationServiceFormats.TEXT,
              NotificationServiceFormats.MARKDOWN,
              NotificationServiceFormats.HTML,
            ].map((format) => ({
              text: format,
              value: format,
            }))}
            disabled={!notificationService.isPersisted}
            onChange={handleFormatChange}
          />
        }
        labelPosition="right"
        className={styles.field}
        onFocus={handleUrlFocus}
        onChange={handleFieldChange}
        onBlur={handleUrlBlur}
      />
      <Button
        type="button"
        loading={notificationService.isTesting}
        disabled={!notificationService.isPersisted || notificationService.isTesting}
        className={styles.button}
        onClick={handleTestClick}
      >
        <Icon fitted name="paper plane outline" />
      </Button>
      <ConfirmationPopup
        title="common.deleteNotificationService"
        content="common.areYouSureYouWantToDeleteThisNotificationService"
        buttonContent="action.deleteNotificationService"
        onConfirm={handleDeleteConfirm}
      >
        <Button type="button" disabled={!notificationService.isPersisted} className={styles.button}>
          <Icon fitted name="trash alternate outline" />
        </Button>
      </ConfirmationPopup>
    </Form>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
