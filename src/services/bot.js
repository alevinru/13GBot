import Telegraf from 'telegraf';
import log from './log';

const { BOT_TOKEN } = process.env;

export const BOT_ID = BOT_TOKEN.match(/^[^:]*/)[0];
export const { BOT_USER_NAME } = process.env;

const options = { username: BOT_USER_NAME };

const { debug } = log('bot');

export default new Telegraf(BOT_TOKEN, options);

debug('Starting bot id:', BOT_ID, 'username:', BOT_USER_NAME);
