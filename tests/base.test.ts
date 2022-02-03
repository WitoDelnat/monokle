import {Page} from 'playwright';
import {expect, test} from '@playwright/test';
import {
  waitForDrawerToHide,
  waitForDrawerToShow,
} from './antdHelpers';
import {clickOnMonokleLogo, ElectronAppInfo, startApp} from './electronHelpers';
import {pause} from './utils';

let appWindow: Page = {} as any;
let appInfo: ElectronAppInfo = {} as any;

test.beforeAll(async () => {
  const startAppResponse = await startApp();
  appWindow = startAppResponse.appWindow;
  appInfo = startAppResponse.appInfo;
});

test.beforeEach(async () => {
  await pause(1000);
});

test.afterEach(async () => {
  await pause(1000);
  appWindow.on('console', console.log);
});

test('Validate title', async () => {
  const title = await appWindow.title();
  expect(title).toBe('Monokle');
});

test('Validate footer', async () => {
  const footer = appWindow.locator('footer');
  await expect(footer).toContainText('Monokle');
  await expect(footer).toContainText('kubeshop.io');
});

test('Validate logo', async () => {
  const img = appWindow.locator("img[src*='MonokleKubeshopLogo'][src$='.svg']");
  expect(await img.count()).toBe(1);
});

test('Validate icons', async () => {
  let span = appWindow.locator("span[aria-label='question-circle']");
  expect(await span.count()).toBe(1);

  span = appWindow.locator("span[aria-label='bell']");
  expect(await span.count()).toBe(1);

  span = appWindow.locator("span[aria-label='setting']");
  expect(await span.count()).toBe(1);
});

test('Validate ClusterContainer', async () => {
  const div = appWindow.locator("div[id='ClusterContainer']");
  expect(await div.count()).toBe(1);
});

test.skip('Validate settings drawer', async () => {
  const settingsTitle = appWindow.locator('.ant-drawer-open .ant-drawer-title');
  expect(await settingsTitle.isVisible()).toBe(false);

  await appWindow.click("span[aria-label='setting']", {noWaitAfter: true, force: true});
  await pause(20000);
  expect(await settingsTitle.isVisible()).toBe(true);

  await clickOnMonokleLogo(appWindow);
  await pause(20000);
  expect(await settingsTitle.isVisible()).toBe(false);
});

test('Validate notifications drawer', async () => {
  appWindow.click("//span[@aria-label='bell' and contains(@class,'anticon')]", {
    noWaitAfter: true,
    force: true,
  });

  expect(await waitForDrawerToShow(appWindow, 'Notifications', 5000)).toBeTruthy();
  await clickOnMonokleLogo(appWindow);

  expect(await waitForDrawerToHide(appWindow, 'Notifications')).toBeTruthy();
});

test.afterAll(async () => {
  await appWindow.screenshot({path: `test-output/${appInfo.platform}/screenshots/final-screen.png`});
  await appWindow.context().close();
  await appWindow.close();
});
