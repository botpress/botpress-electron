import store from './store';

const LAST_URL_STORE_NAME = 'lastKnownUrl';

const saveLastUrl = (lastUrl: string) => {
  const closingUrl = new URL(lastUrl);
  const relativeUrl = closingUrl.href.slice(closingUrl.origin.length);
  if (relativeUrl === '/index.html') {
    return null; // this should never happen, but just to be sure let's blacklist index.html (the loading page)
  }

  return store.set(LAST_URL_STORE_NAME, relativeUrl);
};

const getLastUrl = async (): Promise<string | null> => {
  const result = await store.get(LAST_URL_STORE_NAME);

  return typeof result === 'string' ? result : null;
};

export { saveLastUrl, getLastUrl };
