const { chromium } = require('playwright');
const { getRandomHeaders } = require('./user-agent');

/**
 * Launches a Playwright Chromium browser and configures a context with realistic headers.
 * @returns {Promise<{browser: import('playwright').Browser, context: import('playwright').BrowserContext, page: import('playwright').Page}>}
 */
async function launchBrowser() {
  const browser = await chromium.launch({
    headless: true
  });

  const headers = getRandomHeaders();
  const context = await browser.newContext({
    userAgent: headers['User-Agent'],
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    deviceScaleFactor: 1,
    extraHTTPHeaders: headers
  });

  const page = await context.newPage();

  return {
    browser,
    context,
    page
  };
}

/**
 * Checks if the loaded page has been blocked by CDN/Anti-bot mechanisms and terminates if so.
 * Follows the Kill-Switch guideline in the project's Scraper Architecture.
 * @param {import('playwright').Page} page Playwright Page instance.
 */
async function verifyPageStatus(page) {
  const content = await page.content().catch(() => '');
  
  const banIndicators = [
    'captcha', 'cloudflare', 'robot', 'suspicious activity',
    'блокировка', 'доступ ограничен', 'enable cookies', 'access denied'
  ];

  const isBlocked = banIndicators.some(indicator => 
    content.toLowerCase().includes(indicator)
  );

  if (isBlocked) {
    console.error('🚨 Anti-bot detection or captcha encountered. Terminating to avoid account/IP ban.');
    process.exit(1);
  }
}

module.exports = {
  launchBrowser,
  verifyPageStatus
};
