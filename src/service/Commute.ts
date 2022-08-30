import {logger} from '../log/winston';
import puppeteer, {Browser, Dialog, ElementHandle, Frame, HTTPResponse, Page, WaitForOptions} from 'puppeteer';
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
	private readonly jadeUrl: string = <string>process.env.jade_url;
	private readonly companyCode: string = <string>process.env.company_code;
	// 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
	private readonly waitForOptions: WaitForOptions = {
		// timeout: 5000,
		waitUntil: 'networkidle2'
	};
	private userInfo: User | null = null;
	
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
		
		// todo page.close, page.browser.close를 맨 아래로 빼도 될지 test 필요
		if (response !== null && response.ok()) {
			const loginButton: ElementHandle | null = await page.waitForSelector(selector.login, this.waitForOptions);
			
			if (loginButton !== null) {
				this.userInfo = await this.userRepository.findByUserId(slackInfo.userName);
				
				if (this.userInfo === null) {
					logger.error('Can\'t get User Information for jade!');
					logger.error('Slack Id - ' + slackInfo.userName);
					slackAPI.send('등록되지 않은 사용자입니다. jade 정보를 등록해주세요.', slackInfo.userName);
					
					return null;
				}
				
				await page.type(selector.company, this.companyCode);
				await page.type(selector.id, this.userInfo.jadeUserId);
				await page.type(selector.password, this.userInfo.jadeUserPassword);
				await page.click(selector.login);
				
				const nextPageResponse: HTTPResponse | null = await page.waitForNavigation(this.waitForOptions);
				
				if (nextPageResponse !== null && nextPageResponse.ok()) {
					logger.info('Success in login! ID - ' + this.userInfo.jadeUserId);
					
					// todo dialog event 위치 이동 필요해보임..
					page.on('dialog', async (dialog) => {
						const dialogType: string = dialog.type(); // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
						const dialogMessage: string = dialog.message();
						
						if (dialogType === 'alert') {
							if (dialogMessage !== alertMessages.save) {
								logger.error(dialogMessage);
								slackAPI.send(responseMessages.fail(slackInfo.text));
								slackAPI.send(responseMessages.error(dialogMessage));
							}
							
							if (dialogMessage === alertMessages.save) {
								logger.info('You are successful in ' + slackInfo.text + ' - ' + slackInfo.userName);
								slackAPI.send(responseMessages.success(slackInfo.text));
							}
							
							await page.close();
							await browser.close();
						} else if (dialogType === 'confirm') {
							await dialog.accept();
						}
					});
					
					return page;
				} else {
					await page.close();
					await browser.close();
				}
			} else {
				await page.close();
				await browser.close();
			}
		} else {
			logger.error('Fail to connection login page!');
			logger.error('response :', response);
			await page.close();
			await browser.close();
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
		
		// todo page.close, page.browser.close를 맨 아래로 빼도 될지 test 필요
		if (frameHandle !== null) {
			const frameBody: Frame | null = await frameHandle.contentFrame();
			
			if (frameBody !== null) {
				await frameBody.waitForSelector(selector.save, this.waitForOptions);
				await frameBody.click(selector.save);
			} else {
				await page.close();
				await page.browser().close();
			}
		} else {
			await page.close();
			await page.browser().close();
		}
	}
	
	public async prepareForCommute(slackInfo: SlackInfo) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, slackInfo);
			
			if (page !== null) {
				await this.commute(page, slackInfo.text);
			} else {
				await browser.close();
			}
		}
	}
	
	public async confirm(page: Page, slackInfo: SlackInfo) {
		logger.info('confirm function is started! - ' + slackInfo.text);
		
		const slackAPI: SlackAPI = new SlackAPI();
		const confirmSelector: string = (slackInfo.text.trim() === messageTypes.confirm_start) ? selector.confirm_start : selector.confirm_end;
		const content: string | undefined = await page.$eval(confirmSelector, (element: Element) => {
			return element.textContent?.trim();
		});
		
		if (content !== undefined) {
			const match: RegExpMatchArray | null = content.match('([0-9]{2}:[0-9]{2})');
			
			if (this.userInfo === null) {
				logger.error('Can\'t get User Information for jade!');
				logger.error('Slack Id - ' + slackInfo.userName);
				
				return null;
			}
			
			if (match !== null) {
				logger.info('You can confirm processing history!');
				slackAPI.send(responseMessages.confirm(slackInfo.text.trim(), match[0]), this.userInfo.userName);
			} else {
				logger.error('Can\'t get processing history!');
				slackAPI.send('처리 내역을 찾을 수 없습니다.', this.userInfo.userName);
			}
		}
		
		await page.close();
		await page.browser().close();
	}
	
	public async prepareForConfirm(slackInfo: SlackInfo) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, slackInfo);
			
			if (page !== null) {
				await this.confirm(page, slackInfo);
			} else {
				await browser.close();
			}
		}
	}
}

export default Commute;
