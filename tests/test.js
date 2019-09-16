const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const config = require('lighthouse/lighthouse-core/config/lr-desktop-config.js');
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
const request = require('request');
const util = require('util');
const fs = require('fs');
const ScreenshotTester = require('puppeteer-screenshot-tester')

describe('Launch Browwser', function () {
    it('Should be able to launch browser', async function () {
        const loginURL = 'https://preprod-smartbox.cs109.force.com/s/login/?language=en_EN';

        const opts = {
            logLevel: 'info',
            output: 'json',
            disableDeviceEmulation: true,
            defaultViewport: {
                width: 1200,
                height: 900
            },
            chromeFlags: ['--disable-mobile-emulation']
        };

        // Launch chrome using chrome-launcher
        const chrome = await chromeLauncher.launch(opts);
        opts.port = chrome.port;

        // Connect to it using puppeteer.connect().
        const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`);
        const { webSocketDebuggerUrl } = JSON.parse(resp.body);
        const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });


        //Puppeteer
        page = (await browser.pages())[0];
        await page.setViewport({ width: 1200, height: 900 });
        await page.goto(loginURL, { waitUntil: 'networkidle2' });
        const username = await page.$x('//input[@id="input-1"]');
        await username[0].type('par00005789@partners.smartbox.com.preproduct');
        const tester = await ScreenshotTester(0.8, false, false, [], {
            transparency: 0.5
        })
        const result = await tester(username[0], 'username',{
        })

        const result2 = await tester(page, 'loginPage', {fullPage: true
          
        })
        console.log(result);
        //expect(result).toBe(true)
        //await page.screenshot({path: './screenshots/screenshot.png'})
        const password = await page.$x('//input[@id="input-2"]');
        await password[0].type('SBX012347');
        await page.evaluate(() => {
            document.querySelector('[class="slds-checkbox--faux terms_and_conditions_checkbox"]').click();
        });
        await page.evaluate(() => {
            document.querySelector('[class="slds-button slds-button_brand pmp_login_button"]').click();
        });

        await page.waitForNavigation();
        //const frames = await page.frames();
        //const tryItFrame = frames.find(f => f.id() === 'wfx-frame-guidedPopup');
        //const framedButton = await tryItFrame.$x('//button[@style="color:#bbc3c9 !important;border-color:#dee3e9 !important;"]');
        //framedButton[0].click();

        console.log(page.url());

        // Run Lighthouse.
        const report = await lighthouse(page.url(), opts, config).then(results => {
            return results;
        });
        const html = reportGenerator.generateReport(report.lhr, 'html');
        const json = reportGenerator.generateReport(report.lhr, 'json');

        // console.log(`Lighthouse score: ${report.lhr.score}`);
        //await page.goto(logoutURL, {waitUntil: 'networkidle2'});

        await browser.disconnect();
        await chrome.kill();


        //Write report html to the file
        fs.writeFile('report.html', html, (err) => {
            if (err) {
                console.error(err);
            }
        });

        //Write report json to the file
        fs.writeFile('report.json', json, (err) => {
            if (err) {
                console.error(err);
            }
        });

    });
});