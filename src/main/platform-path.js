import os from 'os';

const osPlatform = os.platform();

const getPlatformPath = () => {
  if (osPlatform === 'darwin') {
    return 'darwin';
  }
  if (osPlatform === 'win32') {
    return 'win';
  }
  return 'linux';
};

const platformPath = getPlatformPath();

export default platformPath;
