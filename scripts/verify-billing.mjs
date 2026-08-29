import assert from 'node:assert/strict';

const api = process.argv[2] || 'https://api.sociobot.in';
const product = 'sideload-readiness';
const catalogResponse = await fetch(`${api}/api/v1/products`);
assert.equal(catalogResponse.status, 200, 'the public product catalog must load');
const catalog = await catalogResponse.json();
const entry = (catalog.data || []).find(item => item.slug === product);
assert.deepEqual(entry, {
  slug: product,
  name: 'Sideload Readiness fleet review',
  price_minor: 3900,
  currency: 'USD',
  product_url: 'https://sideload-readiness.sociobot.in/',
  checkout_url: `${api}/api/v1/products/${product}/checkout`
});

const checkout = await fetch(entry.checkout_url, { redirect: 'manual' });
assert.equal(checkout.status, 303, 'checkout must redirect without a purchase');
const location = checkout.headers.get('location');
assert.match(location || '', /^https:\/\/checkout\.dodopayments\.com\/session\//, 'checkout must use the hosted Sociobot/Dodo flow');

const invalidLicense = await fetch(`${api}/api/v1/products/${product}/verify?license=verification-smoke-invalid`);
assert.equal(invalidLicense.status, 200, 'the registered product must expose license verification');
assert.deepEqual(await invalidLicense.json(), { valid: false, reason: 'invalid', expires_at: null });

console.log(JSON.stringify({ product, checkoutStatus: checkout.status, checkoutLocation: location, invalidLicenseStatus: invalidLicense.status }, null, 2));
