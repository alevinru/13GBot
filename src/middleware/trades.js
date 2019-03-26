import log from 'sistemium-telegram/services/log';
import sumBy from 'lodash/sumBy';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';
import * as CW from 'cw-rest-api';
import { addHours } from 'date-fns';

import Deal from '../models/Deal';

const { debug } = log('mw:trades');

const itemsByName = CW.allItemsByName();

export const itemsByCode = keyBy(map(itemsByName, (code, name) => ({ name, code })), 'code');

export function itemNameByCode(code) {
  const item = itemsByCode[code];
  return item && item.name;
}

export async function itemStats(ctx) {

  const { match } = ctx;
  const [command, itemCode, hoursParam] = match;
  const itemName = itemNameByCode(itemCode);

  debug(command, itemCode, hoursParam, itemName || 'unknown itemCode');

  const hours = parseInt(hoursParam, 0) || 24;

  if (!itemName) {
    await ctx.replyWithHTML(`Unknown item code <b>${itemCode}</b>`);
    return;
  }

  const dealsFilter = {
    ts: { $gt: addHours(new Date(), -hours) },
    itemCode,
  };

  const pipeline = [
    { $match: dealsFilter },
    {
      $group: {
        _id: '$price',
        qty: { $sum: '$qty' },
        cnt: { $sum: 1 },
      },
    },
    { $addFields: { price: '$_id' } },
  ];

  const data = await Deal.aggregate(pipeline);
  const deals = orderBy(data, 'price');

  if (!deals.length) {
    await ctx.replyHTML(`No deals on <b>${itemName}</b> in last <b>${hours}</b> hours`);
    return;
  }

  const totalSum = sumBy(deals, ({ price, qty }) => price * qty);
  const totalQty = sumBy(deals, 'qty');

  const res = [
    `<b>${itemNameByCode(itemCode)}</b> market in last <b>${hours}</b> hours:\n`,
    `Total deals: ${sumBy(deals, 'cnt')}`,
    `Turnover: ${totalSum}💰= ${totalQty} x ${round(totalSum / totalQty, 2)}💰`,
  ];

  if (deals.length > 1) {
    res.push('');
    deals.forEach(({ price, qty }) => {
      res.push(`${price}💰x ${qty}`);
    });
  }

  await ctx.replyWithHTML(res.join('\n'));

}
