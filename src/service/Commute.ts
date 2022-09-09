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
	private readonly jadeUrl: string = <string>process.env.jade_url;
	private readonly companyCode: string = <string>process.env.company_code;
	// 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
	private readonly waitForOptions: WaitForOptions = {
		// timeout: 5000,
		waitUntil: 'networkidle2'
	};
	private slackAPI: SlackAPI = new SlackAPI();
	
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
	
	public async login(browser: Browser, userInfo: User): Promise<Page | null> {
		logger.info('login function is started!');
		
		const page: Page = await browser.newPage();
		const response: HTTPResponse | null = await page.goto(this.jadeUrl);
		
		if (response !== null && response.ok()) {
			const loginButton: ElementHandle | null = await page.waitForSelector(selector.login, this.waitForOptions);
			
			if (loginButton !== null) {
				await page.type(selector.company, this.companyCode);
				await page.type(selector.id, userInfo.jadeUserId);
				await page.type(selector.password, userInfo.jadeUserPassword);
				await page.click(selector.login);
				
				const nextPageResponse: HTTPResponse | null = await page.waitForNavigation(this.waitForOptions);
				
				if (nextPageResponse !== null && nextPageResponse.ok()) {
					logger.info('Success in login! ID - ' + userInfo.jadeUserId);
					
					return page;
				}
			}
		} else {
			logger.error('Fail to connection login page!');
			logger.error('response :', response);
		}
		
		return null;
	}
	
	public async start(slackInfo: SlackInfo) {
		const userRepository: UserRepository = new UserRepository();
		const userInfo: User | null = await userRepository.findByUserId(slackInfo.userName);
		const message: string = slackInfo.text.trim();
		
		if (userInfo === null) {
			logger.error(`Can't find ${slackInfo.userName} info in DB`);
			this.slackAPI.send('사용자 등록을 먼저 해주세요.', slackInfo.userName);
			
			return;
		}
		
		// 내정보 확인, 내정보 삭제
		if (message === messageTypes.info) {
			userInfo.jadeUserPassword = '';
			userInfo.salt = '';
			
			this.slackAPI.send(JSON.stringify(userInfo));
			return;
		} else if (message === messageTypes.info_delete) {
			const result: number = await userRepository.deleteOne(slackInfo.userName);
			
			if (result > 0) {
				logger.info(`Success delete ${userInfo.userId}(${userInfo.userName}) info!`);
				this.slackAPI.send('정상적으로 데이터가 삭제되었습니다.', userInfo.userName);
			} else {
				logger.error(`Fail to delete ${userInfo.userId}(${userInfo.userName}) info!`);
				this.slackAPI.send('데이터를 삭제하는데 실패했습니다.', userInfo.userName);
			}
			
			return;
		}
		
		this.slackAPI.send(`요청하신 ${message}이 처리되고 있습니다. 잠시만 기다려주세요.`, userInfo.userName);
		await this.executeChromium(userInfo, message);
	}
	
	public async executeChromium(userInfo: User, message: string) {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser, userInfo);
			
			if (page !== null) {
				page.on('dialog', async (dialog) => {
					const dialogType: string = dialog.type(); // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
					const dialogMessage: string = dialog.message();
					
					if (dialogType === 'alert') {
						if (dialogMessage !== alertMessages.save) {
							logger.error(dialogMessage);
							this.slackAPI.send(responseMessages.fail(message));
							setTimeout(() => {
								this.slackAPI.send(responseMessages.error(dialogMessage));
							}, 200);
						}
						
						if (dialogMessage === alertMessages.save) {
							logger.info(`You are successful in ${message} - ${userInfo.userId}(${userInfo.userName})`);
							this.slackAPI.send(responseMessages.success(message), userInfo.userName);
						}
						
						if (page !== null && !page.isClosed()) {
							await page.close();
						}
						
						if (browser !== null) {
							await browser.close();
						}
					} else if (dialogType === 'confirm') {
						await dialog.accept();
					}
				});
				
				if (message === messageTypes.confirm_start || message === messageTypes.confirm_end) {
					await this.confirm(page, userInfo.userName, message);
				} else if (message === messageTypes.start || message === messageTypes.end) {
					await this.commute(page, message);
				}
				
				if (page !== null && !page.isClosed()) {
					await page.close();
				}
			}
			
			if (browser !== null) {
				await browser.close();
			}
		}
	}
	
	public async confirm(page: Page, userName: string, message: string) {
		logger.info('confirm function is started! - ' + message);
		
		const confirmSelector: string = (message === messageTypes.confirm_start) ? selector.confirm_start : selector.confirm_end;
		const content: string | undefined = await page.$eval(confirmSelector, (element: Element) => {
			return element.textContent?.trim();
		});
		
		if (content !== undefined) {
			const match: RegExpMatchArray | null = content.match('([0-9]{2}:[0-9]{2})');
			
			if (match !== null) {
				logger.info('You can confirm processing history!');
				this.slackAPI.send(responseMessages.confirm(message, match[0]), userName);
			} else {
				logger.error('Can\'t get processing history!');
				this.slackAPI.send(responseMessages.confirm_fail(message), userName);
			}
		}
		
		if (page !== null && !page.isClosed()) {
			await page.close();
			await page.browser().close();
		}
	}
	
	public async commute(page: Page, message: string) {
		logger.info('commute function is started! - ' + message);
		
		const commuteSelector: string = (message === messageTypes.start) ? selector.startWork : selector.endWork;
		const commuteElement: ElementHandle | null = await page.waitForSelector(commuteSelector, this.waitForOptions);
		
		if (commuteElement !== null) {
			await page.click(commuteSelector);
			
			const frameHandle: ElementHandle | null = await page.waitForSelector(selector.modalFrame, this.waitForOptions);
			
			if (frameHandle !== null) {
				const frameBody: Frame | null = await frameHandle.contentFrame();
				
				if (frameBody !== null) {
					await frameBody.waitForSelector(selector.save, this.waitForOptions);
					await frameBody.click(selector.save);
				}
			}
		}
		
		if (page !== null && !page.isClosed()) {
			await page.close();
			await page.browser().close();
		}
	}
}

export default Commute;
