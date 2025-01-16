// @ts-nocheck

import { expect, test } from "@playwright/test";
import { Config, extractNumbersFromString } from "./utils";

test.describe("Checkout", () => {
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
    await page
      .frameLocator('iframe[title="iframe"]')
      .locator('[data-test-id="button-checkout"]')
      .click();
  });

  test("Checkout page should be visible with image, proper title and price", async ({
    page,
  }) => {
    await expect(
      page.getByTestId(`line-item-image-${config.getProductSku()}`)
    ).toBeVisible();

    await expect(
      page.getByTestId(`line-item-name-${config.getProductSku()}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`line-item-name-${config.getProductSku()}`)
    ).toHaveText(`${productData.sku} ${productData.title}`);

    await expect(page.getByTestId("total-amount")).toBeVisible();
    await expect(
      extractNumbersFromString(
        (await page.getByTestId("total-amount").textContent()) ?? ""
      )
    ).toEqual(productData.price);
  });

  test("Check if an error message appears, when we use a wrong promo code", async ({
    page,
  }) => {
    await expect(page.getByTestId("input_giftcard_coupon")).toBeVisible();
    await page.getByTestId("input_giftcard_coupon").fill("wrong-promo-code");

    await page.getByTestId("submit_giftcard_coupon").click();

    await expect(page.getByTestId("discount-error")).toBeVisible();
  });

  test("Check if the continue button is disabled if not all required fields have been filled in", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("save-customer-button")).toBeDisabled();
  });
});
