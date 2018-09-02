import bot from '../services/bot';
import * as guild from '../services/guildManagement';
import log from '../services/log';

const { debug, error } = log('mw:guild');

export async function requestWithdraw(ctx) {

  const { match, from } = ctx;

  const [text, itemCode, qty] = match;

  const command = text.replace(/ /g, '_');

  debug(command, itemCode, qty, from.username);

  try {

    const master = await guild.getStockMaster();

    if (!master) {
      await ctx.replyError(command, 'У нас не назначен завхоз');
      return;
    }

    // Reply to author
    const request = await guild.addStockRequest(from.id, itemCode, qty);

    await ctx.replyHTML(`Отправил завхозу запрос №<code>${request.id}</code>`);

    // Notify stock master
    const fromText = `@${from.username} <b>${from.first_name} ${from.last_name}</b> просит:`;

    const withdraw = `/g_withdraw ${itemCode} ${qty}`;

    await bot.telegram.sendMessage(master, fromText, { parse_mode: 'HTML' });
    await bot.telegram.sendMessage(master, withdraw);

  } catch (e) {
    error(e.name, e.message);
  }

}


export async function grantStockMaster(ctx) {

  const { match, message } = ctx;
  const { reply_to_message: replyTo } = message;

  const [command, inlineUserId] = match;

  const userId = replyTo ? replyTo.from.id : inlineUserId;

  debug(command, userId, replyTo);

  try {

    if (!userId) {
      await ctx.reply('ИД юзера не понял, туплю чето');
      return;
    }

    await guild.setStockMaster(userId);
    await ctx.replyHTML(`Назначил завхозом юзера <code>${userId}</code> @${replyTo.from.username}`);

  } catch (e) {
    ctx.replyError(command, e);
    error(command, e.name, e.message);
  }

}
