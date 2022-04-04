import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import { trackEvent } from './analytics';
import store from './store';
import { botpressVersion } from '../../package.json';

const migrateData = async (newPath: string) => {
  // check if current path has a data folder
  const newDataPath = path.resolve(newPath, 'data');
  if (fs.existsSync(newDataPath)) {
    return;
  }

  const latestDownloadVersion = store.get(
    'latestDownloadVersion',
    botpressVersion
  );

  // check if previous path has a data folder
  const oldDataPath = path.resolve(newPath, `../${latestDownloadVersion}/data`);
  if (fs.existsSync(oldDataPath) === false) {
    return;
  }

  try {
    await fsExtra.copy(oldDataPath, newDataPath);
    await fsExtra.remove(path.resolve(newDataPath, 'assets'));

    trackEvent('finishedMigratingData');
  } catch (error) {
    trackEvent('migrationDataError');
  }
};

export default migrateData;
