import map from 'lodash/map';
import filter from 'lodash/filter';
import last from 'lodash/last';
import { format } from 'date-fns';

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

    // Object.assign(cond, duelTimeFilter());

    const data = await Duel.find(cond).sort('-ts').limit(5);

    await ctx.replyWithHTML(formatDuels(data, name));

    debug('GET /arena', name);

  } catch (e) {
    error(e.message);
    ctx.replyError('/arena', e);
  }

}


// function duelTimeFilter() {
//   const today = new Date();
//   today.setHours(10, 0, 0, 0);
//   return { ts: { $gt, $lt } };
// }

function dateFormat(date) {
  return format(date, 'dd/MM kk:mm');
}


function formatDuels(duels, primaryName) {

  const wonOver = filter(map(duels, ({ winner, loser }) => winner.name === primaryName && loser));
  const lostTo = filter(map(duels, ({ winner, loser }) => loser.name === primaryName && winner));

  if (!duels.length) {
    return `Арены <b>${primaryName}</b> не найдены`;
  }

  const { ts: minDate } = duels[0];
  const { ts: maxDate } = last(duels);

  return [
    `Арены <b>${primaryName}</b> c ${dateFormat(minDate)} по ${dateFormat(maxDate)}`,
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
    return filter([
      '∙\t',
      castle,
      tag ? `[${tag}]` : '',
      name,
    ]).join(' ');
  }

}
