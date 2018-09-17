import log from 'sistemium-telegram/services/log';

import bot, { BOT_ID, BOT_USER_NAME } from 'sistemium-telegram/services/bot';
import session from 'sistemium-telegram/services/session';
import contextConfig from 'sistemium-telegram/config/context';

import commands from './commands';

const { debug, error } = log('index');

contextConfig(bot);

/*
Low level middleware
*/

bot.use(exceptionHandler);
bot.use(session({ botId: BOT_ID }).middleware());

commands(bot, BOT_USER_NAME);

bot.startPolling();

debug('Start polling bot id:', BOT_ID, `as "${BOT_USER_NAME}"`);

/*
Exception handlers
*/

function exceptionHandler(ctx, next) {

  return next()
    .catch(({ name, message }) => {
      error('exceptionHandler', name, message);
      return ctx.reply(`Error: ${message}`);
    });

}

bot.catch(({ name, message }) => {
  debug(name, message);
});
