import escapeRegExp from 'lodash/escapeRegExp';
import find from 'lodash/find';

import * as triggering from '../services/triggering';
import log from '../services/log';

const { debug, error } = log('mw:triggers');

export async function triggerList(ctx) {

  const { from: { id: fromUserId }, message: { text } } = ctx;

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
  const { reply_to_message: replyTo } = message;
  // const re = new RegExp(escapeRegExp()`/${command}([^ ]+) (.+)`);
  const [, command, triggerMatch, replyTextInline] = match;
  const replyText = replyTextInline || replyTo && replyTo.text;

  debug(command, fromUserId, triggerMatch, replyText);

  try {

    await triggering.addTrigger(triggerMatch, replyText);

    ctx.replyHTML(`Добавил триггер <b>${triggerMatch}</b>`);

  } catch (e) {
    error(command, message.text);
    ctx.replyError(command, e);
  }

}


export async function delTrigger(ctx, next) {

  const { match, message } = ctx;
  const { reply_to_message: replyTo = {} } = message;
  const [, command, triggerMatchInline] = match;

  debug(command, triggerMatchInline || 'no match', replyTo);

  const triggerMatch = triggerMatchInline || replyTo.text;

  if (!triggerMatch) {
    await next();
    return;
  }

  try {

    const res = await triggering.rmTrigger(triggerMatch);

    if (res) {
      ctx.replyHTML(`Удалил триггер <b>${triggerMatch}</b>`);
    } else {
      ctx.replyHTML(`Не нашел триггера <b>${triggerMatch}</b> и ничего не удалил`);
    }

  } catch (e) {
    error(command, message.text);
    ctx.replyError(command, e);
  }

}


export async function trigger(ctx, next) {

  const { from: { id: fromUserId }, message: { text } } = ctx;

  if (!text) {
    return;
  }

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

    const finalReply = reply.replace(/\|/g, '\n');

    ctx.reply(finalReply);

  } catch (e) {
    error(text, e.name, e.message);
  }

}
