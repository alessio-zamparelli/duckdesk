import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { computer, filesystem, os } from "@neutralinojs/lib";

function App() {
  const [count, setCount] = useState(0);
  const [dir, setDir] = useState<filesystem.DirectoryEntry[]>();
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  const showNotification = async () => {
    await os.showNotification("Hello world", "It works! Have a nice day");
  };

  useEffect(() => {
    const info = async () => {
      let cpuInfo = await computer.getCPUInfo();
      setInfo(cpuInfo.model ?? cpuInfo.architecture);
    };

    filesystem
      .readDirectory("./")
      .then((data) => {
        console.log(data);
        setDir(data);
      })
      .catch((err) => {
        console.log(err);
        setError(err);
      });

    info();
  }, []);

  return (
    <>
      <div>
        <div>ci sono {dir?.length} dir entry</div>
        {dir?.map((e) => (
          <div>{e.entry ?? "-"}</div>
        ))}
        {info ?? "no info"}
        {error}
        {/* <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a> */}
      </div>
      <button onClick={() => showNotification()}>Show Notification</button>
      <h1 className="underline">DuckDesk</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>{/* Edit <code>src/App.tsx</code> and save to test HMR */}</p>
      </div>
      <p className="read-the-docs">
        {/* Click on the Vite and React logos to learn more */}
      </p>
    </>
  );
}

export default App;
