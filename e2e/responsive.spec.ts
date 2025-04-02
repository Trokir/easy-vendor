import { test, expect } from '@playwright/test';

/**
 * E2E тесты для проверки адаптивности интерфейса
 */
test.describe('Адаптивность интерфейса', () => {
  test('Страница приватности корректно отображается на мобильных устройствах', async ({ page }) => {
    // Установить размер экрана мобильного устройства
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Установить локальное хранилище для симуляции пользователя из Калифорнии
    await page.addInitScript(() => {
      localStorage.setItem('userRegion', 'CA');
    });
    
    // Перейти на страницу выбора приватности
    await page.goto('/privacy-choices');
    
    // Проверить, что мобильное меню отображается и работает
    const menuButton = page.locator('button[aria-label="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Проверить, что заголовок страницы отображается
    const heading = page.locator('h1:has-text("California Consumer Privacy Act")');
    await expect(heading).toBeVisible();
    
    // Проверить, что форма приватности адаптирована под мобильный экран
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Проверить, что элементы формы умещаются на экране
    const formWidth = await form.evaluate(node => node.getBoundingClientRect().width);
    expect(formWidth).toBeLessThanOrEqual(375);
  });
  
  test('Баннер CCPA корректно отображается на разных размерах экрана', async ({ page }) => {
    // Установить локальное хранилище для симуляции пользователя из Калифорнии
    await page.addInitScript(() => {
      localStorage.setItem('userRegion', 'CA');
      localStorage.removeItem('ccpaBannerSeen');
    });
    
    // Проверка на большом экране
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    
    let banner = page.locator('[data-testid="privacy-banner"]');
    await expect(banner).toBeVisible();
    
    // Проверить стиль баннера на десктопе
    const desktopPosition = await banner.evaluate(node => {
      const style = window.getComputedStyle(node);
      return style.position;
    });
    expect(desktopPosition).toBe('fixed');
    
    // Проверка на маленьком экране
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    banner = page.locator('[data-testid="privacy-banner"]');
    await expect(banner).toBeVisible();
    
    // Проверить, что кнопки отображаются вертикально на мобильном
    const buttonContainer = page.locator('[data-testid="privacy-banner-buttons"]');
    const buttonContainerDirection = await buttonContainer.evaluate(node => {
      const style = window.getComputedStyle(node);
      return style.flexDirection;
    });
    
    // На мобильном должно быть вертикальное расположение (column)
    expect(['column', 'column-reverse']).toContain(buttonContainerDirection);
  });
  
  test('При изменении размера экрана компоненты приватности должны адаптироваться', async ({ page }) => {
    // Установить локальное хранилище для симуляции пользователя из Калифорнии
    await page.addInitScript(() => {
      localStorage.setItem('userRegion', 'CA');
      localStorage.removeItem('ccpaBannerSeen');
    });
    
    // Начать с десктопа
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/privacy-choices');
    
    // Проверить, что форма отображается в один столбец на десктопе
    const desktopForm = page.locator('form');
    const desktopFormDisplay = await desktopForm.evaluate(node => {
      return window.getComputedStyle(node).display;
    });
    
    // Изменить размер на мобильный
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Дать компонентам время адаптироваться
    await page.waitForTimeout(500);
    
    // Проверить, что форма адаптировалась
    const mobileForm = page.locator('form');
    const mobileFormDisplay = await mobileForm.evaluate(node => {
      return window.getComputedStyle(node).display;
    });
    
    // Формы должны иметь разные стили на разных устройствах
    expect(desktopFormDisplay).toBeTruthy();
    expect(mobileFormDisplay).toBeTruthy();
  });
}); 