import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Label, Loader } from 'semantic-ui-react';

import EditPopup from './EditPopup';

import styles from './Item.module.scss';

const Item = React.memo(
  ({
    name,
    url,
    coverUrl,
    createdAt,
    isCover,
    isPersisted,
    onCoverSelect,
    onCoverDeselect,
    onUpdate,
    onDelete,
  }) => {
    const [t] = useTranslation();

    const handleClick = useCallback(() => {
      window.open(url, '_blank');
    }, [url]);

    const handleToggleCoverClick = useCallback(
      (event) => {
        event.stopPropagation();

        if (isCover) {
          onCoverDeselect();
        } else {
          onCoverSelect();
        }
      },
      [isCover, onCoverSelect, onCoverDeselect],
    );

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
            background: coverUrl && `url("${coverUrl}") center / cover`,
          }}
        >
          {coverUrl ? (
            isCover && (
              <Label
                corner="left"
                size="mini"
                icon={{
                  name: 'star',
                  color: 'grey',
                  inverted: true,
                }}
                className={styles.thumbnailLabel}
              />
            )
          ) : (
            <span className={styles.extension}>{extension || '-'}</span>
          )}
        </div>
        <div className={styles.details}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date}>
            {t('format:longDateTime', {
              postProcess: 'formatDate',
              value: createdAt,
            })}
          </span>
          {coverUrl && (
            <span className={styles.options}>
              <button type="button" className={styles.option} onClick={handleToggleCoverClick}>
                <Icon
                  name="window maximize outline"
                  flipped="vertically"
                  size="small"
                  className={styles.optionIcon}
                />
                <span className={styles.optionText}>
                  {isCover
                    ? t('action.removeCover', {
                        context: 'title',
                      })
                    : t('action.makeCover', {
                        context: 'title',
                      })}
                </span>
              </button>
            </span>
          )}
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
  coverUrl: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  isCover: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  onCoverSelect: PropTypes.func.isRequired,
  onCoverDeselect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  url: undefined,
  coverUrl: undefined,
  createdAt: undefined,
};

export default Item;
