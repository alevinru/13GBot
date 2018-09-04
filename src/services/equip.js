import * as redis from 'sistemium-telegram/services/redis';
import map from 'lodash/map';

// import log from 'sistemium-telegram/services/log';

// const { debug } = log('mw:equip');

const EQUIP_HASH = 'equip';

export async function saveEquip(userId, data) {

  return redis.hsetAsync(EQUIP_HASH, userId, JSON.stringify(data));

}

export async function getEquip(userId) {

  return redis.hsetAsync(EQUIP_HASH, userId)
    .then(res => res && JSON.parse(res));

}

export async function getAllEquip() {

  return redis.hgetallAsync(EQUIP_HASH)
    .then(res => map(res, (data, userId) => ({ userId, data: JSON.parse(data) })));

}
