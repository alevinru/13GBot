import log from '../services/log';

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
      `Hi there, *${firstName}*!\n`,
      `Your user id is *${userId}*`,
    ];


    if (session.isAdmin) {
      response.push('\nТы админ, кстати!');
    }

    ctx.replyMD(response);

  }

}
