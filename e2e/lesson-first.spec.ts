import { test, expect } from '@playwright/test';
import { mockTutor, lesson, lessonPath } from './helpers/tutor-mocks';

test.beforeEach(async ({ page }) => mockTutor(page));

for (const width of [390, 430, 768, 820, 1280, 1366, 1440]) {
  test(`Lesson-first and explicit Material navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const main = page.locator('main');
    const overflow = async () => expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(main.getByRole('heading', { name: /커리큘럼/ })).toBeVisible();
    await expect(page.locator('a[href^="/s/"]')).toHaveCount(0);
    await expect(main.locator('a[href^="/m/"]')).toHaveCount(0);
    const track = main.locator('a[href^="/curriculum/"]').first();
    await track.click();
    await expect(main.locator('a[href^="/lesson/"]').first()).toBeVisible();
    await expect(main.locator('a[href^="/m/"]')).toHaveCount(0);
    await overflow();

    if (width < 900) {
      await page.getByRole('button', { name: '더보기', exact: true }).click();
      const more = page.getByRole('dialog', { name: '더보기', exact: true });
      await expect(more.locator('a[href^="/s/"]')).toHaveCount(0);
      await more.locator('a[href="/materials"]').click();
    } else {
      await page.locator('.MuiDrawer-root a[href="/materials"]').click();
    }
    await expect(page).toHaveURL(/\/materials$/);
    await expect(main.getByRole('heading', { name: '학습자료', exact: true })).toBeVisible();
    if (width < 900) await expect(page.getByRole('button', { name: '더보기', exact: true })).toHaveAttribute('aria-current', 'page');
    else await expect(page.locator('.MuiDrawer-root a[href="/materials"][aria-current="page"]')).toBeVisible();
    await main.locator('a[href^="/s/"]').filter({ hasText: 'HTML' }).first().click();
    await expect(main.locator('a[href^="/m/"]').first()).toBeVisible();
    await expect(main.locator('a[href^="/lesson/"]')).toHaveCount(0);
    await main.locator('a[href^="/m/"]').first().click();
    await expect(page).toHaveURL(/\/m\//);
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[aria-label="AI Tutor"]')).toHaveCount(0);
    await expect(main.getByText(/원본과 참고 자료를 찾아보는 공간/)).toBeVisible();
    await overflow();
    await page.screenshot({ path: `test-results/mobile/material-${width}.png`, fullPage: false });

    await page.goto(lessonPath);
    await expect(main.locator('h1')).toHaveText(lesson.title);
    await expect(page.getByRole('button', {name: /말하기 시작/}).first()).toBeVisible();
    await expect(page.locator('a[href^="/s/"]')).toHaveCount(0);
    if (width < 900) await expect(page.getByRole('region', { name: '음성 Tutor' })).toBeVisible();
    else if (width < 1400) await expect(page.getByRole('dialog', { name: 'AI Tutor' })).toBeVisible();
    else await expect(page.locator('[aria-label="AI Tutor"]')).toHaveCSS('position', 'sticky');
    await overflow();
    // Close only the overlay to make the original-material link reachable.
    if (width >= 900 && width < 1400) await page.getByRole('button', { name: 'Tutor 패널 접기' }).click();
    const original = main.getByRole('link', { name: /원문 열기/ }).first();
    const originalHref = await original.getAttribute('href');
    expect(originalHref).toMatch(/^\/m\//);
    await original.click();
    await expect(page).toHaveURL(new RegExp('/m/'));
    await expect(page.locator('[aria-label="AI Tutor"]')).toHaveCount(0);
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(lessonPath));
    await expect(main.locator('h1')).toHaveText(lesson.title);
    await page.goto(originalHref!); // A fresh, direct Material request remains valid.
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[aria-label="AI Tutor"]')).toHaveCount(0);
  });
}

test('search types and Lesson-only review', async ({ page }) => {
  await page.goto('/search?q=HTML');
  await expect(page).not.toHaveURL(/\/login/);
  const main = page.locator('main');
  await expect(main.getByRole('list', { name: '관련 Lesson' }).locator('a[href^="/lesson/"]').first()).toBeVisible();
  const material = main.locator('a[href^="/m/"]').first();
  await expect(material.getByText('학습자료', { exact: true })).toBeVisible();
  await material.click();
  await expect(page).toHaveURL(/\/m\//);
  await page.goto('/study');
  await expect(main.getByRole('heading', { name: '다시 공부하기', exact: true })).toBeVisible();
  await expect(main.locator('a[href^="/m/"]')).toHaveCount(0);
  await expect(main.locator('a[href^="/lesson/"]').first()).toBeVisible();
  await page.goto('/materials/study');
  await expect(main.getByRole('heading', { name: /자료 복습 가이드/ })).toBeVisible();
  await expect(main.locator('a[href^="/m/"]').first()).toBeVisible();
});
