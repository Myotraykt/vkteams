import { Locator, Page } from "@playwright/test";

export class EntryPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly nextButton: Locator;
  readonly errorMessageShort: Locator;
  readonly errorMessageLong: Locator;
  readonly errorMessageEmpty: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[type="text"]');
    this.nextButton = page.locator('button[type="submit"]');
    this.errorMessageShort = page.locator('text=/Имя должно состоять не меньше чем из двух букв|The name must be at least two letters long/');
    this.errorMessageLong = page.locator('text=/Имя не может быть длиннее 64 символов|The name cannot be longer than 64 characters/');
    this.errorMessageEmpty = page.locator('.imAuthError >> text=/Введите имя|Enter your name/');
  }

  // переход по ссылке на сайт
  async navigate() {
    await this.page.goto('https://myteam.mail.ru/webim/call.html?saas=1&call_id=8448fdae17b64623b8d62de7022bdee9');
  }

  // ввод имени
  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  // переход но страницу звонка
  async proceedToLobby() {
    await this.nextButton.click();
  }

  // ошибка, если ввести короткое имя (<2 букв)
  async getErrorMessageShort() {
    return {
      text: await this.errorMessageShort.textContent(),
      validValues: ['Имя должно состоять не меньше чем из двух букв', 'The name must be at least two letters long']
    };
  }
  // ошибка, если ввести длинное имя (64< букв)
  async getErrorMessageLong() {
    return {
      text: await this.errorMessageLong.textContent(),
      validValues: ['Имя не может быть длиннее 64 символов', 'The name cannot be longer than 64 characters']
    };
  }

  // ошибка, если не ввести ничего (пробелы не считаются)
  async getErrorMessageEmpty() {
    return {
      text: await this.errorMessageEmpty.textContent(),
      validValues: ['Введите имя', 'Enter your name']
    };
  }
}