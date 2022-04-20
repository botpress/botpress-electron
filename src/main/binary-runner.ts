import { app } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import getPort from 'get-port';
import fs from 'fs';
import { fixCwdIfNeeded } from './fix-cwd-if-needed';
import downloadBinary from './download-binary';
import platformPath from './platform-path';
import { botpressVersion } from '../../package.json';
import migrateData from './migrate-data';
import store from './store';
import killBinaries from './kill-binaries';

const { isPackaged } = app;

const botpressPath = isPackaged
  ? `${app.getPath(
      'appData'
    )}/botpress-electron-beta/binaries/${botpressVersion}`
  : path.resolve(
      app.getAppPath(),
      `../../archives/binaries/${botpressVersion}`
    );

const getSpawnParameters = async () => {
  const executableName = platformPath === 'win' ? 'bp.exe' : 'bp';

  fixCwdIfNeeded(botpressPath);

  const port = await getPort({ port: getPort.makeRange(3000, 3100) });

  const options = {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VERBOSITY_LEVEL: '2',
      PORT: port.toString(),
      AUTO_MIGRATE: 'true',
    },
  };

  const args = ['-vv'];

  return { cmd: path.join(botpressPath, executableName), args, options };
};

export default class BinaryRunner {
  botpressInstance?: ChildProcess;

  onOutput: (chunk: any) => void;

  onError: (chunk: any) => void;

  onReady: (port: number) => void;

  constructor(
    onOutput: (chunk: any) => void,
    onError: (chunk: any) => void,
    onReady: (port: number) => void
  ) {
    this.onOutput = onOutput;
    this.onError = onError;
    this.onReady = onReady;
  }

  static missingBinary() {
    return fs.existsSync(botpressPath) === false;
  }

  static downloadBinary(progressCallback: (data: any) => void) {
    return downloadBinary(botpressPath, progressCallback);
  }

  static migrateData() {
    return migrateData(botpressPath);
  }

  static setLatestVersion() {
    return store.set('latestDownloadVersion', botpressVersion);
  }

  async start() {
    const { cmd, args, options } = await getSpawnParameters();

    try {
      this.botpressInstance = spawn(cmd, args, options);
      if (!this.botpressInstance.stdout) {
        throw new Error('BP binary has no standard output stream.');
      }
      if (!this.botpressInstance.stderr) {
        throw new Error('BP binary has no standard error stream.');
      }
      this.botpressInstance.stderr.on('data', this.onError);
      this.botpressInstance.stdout.on('data', (chunk: any) => {
        if (
          chunk.toString().toLowerCase().includes('error') &&
          !chunk.toString().toLowerCase().includes('error.flow.json')
        ) {
          this.onError(chunk);
        } else {
          this.onOutput(chunk);
        }
        if (chunk.toString().indexOf('Launcher Botpress is exposed at') > -1) {
          this.onReady(parseInt(options.env.PORT, 10));
        }
      });
    } catch (error) {
      this.onError(error);
      return false;
    }
    return true;
  }

  async stop() {
    try {
      this.botpressInstance?.kill();
      killBinaries();
    } catch (error) {
      this.onError(error);
      return false;
    }
    return true;
  }
}
