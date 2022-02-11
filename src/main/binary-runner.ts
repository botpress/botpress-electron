import { app } from 'electron';
import path from 'path';
import { get } from 'app-root-dir';
import { spawn, ChildProcess } from 'child_process';
import getPort from 'get-port';
import os from 'os';
import { fixCwdIfNeeded } from './fix-cwd-if-needed';

const { isPackaged } = app;
const appRootDir = isPackaged ? path.resolve(get(), '../../..') : get();

const getSpawnParameters = async () => {
  const osPlatform = os.platform();

  const platformPath =
    osPlatform === 'darwin' ? 'macos' : 'win32' ? 'win' : 'linux';
  const executableName = osPlatform === 'win32' ? 'bp.exe' : 'bp';
  const botpressPath = appRootDir + `/archives/${platformPath}`;

  fixCwdIfNeeded(botpressPath);

  const port = await getPort({ port: getPort.makeRange(3000, 3100) });

  const options = {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VERBOSITY_LEVEL: '2',
      PORT: port.toString(),
    },
  };

  const args = ['-vv'];

  return { cmd: path.join(botpressPath, executableName), args, options };
};

export class BinaryRunner {
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
          this.onReady(parseInt(options.env.PORT));
        }
      });
    } catch (error) {
      this.onError(error);
      return false;
    }
    return true;
  }

  stop() {
    try {
      this.botpressInstance?.kill();
    } catch (error) {
      this.onError(error);
      return false;
    }
    return true;
  }
}
