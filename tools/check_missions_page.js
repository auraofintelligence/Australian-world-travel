/* Browser checks for the source-reviewed missions page. Requires Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.MISSION_PLAYWRIGHT_MODULE || 'playwright');

async function main() {
    const root = path.resolve(__dirname, '..');
    const pageUrl = pathToFileURL(path.join(root, 'missions.html')).href;
    const browser = await chromium.launch({ headless: true, ...(process.env.MISSION_BROWSER_CHANNEL ? { channel: process.env.MISSION_BROWSER_CHANNEL } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pageUrl, { waitUntil: 'load' });
        await page.waitForFunction(() => document.querySelectorAll('.mission-card').length === 141);
        const snapshot = await page.evaluate(() => window.AUSTRALIAN_MISSIONS_REVIEW);
        assert.equal(await page.locator('.mission-card').count(), 141);
        assert.equal(await page.locator('#missionsGrid').evaluate(element => getComputedStyle(element).display), 'grid', 'Local directory styling must load');
        assert.equal(await page.locator('script[src^="https:"]').count(), 0, 'Rendering should not depend on remote scripts');
        assert.equal(await page.locator('.mission-card a', { hasText: 'Show on globe' }).count(), snapshot.counts.mapped);
        assert.equal(await page.locator('#checkedAddressCount').textContent(), `${snapshot.records.filter(record => record.address).length} of 141 records`);
        assert.equal(await page.locator('#mappedCount').textContent(), `${snapshot.counts.mapped} of 141 records`);
        const categories = ['mapped', 'address-checked', 'notice', 'non-resident', 'review'];
        const counts = {};
        for (const category of categories) {
            await page.selectOption('#statusFilter', category);
            counts[category] = await page.locator('.mission-card').count();
        }
        assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), 141);
        assert.equal(counts.mapped, snapshot.counts.mapped);
        await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
        await page.locator('#searchInput').fill('Libya');
        assert.equal(await page.locator('.mission-card').count(), 1);
        assert.match(await page.locator('.mission-card').innerText(), /50 Culgoa Circuit/);
        assert.doesNotMatch(await page.locator('.mission-card').innerText(), /13 Culgoa Circuit/);
        await page.locator('#searchInput').fill('Lesotho');
        assert.match(await page.locator('.mission-card').innerText(), /Non-resident representation/);
        assert.equal(await page.locator('.mission-card a', { hasText: 'Show on globe' }).count(), 0);
        assert.equal(await page.locator('.mission-card a', { hasText: 'Listed office website' }).count(), 0);
        await page.locator('#searchInput').fill('Afghanistan');
        assert.match(await page.locator('.mission-card').innerText(), /Official operational notice/);
        assert.match(await page.locator('.mission-card').innerText(), /suspended/i);
        await page.locator('#searchInput').fill('Venezuela');
        assert.match(await page.locator('.mission-card').innerText(), /Official operational notice/);
        await page.locator('#searchInput').fill('Kazakhstan');
        assert.match(await page.locator('.mission-card').innerText(), /Non-resident representation/);
        await page.locator('#searchInput').fill('no-record-with-this-name');
        assert.equal(await page.locator('.mission-card').count(), 0);
        await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
        assert.equal(await page.locator('.mission-card').count(), 141);
        await page.selectOption('#cityFilter', 'Sydney');
        await page.selectOption('#typeFilter', 'Consulate-General');
        assert.equal(await page.locator('.mission-card').count(), snapshot.records.filter(record => record.city === 'Sydney' && record.type === 'Consulate-General').length);
        await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
        assert.equal(await page.evaluate(() => safeLink('javascript:alert(1)')), '');
        assert.equal(await page.evaluate(() => safeLink('https://user:password@example.com')), '');
        assert.equal(await page.evaluate(() => safeLink('http://https://example.com')), '');
        await page.evaluate(() => {
            missionsData[0].country = '<img src=x onerror="window.unsafeMarkup=true">';
            populateMissions();
        });
        assert.equal(await page.locator('.mission-card img').count(), 0);
        assert.equal(await page.evaluate(() => !!window.unsafeMarkup), false);
        await page.reload({ waitUntil: 'load' });
        await page.setViewportSize({ width: 390, height: 844 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'Phone layout must not overflow horizontally');
        const screenshotDir = process.env.MISSION_SCREENSHOT_DIR;
        if (screenshotDir) {
            fs.mkdirSync(screenshotDir, { recursive: true });
            await page.screenshot({ path: path.join(screenshotDir, 'travel-missions-phone.png') });
            await page.setViewportSize({ width: 1365, height: 1000 });
            await page.locator('#searchInput').fill('Libya');
            await page.screenshot({ path: path.join(screenshotDir, 'travel-missions-desktop.png') });
        }
        const failurePage = await browser.newPage();
        await failurePage.route('**/data/missions-reviewed.js', route => route.abort());
        await failurePage.goto(pageUrl, { waitUntil: 'load' });
        assert.equal(await failurePage.locator('.mission-card').count(), 0);
        assert.match(await failurePage.locator('#missionsGrid').innerText(), /not used as a fallback/);
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ page: 'missions.html', records: 141, categories: counts, phoneWidth: 390, noStaleFallback: true, scriptErrors: errors.length }));
    } finally {
        await browser.close();
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
