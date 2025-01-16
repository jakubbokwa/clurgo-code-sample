// @ts-nocheck

import { expect, test } from "@playwright/test";

import { Config, extractNumbersFromString } from "./utils";

test.describe("Cart", () => {
  const config = new Config();
  const productData = {
    sku: "",
    title: "",
    price: 0,
  };

  test.beforeEach(async ({ page }) => {
    await config.init();
    await page.goto(config.getProductUrl(), { waitUntil: "networkidle" });
    productData.sku = config.getProductSku();
    productData.title =
      (await page
        .getByTestId(`product-title-${config.getProductSku()}`)
        .textContent()) ?? "";
    productData.price =
      extractNumbersFromString(
        (await page
          .getByTestId(`product-price-${config.getProductSku()}`)
          .textContent()) ?? ""
      ) ?? 0;
    await page.getByTestId("add-to-cart-button").click();
    await page.getByTestId("cart-qty").first().click();
  });

  test("Cart should be visible with image, proper title, proper price and proper quantity", async ({
    page,
  }) => {
    await expect(
      page
        .frameLocator('iframe[title="iframe"]')
        .getByTestId(`line-item-image-${config.getProductSku()}`)
    ).toBeVisible();

    await expect(
      page
        .frameLocator('iframe[title="iframe"]')
        .getByTestId(`line-item-name-${config.getProductSku()}`)
    ).toHaveText(`${productData.sku} ${productData.title}`);

    await expect(
      extractNumbersFromString(
        (await page
          .frameLocator('iframe[title="iframe"]')
          .locator('[data-test-id="subtotal-amount"]')
          .textContent()) ?? ""
      )
    ).toEqual(productData.price);

    await expect(
      await page
        .frameLocator('iframe[title="iframe"]')
        .locator('[data-test-id="input-spinner-element"]')
        .getAttribute("value")
    ).toEqual("1");
  });

  test("Increase and decrease buttons should work properly", async ({
    page,
  }) => {
    await page
      .frameLocator('iframe[title="iframe"]')
      .locator('[data-test-id="input-spinner-btn-increment"]')
      .click();

    await expect(
      await page
        .frameLocator('iframe[title="iframe"]')
        .locator('[data-test-id="input-spinner-element"]')
        .getAttribute("value")
    ).toEqual("2");

    await page.waitForTimeout(2000); // @TODO remove this timeout and find a better solution

    await expect(
      extractNumbersFromString(
        (await page
          .frameLocator('iframe[title="iframe"]')
          .locator('[data-test-id="subtotal-amount"]')
          .textContent()) ?? ""
      )
    ).toEqual(productData.price * 2);

    await page
      .frameLocator('iframe[title="iframe"]')
      .locator('[data-test-id="input-spinner-btn-decrement"]')
      .click();

    await expect(
      await page
        .frameLocator('iframe[title="iframe"]')
        .locator('[data-test-id="input-spinner-element"]')
        .getAttribute("value")
    ).toEqual("1");

    await page.waitForTimeout(2000); // @TODO remove this timeout and find a better solution

    await expect(
      extractNumbersFromString(
        (await page
          .frameLocator('iframe[title="iframe"]')
          .locator('[data-test-id="subtotal-amount"]')
          .textContent()) ?? ""
      )
    ).toEqual(productData.price);
  });

  test("Clicking on the remove button should remove the product from the cart", async ({
    page,
  }) => {
    await page
      .frameLocator('iframe[title="iframe"]')
      .locator('[data-test-id="button-remove-item"]')
      .click();

    await expect(
      page
        .frameLocator('iframe[title="iframe"]')
        .getByTestId(`line-item-image-${config.getProductSku()}`)
    ).not.toBeVisible();
  });

  test("Clicking on the checkout button should navigate to the checkout page", async ({
    page,
  }) => {
    await page
      .frameLocator('iframe[title="iframe"]')
      .locator('[data-test-id="button-checkout"]')
      .click();

    // eslint-disable-next-line security/detect-non-literal-regexp
    await expect(page).toHaveURL(new RegExp(config.getCheckoutUrl()));
  });
});
