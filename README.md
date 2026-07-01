# MSI Product Page Scraper

Production-ready web scraper built with Node.js and Playwright to extract structured metadata from MSI product detail pages.

## Features

- **Anti-Bot Bypass**: Outsmart Akamai CDN/Cloudflare protection using realistic desktop headers and dynamic user-agent fingerprinting.
- **Robust DOM Extraction**: Parses item details, category breadcrumbs, specification tables, image galleries, and lazy-loaded reviews.
- **Clean Architecture**: Built in accordance with strict coding standards:
  - **Modular Layout**: Clear separation of concern layers (browser core, scraper logic, file storage).
  - **Early Return Pattern**: Negates nested conditionals to ensure flat, readable logic.
  - **Single Responsibility**: Individual DOM extraction methods are kept concise and focused (under 50 lines).
- **Normalized JSON Output**: Generates a strictly typed schema into `output/product.json`.

## Directory Layout

```text
src/
├── core/
│   ├── browser.js         # Browser launch controller & ban checker (kill-switch)
│   └── user-agent.js      # Dynamic desktop header generator
├── scrapers/
│   ├── base.scraper.js    # Base scraper abstract class & utility helpers
│   └── msi.scraper.js     # Target-specific DOM selectors & parser logic
├── storage/
│   └── file-writer.js     # JSON file exporter
└── scrape.js              # Orchestrator & entry point
```

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Br1zz1713/msi-product-scraper.git
   cd msi-product-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Install Playwright browser binaries if not already present on the system:
   ```bash
   npx playwright install chromium
   ```

## Usage

Run the scraper:
```bash
npm run scrape
```

Upon execution, the script will:
1. Initialize the browser context with randomized desktop fingerprints.
2. Navigate to the product page and wait for asynchronous rating widgets to load.
3. Parse the data, normalize prices, build the category tree, and extract all table key-value pairs.
4. Save the results to `output/product.json` and output a verification screenshot locally.

## Output Schema

The extracted product details are structured as follows:
```json
{
  "url": "https://us-store.msi.com/...",
  "item_id": "2373",
  "title": "MAG Z890 TOMAHAWK WIFI",
  "brand": "MSI",
  "product_category": "Motherboards > INTEL PLATFORM > Intel Z890",
  "category_tree": [
    { "name": "Motherboards", "url": "https://us-store.msi.com/Motherboards" }
    // ...
  ],
  "description": "...",
  "price": 259.99,
  "sale_price": null,
  "availability": "in_stock",
  "image_url": "https://...",
  "additional_image_urls": ["https://...", "https://..."],
  "specs": [
    { "name": "CPU Socket", "value": "LGA 1851" }
    // ...
  ],
  "star_rating": 4.7,
  "review_count": 3,
  "gtin": null,
  "mpn": "MAG Z890 TOMAHAWK WIFI",
  "scraped_at": "2026-07-01T11:37:44.738Z"
}
```
