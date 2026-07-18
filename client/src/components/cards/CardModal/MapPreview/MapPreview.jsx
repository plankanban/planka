/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Icon } from "semantic-ui-react";

import styles from "./MapPreview.module.scss";

const MapPreview = React.memo(({ location, googleMapsApiKey, onMapClick }) => {
  const [t] = useTranslation();
  const [hasImageError, setHasImageError] = useState(false);

  const { placeName, latitude, longitude, formattedAddress } = location;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x200&markers=${latitude},${longitude}&key=${googleMapsApiKey}`;

  const handleImageError = useCallback(() => {
    setHasImageError(true);
  }, []);

  const handleMapClick = useCallback(() => {
    if (onMapClick) {
      onMapClick();
    }
  }, [onMapClick]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Icon name="map marker alternate" className={styles.headerIcon} />
        <span className={styles.headerText}>{t("common.location")}</span>
      </div>
      {hasImageError ? (
        <div className={styles.placeholder}>
          <div className={styles.placeholderName}>{placeName}</div>
          <div className={styles.placeholderMessage}>
            {t("common.mapCouldNotBeLoaded")}
          </div>
        </div>
      ) : (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                    jsx-a11y/no-noninteractive-element-interactions */
        <img
          src={staticMapUrl}
          alt={placeName}
          className={styles.mapImage}
          onClick={handleMapClick}
          onError={handleImageError}
        />
      )}
      <div className={styles.caption}>
        <span className={styles.captionName}>{placeName}</span>
        {formattedAddress && (
          <span className={styles.captionAddress}> ({formattedAddress})</span>
        )}
      </div>
    </div>
  );
});

MapPreview.propTypes = {
  location: PropTypes.shape({
    placeName: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    formattedAddress: PropTypes.string.isRequired,
  }).isRequired,
  googleMapsApiKey: PropTypes.string.isRequired,
  onMapClick: PropTypes.func.isRequired,
};

export default MapPreview;
