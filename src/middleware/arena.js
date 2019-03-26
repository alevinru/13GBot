import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import maxBy from 'lodash/maxBy';
import sumBy from 'lodash/sumBy';
import filter from 'lodash/filter';
import last from 'lodash/last';
import { format, addDays } from 'date-fns';

import log from 'sistemium-telegram/services/log';
import Duel from '../models/Duel';

const { debug, error } = log('mw:arena');

const DUEL_RESET_HOUR = parseInt(process.env.DUEL_RESET_HOUR, 0) || 12;

export default async function (ctx) {

  const { from: { id: fromUserId }, message } = ctx;
  const { match } = ctx;
  const [, name, shiftParam = '0'] = match;

  debug(fromUserId, message.text, name, shiftParam);


  try {

    const shift = parseInt(shiftParam, 0);
    const [, tag] = name.match(/\[(.+)\]/) || [];

    if (tag) {

      const { tf, res: data } = await guildDuels(tag, shift);

      const reply = [
        `Арены <b>[${tag}]</b> за ${format(tf.ts.$gt, 'dd/MM')}:\n`,
        ...map(data, formatGuildMemberDuels),
        `\nВсего бойцов: <b>${data.length}</b> побед: ${formatGuildTotalDuels(data)}`,
      ];

      await ctx.replyWithHTML(reply.join('\n'));

    } else {

      const cond = { $or: [{ 'winner.name': name }, { 'loser.name': name }] };
      const data = await Duel.find(cond).sort('-ts').limit(5);

      await ctx.replyWithHTML(formatDuels(data, name));

    }

    debug('GET /arena', name);

  } catch (e) {
    error(e.message);
    ctx.replyError('/arena', e);
  }

}

function formatGuildTotalDuels(duels) {
  return `<b>${sumBy(duels, 'won') || 0}</b>/<b>${sumBy(duels, 'lost') || 0}</b>`;
}

function formatGuildMemberDuels(duels) {
  const {
    name,
    won,
    lost,
    level,
  } = duels;
  return `<code>${level}</code> ${name}: <b>${won}</b>/<b>${lost}</b>`;
}


async function guildDuels(tag, shift) {

  const cond = { $or: [{ 'winner.tag': tag }, { 'loser.tag': tag }] };

  const tf = duelTimeFilter(shift);

  Object.assign(cond, tf);

  const duels = await Duel.find(cond);

  const named = map(duels, duel => {

    const { winner, loser } = duel;
    const isWinner = winner.tag === tag;
    const name = isWinner ? winner.name : loser.name;
    const result = isWinner ? 'won' : 'lost';
    const opponentName = isWinner ? loser.name : winner.name;
    const level = isWinner ? winner.level : loser.level;

    return {
      ...duel,
      name,
      result,
      opponentName,
      level,
    };

  });

  const res = map(groupBy(named, 'name'), (nameDuels, name) => {
    const { won = [], lost = [] } = groupBy(nameDuels, 'result');
    const { level } = maxBy(nameDuels, 'level');
    return {
      name,
      level,
      won: won.length,
      lost: lost.length,
    };
  });

  return { tf, res: orderBy(res, ['level', 'name'], ['desc', 'asc']) };

}


function duelTimeFilter(shift) {

  const today = addDays(new Date(), -shift);
  let $lt = addDays(new Date(), -shift);

  $lt.setHours(DUEL_RESET_HOUR, 0, 0, 0);

  if ($lt < today) {
    $lt = addDays($lt, 1);
  }

  const $gt = addDays($lt, -1);

  debug('duelTimeFilter', shift, $gt, $lt);

  return { ts: { $gt, $lt } };

}

function dateFormat(date) {
  return format(date, 'dd/MM kk:mm');
}


function formatDuels(duels, primaryName) {

  const wonOver = filter(map(duels, ({ winner, loser }) => winner.name === primaryName && loser));
  const lostTo = filter(map(duels, ({ winner, loser }) => loser.name === primaryName && winner));

  if (!duels.length) {
    return `Арены <b>${primaryName}</b> не найдены`;
  }

  const { ts: maxDate } = duels[0];
  const { ts: minDate } = last(duels);

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
      '\t',
      castle,
      tag ? `[${tag}]` : '',
      name,
    ]).join(' ');
  }

}
