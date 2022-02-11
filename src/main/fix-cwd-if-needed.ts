// makes sure that path.resolve("") has same behavior across platforms
// on macos, path.resolve("") === '/' not CWD. This causes a whole host of issues

import os from 'os';
import path from 'path';

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const mustFixCwd = (
  osCode: string,
  isProduction: boolean,
  currentEmptyPathResolve: string,
  projectLocation: string
) => {
  if (!isProduction || osCode !== 'darwin') {
    return false;
  }

  return currentEmptyPathResolve === '/' && projectLocation !== '/';
};

export const fixCwdIfNeeded = (projectLocation: string) => {
  const currentEmptyPathResolve = path.resolve('');
  const isProduction = !isDevelopment;
  const osCode = os.platform();

  if (
    mustFixCwd(osCode, isProduction, currentEmptyPathResolve, projectLocation)
  ) {
    console.log('changed cwd to fix macos path.resolve bug!');
    process.chdir(projectLocation);
  }
};
