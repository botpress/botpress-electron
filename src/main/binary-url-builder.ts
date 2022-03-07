const buildUrl = (downloadVersionTag: string, downloadOsTag: string) => {
  return `https://s3.amazonaws.com/botpress-binaries/botpress-${downloadVersionTag}-${downloadOsTag}-x64.zip`;
};

export default buildUrl;
