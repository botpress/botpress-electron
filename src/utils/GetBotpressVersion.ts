import { botpressVersion } from '../../package.json';

// format should look something like this v12_26_12

export default process.env.BINARY_VERSION ?? botpressVersion;
