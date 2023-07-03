import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Radio, Tab } from 'semantic-ui-react';
// import CryptoJS from 'crypto-js';

import styles from './TelegramPane.module.scss';

const getHashFromUsername = (username) => {
  return CryptoJS.SHA256(username).toString();
}

const TG_BOT_NAME = process.env.TG_BOT_NAME ?? "DebugTeamBoardBot"

const TelegramPane = React.memo(({ subscribeToOwnCards, onUpdate, username }) => {
  const [t] = useTranslation();

  const hashedUsername = "getHashFromUsername(username)";
  const botLink = `https://t.me/${TG_BOT_NAME}?start=${hashedUsername}`;

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <p><b>Бот телеграм</b></p>
      <p>
        Чтобы начать получать уведомления, выполните следующие шаги:
      </p>
      <ol>
        <li>Зайдите в бота и нажмите на кнопку "Старт"</li>
        <li>После этого вас перенаправят на страницу, где вам нужно будет подтвердить вашу личность.</li>
        <li>Следуйте инструкциям на странице, чтобы завершить процесс подтверждения.</li>
        <li>Как только вы успешно подтвердите свою личность, бот начнет присылать вам уведомления.</li>
      </ol>
      <a href={botLink} target="_blank" rel="noopener noreferrer">@{TG_BOT_NAME}</a>
    </Tab.Pane>
  );
});

TelegramPane.propTypes = {
  subscribeToOwnCards: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default TelegramPane;
