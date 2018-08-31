// import map from 'lodash/fp/map';

import * as redis from './redis';

const TRIGGERS_HASH = 'triggers';

export async function addTrigger(match, replyText) {

  const key = triggerKey(match);

  return redis.hsetAsync(TRIGGERS_HASH, key, replyText);

}

export async function getTrigger(match) {

  const key = triggerKey(match);

  return redis.hgetAsync(TRIGGERS_HASH, key);

}

export async function rmTrigger(match) {

  const key = triggerKey(match);

  return redis.hdelAsync(TRIGGERS_HASH, key);

}

export async function getTriggerList() {

  return redis.hgetallAsync(TRIGGERS_HASH)
    .then(res => Object.keys(res));

}

function triggerKey(match) {
  return match.toString();
}
