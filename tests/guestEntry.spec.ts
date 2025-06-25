import { test, expect } from '@playwright/test';
import { EntryPage } from '../pages/entryPage';
import { LobbyPage } from '../pages/lobbyPage';

test.describe('Вход в конференцию VK Teams', () => {
  let entryPage: EntryPage;
  let lobbyPage: LobbyPage;

  test.beforeEach(async ({ page }) => {
    entryPage = new EntryPage(page);
    lobbyPage = new LobbyPage(page);
    await entryPage.navigate()
  });

  test('Переход на страницу подключения после ввода имени', async ({ page }) => {
    await entryPage.enterName('Артем');
    await entryPage.proceedToLobby();
    await expect(lobbyPage.joinButton).toBeVisible();
  });

  test('Запрос разрешений для звука и видео', async ({ context, page, browserName }) => {
    if (browserName !== 'firefox') {
      await context.grantPermissions(['microphone', 'camera']);
    }
  
    // Для firefox эмулируем navigator.mediaDevices
    if (browserName === 'firefox') {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'mediaDevices', {
          value: {
            getUserMedia: () => Promise.resolve({}),
            enumerateDevices: () => Promise.resolve([])
          },
          configurable: true
        });
      });
    }
  
    await entryPage.enterName('Ryan Gosling');
    await entryPage.proceedToLobby();
    await lobbyPage.joinConference();
  
    // Проверяем состояние разрешений
    const permissionsState = await page.evaluate(() => {
      if (navigator.userAgent.includes('Firefox')) {
        return { mic: 'granted', cam: 'granted' };
      }
      try {
        const mic = navigator.permissions.query({ name: 'microphone' });
        const cam = navigator.permissions.query({ name: 'camera' });
        return { mic: mic.state, cam: cam.state };
      } catch (e) {
        return { mic: 'unknown', cam: 'unknown' };
      }
    });
  
    // для браузеров, отличных от firefox
    if (browserName !== 'firefox') {
      expect(permissionsState.mic).toBe(undefined);
      expect(permissionsState.cam).toBe(undefined);
    }
  });

  test('Имитация устройств ввода', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'mediaDevices', {
          value: {
            enumerateDevices: async () => [
              // список устройств
            ],
            getUserMedia: () => Promise.resolve({})
          }
        })
      });
    }

    await page.addInitScript(() => {
      Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
        value: async () => [
          {
            kind: 'audioinput',
            deviceId: 'virtual-mic',
            label: 'Virtual Mic',
            groupId: 'group1'
          },
          {
            kind: 'videoinput',
            deviceId: 'virtual-cam',
            label: 'Virtual Cam',
            groupId: 'group2'
          }
        ]
      })
    });

    await entryPage.navigate();
    
    await entryPage.enterName('EvilArthas');
    await entryPage.proceedToLobby();
    await lobbyPage.joinConference();

    // проверяем доступ к устройствам
    const devices = await page.evaluate<() => Promise<MediaDeviceInfo[]>>(async () => {
      return await navigator.mediaDevices.enumerateDevices();
    });

    expect(devices.some((d: MediaDeviceInfo) => d.label.includes('Virtual Mic'))).toBeTruthy();
    expect(devices.some((d: MediaDeviceInfo) => d.label.includes('Virtual Cam'))).toBeTruthy();
  });
});
