import {logger} from '../log/winston';
import puppeteer, {Browser, ElementHandle, HTTPResponse, Page, WaitForOptions} from 'puppeteer';
import {selector} from '../interface/Selector';
import SlackAPI from './SlackAPI';
import UserRepository from '../repository/UserRepository';
import {User} from '../interface/User';
import {SlackInfo} from '../interface/SlackInfo';

class Commute {
	private userRepository: UserRepository = new UserRepository();
	private jadeUrl: string = 'https://ehr.jadehr.co.kr/';
	private companyCode: string = '2202010';
	// 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
	private waitForOptions: WaitForOptions = {
		// timeout: 5000,
		waitUntil: 'domcontentloaded'
	}
	
	constructor() {
	
	}
	
	public async launch(): Promise<Browser | null> {
		logger.info('launch function is started!');
		
		try {
			const browser: Browser = await puppeteer.launch({
				headless: false
				, slowMo: 0
				, defaultViewport: {
					width: 1024
					, height: 768
					, deviceScaleFactor: 1
					, isMobile: false
					, hasTouch: false
					, isLandscape: false
				}
				, timeout: 5000
				, pipe: false
			});
			
			logger.info('Browser is launched!');
			
			return browser;
		} catch (e: any) {
			logger.error(e);
			logger.error(e.message);
			logger.error('Browser can not launched!');
		}
		
		return null;
	}
	
	public async login(browser: Browser, slackInfo: SlackInfo): Promise<Page | null> {
		logger.info('login function is started!');
		
		const page: Page = await browser.newPage();
		const response: HTTPResponse | null = await page.goto(this.jadeUrl);
		
		if (response !== null && response.ok()) {
			const loginButton: ElementHandle | null = await page.waitForSelector(selector.login, this.waitForOptions);
			
			if (loginButton !== null) {
				const userInfo: User | null = await this.userRepository.findByUserId(slackInfo.userName);
				
				if (userInfo == null) {
					logger.error('Can\'t get User Information for jade!');
					logger.error('Slack Id - ' + slackInfo.userName);
					
					return null;
				}
				
				await page.type(selector.company, this.companyCode);
				await page.type(selector.id, userInfo.jadeUserId);
				await page.type(selector.password, userInfo.jadeUserPassword);
				await page.click(selector.login);
				
				const nextPageResponse: HTTPResponse | null = await page.waitForNavigation(this.waitForOptions);
				
				if (nextPageResponse !== null && nextPageResponse.ok()) {
					logger.info('Success in login! ID - ' + userInfo.jadeUserId);
					
					page.on('dialog', async (dialog) => {
						const dialogType: string = dialog.type(); // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
						const dialogMessage: string = dialog.message();
						const userInfo: User | null = await this.userRepository.findByUserId(slackInfo.userName);
						
						if (dialogType === 'alert') {
							logger.error(dialogMessage);
						} else if (dialogType === 'confirm') {
						
						}
						
						await dialog.accept();
						new SlackAPI().send(dialogMessage, userInfo?.userName);
					});
					
					return page;
				}
			}
		} else {
			logger.error('Fail to connection login page!');
			logger.error('response :', response);
		}
		
		return null;
	}
	
	 public async start(page: Page) {
		 logger.info('start function is started!');
		 
		 await page.waitForTimeout(1000);
		 await page.click(selector.startWork);
		 
		 const blockFrameElementHandle: ElementHandle | null = await page.waitForSelector(selector.blockFrame, this.waitForOptions);
		 
		 await blockFrameElementHandle?.evaluate((element, selector) => {
			 const saveElement: Element | null = document.querySelector(selector.save);
			
			 console.log('saveElement :', saveElement);
		 }, selector);
	 }
	
	public async end(page: Page) {
		logger.info('end function is started!');
		
		await page.click(selector.endWork);
	}
	
	public async workStart(slackInfo: SlackInfo) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, slackInfo);
			
			if (page !== null) {
				await this.start(page);
			}
			
			// await browser.close();
		}
	}
	
	public async workEnd(slackInfo: SlackInfo) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, slackInfo);
			
			if (page !== null) {
				await this.end(page);
			}
			
			await browser.close();
		}
	}
}

export default Commute;
