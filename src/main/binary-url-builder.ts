const buildUrl = (
  downloadVersionTag: string,
  downloadOsTag: string,
  nightlyDate: string | null
) => {
  if (typeof nightlyDate === 'string') {
    return `https://s3.ca-central-1.amazonaws.com/botpress-next-bins/nightly-${nightlyDate}/botpress-${downloadVersionTag}-${downloadOsTag}-x64.zip`;
  }
  return `https://s3.amazonaws.com/botpress-binaries/botpress-${downloadVersionTag}-${downloadOsTag}-x64.zip`;
};

export default buildUrl;
