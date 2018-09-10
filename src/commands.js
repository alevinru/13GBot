import Telegraf from 'telegraf';

import start from './middleware/start';
import { adminOnly, grant } from './middleware/auth';
import { hello } from './middleware/hello';
import etc from './middleware/message';
import * as triggers from './middleware/triggers';
import * as guild from './middleware/guild';
import * as hero from './middleware/hero';

import { fromCWFilter } from './etc/filters';

export default function (bot, BOT_USER_NAME) {

  /*
  Users
   */

  bot.command('start', start);
  bot.command('hello', hello);
  bot.hears(/^\/grant[ _]stockmaster[ ]?(\d*)$/, adminOnly(guild.grantStockMaster));
  bot.hears(/^\/grant ([^ ]+)[ ]?(\d*)$/, adminOnly(grant));

  /*
  Guild
   */

  bot.hears(/^\/request[ _]([a-z0-9]+)[ _]([0-9]+)$/, guild.requestWithdraw);

  /*
  Triggers
   */

  bot.command('triggers', triggers.triggerList);

  bot.hears(/^(\/add[ _]trigger) (.+)$/i, adminOnly(triggers.addTrigger));
  bot.hears(/^(\/del[ _]trigger)[ ]?(.*)$/i, adminOnly(triggers.delTrigger));


  /*
  ChatWars
  */

  bot.on('message', Telegraf.optional(fromCWFilter, hero.parseHero));
  bot.command('equip', hero.getAllEquip);

  /*
  Other
   */

  const commandAtRe = new RegExp(`^(\\/[a-z0-9_]+)@${BOT_USER_NAME}$`, 'i');

  bot.hears(commandAtRe, triggers.commandAt);
  bot.on('message', triggers.executeTrigger, etc);

}