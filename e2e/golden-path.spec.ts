import { test, expect } from '@playwright/test';

/** Minimal valid WAV (silence) so play() succeeds without local media. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

async function clearGatewayStorage(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.removeItem('gateway-crt-boot');
    localStorage.setItem('gateway-crt-intensity', 'full');
    localStorage.removeItem('gateway-lang');
    document.documentElement.classList.remove('crt-boot-seen');
  });
  await page.reload();
}

test.describe('Gateway CRT golden path', () => {
  test('boot → Wave I → session play dims CRT', async ({ page }) => {
    await clearGatewayStorage(page);

    const boot = page.locator('[data-crt-boot]');
    await expect(boot).toBeVisible();
    await expect(page.locator('[data-crt-boot-enter]')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('ACCESS GRANTED/')).toBeVisible();

    await page.locator('[data-crt-boot-enter]').click();
    await expect(boot).toBeHidden();

    await expect(page.getByRole('heading', { name: 'Gateway Experience', exact: true })).toBeVisible();
    await expect(page.locator('.dossier-banner')).toContainText('CIA GATEWAY PROCESS');
    await expect(page.locator('html')).toHaveAttribute('data-crt', 'full');

    const startWave = page.getByRole('link', { name: /Commencer la Vague I|Start Wave I/i }).first();
    if (await startWave.count()) {
      await startWave.click();
    } else {
      await page.goto('./waves/wave-i/');
    }

    await expect(page.locator('.dossier-banner')).toContainText('WAVE-I');

    const firstSession = page.locator('.session-list a').first();
    await expect(firstSession).toBeVisible();
    await firstSession.click();

    await expect(page.locator('#listen')).toBeVisible();

    const playBtn = page.locator('[data-gateway-player] [data-play]');
    const offline = page.locator('.media-offline');

    if (await offline.isVisible().catch(() => false)) {
      test.info().annotations.push({ type: 'note', description: 'media offline — CRT play dim skipped' });
      await expect(offline).toBeVisible();
      return;
    }

    await expect(playBtn).toBeVisible();
    await expect(playBtn).toContainText('PLAY');
    await page.locator('[data-gateway-player] [data-audio]').evaluate((el, src) => {
      const audio = el as HTMLAudioElement;
      audio.src = src;
      audio.loop = true;
      audio.load();
    }, SILENT_WAV);

    await playBtn.click();
    await expect(page.locator('[data-gateway-player]')).toHaveAttribute('data-state', 'playing');
    await expect(page.locator('html')).toHaveAttribute('data-crt', 'listen');
    const liveScope = page.locator('[data-live-scope]');
    await expect(liveScope).toBeVisible();
    await expect(liveScope).toContainText(/Live analysis|Analyse live/i);
    await expect(liveScope.locator('[data-viz-l]')).toBeVisible();
    await expect(liveScope.locator('[data-viz-r]')).toBeVisible();
    await expect(liveScope.locator('[data-live-fs]')).toBeVisible();
    await liveScope.locator('[data-live-fs]').dispatchEvent('click');
    const liveStage = page.locator('[data-live-stage]');
    await expect(liveStage).toHaveClass(/is-fs/);
    await expect(liveStage.locator('[data-live-session]')).toBeVisible();
    await expect(liveStage.locator('.live-scope-session-name')).not.toHaveText('');
    await expect(liveStage.locator('[data-play]')).toBeVisible();
    await expect(liveScope.locator('[data-live-fs-label]')).toHaveText('EXIT');
    await expect(liveScope.locator('[data-band-hold="alpha"]')).toBeVisible();

    await liveScope.locator('[data-live-fs]').dispatchEvent('click');
    await expect(liveStage).not.toHaveClass(/is-fs/);

    await playBtn.click();
    await expect(page.locator('[data-gateway-player]')).not.toHaveAttribute('data-state', 'playing');
    await expect(page.locator('html')).toHaveAttribute('data-crt', 'full');
    await expect(page.locator('[data-live-scope]')).toBeHidden();
  });

  test('skip boot remembers preference', async ({ page }) => {
    await clearGatewayStorage(page);
    await expect(page.locator('[data-crt-boot]')).toBeVisible();
    await page.locator('[data-crt-boot-skip]').click();
    await expect(page.locator('[data-crt-boot]')).toBeHidden();

    await page.reload();
    await expect(page.locator('[data-crt-boot]')).toBeHidden();
  });
});
