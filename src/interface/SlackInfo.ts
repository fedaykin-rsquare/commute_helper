
export interface OutWebhook {
	token: string,
	team_id: string,
	team_domain: string,
	service_id: string,
	channel_id: string,
	channel_name: string,
	timestamp: string,
	user_id: string,
	user_name: string,
	text: string,
	trigger_word: string
}

export interface SlackInfo {
	teamDomain: string,
	serviceId: string,
	channelId: string,
	channelName: string,
	timestamp: string,
	userId: string,
	userName: string,
	text: string
}

export function convertToSlackInfo(outWebhook: OutWebhook): SlackInfo {
	return {
		teamDomain: outWebhook.team_domain,
		serviceId: outWebhook.service_id,
		channelId: outWebhook.channel_id,
		channelName: outWebhook.channel_name,
		timestamp: outWebhook.timestamp,
		userId: outWebhook.user_id,
		userName: outWebhook.user_name,
		text: outWebhook.text
	}
}

