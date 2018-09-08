import log from 'sistemium-telegram/services/log';
import { hello } from './hello';

const { debug, error } = log('mw:start');

export default async function (ctx) {

  const { reply, from: { id: userId }, session } = ctx;
  debug(userId);

  try {
    if (session.auth) {
      await hello(ctx);
    } else {
      await reply('Бот 13го Галеона приветствует тебя!');
    }
  } catch (e) {
    error(e);
  }

}
