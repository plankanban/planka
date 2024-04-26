import { useState } from 'react';
import { TagRegex } from '../components/Tag/Tag';

export default () => {
  const [mention, setMention] = useState('');
  const [isMentioning, setIsMentioning] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);

  const getWord = (s, pos) => {
    const n = s.substring(pos).match(/^[^ ]+/);
    const p = s.substring(0, pos).match(/[^ ]+$/);
    // if you really only want the word if you click at start or between
    // but not at end instead use if (!n) return
    if (!p && !n) return '';
    return (p || '') + (n || '');
  };

  const onChange = (ev) => {
    TagRegex.lastIndex = 0;

    const position = ev.target.selectionStart;
    const word = getWord(ev.target.value, position);
    setCurrentPos(position);

    if (TagRegex.test(word)) {
      // Extract the mention after @ symbol
      const mentionSymbols = word.split('@');
      const mentionName = mentionSymbols[mentionSymbols.length - 1].split(' ')[0].toLowerCase();
      setMention(mentionName);
      setIsMentioning(true);
    } else {
      setMention('');
      setIsMentioning(false);
    }
  };

  const onSelectMention = (text, user) => {
    if (!isMentioning) return text;

    const { username, email } = user;
    const userTag = username ?? email;
    const wordLength = getWord(text, currentPos).length;

    const n = text.substring(currentPos).match(/^[^ ]+/);
    const p = text.substring(0, currentPos).match(/[^ ]+$/);

    const startIndex = p ? p.index : n.index;

    setIsMentioning(false);
    return `${text.substring(0, startIndex)}[@${userTag}]${text.substring(startIndex + wordLength)}`;
  };

  return {
    mention,
    isMentioning,
    onChange,
    onSelectMention,
  };
};
