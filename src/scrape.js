const path = require('path');
const { launchBrowser, verifyPageStatus } = require('./core/browser');
const { MsiScraper } = require('./scrapers/msi.scraper');
const { writeJson } = require('./storage/file-writer');

async function main() {
  const targetUrl = 'https://us-store.msi.com/Motherboards/Intel-Platform-Motherboard/INTEL-Z890/MAG-Z890-TOMAHAWK-WIFI';
  console.log(`Starting scraper for MSI Product: ${targetUrl}`);

  const { browser, page } = await launchBrowser();

  try {
    console.log('Navigating to product page...');
    const response = await page.goto(targetUrl, {
      waitUntil: 'load',
      timeout: 45000
    });

    if (!response) {
      throw new Error('Failed to retrieve response from target URL');
    }

    const statusCode = response.status();
    console.log(`Response received with status code: ${statusCode}`);
    
    if (statusCode !== 200) {
      throw new Error(`Access denied or page error (HTTP ${statusCode})`);
    }

    // Verify if we got banned by Akamai/Cloudflare
    await verifyPageStatus(page);

    // Wait for the reviews / rating AJAX element to load
    await page.waitForSelector('#average-rating-info', { timeout: 8000 }).catch(() => {
      console.warn('Warning: #average-rating-info not found or loaded in time.');
    });

    // Wait for the main pricing wrapper element to load
    await page.waitForSelector('#prices-wrapper', { timeout: 5000 }).catch(() => {
      console.warn('Warning: #prices-wrapper selector not found within timeout.');
    });

    const msiScraper = new MsiScraper();
    const productData = await msiScraper.scrape(page, targetUrl);

    const outputPath = path.join(__dirname, '..', 'output', 'product.json');
    writeJson(outputPath, productData);
    console.log(`Scraping completed successfully! Results written to: ${outputPath}`);

    // Take screenshot of the loaded page for verification
    const screenshotPath = path.join(__dirname, '..', 'output', 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(err => {
      console.error('Failed to take page screenshot:', err);
    });
    console.log(`Screenshot saved to: ${screenshotPath}`);

  } catch (error) {
    console.error('An error occurred during scraping:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

main();
