import { test, expect } from '@playwright/test';
import {WidgetPage} from "./widget.page";

test.describe('Uchi.ru widget ', () => {
  let widgetPage: WidgetPage;

  test.beforeEach(async ({page}) => {
    widgetPage = new WidgetPage(page);

    // open uchi.ru main page
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // the widget script (help.uchi.ru) can load slowly or fail;
    // retry loading the page until the widget's open button appears
    const openButton = page.locator('[data-test=openWidget]');
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await openButton.count() > 0) break;
      try {
        await openButton.waitFor({ state: 'attached', timeout: 20_000 });
        break;
      } catch {
        // page/context may already be closed if the test has timed out
        if (page.isClosed()) return;
        await page.goto('/', { waitUntil: 'domcontentloaded' });
      }
    }

    // close cookies popup if it appears (it shows up with a random delay,
    // and sometimes does not show up at all on repeat visits)
    const cookieButton = page.locator('._UCHI_COOKIE__button').first();
    const cookieShown = await cookieButton.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
    if (cookieShown) {
      await cookieButton.click();
    }
  });

  test('opens', async ({page}) => {
    await widgetPage.openWidget();

    await expect(widgetPage.getWidgetBody()).toBeVisible()
  });

  test('has correct title', async ({ page }) => {
    await widgetPage.openWidget();

    const articles = await widgetPage.getPopularArticles();

    await articles[0].click();

    await widgetPage.clickWriteToUs();

    await expect(await widgetPage.getTitle()).toEqual('Связь с поддержкой');
  });

  // дополнительный тест: кнопка «Назад» на экране статьи возвращает
  // к стартовому экрану виджета («База знаний Учи.ру»)
  test('back button returns to start screen', async ({ page }) => {
    await widgetPage.openWidget();

    // ждём появления списка популярных статей и кликаем первую
    const article = widgetPage.getWidgetBody()
      .locator('[class^=popularTitle__] + ul[class^=articles__] > li')
      .first();
    await article.click();

    // на экране статьи появляется кнопка «Назад»
    const backButton = widgetPage.getWidgetBody().locator('[data-test=button_back]');
    await expect(backButton).toBeVisible();

    await backButton.click();

    await expect(await widgetPage.getTitle()).toEqual('База знаний Учи.ру');
  });
});
