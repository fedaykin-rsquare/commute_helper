import {messageTypes} from './MessageTypes';

export const responseMessages = {
	success: (text: string): string => {
		let responseText: string = '';
		
		if (text.trim() === messageTypes.start) {
			responseText = '성공적으로 출근 되었습니다. 오늘 하루도 화이팅하세요! :meow_code:';
		} else if (text.trim() === messageTypes.end) {
			responseText = '성공적으로 퇴근 되었습니다. 얼른 집가서 푹 쉬세요! :meow_party:';
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
	},
	confirm: (text: string, time: string): string => {
		let responseText: string = '';
		
		if (text.trim() === messageTypes.confirm_start) {
			responseText = time + '에 성공적으로 출근 처리 되었습니다';
		} else if (text.trim() === messageTypes.confirm_end) {
			responseText = time + '에 성공적으로 퇴근 처리 되었습니다.';
		}
		
		return responseText;
	},
	confirm_fail: (text: string): string => {
		return `${text}이 처리된 내역을 찾을 수 없습니다.`;
	},
	error: (text: string): string => {
		const responseText: string = `실패 사유: ${text}`;
		
		return responseText;
	}
}
