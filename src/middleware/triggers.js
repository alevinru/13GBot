import escapeRegExp from 'lodash/escapeRegExp';
import find from 'lodash/find';

import * as triggering from '../services/triggering';
import log from '../services/log';

const { debug, error } = log('mw:triggers');

export async function triggerList(ctx) {

  const { from: { id: fromUserId }, message: { text } } = ctx;
  // const { match } = ctx;
  // const [command] = match;

  debug(text, fromUserId);

  try {

    const triggers = await triggering.getTriggerList();

    if (triggers.length) {
      ctx.replyMD(triggers.join('\n'));
    } else {
      ctx.replyMD('Список триггеров пуст');
    }

  } catch (e) {
    ctx.replyError(text, e);
  }

}


export async function addTrigger(ctx) {

  const { from: { id: fromUserId }, match, message } = ctx;
  // const re = new RegExp(escapeRegExp()`/${command}([^ ]+) (.+)`);
  const [, command, triggerMatch, replyText] = match;

  debug(command, fromUserId, triggerMatch, replyText);

  try {

    await triggering.addTrigger(triggerMatch, replyText);

    ctx.replyMD('Добавил');

  } catch (e) {
    error(command, message.text);
    ctx.replyError(command, e);
  }

}


export async function delTrigger(ctx) {

  const { from: { id: fromUserId }, match, message } = ctx;
  const [, command, triggerMatch] = match;

  debug(command, fromUserId, triggerMatch);

  try {

    await triggering.rmTrigger(triggerMatch);

    ctx.replyMD('Удалил');

  } catch (e) {
    error(command, message.text);
    ctx.replyError(command, e);
  }

}


export async function trigger(ctx, next) {

  const { from: { id: fromUserId }, message: { text } } = ctx;

  try {

    const triggers = await triggering.getTriggerList();

    const re = new RegExp(escapeRegExp(text), 'i');
    const triggerKey = find(triggers, t => re.test(t));

    if (!triggerKey) {
      await next();
      return;
    }

    const reply = await triggering.getTrigger(triggerKey);
    debug('trigger', fromUserId, triggerKey, reply);

    ctx.reply(reply);

  } catch (e) {
    error(text, e.name, e.message);
  }

}
