import download from 'download';
import { trackEvent } from './analytics';

const BINARIES_ZIP_URL =
  'https://s3.amazonaws.com/botpress-binaries/botpress-v12_26_10-darwin-x64.zip';

const downloadBinary = async (path: string) => {
  trackEvent('downloadBinaryStart');
  await download(BINARIES_ZIP_URL, path, { extract: true });
  trackEvent('downloadBinaryEnd');
};

export default downloadBinary;
