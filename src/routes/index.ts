import express from 'express';
import Commute from '../service/commute';
import {Browser, Page} from 'puppeteer';
import {convertToSlackInfo, OutWebhook, SlackInfo} from '../interface/SlackInfo';
import {messageTypes} from '../interface/MessageTypes';
import UserRepository from '../repository/UserRepository';
import {User} from '../interface/User';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {title: 'Express'});
});

// 메시지 받기
router.post('/message', async (req, res) => {
	const commute: Commute = new Commute();
	const slackInfo: SlackInfo = convertToSlackInfo(req.body as OutWebhook);
	const message: string = slackInfo.text.trim();
	
	if (message === messageTypes.register) {
	
	} else if (message === messageTypes.start) {
		await commute.workStart(slackInfo);
	} else if (message === messageTypes.end) {
		await commute.workEnd(slackInfo);
	}
	
	res.json({'text': '발신 테스트 중입니다.'});
});

// 테스트용
router.get('/commute', (async (req, res) => {
	const commute: Commute = new Commute();
	const browser: Browser | null = await commute.launch();
	const slackInfo: SlackInfo = {
		teamDomain: '',
		serviceId: '',
		channelId: '',
		channelName: '',
		timestamp: '',
		userId: '',
		userName: 'fedaykin',
		text: '출근'
	}
	
	if (browser !== null) {
		const page: Page | null = await commute.login(browser, slackInfo);
		
		if (page !== null) {
			await commute.start(page);
		}
	}
}));

// 등록 테스트용
router.get('/register', ((req, res) => {
	res.send('not yet!');
}));


// sequelize 테스트용
router.get('/db', async (req, res) => {
	const userRepository: UserRepository = new UserRepository();
	const userOne: User = {
		userId: 'fedaykin',
		userName: '정상운',
		jadeUserId: 'fedaykin',
		jadeUserPassword: '',
	}
	
	await userRepository.deleteOne(userOne.userId);
	await userRepository.insertOne(userOne);
});

router.get('/db/create', async (req, res) => {
	const userRepository: UserRepository = new UserRepository();
	const result: boolean = await userRepository.createTable();
	const text: string = (result) ? 'Success create table!' : 'Fail create table!';
	
	res.send(text);
})

module.exports = router;
