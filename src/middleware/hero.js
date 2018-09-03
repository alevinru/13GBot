import log from 'sistemium-telegram/services/log';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
// import trim from 'lodash/trim';

const { debug, error } = log('mw:hero');

const equipRe = /^🎽Экипировка/;
const itemRe = /⚔|🛡/;

export default async function (ctx, next) {

  const { message: { from, text, forward_date: date } } = ctx;

  const userId = from.id;
  const ts = new Date(date * 1000);

  const items = text.split('\n');

  const equipStart = findIndex(items, item => equipRe.test(item));

  debug(userId, equipStart, ts);

  if (!equipStart) {
    await next();
    return;
  }

  try {

    const equipEnd = findIndex(items, '', equipStart + 1);

    let equip = filter(items.slice(equipStart + 1, equipEnd - 2), item => itemRe.test(item));

    equip = equip.map(item => {
      const match = item.match(/^(⚡\+\d+)?[ ]?([^⚔🛡]+)[ ](\+\d+⚔)?[ ]?(\+\d+🛡)?/);
      const [, enchanted, name, atk, def] = match;
      return JSON.stringify({
        name,
        enchanted: enchanted && enchanted.replace(/[^0-9]/g, ''),
        atk: atk && atk.replace(/[⚔+]/g, ''),
        def: def && def.replace(/[🛡+]/g, ''),
      });
    });

    const response = [
      'Я так понял вот шмот:',
      '\n\n',
      equip.join('\n'),
      '\n\n',
      'Но я ничего не запоминаю из этого пока, так что потом пришли снова как-нибудь!',
    ];

    ctx.replyHTML(response);

  } catch (e) {
    error(e.message);
  }

}
