import {logger} from '../log/winston';
import puppeteer, {Browser, Page, HTTPResponse, ElementHandle, WaitForOptions} from 'puppeteer';

interface Selector {
	company: string,
	id: string,
	password: string,
	login: string,
	startWork: string,
	endWork: string
}

class Commute {
	private url: string = 'https://ehr.jadehr.co.kr/';
	private companyCode: string = '2202010';
	private selector: Selector = {
		company: '#S_C_CD',
		id: '#S_USER_ID',
		password: '#S_PWD',
		login: '#btn_login',
		startWork: '#S_WORK_STA_BTN',
		endWork: '#S_WORK_END_BTN'
	};
	private waitForOptions: WaitForOptions = {
		waitUntil: 'networkidle2'
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
				, timeout: 3000
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
	
	public async login(browser: Browser): Promise<Page | null> {
		logger.info('login function is started!');
		
		const page: Page = await browser.newPage();
		const id: string = 'fedaykin';
		const password: string = '';
		
		const response: HTTPResponse | null = await page.goto(this.url);
		
		if (response !== null && response.ok()) {
			const loginButton: ElementHandle | null = await page.waitForSelector(this.selector.login, this.waitForOptions);
			
			if (loginButton !== null) {
				await page.type(this.selector.company, this.companyCode);
				await page.type(this.selector.id, id);
				await page.type(this.selector.password, password);
				await page.click(this.selector.login);
				
				const nextPageResponse: HTTPResponse | null = await page.waitForNavigation(this.waitForOptions);
				
				if (nextPageResponse !== null && nextPageResponse.ok()) {
					logger.info('Success in login! ID - ' + id);
					
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
		 
		 /*const result: string = await page.evaluate(() => {
			 // `${MainPage.mainInfoXs.GetCellValue(0, 'PLAN_WORK_YN', 'tmpInfo')}`
			 // return `MainPage.mainInfoXs.GetCellValue(0, 'PLAN_WORK_YN', 'tmpInfo')`;
		 });*/
		
		 // console.log('result :', result);
		 
		 await page.click(this.selector.startWork);
	 }
	
	public async end(page: Page) {
		logger.info('end function is started!');
		
		await page.click(this.selector.endWork);
	}
	
	public async workStart() {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser);
			
			if (page !== null) {
				await this.start(page);
			}
			
			await browser.close();
		}
	}
	
	public async workEnd() {
		const browser: Browser | null = await this.launch();
		
		if (browser !== null) {
			const page: Page | null = await this.login(browser);
			
			if (page !== null) {
				await this.end(page);
			}
			
			await browser.close();
		}
	}
}

export default Commute;
