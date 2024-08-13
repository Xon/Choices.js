import { expect, type Locator, type Page } from '@playwright/test';

export class TestSuit {
  readonly testId: string;

  readonly url: string;

  readonly page: Page;

  readonly group: Locator;

  readonly input: Locator;

  readonly wrapper: Locator;

  readonly itemList: Locator;

  readonly items: Locator;

  readonly dropdown: Locator;

  constructor(page: Page, url: string, testId: string) {
    this.testId = testId;
    this.url = url;
    this.page = page;
    this.group = page.getByTestId(this.testId);
    this.input = this.group.locator('input[type="search"]');
    this.wrapper = this.group.locator('.choices').first();
    this.itemList = this.group.locator('.choices__list.choices__list--multiple, .choices__list.choices__list--single');
    this.items = this.itemList.locator('.choices__item:not(.choices__placeholder)');
    this.dropdown = this.group.locator('.choices__list.choices__list--dropdown');
  }

  async start(textInput?: string): Promise<void> {
    // disable google analytics, as it can weirdly fail sometimes
    await this.page.route('https://www.google-analytics.com/analytics.js', (route) => route.abort('blockedbyresponse'));

    await this.page.goto(this.url);

    if (textInput) {
      await this.typeTextAndEnter(textInput);
    }
  }

  async select(textInput?: string): Promise<void> {
    await this.wrapper.focus();
    if (textInput) {
      await this.input.pressSequentially(textInput);
    } else {
      await this.enterKey();
    }
  }

  async selectClick(): Promise<void> {
    await this.wrapper.click();
  }

  async typeTextAndEnter(textInput: string): Promise<void> {
    await this.typeText(textInput);
    await this.enterKey();
  }

  async typeText(textInput: string): Promise<void> {
    await this.input.focus();
    await this.input.fill(textInput);
  }

  async ctrlA(): Promise<void> {
    await this.input.focus();
    await this.input.press('ControlOrMeta+a');
  }

  async enterKey(): Promise<void> {
    await this.input.focus();
    await this.input.press('Enter');
  }

  async backspaceKey(): Promise<void> {
    await this.input.focus();
    await this.input.press('Backspace');
  }

  /**
   * Currently flaky, may indicate the dropdown isn't reliably appearing
   */
  async expectVisibleDropdown(text?: string): Promise<void> {
    if (text) {
      await expect(this.dropdown).toHaveText(text);
    }

    await this.dropdown.waitFor({ state: 'visible' });

    await expect(this.dropdown).toBeVisible();
  }

  async expectHiddenDropdown(): Promise<void> {
    await this.dropdown.waitFor({ state: 'hidden' });
    await expect(this.dropdown).toBeHidden();
  }

  // eslint-disable-next-line class-methods-use-this
  getWrappedElement(): Locator {
    throw new Error('Not implemented');
  }

  async expectedValue(text: string) {
    if (text !== '') {
      await expect(this.items.filter({ hasText: text })).not.toHaveCount(0);
    }

    expect(await this.getWrappedElement().inputValue()).toEqual(text);
  }

  async expectedItemCount(count: number) {
    await expect(this.items).toHaveCount(count);
  }
}