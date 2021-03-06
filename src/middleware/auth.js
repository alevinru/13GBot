import Telegraf from 'telegraf';
import log from 'sistemium-telegram/services/log';
import { getSession, setSession } from 'sistemium-telegram/services/session';
import { BOT_ID } from 'sistemium-telegram/services/bot';

const { debug, error } = log('mw:auth');

export function adminOnly(mw) {
  return Telegraf.branch(adminFilter, mw, notAuthorized);
}

function adminFilter(ctx) {

  const { session, from: { id: userId, first_name: firstName } } = ctx;

  const { isAdmin = false } = session;

  debug(userId, firstName, isAdmin ? 'is admin' : 'is not admin');

  return isAdmin;

}

async function notAuthorized(ctx) {

  const { from: { first_name: firstName } } = ctx;

  try {
    ctx.replyPlain(`${firstName}, у вас нет прав выполнять эту операцию`);
  } catch (e) {
    error(e.name, e.message);
  }

}

export async function grant(ctx) {

  const { match, session, from: { id: authorId } } = ctx;
  const { reply_to_message: replyTo } = ctx.message;
  const [, role, inlineUserId] = match;

  const userId = replyTo ? replyTo.from.id : inlineUserId;

  try {

    if (authorId.toString() === userId) {
      session[role] = true;
    } else {
      await modifyUserSession(userId, { [role]: true });
    }

    ctx.replyHTML(`Дал роль ${role} юзеру c ид <code>${userId}</code>`);

  } catch (e) {
    error(e.name, e.message);
  }

}

async function modifyUserSession(userId, data) {

  const session = await getSession(BOT_ID, userId);

  Object.assign(session, data);

  await setSession(BOT_ID, userId, session);

}
