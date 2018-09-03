import log from 'sistemium-telegram/services/log';

const { debug, error } = log('mw:hello');

// eslint-disable-next-line
export async function hello(ctx) {

  const { session, from: { id: userId, first_name: firstName } } = ctx;

  debug('/hello', userId, firstName, ctx.from);

  if (!session.auth) {
    debug('no auth');
  }

  try {

    replyResults();

  } catch (e) {
    error(e.name, e.message);
    ctx.replyError('to greet you', e);
  }

  function replyResults() {

    const response = [
      `Привет, *${firstName}*!\n`,
      `Твой юзер ид в Телеграм: *${userId}*`,
    ];


    if (session.isAdmin) {
      response.push('\nТы мой админ, кстати!');
    }

    ctx.replyMD(response);

  }

}
