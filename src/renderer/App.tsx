import icon from '../../assets/bp-logo-white.png';
import './App.css';
import React from 'react';
import { Line } from 'rc-progress';
import { BeatLoader } from 'react-spinners';

declare global {
  interface Window {
    electron: any;
  }
}

export default function App() {
  const [latestLog, setLatestLog] = React.useState('Launching Botpress');
  const [totalDownloadLength, setTotalDownloadLength] = React.useState(0);
  const [downloadedLength, setDownloadedLength] = React.useState(0);
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    if (window.electron) {
      // otherwise tests will fail without electron
      window.electron.ipcRenderer.on('botpress-instance-data', (arg: any) => {
        setLatestLog(arg);
      });
      window.electron.ipcRenderer.on('binary-download-progress', (arg: any) => {
        if (arg.total) {
          setTotalDownloadLength(arg.total);
        }
        if (arg.downloadedLength) {
          setDownloadedLength(arg.downloadedLength);
        }

        if (arg.downloading && arg.downloading === true) {
          setDownloading(true);
        }
        if (
          typeof arg.downloading !== 'undefined' &&
          arg.downloading === false
        ) {
          setDownloading(false);
        }
      });
    }
  }, []);

  const percentDownloaded = Math.floor(
    (100 * downloadedLength) / totalDownloadLength
  );
  
  return (
    <div id="main-content">
      <img width="315px" height="72px" alt="icon" src={icon} />

      <div id="loading-icon">
        {downloading ? (
          <Line
            percent={percentDownloaded}
            strokeColor="white"
            trailColor="#333"
            trailWidth={3}
            strokeWidth={3}
            strokeLinecap="butt"
          />
        ) : (
          <BeatLoader color="white" />
        )}
      </div>
      <p id="loading-text">{latestLog}</p>
    </div>
  );
}
