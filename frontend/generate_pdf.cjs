const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Launching Chrome for PDF generation...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, '..', 'documentation_export.html');
  const pdfPath = path.resolve(__dirname, '..', 'Secure_Banking_System_Documentation.pdf');

  console.log('Loading HTML documentation:', htmlPath);
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  console.log('Exporting to PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '14mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  const stats = fs.statSync(pdfPath);
  console.log(`SUCCESS: PDF created at ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

run().catch(err => {
  console.error('PDF Generation Error:', err);
  process.exit(1);
});
