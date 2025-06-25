import { test, expect } from '@playwright/test';
import { EntryPage } from '../pages/entryPage';
import { LobbyPage } from '../pages/lobbyPage';

// так как у меня нет доступа к коду продукта, по сути это является тестированием черного ящика. 
// сайт обрабатывает символы очень странно - за буквы считаются только кириллица и латиница.
// если в имени будет меньше 2 букв - валидация не пройдет, но ошибка будет указаывать, что имя должно состоять не меньше, чем из двух букв.
// поэтому я написал тесты со спецсимволами и цифрами - но ошибка будет та же. не знаю, баг это или фича.
// подробнее об этой дилемме я распишу в TESTCASES.md
test.describe('Валидация поля вводимого имени', () => {
  let entryPage: EntryPage;
  let lobbyPage: LobbyPage;

  test.beforeEach(async ({ page }) => {
    entryPage = new EntryPage(page);
    lobbyPage = new LobbyPage(page);
    await entryPage.navigate();
  });

  test('Успешный ввод валидного имени', async () => {
    await entryPage.enterName('Артем (Почт)');
    await entryPage.proceedToLobby();
    await expect(lobbyPage.joinButton).toBeVisible();
  });

  test('Пустое имя - отображается ошибка', async () => {
    await entryPage.enterName('');
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageEmpty();
    expect(error.validValues).toContain(error.text);
  });

  test('Один символ - отображается ошибка', async () => {
    await entryPage.enterName('А');
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageShort();
    expect(error.validValues).toContain(error.text);
  });

  test('Два символа - успешный ввод', async () => {
    await entryPage.enterName('Ар');
    await entryPage.proceedToLobby();
    await expect(lobbyPage.joinButton).toBeVisible();
  });

  test('Слшком длинное имя - отображается ошибка', async () => {
    const maxLength = 64;
    const longName = 'A'.repeat(maxLength + 1);

    await entryPage.enterName(longName);
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageLong();
    expect(error.validValues).toContain(error.text);
  });

  // можно вводить любой символ, 
  test('Спецсимволы - отображается ошибка', async () => {
    await entryPage.enterName('@#$%');
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageShort();
    expect(error.validValues).toContain(error.text);
  });

  test('Цифры - отображается ошибка', async () => {
    await entryPage.enterName('123');
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageShort();
    expect(error.validValues).toContain(error.text);
  });

  // тут стоит уточнить, что пробелы !== пустому символу, и парсятся как полноценный символ
  test('Пробелы - отображается ошибка', async () => {
    await entryPage.enterName('   ');
    await entryPage.proceedToLobby();
    const error = await entryPage.getErrorMessageShort();
    expect(error.validValues).toContain(error.text);
  });
});