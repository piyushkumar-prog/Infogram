import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5173';
axios.defaults.timeout = 600000;

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverLog, setServerLog] = useState([]);
  const [scrapingSteps, setScrapingSteps] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isScrapingComplete, setIsScrapingComplete] = useState(false);
   
  const handleSubmit = async (event) => {
    event.preventDefault();
    setScrapingSteps([]);
    setIsScrapingComplete(false);
    setPdfUrl('');
    setServerLog([]);
    try {
      const data = { username, password };
      const response = await axios.post('/scrape', data);
      console.log(response.data);
      setPdfUrl(response.data.pdfPath);
      setIsScrapingComplete(true);
    } catch (error) {
      console.error(error);
      setServerLog(prevLog => [...prevLog, 'Error occurred while scraping']);
    }
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5173');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setServerLog(prevLog => [...prevLog, data.message]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const ServerLog = ({ log }) => (
    <div className="mt-4 p-4 bg-black border-2 border-green-700 rounded">
      <h2 className="text-green-700 text-xl mb-2">Server Log:</h2>
      <pre className="text-white whitespace-pre-wrap">
        {log.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </pre>
    </div>
  );

  const ScrapingSteps = ({ steps }) => (
    <div className="mt-4 p-4 bg-black border-2 border-green-700 rounded">
      <h2 className="text-green-700 text-xl mb-2">Scraping Progress:</h2>
      <ul className="text-white">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <nav className="bg-black flex items-center justify-between px-8 ">
     <div className=" ml-96 flex items-center">
    <img src="logo.png" className="w-32 h-28" alt="Logo" />
    <p className="text-white text-6xl font-one ml-4">Infogram</p>
    </div>
     </nav>

      <div className="text-green-700 bg-[url('/bg.jpg')] flex flex-col justify-center items-center min-h-screen">
        <form className="bg-black font-one text-lg p-10" onSubmit={handleSubmit}>
          <label>Username:</label>
          <input className="text-center text-white bg-black border-2 border-green-700 rounded ml-1.5 mb-2" type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
          <br />
          <label>Password:</label>
          <input className="text-center text-white bg-black border-2 border-green-700 rounded ml-2 mb-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <br />
          <div className="flex justify-center items-center">
            <button className="bg-black border-2 border-green-700 p-1 rounded" type="submit">Scrape</button>
          </div>
        </form>
        {serverLog.length > 0 && <ServerLog log={serverLog} />}
        {scrapingSteps.length > 0 && <ScrapingSteps steps={scrapingSteps} />}
        {isScrapingComplete && pdfUrl && (
          <a href={pdfUrl} download className="mt-4 bg-black border-2 border-green-700 p-2 rounded text-white">
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
