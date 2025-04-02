import { test, expect } from '@playwright/test';

/**
 * E2E тесты для потока работы с функциями приватности
 */
test.describe('Потоки работы с приватностью', () => {
  // Имитация пользователя из Калифорнии
  test.beforeEach(async ({ page }) => {
    // Устанавливаем localStorage, чтобы симулировать пользователя из Калифорнии
    await page.addInitScript(() => {
      localStorage.setItem('userRegion', 'CA');
    });
  });

  test('Баннер CCPA отображается для пользователя из Калифорнии', async ({ page }) => {
    // Перейти на главную страницу
    await page.goto('/');
    
    // Проверить наличие баннера CCPA
    const banner = page.locator('text=California Consumer Privacy Act Notice');
    await expect(banner).toBeVisible();
    
    // Проверить наличие кнопки "Do Not Sell My Data"
    const doNotSellButton = page.locator('text=Do Not Sell My Data');
    await expect(doNotSellButton).toBeVisible();
  });

  test('Пользователь может принять условия приватности', async ({ page }) => {
    // Перейти на главную страницу
    await page.goto('/');
    
    // Нажать на кнопку "Accept"
    await page.click('text=Accept');
    
    // Проверить, что баннер исчезает
    const banner = page.locator('text=California Consumer Privacy Act Notice');
    await expect(banner).not.toBeVisible();
    
    // Проверить, что значение сохранено в localStorage
    const value = await page.evaluate(() => localStorage.getItem('ccpaBannerSeen'));
    expect(value).toBe('true');
  });

  test('Пользователь может отказаться от продажи своих данных', async ({ page }) => {
    // Перейти на главную страницу
    await page.goto('/');
    
    // Нажать на кнопку "Do Not Sell My Data"
    await page.click('text=Do Not Sell My Data');
    
    // Проверить, что появляется сообщение об успехе
    const successMessage = page.locator('text=Your preference has been saved');
    await expect(successMessage).toBeVisible();
    
    // Проверить, что установлено значение в localStorage
    const value = await page.evaluate(() => {
      const settings = localStorage.getItem('privacySettings');
      return settings ? JSON.parse(settings).doNotSell : null;
    });
    expect(value).toBe(true);
  });

  test('Пользователь может перейти на страницу выбора приватности и заполнить форму', async ({ page }) => {
    // Перейти на страницу выбора приватности
    await page.goto('/privacy-choices');
    
    // Проверить, что отображается заголовок CCPA
    const heading = page.locator('text=California Consumer Privacy Act (CCPA)');
    await expect(heading).toBeVisible();
    
    // Заполнить форму
    await page.fill('[type="email"]', 'test@example.com');
    
    // Выбрать опцию отказа от продажи данных
    await page.click('text=Do not sell my personal information');
    
    // Отправить форму
    await page.click('text=Submit Request');
    
    // Проверить сообщение об успехе
    const successMessage = page.locator('text=Your request has been processed successfully');
    await expect(successMessage).toBeVisible();
  });

  test('Пользователь может запросить удаление своих данных', async ({ page }) => {
    // Перейти на страницу выбора приватности
    await page.goto('/privacy-choices');
    
    // Заполнить форму
    await page.fill('[type="email"]', 'test@example.com');
    
    // Выбрать опцию удаления данных
    await page.click('text=Delete my personal data');
    
    // Отправить форму
    await page.click('text=Submit Request');
    
    // Проверить сообщение об успехе
    const successMessage = page.locator('text=Your request has been processed successfully');
    await expect(successMessage).toBeVisible();
  });
}); 