const UserAgent = require('user-agents');

/**
 * Generates realistic HTTP headers for requests, including a randomized User-Agent.
 * Follows the fingerprinting guidelines from the project's Scraper Architecture.
 * @returns {Record<string, string>} An object containing standard browser headers.
 */
function getRandomHeaders() {
  const ua = new UserAgent({ deviceCategory: 'desktop' });
  return {
    'User-Agent': ua.toString(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-device-memory': '8',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://www.google.com/'
  };
}

module.exports = {
  getRandomHeaders
};
