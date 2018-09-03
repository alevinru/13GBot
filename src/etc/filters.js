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
  debug('fromCWFilter', from, res);
  return res;

}
