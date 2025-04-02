import { Page } from '@playwright/test';

/**
 * Настройка пользователя из определенного региона
 */
export async function setupUserFromRegion(page: Page, region: string): Promise<void> {
  await page.addInitScript((regionCode) => {
    localStorage.setItem('userRegion', regionCode);
    localStorage.removeItem('ccpaBannerSeen');
    localStorage.removeItem('privacyBannerSeen');
  }, region);
}

/**
 * Настройка пользователя, который отказался от продажи данных
 */
export async function setupUserOptedOut(page: Page, region: string = 'CA'): Promise<void> {
  await page.addInitScript((regionCode) => {
    localStorage.setItem('userRegion', regionCode);
    localStorage.setItem('ccpaBannerSeen', 'true');
    localStorage.setItem('privacyBannerSeen', 'true');
    localStorage.setItem('privacySettings', JSON.stringify({
      doNotSell: true,
      email: 'test@example.com',
      lastUpdated: new Date().toISOString(),
    }));
  }, region);
}

/**
 * Проверка сохраненных настроек приватности
 */
export async function getPrivacySettings(page: Page): Promise<any> {
  return page.evaluate(() => {
    const settings = localStorage.getItem('privacySettings');
    return settings ? JSON.parse(settings) : null;
  });
}

/**
 * Заполнение формы приватности
 */
export async function fillPrivacyForm(page: Page, options: {
  email?: string;
  optType?: 'optOut' | 'delete' | 'access';
}): Promise<void> {
  // Заполнить email, если указан
  if (options.email) {
    await page.fill('[type="email"]', options.email);
  }
  
  // Выбрать тип запроса, если указан
  if (options.optType) {
    switch (options.optType) {
      case 'optOut':
        await page.click('text=Do not sell my personal information');
        break;
      case 'delete':
        await page.click('text=Delete my personal data');
        break;
      case 'access':
        await page.click('text=Access my personal data');
        break;
    }
  }
}

/**
 * Моделирование различных размеров экрана
 */
export const screenSizes = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
}; 