import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CardModal from './CardModal';

describe('CardModal', () => {
  const defaultProps = {
    name: 'Test Card',
    description: 'Test Description',
    dueDate: new Date(),
    isDueDateCompleted: false,
    stopwatch: { startedAt: null, total: 0 },
    isSubscribed: false,
    isActivitiesFetching: false,
    isAllActivitiesFetched: false,
    isActivitiesDetailsVisible: false,
    isActivitiesDetailsFetching: false,
    listId: '1',
    boardId: '1',
    projectId: '1',
    users: [],
    labels: [],
    tasks: [],
    attachments: [],
    activities: [],
    allProjectsToLists: [],
    allBoardMemberships: [],
    allLabels: [],
    canEdit: true,
    canEditCommentActivities: true,
    canEditAllCommentActivities: true,
    onUpdate: jest.fn(),
    onMove: jest.fn(),
    onTransfer: jest.fn(),
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    onUserAdd: jest.fn(),
    onUserRemove: jest.fn(),
    onBoardFetch: jest.fn(),
    onLabelAdd: jest.fn(),
    onLabelRemove: jest.fn(),
    onLabelCreate: jest.fn(),
    onLabelUpdate: jest.fn(),
    onLabelMove: jest.fn(),
    onLabelDelete: jest.fn(),
    onTaskCreate: jest.fn(),
    onTaskUpdate: jest.fn(),
    onTaskMove: jest.fn(),
    onTaskDelete: jest.fn(),
    onAttachmentCreate: jest.fn(),
    onAttachmentUpdate: jest.fn(),
    onAttachmentDelete: jest.fn(),
    onActivitiesFetch: jest.fn(),
    onActivitiesDetailsToggle: jest.fn(),
    onCommentActivityCreate: jest.fn(),
    onCommentActivityUpdate: jest.fn(),
    onCommentActivityDelete: jest.fn(),
    onClose: jest.fn(),
  };

  it('should display the github link as a clickable link when filled in', () => {
    const props = {
      ...defaultProps,
      githubLink: 'https://github.com/test/repo',
    };

    render(<CardModal {...props} />);

    const githubLink = screen.getByText('https://github.com/test/repo');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/test/repo');
  });

  it('should display a button to add github link when not filled in', () => {
    render(<CardModal {...defaultProps} />);

    const addButton = screen.getByText('Add Github Link');
    expect(addButton).toBeInTheDocument();
  });

  it('should display an input field when the add github link button is clicked', () => {
    render(<CardModal {...defaultProps} />);

    const addButton = screen.getByText('Add Github Link');
    fireEvent.click(addButton);

    const inputField = screen.getByPlaceholderText('Enter Github Link');
    expect(inputField).toBeInTheDocument();
  });

  it('should call onUpdate with the github link when the save button is clicked', () => {
    render(<CardModal {...defaultProps} />);

    const addButton = screen.getByText('Add Github Link');
    fireEvent.click(addButton);

    const inputField = screen.getByPlaceholderText('Enter Github Link');
    fireEvent.change(inputField, { target: { value: 'https://github.com/test/repo' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ githubLink: 'https://github.com/test/repo' });
  });

  it('should validate the github link format', () => {
    render(<CardModal {...defaultProps} />);

    const addButton = screen.getByText('Add Github Link');
    fireEvent.click(addButton);

    const inputField = screen.getByPlaceholderText('Enter Github Link');
    fireEvent.change(inputField, { target: { value: 'invalid-link' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(defaultProps.onUpdate).not.toHaveBeenCalled();
  });
});
