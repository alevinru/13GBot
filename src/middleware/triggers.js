import find from 'lodash/find';
import trim from 'lodash/trim';
import orderBy from 'lodash/orderBy';

import * as triggering from '../services/triggering';
import log from '../services/log';

const { debug, error } = log('mw:triggers');

export async function triggerList(ctx) {

  const { from: { id: fromUserId }, message: { text } } = ctx;

  debug(text, fromUserId);

  try {

    const triggers = await triggering.getTriggerList();
    const replies = triggers.map(trigger => trigger.join(', '));

    if (triggers.length) {
      ctx.replyHTML(orderBy(replies).join('\n'));
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

  debug(command, fromUserId, triggerMatch, replyText || 'empty');
  debug('message', message);

  try {

    if (!replyText) {
      await ctx.replyHTML('Я такое не умею триггерить, только текст обычный пока');
      return;
    }

    const multi = triggerMatch.match(/^\[(.+)]$/);

    const matches = multi ? multi[1].split(',').map(trim) : [triggerMatch];

    const trigger = JSON.stringify(matches);
    debug(command, multi, trigger);

    await triggering.addTrigger(trigger, replyText);

    await ctx.replyHTML(`Добавил триггер <b>${triggerMatch}</b>`);

  } catch (e) {
    error(command, message.text);
    ctx.replyError(command, e);
  }

}


export async function delTrigger(ctx, next) {

  const { match, message } = ctx;
  const { reply_to_message: replyTo = {} } = message;
  const [, command, triggerMatchInline] = match;

  const triggerMatch = triggerMatchInline || replyTo.text;

  debug(command, triggerMatch || 'no match', replyTo.text);

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


export async function executeTrigger(ctx, next) {

  const { message: { text } } = ctx;

  if (!text) {
    return;
  }

  try {

    const triggers = await triggering.getTriggerList();

    // TODO: a service to cache regexps in memory and watch for redis changes
    const triggerKey = find(triggers, triggering.matchesTrigger(text));

    if (!triggerKey) {
      await next();
      return;
    }

    const reply = await triggering.getTrigger(triggerKey);
    debug('executeTrigger', triggerKey, reply);

    // const finalReply = reply.replace(/\|/g, '\n');

    await ctx.reply(reply);

  } catch (e) {
    error(text, e.name, e.message);
  }

}

export async function commandAt(ctx, next) {

  const { match, message } = ctx;

  const [, cmd] = match;

  debug('commandAt', match, cmd);

  if (cmd) {
    message.text = cmd;
    return executeTrigger(ctx);
  }

  return next();

}
