import store from './store';

const LAST_URL_STORE_NAME = 'lastKnownUrl';

const saveUrlOnClose = (BrowserWindow) => {
  BrowserWindow.on('close', ({ sender }) => {
    const closingUrl = new URL(sender.webContents.getURL());
    const relativeUrl =  closingUrl.href.slice(closingUrl.origin.length)

    return store.set(LAST_URL_STORE_NAME, relativeUrl);
  });
};

const getLastUrl = async (): Promise<string | null> => {
  const result = await store.get(LAST_URL_STORE_NAME);

  return typeof result === 'string' ? result : null;
};

export { saveUrlOnClose, getLastUrl };
