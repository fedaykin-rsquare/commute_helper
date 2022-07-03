import express, {Application} from 'express';
import morgan from 'morgan';
import path from 'path';
import {logger, stream} from './log/winston';
import cookieParser from 'cookie-parser';

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app: Application = express();

app.use(morgan('dev', {stream: stream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join('public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
