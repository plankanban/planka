import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Loader, Message } from 'semantic-ui-react';

import Config from '../../constants/Config';
import KanbanBoard from './KanbanBoard';
import styles from './PublicBoard.module.scss';

const PublicBoard = React.memo(() => {
  const { publicId } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicBoard = async () => {
      try {
        const response = await fetch(`${Config.SERVER_BASE_URL}/api/public-boards/${publicId}`);

        if (!response.ok) {
          throw new Error('Board not found or not public');
        }

        const data = await response.json();
        setBoardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBoard();
  }, [publicId]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Loader active size="massive" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <Message error>
          <Message.Header>Board Not Available</Message.Header>
          <p>{error}</p>
        </Message>
      </div>
    );
  }

  if (!boardData) {
    return null;
  }

  const { item: board, included } = boardData;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.boardName}>{board.name}</h1>
        <div className={styles.badge}>Read Only - Public View</div>
      </div>
      <div className={styles.content}>
        <KanbanBoard board={board} included={included} isPublic />
      </div>
    </div>
  );
});

export default PublicBoard;
