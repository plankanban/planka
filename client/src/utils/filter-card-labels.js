const getLabelIds = (card) =>
  card.labels.toRefArray
    ? card.labels.toRefArray().map((label) => label.id)
    : card.labels.map((label) => label.id);

const filterCardLabels = (cards, includedLabelIds, excludedLabelIds) =>
  cards.filter((card) => {
    const labelIds = getLabelIds(card);

    if (
      includedLabelIds.length > 0 &&
      !labelIds.some((labelId) => includedLabelIds.includes(labelId))
    ) {
      return false;
    }

    return !labelIds.some((labelId) => excludedLabelIds.includes(labelId));
  });

export default filterCardLabels;
