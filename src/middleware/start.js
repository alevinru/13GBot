import log from 'sistemium-telegram/services/log';
import { hello } from './hello';

const { debug, error } = log('mw:start');

const { PHRASE_ON_START } = process.env;

export default async function (ctx) {

  const { reply, from: { id: userId }, session } = ctx;
  debug(userId);

  try {
    if (session.auth) {
      await hello(ctx);
    } else {
      await reply(PHRASE_ON_START);
    }
  } catch (e) {
    error(e);
  }

}
