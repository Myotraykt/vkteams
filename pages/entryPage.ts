import { Locator, Page } from "@playwright/test";

export class EntryPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[type="text"]');
    this.nextButton = page.locator('button[type="submit"]');
  }

  async navigate() {
    await this.page.goto('https://myteam.mail.ru/webim/call.html?saas=1&call_id=8448fdae17b64623b8d62de7022bdee9');
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async proceedToLobby() {
    await this.nextButton.click();
  }
}