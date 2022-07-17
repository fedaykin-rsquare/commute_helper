import {logger} from '../log/winston';
import Slack from 'slack-node';

class SlackAPI {
	private slackUrl: string = <string> process.env.slack_url;
	private slack: Slack = new Slack();
	
	constructor() {
		this.slack.setWebhook(this.slackUrl);
	}
	
	public send(message: string, userName: string = '') {
		if (userName.trim() !== '') {
			message = userName + '님 ' + message;
		}
		
		this.slack.webhook({
			text: message
		}, (err, response) => {
			if (response.status === 'fail') {
				logger.error(err.errorMessage);
			}
		});
	}
}

export default SlackAPI;
