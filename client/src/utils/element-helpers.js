/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const focusEnd = (element) => {
  element.focus();
  element.setSelectionRange(element.value.length + 1, element.value.length + 1);
};

export const isActiveTextElement = (element) =>
  ['input', 'textarea'].includes(element.tagName.toLowerCase()) &&
  element === document.activeElement;

export const isUsableMarkdownElement = (element) =>
  !!element.closest('.yfm a, .yfm-clipboard-button, .yfm-cut-title');
