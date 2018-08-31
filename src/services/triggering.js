// import map from 'lodash/fp/map';

import { hsetAsync, hgetAsync, hgetallAsync } from './redis';

const TRIGGERS_HASH = 'triggers';

export async function addTrigger(match, replyText) {

  const key = triggerKey(match);

  return hsetAsync(TRIGGERS_HASH, key, replyText);

}

export async function getTrigger(match) {

  const key = triggerKey(match);

  return hgetAsync(TRIGGERS_HASH, key);

}

export async function getTriggerList() {

  return hgetallAsync(TRIGGERS_HASH)
    .then(res => Object.keys(res));

}

function triggerKey(match) {
  return match.toString();
}
