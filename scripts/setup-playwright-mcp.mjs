import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const config = {
  browser: {
    browserName: 'chromium',
    userDataDir: './.playwright-mcp-profile',
    launchOptions: {
      headless: false,
      executablePath: chromium.executablePath(),
      args: [
        '--disable-extensions-except=./dist',
        '--load-extension=./dist',
        '--no-sandbox',
      ],
    },
  },
};

writeFileSync('playwright-mcp.config.json', JSON.stringify(config, null, 2) + '\n');
console.log('Generated playwright-mcp.config.json');
console.log(`  executablePath: ${config.browser.launchOptions.executablePath}`);