import { Locator, Page } from "@playwright/test";

export class LobbyPage {
  readonly page: Page;
  readonly joinButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.joinButton = page.locator('button.im-guests-calls-submit');
    this.backButton = page.locator('span.im-marker');
  }

  async joinConference() {
    await this.joinButton.click();
  }
}