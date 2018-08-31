// import Telegraf from 'telegraf';
import log from './services/log';
import session from './services/session';
import bot, { BOT_ID } from './services/bot';


import start from './middleware/start';
import { hello } from './middleware/hello';

const { debug, error } = log('index');

require('./config/context').default(bot);

/*
Low level middleware
*/

bot.use(exceptionHandler);
bot.use(session({ botId: BOT_ID }).middleware());

/*
Users
 */

bot.command('start', start);
// bot.command('auth', auth);
bot.command('hello', hello);
// bot.command('users', users.listUsers);

/*
Other
 */

// bot.on('message', require('./middleware/message').default);

bot.startPolling();
debug('Start polling');

/*
Exception handlers
*/

function exceptionHandler(ctx, next) {

  // debug('userId', 'start');

  return next()
  // .then(() => debug('exceptionHandler', 'end'))
    .catch(({ name, message }) => {
      error('exceptionHandler', name, message);
      return ctx.reply(`Error: ${message}`);
    });

}

bot.catch(({ name, message }) => {
  debug(name, message);
});
