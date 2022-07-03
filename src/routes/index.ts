import express from 'express';
import Commute from '../service/commute';
import {logger} from '../log/winston';
import {Browser, Page} from 'puppeteer';
import SlackMessage from '../interface/SlackMessage';
import {messageTypes} from '../interface/MessageTypes';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 메시지 받기
router.post('/message', async (req, res) => {
  const commute: Commute = new Commute();
  const slackMessage: SlackMessage = req.body as SlackMessage;
  const message: string = slackMessage.text.trim();
  
  logger.debug('slackMessage :', slackMessage);
  
  if (message === messageTypes.register) {
  
  } else if (message === messageTypes.start) {
    await commute.workStart();
  } else if (message === messageTypes.end) {
    await commute.workEnd();
  }
});

// 테스트용
router.get('/commute', (async (req, res) => {
  const commute: Commute = new Commute();
  const browser: Browser | null = await commute.launch();
  
  if (browser !== null) {
    const page: Page | null = await commute.login(browser);
  
    if (page !== null) {
      await commute.start(page);
    }
  }
}));

// 등록 테스트용
router.get('/register', ((req, res) => {
  res.send('not yet!');
}));



module.exports = router;
