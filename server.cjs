const express = require('express');
const http = require('http');
const { chromium } = require('playwright');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { username, password } = req.body;

  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
  });

  function sendLog(message) {
    console.log(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'log', message }));
      }
    });
  }

  try {
    sendLog('Starting Instagram scraping process...');
    const browser = await chromium.launch({ headless: true });
    console.log('Browser launched in headless mode');
    const context = await browser.newContext();
    const page = await context.newPage();

    sendLog('Navigating to Instagram login page');
await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle', timeout: 60000 });

sendLog('Filling in login credentials');
await page.waitForSelector('input[name="username"]', { state: 'visible', timeout: 10000 });
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', password);

console.log('Submitting login form');
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 })
]);

console.log('Checking login status');
const loginSuccessful = await page.evaluate(() => {
  return !document.querySelector('p[data-testid="login-error-message"]');
});

if (!loginSuccessful) {
  throw new Error('Login failed. Please check your credentials.');
}

sendLog('Login successful. Proceeding with scraping...');


sendLog('Login successful. Starting page captures...');
    const pages = [
      { name: 'Messages', url: 'https://www.instagram.com/direct/inbox/' },
      { name: 'Follower_List', url: 'https://www.instagram.com/' + username + '/followers/' },
      { name: 'Following_List', url: 'https://www.instagram.com/' + username + '/following/' },
      { name: 'Close_Friends', url: 'https://www.instagram.com/' + username + '/closefriends/' },
      { name: 'Timeline', url: 'https://www.instagram.com/' + username + '/' },
      { name: 'Activity', url: 'https://www.instagram.com/accounts/activity/' },
      { name: 'Liked_Posts', url: 'https://www.instagram.com/your_activity/interactions/likes/' },
      { name: 'Account_Info', url: 'https://www.instagram.com/accounts/edit/' },
      { name: 'comments', url: 'https://www.instagram.com/your_activity/interactions/comments' },
      { name: 'story_replies', url: 'https://www.instagram.com/your_activity/interactions/story_replies' },
      { name: 'posts', url: 'https://www.instagram.com/your_activity/photos_and_videos/posts/' },
      { name: 'account_history', url: 'https://www.instagram.com/your_activity/account_history' },
      { name: 'stories', url: 'https://www.instagram.com/archive/stories/' },
      { name: 'tagged', url: 'https://www.instagram.com/'+ username +'/tagged/' },
      { name: 'login_activity', url: 'https://www.instagram.com/session/login_activity/' },
      { name: 'close_friends', url: 'https://www.instagram.com/accounts/close_friends/' },
      { name: 'blocked_accounts', url: 'https://www.instagram.com/accounts/blocked_accounts/' },
      { name: 'restricted_accounts', url: 'https://www.instagram.com/accounts/restricted_accounts/' },
      { name: 'muted_accounts', url: 'https://www.instagram.com/accounts/muted_accounts/' },
      { name: 'Accounts', url: 'https://accountscenter.instagram.com/accounts/' },
      { name: 'personal_info', url: 'https://accountscenter.instagram.com/personal_info/' },
    ];

    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    for (const pageInfo of pages) {
      sendLog(`Capturing ${pageInfo.name} page`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(5000); // Wait an additional 5 seconds for any dynamic content
      await page.screenshot({ path: path.join(screenshotDir, `${pageInfo.name}.png`) });
    
      if (pageInfo.name === 'messages') {
        const threads = await page.$$('div[role="button"][tabindex="0"]');
        for (let i = 0; i < Math.min(threads.length, 5); i++) {
          console.log(`Capturing message thread ${i + 1}`);
          await threads[i].click();
          await page.waitForLoadState('networkidle', {timeout: 60000});
          await page.waitForTimeout(6000); // Wait an additional 6 seconds for messages to load
          await page.screenshot({ path: path.join(screenshotDir, `message_${i + 1}.png`) });
        }
      }
    }
    

    sendLog('Generating PDF report');
    const pdfPath = path.join(__dirname, 'instagram_report.pdf');
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    const screenshots = fs.readdirSync(screenshotDir);
    for (const screenshot of screenshots) {
      if (path.extname(screenshot).toLowerCase() === '.png') {
        doc.addPage().image(path.join(screenshotDir, screenshot), {
          fit: [500, 400],
          align: 'center',
          valign: 'center'
        });
    }

    }

    doc.end();

    await new Promise((resolve) => pdfStream.on('finish', resolve));

    console.log('Closing browser');
    await browser.close();

    sendLog('Scraping process completed successfully');
    res.json({ message: 'Scraping completed successfully', pdfPath });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
