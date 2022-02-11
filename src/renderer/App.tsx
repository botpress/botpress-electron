import icon from '../../assets/bp-logo-white.png';
import './App.css';
import React from 'react';

import { BeatLoader } from 'react-spinners';

declare global {
  interface Window {
    electron: any;
  }
}

export default function App() {
  const [latestLog, setLatestLog] = React.useState('Launching Botpress');
  React.useEffect(() => {
    if (window.electron) { // otherwise tests will fail without electron
      window.electron.ipcRenderer.on('botpress-instance-data', (arg: any) => {
        setLatestLog(arg);
      });
    }
  }, []);

  return (
    <div id="main-content">
      <img width="315px" height="72px" alt="icon" src={icon} />
      <div id="loading-icon">
        <BeatLoader color="white" />
      </div>
      <p id="loading-text">{latestLog}</p>
    </div>
  );
}
