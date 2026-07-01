/**
 * Base class for web scrapers.
 * Conforms to the project blueprints and coding standards.
 */
class BaseScraper {
  /**
   * Main scrape orchestrator method for the specific target.
   * @param {import('playwright').Page} page Playwright Page instance.
   * @param {string} url Target page URL.
   */
  async scrape(page, url) {
    throw new Error('Method "scrape" must be implemented by subclasses.');
  }

  /**
   * Normalizes a price string to a float number.
   * Uses the Early Return pattern to prevent deep indentation.
   * @param {string | null} priceStr Raw price string (e.g. "$259.99").
   * @returns {number | null} Float representation or null if parsing fails.
   */
  parsePrice(priceStr) {
    if (!priceStr) return null;

    const cleaned = priceStr.replace(/[^\d.]/g, '');
    const val = parseFloat(cleaned);
    
    if (isNaN(val)) return null;

    return val;
  }
}

module.exports = {
  BaseScraper
};
