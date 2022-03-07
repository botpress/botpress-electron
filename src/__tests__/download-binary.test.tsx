import https from 'https';
import { botpressVersion } from '../../package.json';
import buildUrl from '../main/binary-url-builder';

const botpressOsTypes = ['darwin', 'win', 'linux'];

describe('validating download links', () => {
  botpressOsTypes.forEach((botpressOsType) => {
    test(`checking ${botpressOsType}`, async () => {
      const url = buildUrl(botpressVersion, botpressOsType);
      const fileExists = await new Promise((resolve) => {
        https
          .get(url, (res) => {
            res.destroy();
            resolve(res.statusCode === 200);
          })
          .on('error', (e) => {
            console.error(e);
            resolve(false);
          });
      });
      expect(fileExists).toEqual(true);
    });
  });
});
