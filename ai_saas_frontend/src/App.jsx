import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { checkHealth } from "./api/api";
import './styles/App.css'
import Layout from "./components/layout/Layout";

function App() {
  const [count, setCount] = useState(0);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(data => setHealth(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <>
      <Layout>
        <h1 className="h1 text-black">Dashboard</h1>
      </Layout>
    </>
  )
}

export default App;
