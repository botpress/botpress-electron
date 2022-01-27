import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/bp-logo-white.png';
import './App.css';
import React from 'react';

import { BeatLoader } from 'react-spinners';

export default function App() {
  const [latestLog, setLatestLog] = React.useState("Launching Botpress");
  React.useEffect(() => {
    window.electron.ipcRenderer.on('botpress-instance-data', (arg) => {
      setLatestLog(arg);
      console.log("🚀 ~ file: App.tsx ~ line 12 ~ window.electron.ipcRenderer.on ~ arg", arg)
    });
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
