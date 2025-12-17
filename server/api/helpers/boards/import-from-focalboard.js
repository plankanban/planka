/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    lists: {
      type: 'ref',
      required: true,
    },
    focalboardData: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const { focalboardData } = inputs;

    console.log('');
    console.log('=== Starting Focalboard Import ===');
    console.log(`Board: ${focalboardData.board?.title || 'Unknown'}`);
    console.log(`Total views: ${focalboardData.views.length}`);
    console.log(`Total cards: ${focalboardData.cards.length}`);
    console.log(`Total text blocks: ${focalboardData.textBlocks.length}`);

    // Find the board block
    const boardBlock = focalboardData.board;
    if (!boardBlock) {
      throw new Error('No board block found in Focalboard data');
    }

    // Find the Kanban view
    const kanbanView = focalboardData.views.find(
      (view) => view.fields.viewType === 'board'
    );
    if (!kanbanView) {
      throw new Error('No Kanban view found in Focalboard data');
    }
    console.log(`Using Kanban view: ${kanbanView.title}`);

    // Find the column property (the one used for grouping in Kanban view)
    const columnPropertyId = kanbanView.fields.groupById;
    if (!columnPropertyId) {
      throw new Error('No groupById property found in Kanban view');
    }

    const columnProperty = boardBlock.cardProperties.find(
      (prop) => prop.id === columnPropertyId
    );
    if (!columnProperty) {
      throw new Error('Column property not found in board');
    }
    console.log(`Column property: ${columnProperty.name} (${columnProperty.type})`);
    console.log(`Total column options: ${columnProperty.options.length}`);

    // Create lists from visible column options
    const visibleOptionIds = kanbanView.fields.visibleOptionIds || [];
    const listIdByOptionId = {};

    console.log('');
    console.log('--- Creating Lists ---');
    console.log(`Visible columns: ${visibleOptionIds.length}`);

    let createdListsCount = 0;
    await Promise.all(
      visibleOptionIds.map(async (optionId, index) => {
        // Empty string in visibleOptionIds represents cards without a column value
        if (optionId === '') {
          console.log(`  [${index}] Skipping empty option ID`);
          return;
        }

        const option = columnProperty.options.find((opt) => opt.id === optionId);
        if (!option) {
          console.log(`  [${index}] Option not found: ${optionId}`);
          return;
        }

        const { id } = await List.qm.createOne({
          boardId: inputs.board.id,
          type: List.Types.ACTIVE,
          position: POSITION_GAP * (index + 1),
          name: option.value,
        });

        listIdByOptionId[optionId] = id;
        createdListsCount++;
        console.log(`  [${index}] Created list: "${option.value}" (position: ${POSITION_GAP * (index + 1)})`);
      })
    );

    console.log(`Created ${createdListsCount} lists`);

    // Create an "Unordered" list for cards not in cardOrder or without column
    const { id: unorderedListId } = await List.qm.createOne({
      boardId: inputs.board.id,
      type: List.Types.ACTIVE,
      position: POSITION_GAP * (visibleOptionIds.length + 1),
      name: 'Unordered',
    });
    console.log(`Created "Unordered" list (position: ${POSITION_GAP * (visibleOptionIds.length + 1)})`);

    // Get archive list
    const { id: archiveListId } = inputs.lists.find(
      (list) => list.type === List.Types.ARCHIVE
    );

    console.log('');
    console.log('--- Grouping Cards by Column ---');

    // Group cards by their column value
    const cardsByColumn = {};
    const cardOrder = kanbanView.fields.cardOrder || [];

    console.log(`Cards in cardOrder: ${cardOrder.length}`);

    // Initialize column groups
    visibleOptionIds.forEach((optionId) => {
      if (optionId !== '') {
        cardsByColumn[optionId] = [];
      }
    });
    cardsByColumn['unordered'] = [];

    // Process cards in the order defined by cardOrder
    let cardsInOrder = 0;
    let cardsWithoutColumn = 0;
    cardOrder.forEach((cardId) => {
      const card = focalboardData.cards.find((c) => c.id === cardId);
      if (!card) {
        return;
      }

      cardsInOrder++;
      const columnValue = card.fields.properties[columnPropertyId];

      if (columnValue && listIdByOptionId[columnValue]) {
        cardsByColumn[columnValue].push(card);
      } else {
        cardsByColumn['unordered'].push(card);
        cardsWithoutColumn++;
      }
    });

    console.log(`Cards processed from cardOrder: ${cardsInOrder}`);

    // Add cards not in cardOrder to unordered
    let cardsNotInOrder = 0;
    focalboardData.cards.forEach((card) => {
      if (!cardOrder.includes(card.id)) {
        cardsByColumn['unordered'].push(card);
        cardsNotInOrder++;
      }
    });

    if (cardsNotInOrder > 0) {
      console.log(`Cards not in cardOrder (added to Unordered): ${cardsNotInOrder}`);
    }
    if (cardsWithoutColumn > 0) {
      console.log(`Cards without column assignment: ${cardsWithoutColumn}`);
    }

    // Log distribution
    console.log('');
    console.log('Card distribution by list:');
    for (const [columnKey, cards] of Object.entries(cardsByColumn)) {
      if (cards.length > 0) {
        if (columnKey === 'unordered') {
          console.log(`  Unordered: ${cards.length} cards`);
        } else {
          const option = columnProperty.options.find((opt) => opt.id === columnKey);
          console.log(`  ${option?.value || columnKey}: ${cards.length} cards`);
        }
      }
    }

    console.log('');
    console.log('--- Importing Cards ---');

    // Create cards
    const cardIdByFocalboardCardId = {};
    let totalCardsCreated = 0;
    let cardsWithoutTitle = 0;
    let cardsWithDescription = 0;

    for (const [columnKey, cards] of Object.entries(cardsByColumn)) {
      const listId = columnKey === 'unordered'
        ? unorderedListId
        : listIdByOptionId[columnKey];

      if (!listId) {
        continue;
      }

      if (cards.length === 0) {
        continue;
      }

      const listName = columnKey === 'unordered'
        ? 'Unordered'
        : columnProperty.options.find((opt) => opt.id === columnKey)?.value || columnKey;

      console.log(`Processing list "${listName}"...`);

      await Promise.all(
        cards.map(async (focalboardCard, index) => {
          let cardName = focalboardCard.title?.trim();
          if (!cardName) {
            cardName = 'Untitled';
            console.log(`  ⚠ Card with empty title, using "Untitled" (ID: ${focalboardCard.id})`);
            cardsWithoutTitle++;
          }
          // Find description from text blocks
          const textBlocks = focalboardData.textBlocks.filter(
            (block) => block.parentId === focalboardCard.id
          );

          // Only create description if we have non-empty text blocks
          let description = null;
          if (textBlocks.length > 0) {
            const descriptionText = textBlocks
              .map((block) => block.title?.trim())
              .filter((text) => text) // Remove empty/null values
              .join('\n\n');

            // Only set description if we got actual content
            if (descriptionText) {
              description = descriptionText;
              cardsWithDescription++;
            }
          }

          const values = {
            boardId: inputs.board.id,
            type: Card.Types.PROJECT,
            position: POSITION_GAP * (index + 1),
            name: cardName,
            description,
            listChangedAt: new Date(focalboardCard.updateAt).toISOString(),
          };

          values.listId = listId;

          const { id } = await Card.qm.createOne(values);
          cardIdByFocalboardCardId[focalboardCard.id] = id;
          totalCardsCreated++;
        })
      );

      console.log(`  ✓ Created ${cards.length} cards`);
    }

    console.log('');
    console.log('=== Import Complete ===');
    console.log(`Total cards imported: ${totalCardsCreated}`);
    if (cardsWithoutTitle > 0) {
      console.log(`Cards without title (named "Untitled"): ${cardsWithoutTitle}`);
    }
    console.log(`Lists created: ${createdListsCount + 1} (including Unordered)`);
    console.log('');
  },
};
