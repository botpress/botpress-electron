import download from 'download';
import Store from 'electron-store';
import { trackEvent } from './analytics';
import platformPath from './platform-path';
import { botpressVersion } from '../../package.json';
import buildUrl from './binary-url-builder';

const store = new Store();

const BINARIES_ZIP_URL = buildUrl(botpressVersion, platformPath);

const downloadBinary = async (
  path: string,
  progressCallback: (data: any) => void
) => {
  trackEvent('downloadBinaryStart');
  await new Promise((resolve, reject) => {
    download(BINARIES_ZIP_URL, path, { extract: true })
      .on('response', (res) => {
        const total = res.headers['content-length'];
        progressCallback({ total, downloading: true });
        let downloadedLength = 0;
        res.on('data', (data) => {
          downloadedLength += data.length;
          progressCallback({ downloadedLength });
        });
      })
      .then(() => {
        resolve(true);
        progressCallback({ downloading: false });
        return { downloading: true };
      })
      .catch((reason: any) => {
        reject(reason);
      });
  });
  store.set('latestDownloadVersion', botpressVersion);
  trackEvent('downloadBinaryEnd');
};

export default downloadBinary;
