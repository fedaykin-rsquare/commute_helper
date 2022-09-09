import {logger} from '../log/winston';
import {IncomingWebhook} from '@slack/webhook';

class SlackAPI {
	private slackUrl: string = <string> process.env.slack_url;
	private webhook: IncomingWebhook = new IncomingWebhook(this.slackUrl);
	
	constructor() {
	}
	
	public send(message: string, userName: string = '') {
		if (userName.trim() !== '') {
			message = userName + '님 ' + message;
		}
		
		
		(async () => {
			await this.webhook.send({
				blocks: [{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: message,
					}
				}],
			});
		})();
		
		/*this.webhook.webhook({
			
			text: message
		}, (err, response) => {
			if (response.status === 'fail') {
				logger.error(err.errorMessage);
			}
		});*/
	}
}

export default SlackAPI;
