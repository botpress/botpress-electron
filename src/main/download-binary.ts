import download from 'download';
import { trackEvent } from './analytics';

const BINARIES_ZIP_URL =
  'https://s3.amazonaws.com/botpress-binaries/botpress-v12_26_10-darwin-x64.zip';

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
      })
      .catch((reason: any) => {
        reject(reason);
      });
  });
  trackEvent('downloadBinaryEnd');
};

export default downloadBinary;
