import {logger} from '../log/winston';
import puppeteer, {Browser, ElementHandle, Frame, HTTPResponse, Page, WaitForOptions} from 'puppeteer';
import {selector} from '../interface/Selectors';
import SlackAPI from './SlackAPI';
import UserRepository from '../repository/UserRepository';
import {User} from '../interface/User';
import {SlackInfo} from '../interface/SlackInfo';
import {messageTypes} from '../interface/MessageTypes';
import {alertMessages} from '../interface/AlertMessages';
import {responseMessages} from '../interface/ResponseMessages';

class Commute {
	private userRepository: UserRepository = new UserRepository();
	private jadeUrl: string = <string>process.env.jade_url;
	private companyCode: string = <string>process.env.company_code;
	// 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
	private waitForOptions: WaitForOptions = {
		// timeout: 5000,
		waitUntil: 'networkidle2'
	};
	
	constructor() {
	
	}
	
	public async launch(): Promise<Browser | null> {
		logger.info('launch function is started!');
		
		try {
			const browser: Browser = await puppeteer.launch({
				headless: true
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
				, args: [
					'--disable-web-security',
					'--disable-features=IsolateOrigins,site-per-process'
				]
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
		const slackAPI: SlackAPI = new SlackAPI();
		
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
						
						if (dialogType === 'alert') {
							if (dialogMessage !== alertMessages.save) {
								logger.error(dialogMessage);
								slackAPI.send(responseMessages.fail(slackInfo.text));
							}
							
							if (dialogMessage === alertMessages.save) {
								slackAPI.send(responseMessages.success(slackInfo.text));
							}
							
							await page.close();
							await browser.close();
						} else if (dialogType === 'confirm') {
							await dialog.accept();
						}
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
	
	public async commute(page: Page, text: string) {
		logger.info('commute function is started! - ' + text);
		
		const workSelector: string = (text.trim() === messageTypes.start) ? selector.startWork : selector.endWork;
		
		await page.waitForSelector(workSelector, this.waitForOptions);
		await page.click(workSelector);
		await page.waitForSelector(selector.modalFrame, this.waitForOptions);
		
		const frameHandle: ElementHandle | null = await page.waitForSelector(selector.modalFrame, this.waitForOptions);
		
		if (frameHandle !== null) {
			const frameBody: Frame | null = await frameHandle.contentFrame();
			
			if (frameBody !== null) {
				await frameBody.waitForSelector(selector.save, this.waitForOptions);
				await frameBody.click(selector.save);
			}
		}
	}
	
	public async prepareForCommute(slackInfo: SlackInfo) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, slackInfo);
			
			if (page !== null) {
				await this.commute(page, slackInfo.text);
			}
		}
	}
}

export default Commute;
