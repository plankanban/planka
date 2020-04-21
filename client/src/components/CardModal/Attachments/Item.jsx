import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Loader } from 'semantic-ui-react';

import EditPopup from './EditPopup';

import styles from './Item.module.css';

const Item = React.memo(
  ({ name, url, thumbnailUrl, createdAt, isPersisted, onUpdate, onDelete }) => {
    const [t] = useTranslation();

    const handleClick = useCallback(() => {
      window.open(url, '_blank');
    }, [url]);

    if (!isPersisted) {
      return (
        <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>
          <Loader inverted />
        </div>
      );
    }

    const filename = url.split('/').pop();
    const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

    return (
      /* eslint-disable jsx-a11y/click-events-have-key-events,
                        jsx-a11y/no-static-element-interactions */
      <div className={styles.wrapper} onClick={handleClick}>
        {/* eslint-enable jsx-a11y/click-events-have-key-events,
                          jsx-a11y/no-static-element-interactions */}
        <div
          className={styles.thumbnail}
          style={{
            backgroundImage: thumbnailUrl && `url(${thumbnailUrl}`,
          }}
        >
          {!thumbnailUrl && <span className={styles.extension}>{extension || '-'}</span>}
        </div>
        <div className={styles.details}>
          <span className={styles.name}>{name}</span>
          <span className={styles.options}>
            {t('format:longDateTime', {
              postProcess: 'formatDate',
              value: createdAt,
            })}
          </span>
        </div>
        <EditPopup
          defaultData={{
            name,
          }}
          onUpdate={onUpdate}
          onDelete={onDelete}
        >
          <Button className={classNames(styles.button, styles.target)}>
            <Icon fitted name="pencil" size="small" />
          </Button>
        </EditPopup>
      </div>
    );
  },
);

Item.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  isPersisted: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  url: undefined,
  thumbnailUrl: undefined,
  createdAt: undefined,
};

export default Item;
