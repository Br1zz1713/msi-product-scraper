const { BaseScraper } = require('./base.scraper');

/**
 * Concrete scraper implementation for MSI product pages in pure JavaScript.
 * Adheres to single responsibility principles by splitting extraction into sub-methods under 50 lines.
 * Employs Early Return code pattern for clean nesting.
 */
class MsiScraper extends BaseScraper {
  
  async scrape(page, url) {
    console.log('Extracting product details...');

    const finalUrl = page.url();
    const itemId = await this.extractItemId(page);
    const title = await this.extractTitle(page);
    const { productCategory, categoryTree } = await this.extractCategories(page);
    const description = await this.extractDescription(page);
    const { price, salePrice } = await this.extractPricing(page);
    const availability = await this.extractAvailability(page);
    const { imageUrl, additionalImageUrls } = await this.extractImages(page);
    const specs = await this.extractSpecs(page);
    const { starRating, reviewCount } = await this.extractRating(page);

    // Map MPN from specifications
    const mpnObj = specs.find(s => s.name.toLowerCase() === 'manufacturer number' || s.name.toLowerCase() === 'mpn');
    const mpn = mpnObj ? mpnObj.value : null;

    return {
      url: finalUrl,
      item_id: itemId,
      title,
      brand: 'MSI',
      product_category: productCategory,
      category_tree: categoryTree,
      description,
      price,
      sale_price: salePrice,
      availability,
      image_url: imageUrl,
      additional_image_urls: additionalImageUrls,
      specs,
      star_rating: starRating,
      review_count: reviewCount,
      gtin: null, // GTIN not present on page
      mpn,
      scraped_at: new Date().toISOString()
    };
  }

  async extractItemId(page) {
    const itemId = await page.$eval('input[name="product_id"]', (el) => el.value.trim()).catch(() => null);
    if (!itemId) return null;
    return itemId;
  }

  async extractTitle(page) {
    const titleFromCrop = await page.$eval('h2.crop-text-2.title', el => el.textContent?.trim() || null).catch(() => null);
    if (titleFromCrop) return titleFromCrop;

    const titleFromBreadcrumb = await page.$eval('ol.breadcrumb li.active', el => el.textContent?.trim() || null).catch(() => null);
    return titleFromBreadcrumb;
  }

  async extractCategories(page) {
    const breadcrumbs = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ol.breadcrumb li.breadcrumb-item'));
      return items.map(item => {
        const a = item.querySelector('a');
        return {
          name: item.textContent?.trim() || '',
          url: a ? a.href : null
        };
      });
    }).catch(() => []);

    if (breadcrumbs.length === 0) {
      return { productCategory: null, categoryTree: [] };
    }

    // Filter categories (excluding 'Home' and active product title)
    const categories = breadcrumbs.filter((item, index) => {
      const isHome = index === 0 && (item.name.toLowerCase() === 'home' || item.url === 'https://us-store.msi.com/');
      const isProduct = index === breadcrumbs.length - 1;
      return !isHome && !isProduct;
    });

    const productCategory = categories.length > 0 ? categories.map(c => c.name).join(' > ') : null;
    return {
      productCategory,
      categoryTree: categories
    };
  }

  async extractDescription(page) {
    const desc = await page.$eval('h2.title + div', el => el.textContent?.trim() || null).catch(() => null);
    return desc;
  }

  async extractPricing(page) {
    const pricing = await page.evaluate(() => {
      const pricesNewEl = document.querySelector('#prices-new');
      const pricesOldEl = document.querySelector('#prices-old');
      
      const newPriceText = pricesNewEl ? pricesNewEl.textContent?.trim() || null : null;
      const oldPriceText = pricesOldEl ? pricesOldEl.textContent?.trim() || null : null;
      
      if (oldPriceText) {
        return {
          priceText: oldPriceText,
          salePriceText: newPriceText
        };
      }
      return {
        priceText: newPriceText,
        salePriceText: null
      };
    }).catch(() => ({ priceText: null, salePriceText: null }));

    return {
      price: this.parsePrice(pricing.priceText),
      salePrice: this.parsePrice(pricing.salePriceText)
    };
  }

  async extractAvailability(page) {
    const availability = await page.evaluate(() => {
      const wrapper = document.querySelector('#prices-wrapper');
      if (!wrapper) return null;
      
      const spans = Array.from(wrapper.querySelectorAll('span'));
      for (const span of spans) {
        if (span.id === 'prices-new' || span.id === 'prices-old') continue;
        const text = span.textContent?.trim().toLowerCase() || '';
        if (text.includes('in stock')) return 'in_stock';
        if (text.includes('out of stock')) return 'out_of_stock';
        if (text.includes('pre order') || text.includes('pre-order')) return 'pre_order';
      }
      return null;
    }).catch(() => null);

    return availability;
  }

  async extractImages(page) {
    const imageUrl = await page.$eval('#imagePopup', el => el.src).catch(() => null);

    const additionalImageUrls = await page.evaluate((mainImg) => {
      const imgs = Array.from(document.querySelectorAll('#carouselImages img'));
      const urls = imgs.map(img => img.src).filter(Boolean);
      const uniqueUrls = Array.from(new Set(urls));
      return uniqueUrls.filter(url => url !== mainImg);
    }, imageUrl).catch(() => []);

    return {
      imageUrl,
      additionalImageUrls
    };
  }

  async extractSpecs(page) {
    const specs = await page.evaluate(() => {
      const list = [];
      const rows = document.querySelectorAll('table.table-borderless tbody tr');
      rows.forEach(row => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) {
          list.push({
            name: th.textContent?.trim() || '',
            value: td.textContent?.trim().replace(/\s+/g, ' ') || ''
          });
        }
      });
      return list;
    }).catch(() => []);

    return specs;
  }

  async extractRating(page) {
    const ratingData = await page.evaluate(() => {
      const el = document.querySelector('#average-rating-info');
      if (!el) return null;
      const text = el.textContent?.trim() || '';
      const match = text.match(/([\d.]+)\s*\((\d+)\)/);
      if (match) {
        return {
          star_rating: parseFloat(match[1]),
          review_count: parseInt(match[2], 10)
        };
      }
      return null;
    }).catch(() => null);

    if (!ratingData) {
      return { starRating: null, reviewCount: null };
    }

    return {
      starRating: ratingData.star_rating,
      reviewCount: ratingData.review_count
    };
  }
}

module.exports = {
  MsiScraper
};
