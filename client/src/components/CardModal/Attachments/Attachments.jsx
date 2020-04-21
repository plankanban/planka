import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Item from './Item';

const Attachments = React.memo(({ items, onUpdate, onDelete }) => {
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

  return (
    <>
      {items.map((item) => (
        <Item
          key={item.id}
          name={item.name}
          url={item.url}
          thumbnailUrl={item.thumbnailUrl}
          createdAt={item.createdAt}
          isPersisted={item.isPersisted}
          onUpdate={(data) => handleUpdate(item.id, data)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </>
  );
});

Attachments.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Attachments;
