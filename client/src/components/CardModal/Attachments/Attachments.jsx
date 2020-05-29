import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { useToggle } from '../../../lib/hooks';

import Item from './Item';

import styles from './Attachments.module.scss';

const Attachments = React.memo(({ items, onUpdate, onDelete, onCoverUpdate }) => {
  const [t] = useTranslation();
  const [isOpened, toggleOpened] = useToggle();

  const handleToggleClick = useCallback(() => {
    toggleOpened();
  }, [toggleOpened]);

  const handleCoverSelect = useCallback(
    (id) => {
      onCoverUpdate(id);
    },
    [onCoverUpdate],
  );

  const handleCoverDeselect = useCallback(() => {
    onCoverUpdate(null);
  }, [onCoverUpdate]);

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

  const visibleItems = isOpened ? items : items.slice(0, 4);

  return (
    <>
      {visibleItems.map((item) => (
        <Item
          key={item.id}
          name={item.name}
          url={item.url}
          coverUrl={item.coverUrl}
          createdAt={item.createdAt}
          isCover={item.isCover}
          isPersisted={item.isPersisted}
          onCoverSelect={() => handleCoverSelect(item.id)}
          onCoverDeselect={handleCoverDeselect}
          onUpdate={(data) => handleUpdate(item.id, data)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
      {items.length > 4 && (
        <Button
          fluid
          content={
            isOpened
              ? t('action.showFewerAttachments')
              : t('action.showAllAttachments', {
                  hidden: items.length - visibleItems.length,
                })
          }
          className={styles.toggleButton}
          onClick={handleToggleClick}
        />
      )}
    </>
  );
});

Attachments.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCoverUpdate: PropTypes.func.isRequired,
};

export default Attachments;
