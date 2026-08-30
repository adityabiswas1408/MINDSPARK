const { chromium } = require('./mindspark/node_modules/playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 },
        deviceScaleFactor: 2
    });
    const page = await context.newPage();
    const filePath = 'file:///' + path.resolve(__dirname, 'flash_anzan_mockup.html').replace(/\\/g, '/');
    
    console.log('Loading:', filePath);
    await page.goto(filePath);
    await page.waitForTimeout(500);

    // 1. Capture Get Ready (screen-0)
    await page.evaluate(() => {
        if (typeof clearAllTimers === 'function') clearAllTimers();
        if (typeof setPhase === 'function') setPhase('getready');
        document.getElementById('countdown-digit').textContent = '3';
        document.getElementById('cd-dot-1').style.backgroundColor = 'var(--t3)';
        document.getElementById('cd-dot-2').style.backgroundColor = 'var(--t3)';
        document.getElementById('cd-dot-3').style.backgroundColor = 'var(--t3)';
        // Hide mockup skip links for clean production render
        document.querySelectorAll('.mockup-skip-cd, .mockup-toolbar').forEach(el => el.style.display = 'none');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'flash_screen_1_getready.png') });
    console.log('Captured: flash_screen_1_getready.png');

    // 2. Capture Flash Sequence (screen-2 with number 47)
    await page.evaluate(() => {
        if (typeof clearAllTimers === 'function') clearAllTimers();
        if (typeof showScreen === 'function') showScreen('screen-2');
        const numEl = document.getElementById('flash-number');
        if (numEl) {
            numEl.textContent = '47';
            numEl.style.display = 'block';
            numEl.style.opacity = '1';
            numEl.className = 'active';
        }
        document.querySelectorAll('.mockup-skip-cd, .mockup-toolbar').forEach(el => el.style.display = 'none');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'flash_screen_2_flash.png') });
    console.log('Captured: flash_screen_2_flash.png');

    // 3. Capture MCQ Grid (screen-3)
    await page.evaluate(() => {
        if (typeof clearAllTimers === 'function') clearAllTimers();
        if (typeof showScreen === 'function') showScreen('screen-3');
        const grid = document.getElementById('mcq-grid');
        const q = questions[0];
        grid.innerHTML = q.options.map((opt, idx) => `
            <div class="mcq-card" id="opt-${idx}" onclick="selectOption(${idx})">
                <span class="mcq-badge">${opt.label}</span>
                <span class="mcq-val fm">${opt.value}</span>
            </div>
        `).join('');
        document.getElementById('mcq-q-curr').textContent = '1';
        document.querySelectorAll('.mockup-skip-cd, .mockup-toolbar').forEach(el => el.style.display = 'none');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'flash_screen_3_mcq.png') });
    console.log('Captured: flash_screen_3_mcq.png');

    // 4. Capture Submitted (screen-4)
    await page.evaluate(() => {
        if (typeof clearAllTimers === 'function') clearAllTimers();
        if (typeof showScreen === 'function') showScreen('screen-4');
        const card = document.getElementById('card');
        if (card) {
            card.style.transition = 'none';
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }
        document.getElementById('stat-ans').innerHTML = '<span class="fm">3</span> of <span class="fm">3</span> Answered';
        document.querySelectorAll('.mockup-skip-cd, .mockup-toolbar').forEach(el => el.style.display = 'none');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'flash_screen_4_submitted.png') });
    console.log('Captured: flash_screen_4_submitted.png');

    await browser.close();
    console.log('All 4 Flash Anzan screens captured successfully!');
}

capture().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
