import log from 'sistemium-telegram/services/log';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
import * as eq from '../services/equip';

const { debug, error } = log('mw:hero');

const equipRe = /^🎽Экипировка/;
const itemRe = /⚔|🛡/;

export async function parseHero(ctx, next) {

  const { message: { from, text, forward_date: date } } = ctx;

  const userId = from.id;
  const ts = new Date(date * 1000);

  const items = text.split('\n');

  const equipStart = findIndex(items, item => equipRe.test(item));

  debug(userId, equipStart, ts);

  if (equipStart < 0) {
    await next();
    return;
  }

  try {

    const equipEnd = findIndex(items, '', equipStart + 1);

    let equip = filter(items.slice(equipStart + 1, equipEnd - 2), item => itemRe.test(item));

    equip = equip.map(item => {
      const match = item.match(/^(⚡\+\d+)?[ ]?([^⚔🛡]+)[ ](\+\d+⚔)?[ ]?(\+\d+🛡)?/);
      const [, enchanted, name, atk, def] = match;
      return {
        name,
        enchanted: enchanted && enchanted.replace(/[^0-9]/g, ''),
        atk: atk && atk.replace(/[⚔+]/g, ''),
        def: def && def.replace(/[🛡+]/g, ''),
      };
    });

    if (!equip.length) {
      await ctx.replyPlain('Это не похоже на форвард /hero, ты, наверное, профиль прислал или прикалываешься');
      return;
    }

    await eq.saveEquip(userId, equip);

    const response = [
      'Я так понял вот шмот:',
      '\n\n',
      equip.map(e => JSON.stringify(e)).join('\n'),
      '\n\n',
      'Все запомнил, а форматировать красиво потом научусь как-нибудь',
    ];

    ctx.replyHTML(response);

  } catch (e) {
    error(e.message);
  }

}


export async function getAllEquip(ctx) {

  try {

    const data = await eq.getAllEquip();
    const res = data.map(formatEquip(';')).join('\n\n');

    ctx.replyHTML(res);

  } catch (e) {
    error(e.message);
  }

}

function formatEquip(delimiter = '\n') {

  return ({ userId, data }) => [
    `<code>${userId}</code>`,
    data.map(item => [
      `${item.name}`,
      item.enchanted ? ` +${item.enchanted}` : '',
    ].join('')).join(delimiter),
  ].join(delimiter);

}
