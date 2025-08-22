/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Item as GalleryItem } from 'react-photoswipe-gallery';

import selectors from '../../../selectors';
import Config from '../../../constants/Config';
import Encodings from '../../../constants/Encodings';
import { AttachmentTypes } from '../../../constants/Enums';
import ItemContent from './ItemContent';
import ContentViewer from './ContentViewer';
import PdfViewer from './PdfViewer';
import CsvViewer from './CsvViewer';

import styles from './Item.module.scss';

const Item = React.memo(({ id, isVisible }) => {
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const attachment = useSelector((state) => selectAttachmentById(state, id));

  const [t] = useTranslation();

  if (!attachment.isPersisted) {
    return <ItemContent id={id} />;
  }

  let galleryItemProps;
  if (attachment.type === AttachmentTypes.FILE) {
    if (attachment.data.image) {
      galleryItemProps = attachment.data.image;
    } else {
      let content;
      switch (attachment.data.mimeType) {
        case 'application/pdf':
          content = (
            <PdfViewer
              src={attachment.data.url}
              className={classNames(styles.content, styles.contentViewer)}
            />
          );

          break;
        case 'audio/mpeg':
        case 'audio/wav':
        case 'audio/ogg':
        case 'audio/opus':
        case 'audio/mp4':
        case 'audio/x-aac':
          content = (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio controls src={attachment.data.url} className={styles.content} />
          );

          break;
        case 'text/csv':
          content = (
            <CsvViewer
              src={attachment.data.url}
              className={classNames(styles.content, styles.contentViewer)}
            />
          );

          break;
        case 'video/mp4':
        case 'video/ogg':
        case 'video/webm':
          content = (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video controls src={attachment.data.url} className={styles.content} />
          );

          break;
        default:
          if (attachment.data.encoding === Encodings.UTF8) {
            if (attachment.data.size <= Config.MAX_SIZE_TO_DISPLAY_CONTENT) {
              content = (
                <ContentViewer
                  src={attachment.data.url}
                  filename={attachment.data.filename}
                  className={classNames(styles.content, styles.contentViewer)}
                />
              );
            } else {
              content = (
                <span className={classNames(styles.content, styles.contentError)}>
                  {t('common.contentOfThisAttachmentIsTooBigToDisplay')}
                </span>
              );
            }
          } else {
            content = (
              <span className={classNames(styles.content, styles.contentError)}>
                {t('common.thereIsNoPreviewAvailableForThisAttachment')}
              </span>
            );
          }
      }

      galleryItemProps = {
        content,
      };
    }
  } else if (attachment.type === AttachmentTypes.LINK) {
    galleryItemProps = {
      content: (
        <span className={classNames(styles.content, styles.contentError)}>
          {t('common.thereIsNoPreviewAvailableForThisAttachment')}
        </span>
      ),
    };
  }

  return (
    <GalleryItem
      {...galleryItemProps} // eslint-disable-line react/jsx-props-no-spreading
      original={attachment.data.url}
      caption={attachment.name}
    >
      {({ ref, open }) =>
        isVisible ? (
          <ItemContent
            ref={ref}
            id={id}
            onOpen={attachment.type === AttachmentTypes.FILE ? open : undefined}
          />
        ) : (
          <span ref={ref} />
        )
      }
    </GalleryItem>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default Item;
