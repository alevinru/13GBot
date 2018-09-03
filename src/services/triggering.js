import find from 'lodash/find';
import * as redis from 'sistemium-telegram/services/redis';
import log from 'sistemium-telegram/services/log';

const { debug } = log('mw:triggering');

const TRIGGERS_HASH = 'triggers';

export async function addTrigger(match, replyText) {

  const key = triggerKey(match);

  return redis.hsetAsync(TRIGGERS_HASH, key, replyText);

}

export async function getTrigger(match) {

  const matchKey = Array.isArray(match) ? JSON.stringify(match) : match;

  debug('getTrigger', matchKey);

  const key = triggerKey(matchKey);

  return redis.hgetAsync(TRIGGERS_HASH, key);

}

export async function rmTrigger(match) {

  const trigger = await getMatchingTrigger(match);

  if (!trigger) {
    return null;
  }

  const matchKey = JSON.stringify(trigger);

  const key = triggerKey(matchKey);

  return redis.hdelAsync(TRIGGERS_HASH, key);

}

export async function getMatchingTrigger(match) {
  const triggers = await getTriggerList();
  return find(triggers, matchesTrigger(match));
}

export async function getTriggerList() {

  return redis.hgetallAsync(TRIGGERS_HASH)
    .then(res => (res ? Object.keys(res).map(keys => JSON.parse(keys)) : []));

}

export function matchesTrigger(text) {
  return matches => find(matches, trigger => {
    const re = new RegExp(`^${trigger}$`, 'i');
    return re.test(text);
  });
}


function triggerKey(match) {
  return match.toString();
}
