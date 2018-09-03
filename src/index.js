import Telegraf from 'telegraf';
import bot, { BOT_ID, BOT_USER_NAME } from 'sistemium-telegram/services/bot';
import log from 'sistemium-telegram/services/log';
import session from 'sistemium-telegram/services/session';

import contextConfig from 'sistemium-telegram/config/context';

import start from './middleware/start';
import { adminOnly, grant } from './middleware/auth';
import { hello } from './middleware/hello';
import etc from './middleware/message';
import * as triggers from './middleware/triggers';
import * as guild from './middleware/guild';
import hero from './middleware/hero';

import { fromCWFilter } from './etc/filters';

const { debug, error } = log('index');

contextConfig(bot);

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
bot.hears(/\/grant[ _]stockmaster[ ]?(\d*)/, adminOnly(guild.grantStockMaster));
bot.hears(/\/grant ([^ ]+)[ ]?(\d*)/, adminOnly(grant));

/*
Guild
 */

bot.hears(/\/request[ _]([a-z0-9]+)[ _]([0-9]+)/, guild.requestWithdraw);

/*
Triggers
 */

bot.command('triggers', triggers.triggerList);
// bot.command('trigger_add', triggers.addTrigger);
bot.hears(/^(\/add[ _]trigger) (.+)$/, adminOnly(triggers.addTrigger));
bot.hears(/^(\/del[ _]trigger)[ ]?(.*)$/, adminOnly(triggers.delTrigger));


/*
ChatWars
*/

bot.on('message', Telegraf.optional(fromCWFilter, hero));

/*
Other
 */

const commandAtRe = new RegExp(`^(\\/[a-z0-9_]+)@${BOT_USER_NAME}$`);

bot.hears(commandAtRe, triggers.commandAt);
bot.on('message', triggers.executeTrigger, etc);

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
