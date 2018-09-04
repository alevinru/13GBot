import * as redis from 'sistemium-telegram/services/redis';
import map from 'lodash/map';
import keyBy from 'lodash/keyBy';

// import log from 'sistemium-telegram/services/log';

// const { debug } = log('mw:equip');

const EQUIP_HASH = 'equip';
const USERS_HASH = 'users';

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

export async function saveUser(userId, data) {

  return redis.hsetAsync(USERS_HASH, userId, JSON.stringify(data));

}

export async function getUser(userId) {

  return redis.hgetAsync(USERS_HASH, userId)
    .then(res => res && JSON.parse(res));

}

export async function getUsers() {

  return redis.hgetallAsync(USERS_HASH)
    .then(res => keyBy(map(res, JSON.parse), 'userId'));

}
