import {messageTypes} from './MessageTypes';

export interface ResponseMessages {
	start_success: string
	start_fail: string
	end_success: string
	end_fail: string
}

export const responseMessages = {
	success: (text: string): string => {
		let responseText: string = '';
		
		if (text.trim() === messageTypes.start) {
			responseText = '성공적으로 출근 처리 되었습니다.';
		} else if (text.trim() === messageTypes.end) {
			responseText = '성공적으로 퇴근 처리 되었습니다.';
		}
		
		return responseText;
	},
	fail: (text: string): string => {
		let responseText: string = '';
		
		if (text.trim() === messageTypes.start) {
			responseText = '출근 처리에 실패했습니다. Jade로 접속하여 직접 시도해주시길 바랍니다.';
		} else if (text.trim() === messageTypes.end) {
			responseText = '퇴근 처리에 실패했습니다. Jade로 접속하여 직접 시도해주시길 바랍니다.';
		}
		
		return responseText;
	}
}
