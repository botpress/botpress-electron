import process from 'process';
import findProcess from 'find-process';

const killBinaries = async () => {
  await new Promise((resolve) => {
    // the find-process package hangs the main thread, so push it after the next paint
    setTimeout(() => resolve(true), 1);
  });

  const processes = await findProcess('name', 'botpress-electron');

  const botpressBinaries = processes.filter((a) => {
    return a.cmd.includes('/binaries/') === true;
  });

  botpressBinaries.forEach((a) => {
    process.kill(a.pid);
  });
};

export default killBinaries;
