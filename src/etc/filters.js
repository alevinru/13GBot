import log from 'sistemium-telegram/services/log';

const CW_BOT_ID = parseInt(process.env.CW_BOT_ID, 0);

const { debug } = log('filters');

export function forwardFilter(ctx) {
  return !!ctx.message.forward_from;
}

export function fromCWFilter(ctx) {

  if (!forwardFilter(ctx)) {
    return false;
  }

  const { forward_from: from } = ctx.message;
  const res = from.id === CW_BOT_ID;
  debug('fromCWFilter', res);
  return res;

}

const heroRe = /Уровень[\s\S]*Ранг[\s\S]*Класс/;

export function heroFilter(ctx) {

  const { text } = ctx.message;
  debug('heroFilter', heroRe.test(text));
  return heroRe.test(text);

}


export function levelUpFilter(ctx) {

  const { message: { sticker } } = ctx;

  if (!sticker) {
    return false;
  }

  return sticker.file_id === 'CAADAgADiQAD6st5AuZbw2Z4SeORAg';

}
