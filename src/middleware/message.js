import log from '../services/log';

const { PHRASE_NOT_IMPLEMENTED } = process.env || 'What ?';

const { debug } = log('mw:message');

export default async function (ctx, next) {

  await next();

  const {
    // message,
    message: { forward_from: forwardFrom, text },
    from: { id: userId, username, first_name: firstName },
    chat: { id: chatId },
    reply,
  } = ctx;

  // debug(JSON.stringify(message));

  if (chatId !== userId) {
    debug('ignore:', `@${username} ${firstName}`, text);
    return;
  }

  debug('from:', userId, forwardFrom || '(not a forward)', text);
  reply(PHRASE_NOT_IMPLEMENTED);

}
