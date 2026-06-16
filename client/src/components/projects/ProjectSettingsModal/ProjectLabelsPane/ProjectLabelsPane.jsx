/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";
import React, { useCallback, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Divider, Form, Header, Tab } from "semantic-ui-react";
import { Input, Popup } from "../../../../lib/custom-ui";

import selectors from "../../../../selectors";
import entryActions from "../../../../entry-actions";
import { useField, useForm, useNestedRef, useSteps } from "../../../../hooks";
import DroppableTypes from "../../../../constants/DroppableTypes";
import LABEL_COLORS from "../../../../constants/LabelColors";

import styles from "./ProjectLabelsPane.module.scss";
import globalStyles from "../../../../styles.module.scss";

const StepTypes = {
  ADD: "ADD",
  EDIT: "EDIT",
};

const ProjectLabelsPane = React.memo(() => {
  const projectLabels = useSelector(
    selectors.selectProjectLabelsForCurrentProject,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField("");
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredLabels = useMemo(
    () =>
      projectLabels.filter(
        (label) =>
          (label.name && label.name.toLowerCase().includes(cleanSearch)) ||
          label.color.includes(cleanSearch),
      ),
    [projectLabels, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef("inputRef");

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveProjectLabel(draggableId, destination.index));
    },
    [dispatch],
  );

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

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.focus({
        preventScroll: true,
      });
    }
  }, [searchFieldRef]);

  if (step) {
    switch (step.type) {
      case StepTypes.ADD:
        return (
          <AddStep
            defaultData={{
              name: search,
            }}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT: {
        const currentLabel = projectLabels.find(
          (label) => label.id === step.params.id,
        );

        if (currentLabel) {
          return (
            <EditStep projectLabelId={currentLabel.id} onBack={handleBack} />
          );
        }

        openStep(null);

        break;
      }
      default:
    }
  }

  return (
    <Tab.Pane>
      <Input
        fluid
        ref={handleSearchFieldRef}
        value={search}
        placeholder={t("common.searchLabels")}
        maxLength={128}
        icon="search"
        onChange={handleSearchChange}
      />
      {filteredLabels.length > 0 && (
        <DragDropContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="projectLabels" type={DroppableTypes.LABEL}>
            {({ innerRef, droppableProps, placeholder }) => (
              <div
                {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                ref={innerRef}
                className={styles.items}
              >
                {filteredLabels.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={!item.isPersisted}
                  >
                    {(
                      { innerRef, draggableProps, dragHandleProps },
                      { isDragging },
                    ) => {
                      const contentNode = (
                        <div
                          {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
                          ref={innerRef}
                          className={styles.wrapper}
                        >
                          <span
                            {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                            className={`${styles.name} ${
                              globalStyles[
                                `background${upperFirst(camelCase(item.color))}`
                              ]
                            }`}
                          >
                            {item.name}
                          </span>
                          <Button
                            icon="pencil"
                            size="small"
                            disabled={!item.isPersisted}
                            className={styles.button}
                            onClick={() => handleEdit(item.id)}
                          />
                          <Button
                            icon="trash"
                            size="small"
                            disabled={!item.isPersisted}
                            className={styles.button}
                            onClick={() =>
                              dispatch(entryActions.deleteProjectLabel(item.id))
                            }
                          />
                        </div>
                      );

                      return isDragging
                        ? ReactDOM.createPortal(contentNode, document.body)
                        : contentNode;
                    }}
                  </Draggable>
                ))}
                {placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Button
        fluid
        content={t("action.createNewLabel")}
        className={styles.addButton}
        onClick={handleAddClick}
      />
    </Tab.Pane>
  );
});

const AddStep = React.memo(({ defaultData, onBack }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: "",
    color: LABEL_COLORS[0],
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    dispatch(entryActions.createProjectLabelInCurrentProject(cleanData));

    onBack();
  }, [onBack, data, dispatch]);

  const [nameFieldRef, handleNameFieldRef] = useNestedRef("inputRef");

  useEffect(() => {
    if (nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, [nameFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t("common.createLabel", {
          context: "title",
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t("common.title")}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t("common.color")}</div>
          <div className={styles.colorButtons}>
            {LABEL_COLORS.map((color) => (
              <Button
                key={color}
                type="button"
                name="color"
                value={color}
                className={`${styles.colorButton} ${
                  color === data.color && styles.colorButtonActive
                } ${globalStyles[`background${upperFirst(camelCase(color))}`]}`}
                onClick={handleFieldChange}
              />
            ))}
          </div>
          <Button positive content={t("action.createLabel")} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onBack: PropTypes.func.isRequired,
};

const EditStep = React.memo(({ projectLabelId, onBack }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const selectProjectLabelById = useMemo(
    () => selectors.makeSelectProjectLabelById(),
    [],
  );
  const projectLabel = useSelector((state) =>
    selectProjectLabelById(state, projectLabelId),
  );

  const [data, handleFieldChange] = useForm(
    () =>
      projectLabel || {
        name: "",
        color: LABEL_COLORS[0],
      },
  );

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    dispatch(entryActions.updateProjectLabel(projectLabelId, cleanData));

    onBack();
  }, [onBack, projectLabelId, data, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(entryActions.deleteProjectLabel(projectLabelId));

    onBack();
  }, [onBack, projectLabelId, dispatch]);

  const [nameFieldRef, handleNameFieldRef] = useNestedRef("inputRef");

  useEffect(() => {
    if (nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, [nameFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t("common.editLabel", {
          context: "title",
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t("common.title")}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t("common.color")}</div>
          <div className={styles.colorButtons}>
            {LABEL_COLORS.map((color) => (
              <Button
                key={color}
                type="button"
                name="color"
                value={color}
                className={`${styles.colorButton} ${
                  color === data.color && styles.colorButtonActive
                } ${globalStyles[`background${upperFirst(camelCase(color))}`]}`}
                onClick={handleFieldChange}
              />
            ))}
          </div>
          <Button positive content={t("action.save")} />
        </Form>
        <Divider horizontal section>
          <Header as="h4">
            {t("common.dangerZone", {
              context: "title",
            })}
          </Header>
        </Divider>
        <Button negative fluid onClick={handleDelete}>
          {t("action.deleteLabel")}
        </Button>
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  projectLabelId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ProjectLabelsPane;
