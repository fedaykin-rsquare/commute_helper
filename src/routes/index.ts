import express from 'express';
import Commute from '../service/commute';
import {Browser, Page} from 'puppeteer';
import {convertToSlackInfo, OutWebhook, SlackInfo} from '../interface/SlackInfo';
import {messageTypes} from '../interface/MessageTypes';
import UserRepository from '../repository/UserRepository';
import {User} from '../interface/User';
import CipherModule from '../crypto/CipherModule';

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
		teamDomain: 'rsquare',
		serviceId: '3765375367249',
		channelId: 'C03N74EFU1J',
		channelName: '출퇴근_도우미_테스트용',
		timestamp: '1657032514.184039',
		userId: 'U02T9DCKRNE',
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
		salt: ''
	}
	
	await userRepository.deleteOne(userOne.userId);
	await userRepository.insertOne(userOne);
	console.log(await userRepository.findByUserId(userOne.userId));
});

router.get('/db/create', async (req, res) => {
	const userRepository: UserRepository = new UserRepository();
	const result: boolean = await userRepository.createTable();
	const text: string = (result) ? 'Success create table!' : 'Fail create table!';
	
	res.send(text);
});

router.post('/db/insert', async (req, res) => {
	const userRepository: UserRepository = new UserRepository();
	const userOne: User = {
		userId: req.body.user_id,
		userName: req.body.user_name,
		jadeUserId: req.body.jade_user_id,
		jadeUserPassword: req.body.jade_user_password,
		salt: ''
	}
	const result: User = await userRepository.insertOne(userOne);
	
	return (result.salt !== '') ? res.send('Success insert your info!') : res.send('Fail to insert your info!');
});

router.get('/cipher', (req, res) => {
	const text: string = '';
	const cipherModule: CipherModule = new CipherModule();
	const encryptedText: string = cipherModule.encrypt(text);
	
	console.log('text :', text);
	console.log('encrypted :', cipherModule.encrypt(text));
	console.log('decrypted :', cipherModule.decrypt(encryptedText, cipherModule.getSalt()));
});

module.exports = router;
