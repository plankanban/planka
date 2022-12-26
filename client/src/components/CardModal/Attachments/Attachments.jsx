import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Gallery, Item as GalleryItem } from 'react-photoswipe-gallery';
import { Button } from 'semantic-ui-react';
import { useToggle } from '../../../lib/hooks';

import Item from './Item';

import styles from './Attachments.module.scss';

const INITIALLY_VISIBLE = 4;

const Attachments = React.memo(
  ({ items, canEdit, onUpdate, onDelete, onCoverUpdate, onGalleryOpen, onGalleryClose }) => {
    const [t] = useTranslation();
    const [isAllVisible, toggleAllVisible] = useToggle();

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

    const handleBeforeGalleryOpen = useCallback(
      (gallery) => {
        onGalleryOpen();

        gallery.on('destroy', () => {
          onGalleryClose();
        });
      },
      [onGalleryOpen, onGalleryClose],
    );

    const handleToggleAllVisibleClick = useCallback(() => {
      toggleAllVisible();
    }, [toggleAllVisible]);

    const galleryItemsNode = items.map((item, index) => {
      const isPdf = item.url && item.url.endsWith('.pdf');

      let props;
      if (item.image) {
        props = item.image;
      } else {
        props = {
          content: isPdf ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <object
              data={item.url}
              type="application/pdf"
              className={classNames(styles.content, styles.contentPdf)}
            />
          ) : (
            <span className={classNames(styles.content, styles.contentError)}>
              {t('common.thereIsNoPreviewAvailableForThisAttachment')}
            </span>
          ),
        };
      }

      const isVisible = isAllVisible || index < INITIALLY_VISIBLE;

      return (
        <GalleryItem
          {...props} // eslint-disable-line react/jsx-props-no-spreading
          key={item.id}
          original={item.url}
          caption={item.name}
        >
          {({ ref, open }) =>
            isVisible ? (
              <Item
                ref={ref}
                name={item.name}
                url={item.url}
                coverUrl={item.coverUrl}
                createdAt={item.createdAt}
                isCover={item.isCover}
                isPersisted={item.isPersisted}
                canEdit={canEdit}
                onClick={item.image || isPdf ? open : undefined}
                onCoverSelect={() => handleCoverSelect(item.id)}
                onCoverDeselect={handleCoverDeselect}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item.id)}
              />
            ) : (
              <span ref={ref} />
            )
          }
        </GalleryItem>
      );
    });

    return (
      <>
        <Gallery
          withCaption
          withDownloadButton
          options={{
            wheelToZoom: true,
            showHideAnimationType: 'none',
            closeTitle: '',
            zoomTitle: '',
            arrowPrevTitle: '',
            arrowNextTitle: '',
            errorMsg: '',
          }}
          onBeforeOpen={handleBeforeGalleryOpen}
        >
          {galleryItemsNode}
        </Gallery>
        {items.length > INITIALLY_VISIBLE && (
          <Button
            fluid
            content={
              isAllVisible
                ? t('action.showFewerAttachments')
                : t('action.showAllAttachments', {
                    hidden: items.length - INITIALLY_VISIBLE,
                  })
            }
            className={styles.toggleButton}
            onClick={handleToggleAllVisibleClick}
          />
        )}
      </>
    );
  },
);

Attachments.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCoverUpdate: PropTypes.func.isRequired,
  onGalleryOpen: PropTypes.func.isRequired,
  onGalleryClose: PropTypes.func.isRequired,
};

export default Attachments;
