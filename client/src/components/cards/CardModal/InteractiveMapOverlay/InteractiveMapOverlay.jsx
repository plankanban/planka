/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Icon } from 'semantic-ui-react';

import styles from './InteractiveMapOverlay.module.scss';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const DEFAULT_ZOOM = 15;

const InteractiveMapOverlay = React.memo(({ location, googleMapsApiKey, onClose }) => {
  const [t] = useTranslation();
  const overlayRef = useRef(null);

  const { placeName, latitude, longitude } = location;

  const center = { lat: latitude, lng: longitude };

  const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
  });

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (event) => {
      if (event.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderMapContent = () => {
    if (loadError) {
      return (
        <div className={styles.error}>
          <Icon name="warning sign" className={styles.errorIcon} />
          <span>{t('common.mapCouldNotBeLoaded')}</span>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className={styles.loading}>
          <span>{t('common.loadingMap')}</span>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <MarkerF position={center} />
      </GoogleMap>
    );
  };

  return ReactDOM.createPortal(
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                jsx-a11y/no-static-element-interactions */
    <div ref={overlayRef} className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Icon name="map marker alternate" className={styles.headerIcon} />
            <span>{placeName}</span>
          </div>
          <div className={styles.headerActions}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
            >
              {t('common.openInGoogleMaps')}
              <Icon name="external alternate" className={styles.openLinkIcon} />
            </a>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <Icon name="close" className={styles.closeIcon} />
            </button>
          </div>
        </div>
        <div className={styles.mapWrapper}>{renderMapContent()}</div>
      </div>
    </div>,
    document.body,
  );
});

InteractiveMapOverlay.propTypes = {
  location: PropTypes.shape({
    placeName: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    formattedAddress: PropTypes.string.isRequired,
  }).isRequired,
  googleMapsApiKey: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InteractiveMapOverlay;
