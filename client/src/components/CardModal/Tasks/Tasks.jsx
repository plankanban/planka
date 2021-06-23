import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Progress } from 'semantic-ui-react';

import Item from './Item';
import Add from './Add';

import styles from './Tasks.module.scss';

const Tasks = React.memo(({ items, canEdit, onCreate, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const completedItems = items.filter((item) => item.isCompleted);

  return (
    <>
      {items.length > 0 && (
        <Progress
          autoSuccess
          value={completedItems.length}
          total={items.length}
          color="blue"
          size="tiny"
          className={styles.progress}
        />
      )}
      {items.map((item) => (
        <Item
          key={item.id}
          name={item.name}
          isCompleted={item.isCompleted}
          isPersisted={item.isPersisted}
          canEdit={canEdit}
          onUpdate={(data) => handleUpdate(item.id, data)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
      {canEdit && (
        <Add onCreate={onCreate}>
          <button type="button" className={styles.taskButton}>
            <span className={styles.taskButtonText}>
              {items.length > 0 ? t('action.addAnotherTask') : t('action.addTask')}
            </span>
          </button>
        </Add>
      )}
    </>
  );
});

Tasks.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Tasks;
