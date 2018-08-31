import Telegraf from 'telegraf';
import log from '../services/log';
import { getSession, setSession } from '../services/session';
import { BOT_ID } from '../services/bot';

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

  try {
    ctx.replyPlain('У вас нет прав выполнять эту операцию');
  } catch (e) {
    error(e.name, e.message);
  }

}

export async function grant(ctx) {

  const { match, session, from: { id: authorId } } = ctx;
  const [, role, userId] = match;

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
