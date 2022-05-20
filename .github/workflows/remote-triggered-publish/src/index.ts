import * as core from '@actions/core';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const BOTPRESS_TEMP_PATH = "botpress-cloner"
const readFileAsync = promisify(fs.readFile)
const execAsync = promisify(exec);

const getLastTag = async (): Promise<string | undefined> => {
  const { stdout: tag } = await execAsync('git describe --tags --abbrev=0');

  return tag.match(/^v\d+\.\d+\.\d+/)?.[0];
};

const loadRepo = async () => {
  await execAsync(
    `git clone https://github.com/botpress/botpress.git ${BOTPRESS_TEMP_PATH}`
  );
  await execAsync(`cd ${BOTPRESS_TEMP_PATH}`);
}

const deleteRepo = async () => {
  await execAsync('cd ..');
  await execAsync(`rm -rf ${BOTPRESS_TEMP_PATH}`);
}

const run = async () => {
  try {
    await loadRepo()
    const lastReleaseTag = await getLastTag();
    const tagVersion = lastReleaseTag?.replace(/^v/, '');

    core.setOutput('latest_tag', lastReleaseTag);

    const pkg = await readFileAsync(
      path.resolve(`./${BOTPRESS_TEMP_PATH}/package.json`),
      'utf-8'
    );

    const currentVersion = JSON.parse(pkg).version as string;
    const isNewRelease = tagVersion !== currentVersion;

    core.setOutput('version', "v" + currentVersion.replace(/\./g,"_")); // this is the binary version for link
    core.setOutput('displayableVersion', currentVersion); // this is the version for github releases
    core.setOutput('is_new_release', isNewRelease);
    await deleteRepo()
  } catch (err) {
    core.setFailed(err as Error);
  }
};

void run();
