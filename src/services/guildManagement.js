import * as redis from './redis';

const REQUESTS_KEY = 'guild_stock_requests';

const STOCK_MASTERS_KEY = 'guild_stock_master';

export async function setStockMaster(userId) {

  return redis.setAsync(STOCK_MASTERS_KEY, userId);

}

export async function getStockMaster() {

  return redis.getAsync(STOCK_MASTERS_KEY)
    .then(res => res && parseInt(res, 0));

}


export async function addStockRequest(userId, itemCode, qty) {

  const id = await redis.getId(REQUESTS_KEY);
  const request = {
    id,
    userId,
    itemCode,
    qty: parseInt(qty, 0),
  };

  await redis.saddAsync(REQUESTS_KEY, id);
  await redis.setAsync(`${REQUESTS_KEY}_${id}`, JSON.stringify(request));

  return request;

}
