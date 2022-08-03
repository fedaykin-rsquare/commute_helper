
export interface Selectors {
	company: string;
	id: string;
	password: string;
	login: string;
	startWork: string;
	endWork: string;
	modalFrame: string;
	save: string;
	confirm_start: string;
	confirm_end: string;
}

export const selector: Selectors = {
	company: '#S_C_CD',
	id: '#S_USER_ID',
	password: '#S_PWD',
	login: '#btn_login',
	startWork: '#S_WORK_STA_BTN',
	endWork: '#S_WORK_END_BTN',
	modalFrame: '.modalCon iframe',
	save: '.save',
	confirm_start: '#C_IN_HM',
	confirm_end: '#C_OUT_HM'
};
