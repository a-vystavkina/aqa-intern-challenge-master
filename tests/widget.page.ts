import {Page} from "@playwright/test";

enum WidgetPageSelectors {
    WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test=openWidget]',
    BUTTON_WRITE_TO_US = 'button[class^=cbutton__]',
    ARTICLE_POPULAR_TITLE = '[class^=popularTitle__]',
    ARTICLE_POPULAR_LIST = `${ARTICLE_POPULAR_TITLE} + ul[class^=articles__]`,
    ARTICLE_POPULAR_LIST_ITEM = `${ARTICLE_POPULAR_LIST} > li`,
}

export class WidgetPage {
    static selector = WidgetPageSelectors;

    constructor(protected page: Page) {}

    wrapper() {
        return this.page.locator(WidgetPage.selector.WRAPPER)
    }

    async openWidget() {
        return this.wrapper().locator(WidgetPage.selector.BUTTON_OPEN).click();
    }

    async getPopularArticles() {
        // ждём, пока виджет прогрузит список популярных статей
        const list = this.getWidgetBody().locator(WidgetPage.selector.ARTICLE_POPULAR_LIST_ITEM);
        await list.first().waitFor({ state: 'visible' });
        return list.all();
    }

    async clickWriteToUs() {
        return this.getWidgetBody().locator(WidgetPage.selector.BUTTON_WRITE_TO_US).click();
    }

    async getTitle() {
        return this.getWidgetBody().locator(WidgetPage.selector.HEADER_TEXT).textContent();
    }

    getWidgetBody() {
        return this.page.locator(WidgetPage.selector.WIDGET_BODY);
    }
}

