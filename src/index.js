// import Telegraf from 'telegraf';
import log from './services/log';
import session from './services/session';
import bot, { BOT_ID } from './services/bot';

import start from './middleware/start';
import { hello } from './middleware/hello';
import etc from './middleware/message';
import * as triggers from './middleware/triggers';

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
Triggers
 */

bot.command('triggers', triggers.triggerList);
// bot.command('trigger_add', triggers.addTrigger);
bot.hears(/^(\/add_trigger) ([^ ]+) (.+)$/, triggers.addTrigger);
bot.hears(/^(\/del_trigger) ([^ ]+)$/, triggers.delTrigger);

/*
Other
 */

bot.on('message', triggers.trigger, etc);

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
