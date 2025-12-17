/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const { rimraf } = require('rimraf');
const readline = require('readline');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    console.log('');
    console.log('=== Processing Focalboard JSONL File ===');

    const fileStream = fs.createReadStream(inputs.file.fd);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const blocks = {
      board: null,
      views: [],
      cards: [],
      textBlocks: [],
    };

    // To log
    let lineCount = 0;
    let emptyLines = 0;
    let parseErrors = 0;
    const unknownBlockTypes = new Set()

    try {
      for await (const line of rl) {
        lineCount++;

        if (!line.trim()) {
          emptyLines++;
          continue;
        }

        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch (error) {
          parseErrors++;
          console.warn(`Parse error on line ${lineCount}: ${error.message}`);
          await rimraf(inputs.file.fd);
          throw 'invalidFile';
        }

        // Focalboard exports have two formats (for this version):
        // 1. Board: {"type":"board","data":{...}}
        // 2. Blocks: {"type":"block","data":{...}}

        let block;
        if (parsed.type === 'board' && parsed.data) {
          // Board is exported as type: "board"
          block = parsed.data;
          blocks.board = block;
          console.log(`Found board: "${block.title}"`);
          continue;
        } else if (parsed.type === 'block' && parsed.data) {
          // Other blocks are type: "block"
          block = parsed.data;
        } else {
          console.warn(`Skipping line ${lineCount}: not a valid structure (type: ${parsed.type})`);
          continue;
        }

        switch (block.type) {
          case 'board':
            blocks.board = block;
            console.log(`Found board: "${block.title}"`);
            break;
          case 'view':
            blocks.views.push(block);
            console.log(`Found view: "${block.title}" (type: ${block.fields?.viewType || 'unknown'})`);
            break;
          case 'card':
            blocks.cards.push(block);
            break;
          case 'text':
            blocks.textBlocks.push(block);
            break;
          // We can ignore other block types for now (comment, attachment, etc.)
          default:
            break;
        }
      }
    } catch (error) {
      await rimraf(inputs.file.fd);
      if (error === 'invalidFile') {
        throw error;
      }
      console.error('Unexpected error:', error);
      throw 'invalidFile';
    }

    await rimraf(inputs.file.fd);

    console.log('');
    console.log('--- Parsing Summary ---');
    console.log(`Total lines: ${lineCount}`);
    console.log(`Empty lines: ${emptyLines}`);
    console.log(`Board blocks: ${blocks.board ? 1 : 0}`);
    console.log(`View blocks: ${blocks.views.length}`);
    console.log(`Card blocks: ${blocks.cards.length}`);
    console.log(`Text blocks: ${blocks.textBlocks.length}`);

    if (unknownBlockTypes.size > 0) {
      console.log(`Unknown block types (ignored): ${Array.from(unknownBlockTypes).join(', ')}`);
    }

    if (parseErrors > 0) {
      console.warn(`Parse errors: ${parseErrors}`);
    }

    // Validate that we have the minimum required data
    if (!blocks.board) {
      console.error('ERROR: No board block found');
      throw 'invalidFile';
    }

    if (blocks.views.length === 0) {
      console.error('ERROR: No view blocks found');
      throw 'invalidFile';
    }

    if (blocks.cards.length === 0) {
      console.error('ERROR: No card blocks found');
      throw 'invalidFile';
    }

    console.log('✓ File validated successfully');
    console.log('');

    return blocks;
  },
};
