import path from 'path';
import winston from 'winston';
import daily from 'winston-daily-rotate-file';

const {combine, timestamp, printf, colorize} = winston.format;
const logPath: string = path.join('./logs');
const logFormat = printf!((info) => {
	return `[${info.timestamp}] [${info.level}] - ${info.message}`;
});

const logger = winston.createLogger({
	format: combine!(
		timestamp!({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		logFormat
	),
	transports: [
		new daily({
			level: 'info',
			datePattern: 'YYYY-MM-DD',
			dirname: logPath + '/info',
			filename: '%DATE%.info.log',
			maxFiles: 30,
			zippedArchive: true,
		}),
		new daily({
			level: 'error',
			datePattern: 'YYYY-MM-DD',
			dirname: logPath + '/error',
			filename: '%DATE%.error.log',
			maxFiles: 30,
			zippedArchive: true,
		})
	]
});

const stream = {
	write: (message: string) => {
		logger.info(message)
	}
}

if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new winston.transports.Console({
			format: combine!(
				colorize!({all: true}),
				logFormat
			)
		})
	);
}

export {logger, stream};
