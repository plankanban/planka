/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Item as GalleryItem } from 'react-photoswipe-gallery';

import selectors from '../../../../selectors';

import styles from './Thumbnail.module.scss';

const Thumbnail = React.memo(({ attachmentId }) => {
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const attachment = useSelector((state) => selectAttachmentById(state, attachmentId));

  return (
    <GalleryItem
      {...attachment.data.image} // eslint-disable-line react/jsx-props-no-spreading
      original={attachment.data.url}
      caption={attachment.name}
    >
      {({ ref, open }) => (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                    jsx-a11y/no-noninteractive-element-interactions */
        <img
          ref={ref}
          src={attachment.data.thumbnailUrls.outside360}
          alt={attachment.name}
          className={styles.image}
          onClick={open}
        />
      )}
    </GalleryItem>
  );
});

Thumbnail.propTypes = {
  attachmentId: PropTypes.string.isRequired,
};

export default Thumbnail;
