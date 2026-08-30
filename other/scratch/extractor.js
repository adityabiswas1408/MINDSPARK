const fs = require('fs');
const cheerio = require('cheerio');

const htmlContent = fs.readFileSync('../index (1).html', 'utf8');
const $ = cheerio.load(htmlContent);

const iframe = $('#student-dashboard iframe');
let src = iframe.attr('src');
if (src && src.startsWith('data:text/html;base64,')) {
    const base64 = src.replace('data:text/html;base64,', '');
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    fs.writeFileSync('student-dashboard-decoded.html', decoded);
    console.log('Decoded student-dashboard to student-dashboard-decoded.html');
} else {
    console.log('No base64 src found. Src is:', src);
}
