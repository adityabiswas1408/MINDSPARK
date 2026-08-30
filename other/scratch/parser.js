const fs = require('fs');
const cheerio = require('cheerio');

const htmlContent = fs.readFileSync('../index (1).html', 'utf8');
const $ = cheerio.load(htmlContent);

console.log('--- Shell Structure ---');
const topnav = $('.topnav');
console.log('Topnav present:', topnav.length > 0);
console.log('Topnav classes:', topnav.attr('class'));

console.log('\n--- Present Screen Inventory ---');
const screens = $('.screen-block');
console.log(`Total screens found: ${screens.length}`);

screens.each((i, el) => {
    const id = $(el).attr('id');
    const title = $(el).find('.screen-title').text();
    const groupLabel = $(el).closest('.group-block').find('.group-label').text();
    const iframe = $(el).find('iframe');
    const hasIframe = iframe.length > 0;
    console.log(`${i+1}. [${id}] ${title} (Group: ${groupLabel}, Iframe: ${hasIframe})`);
});

console.log('\n--- Navigation Dropdown Audit ---');
const selectOptions = $('.topnav select option');
console.log(`Total options: ${selectOptions.length}`);
selectOptions.each((i, el) => {
    console.log(`Option: ${$(el).val()} - ${$(el).text()}`);
});
