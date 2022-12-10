const fs = require('fs');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const isValidTrelloFile = (content) =>
      content &&
      Array.isArray(content.lists) &&
      Array.isArray(content.cards) &&
      Array.isArray(content.checklists) &&
      Array.isArray(content.actions);

    return new Promise((resolve, reject) => {
      fs.readFile(inputs.file.fd, (err, data) => {
        try {
          const exp = data && JSON.parse(data);
          if (err) {
            reject(err);
          } else if (isValidTrelloFile(exp)) {
            resolve(exp);
          } else {
            reject(new Error('Invalid Trello File'));
          }
        } catch (e) {
          reject(new Error(e));
        }
      });
    });
  },
};
