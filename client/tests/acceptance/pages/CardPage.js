import Config from '../Config.js';

export default class CardPage {
  constructor() {
    this.addTaskButtonSelector = 'button[class*="taskButton"]';
    this.addTaskFieldSelector = 'textarea:focus';
  }

  async navigate(cardId) {
    await page.goto(`${Config.BASE_URL}/cards/${cardId}`);
  }

  async openAddTaskForm() {
    await page.click(this.addTaskButtonSelector);
    await page.waitForSelector(this.addTaskFieldSelector);
  }

  async pressEnterDuringImeComposition(text) {
    const session = await context.newCDPSession(page);

    await session.send('Input.imeSetComposition', {
      text,
      selectionStart: text.length,
      selectionEnd: text.length,
    });

    await session.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });

    await session.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });

    await session.detach();
  }
}
