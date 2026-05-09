/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form, Header, Icon, Input, Tab } from 'semantic-ui-react';

import api from '../../../api';
import selectors from '../../../selectors';

import styles from './ProjectGroupMappingsPane.module.scss';

const ProjectGroupMappingsPane = React.memo(() => {
  const [t] = useTranslation();
  const projects = useSelector(selectors.selectAllProjects);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const projectsById = useMemo(() => {
    const map = new Map();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  const projectOptions = useMemo(
    () =>
      projects
        .map((p) => ({ key: p.id, value: p.id, text: p.name }))
        .sort((a, b) => a.text.localeCompare(b.text)),
    [projects],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items: result } = await api.getProjectGroupMappings();
      setItems(result);
      setError(null);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const trimmed = groupName.trim();
      if (!trimmed || !projectId) {
        return;
      }

      setIsSubmitting(true);
      try {
        const { item } = await api.createProjectGroupMapping({
          groupName: trimmed,
          projectId,
        });
        setItems((prev) => [...prev, item]);
        setGroupName('');
        setProjectId(null);
        setError(null);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [groupName, projectId],
  );

  const handleDelete = useCallback(async (id) => {
    try {
      await api.deleteProjectGroupMapping(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message || String(err));
    }
  }, []);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Header as="h3">{t('common.oidcGroupProjectAccess', { context: 'title' })}</Header>
      <p>{t('common.oidcGroupProjectAccessHint')}</p>

      <Form onSubmit={handleSubmit} className={styles.form}>
        <Form.Group>
          <Form.Field width={6}>
            <Input
              fluid
              placeholder={t('common.groupName')}
              value={groupName}
              onChange={(_, { value }) => setGroupName(value)}
            />
          </Form.Field>
          <Form.Field width={8}>
            <Dropdown
              selection
              search
              fluid
              placeholder={t('common.selectProject')}
              options={projectOptions}
              value={projectId}
              onChange={(_, { value }) => setProjectId(value)}
            />
          </Form.Field>
          <Form.Field width={2}>
            <Button
              primary
              fluid
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !groupName.trim() || !projectId}
            >
              {t('action.add')}
            </Button>
          </Form.Field>
        </Form.Group>
      </Form>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading && <div className={styles.empty}>{t('common.loading')}…</div>}
      {!isLoading && items.length === 0 && (
        <div className={styles.empty}>{t('common.noMappingsConfigured')}</div>
      )}
      {!isLoading &&
        items.length > 0 &&
        items.map((mapping) => {
          const project = projectsById.get(mapping.projectId);
          return (
            <div key={mapping.id} className={styles.row}>
              <span className={styles.group}>{mapping.groupName}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.project}>
                {project ? project.name : `#${mapping.projectId}`}
              </span>
              <Button
                icon
                size="small"
                onClick={() => handleDelete(mapping.id)}
                aria-label={t('action.delete')}
              >
                <Icon name="trash" />
              </Button>
            </div>
          );
        })}
    </Tab.Pane>
  );
});

export default ProjectGroupMappingsPane;
