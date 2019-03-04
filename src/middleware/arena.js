import map from 'lodash/map';
import filter from 'lodash/filter';

import log from 'sistemium-telegram/services/log';
import Duel from '../models/Duel';

const { debug, error } = log('mw:arena');

export default async function (ctx) {

  const { from: { id: fromUserId }, message } = ctx;
  const { match } = ctx;
  const [, name] = match;

  debug(fromUserId, message.text, match);

  try {

    const cond = { $or: [{ 'winner.name': name }, { 'loser.name': name }] };

    const data = await Duel.find(cond);

    await ctx.replyWithHTML(formatDuels(data, name));

    debug('GET /arena', name);

  } catch (e) {
    error(e.message);
    ctx.replyError('/arena', e);
  }

}


function formatDuels(duels, primaryName) {

  const wonOver = filter(map(duels, ({ winner, loser }) => winner.name === primaryName && loser));
  const lostTo = filter(map(duels, ({ winner, loser }) => loser.name === primaryName && winner));

  return [
    `Арены <b>${primaryName}</b>:`,
    `Победил${opponentList(wonOver)}`,
    `Проиграл${opponentList(lostTo)}`,
  ].join('\n\n');

  function opponentList(opponents) {

    if (!opponents.length) {
      return ': ни разу!';
    }

    return ` (<b>${opponents.length}</b>): \n\n${map(opponents, opponentFormat).join('\n')}`;

  }

  function opponentFormat({ castle, tag, name }) {
    return [
      '∙\t',
      castle,
      tag ? `[${tag}]` : '',
      name,
    ].join(' ');
  }

}
