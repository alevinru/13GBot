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

  if (!text) {
    await next();
    return;
  }

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

    const userInfo = items[0];
    const matchUser = userInfo.match(/^([🐢🌹☘️🍁🍆🖤🦇]+)(\[.+])(.+)$/);

    if (!matchUser) {
      await ctx.reply('Я не смог понять кто ты, извини');
      return;
    }

    const [, castle, guildTag, gameName] = matchUser;

    const response = [
      'Я так понял вот твой шмот:',
      '\n\n',
      equip.map(formatEquipItem).join('\n'),
      '\n\n',
      `Все запомнил, спасибо, ${castle} ${guildTag} <b>${gameName}</b>!`,
    ];

    const userData = {
      userId,
      castle,
      guildTag,
      gameName,
      name: `${filter([from.first_name, from.last_name]).join(' ')}`,
      userName: from.username,
    };

    await eq.saveEquip(userId, equip);
    await eq.saveUser(userId, userData);

    ctx.replyHTML(response);

  } catch (e) {
    error(e.message);
  }

}


export async function getAllEquip(ctx) {

  try {

    const equipData = await eq.getAllEquip();
    const users = await eq.getUsers();

    const userData = equipData.map(({ userId, data }) => {
      const { gameName = 'Этого перса не знаю', name, userName } = users[userId] || {};
      return {
        userId,
        data,
        gameName,
        name,
        userName,
      };
    });

    const res = userData.map(formatEquip(';')).join('\n');

    ctx.replyHTML(res);

  } catch (e) {
    error(e);
  }

}

function formatEquip(delimiter = '\n') {

  return equipData => {

    const {
      userId, data, name, userName, gameName,
    } = equipData;

    return [
      `<code>${userId}</code>`,
      name ? `<b>${name}</b>` : '',
      userName ? `${userName}` : '',
      `<b>${gameName}</b>`,
      data.map(formatEquipItem).join(delimiter),
    ].join(delimiter);
  };

}

function formatEquipItem(item) {

  return [
    `${item.name}`,
    item.enchanted ? ` +${item.enchanted}` : '',
  ].join('');

}
