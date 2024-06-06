// eslint-disable-next-line import/prefer-default-export
export const focusEnd = (element) => {
  element.focus();
  element.setSelectionRange(element.value.length + 1, element.value.length + 1);
};
