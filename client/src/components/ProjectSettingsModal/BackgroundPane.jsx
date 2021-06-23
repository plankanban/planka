import { dequal } from 'dequal';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Image } from 'semantic-ui-react';
import { FilePicker } from '../../lib/custom-ui';

import ProjectBackgroundGradients from '../../constants/ProjectBackgroundGradients';
import { ProjectBackgroundTypes } from '../../constants/Enums';

import styles from './BackgroundPane.module.scss';
import globalStyles from '../../styles.module.scss';

const BackgroundPane = React.memo(
  ({ item, imageCoverUrl, isImageUpdating, onUpdate, onImageUpdate, onImageDelete }) => {
    const [t] = useTranslation();

    const field = useRef(null);

    const handleGradientClick = useCallback(
      (_, { value }) => {
        const background = {
          type: ProjectBackgroundTypes.GRADIENT,
          name: value,
        };

        if (!dequal(background, item)) {
          onUpdate(background);
        }
      },
      [item, onUpdate],
    );

    const handleImageClick = useCallback(() => {
      const background = {
        type: ProjectBackgroundTypes.IMAGE,
      };

      if (!dequal(background, item)) {
        onUpdate(background);
      }
    }, [item, onUpdate]);

    const handleFileSelect = useCallback(
      (file) => {
        onImageUpdate({
          file,
        });
      },
      [onImageUpdate],
    );

    const handleDeleteImageClick = useCallback(() => {
      onImageDelete();
    }, [onImageDelete]);

    const handleRemoveClick = useCallback(() => {
      onUpdate(null);
    }, [onUpdate]);

    useEffect(() => {
      field.current.focus();
    }, []);

    return (
      <>
        <div className={styles.gradientButtons}>
          {ProjectBackgroundGradients.map((gradient) => (
            <Button
              key={gradient}
              type="button"
              name="gradient"
              value={gradient}
              className={classNames(
                styles.gradientButton,
                item &&
                  item.type === ProjectBackgroundTypes.GRADIENT &&
                  gradient === item.name &&
                  styles.gradientButtonActive,
                globalStyles[`background${upperFirst(camelCase(gradient))}`],
              )}
              onClick={handleGradientClick}
            />
          ))}
        </div>
        {imageCoverUrl && (
          // TODO: wrap in button
          <Image
            src={imageCoverUrl}
            label={
              item &&
              item.type === 'image' && {
                corner: 'left',
                size: 'small',
                icon: {
                  name: 'star',
                  color: 'grey',
                  inverted: true,
                },
                className: styles.imageLabel,
              }
            }
            className={styles.image}
            onClick={handleImageClick}
          />
        )}
        <div className={styles.actions}>
          <div className={styles.action}>
            <FilePicker accept="image/*" onSelect={handleFileSelect}>
              <Button
                ref={field}
                content={t('action.uploadNewImage', {
                  context: 'title',
                })}
                loading={isImageUpdating}
                disabled={isImageUpdating}
                className={styles.actionButton}
              />
            </FilePicker>
          </div>
          {imageCoverUrl && (
            <div className={styles.action}>
              <Button
                content={t('action.deleteImage', {
                  context: 'title',
                })}
                disabled={isImageUpdating}
                className={styles.actionButton}
                onClick={handleDeleteImageClick}
              />
            </div>
          )}
          {item && (
            <div className={styles.action}>
              <Button
                content={t('action.removeBackground', {
                  context: 'title',
                })}
                disabled={isImageUpdating}
                className={styles.actionButton}
                onClick={handleRemoveClick}
              />
            </div>
          )}
        </div>
      </>
    );
  },
);

BackgroundPane.propTypes = {
  item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  imageCoverUrl: PropTypes.string,
  isImageUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onImageUpdate: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func.isRequired,
};

BackgroundPane.defaultProps = {
  item: undefined,
  imageCoverUrl: undefined,
};

export default BackgroundPane;
