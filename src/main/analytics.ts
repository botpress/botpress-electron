import Analytics from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import os from 'os';

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const segmentKey = isDevelopment
  ? (process.env.SEGMENT_NODE_DEV as string)
  : (process.env.SEGMENT_NODE_PROD as string);

const analyticsClient = new Analytics(segmentKey, { flushAt: 1 });

const store = new Store();

const identifyUser = () => {
  try {
    const anonymousId = getOrCreateAnonymousUserId();
    const traits = {
      arch: os.arch(),
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
    };
    analyticsClient.identify({
      anonymousId,
      traits,
    });
  } catch (error) {
    console.log('There was an analytics identify error : ', error);
  }
};

const getOrCreateAnonymousUserId = (): string => {
  // check storage if anonymous_user_id
  const storedAnonymousUserId = store.get('anonymous_user_id');

  if (!storedAnonymousUserId) {
    const newAnonymousUserId = uuidv4();
    store.set('anonymous_user_id', newAnonymousUserId);
  }

  return store.get('anonymous_user_id') as string;
};

const trackEvent = (event: string, properties?: any): void => {
  try {
    const anonymousId = getOrCreateAnonymousUserId();
    analyticsClient.track({
      anonymousId,
      event,
      properties,
    });
  } catch (error) {
    console.log('There was an analytics track error : ', error);
  }
};

export { trackEvent, identifyUser };
