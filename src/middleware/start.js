import log from 'sistemium-telegram/services/log';
import { hello } from './hello';

const { debug } = log('mw:start');

export default async function (ctx) {

  const { reply, from: { id: userId }, session } = ctx;
  debug(userId);

  if (session.auth) {
    await hello(ctx);
  } else {
    reply('Бот 13го Галеона приветствует тебя!');
  }

}
