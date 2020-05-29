import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import { useSteps } from '../../hooks';
import AddStep from './AddStep';
import EditStep from './EditStep';
import Item from './Item';

import styles from './LabelsStep.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const LabelsStep = React.memo(
  ({ items, currentIds, title, onSelect, onDeselect, onCreate, onUpdate, onDelete, onBack }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleAddClick = useCallback(() => {
      openStep(StepTypes.ADD);
    }, [openStep]);

    const handleEdit = useCallback(
      (id) => {
        openStep(StepTypes.EDIT, {
          id,
        });
      },
      [openStep],
    );

    const handleSelect = useCallback(
      (id) => {
        onSelect(id);
      },
      [onSelect],
    );

    const handleDeselect = useCallback(
      (id) => {
        onDeselect(id);
      },
      [onDeselect],
    );

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

    if (step) {
      switch (step.type) {
        case StepTypes.ADD:
          return <AddStep onCreate={onCreate} onBack={handleBack} />;
        case StepTypes.EDIT: {
          const currentItem = items.find((item) => item.id === step.params.id);

          if (currentItem) {
            return (
              <EditStep
                defaultData={pick(currentItem, ['name', 'color'])}
                onUpdate={(data) => handleUpdate(currentItem.id, data)}
                onDelete={() => handleDelete(currentItem.id)}
                onBack={handleBack}
              />
            );
          }

          openStep(null);

          break;
        }
        default:
      }
    }

    return (
      <>
        <Popup.Header onBack={onBack}>{t(title)}</Popup.Header>
        <Popup.Content>
          {items.map((item) => (
            <Item
              key={item.id}
              name={item.name}
              color={item.color}
              isPersisted={item.isPersisted}
              isActive={currentIds.includes(item.id)}
              onSelect={() => handleSelect(item.id)}
              onDeselect={() => handleDeselect(item.id)}
              onEdit={() => handleEdit(item.id)}
            />
          ))}
          <Button
            fluid
            content={t('action.createNewLabel')}
            className={styles.addButton}
            onClick={handleAddClick}
          />
        </Popup.Content>
      </>
    );
  },
);

LabelsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  title: 'common.labels',
  onBack: undefined,
};

export default LabelsStep;
