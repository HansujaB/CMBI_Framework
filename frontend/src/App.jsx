import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import { loadCSV } from "./utils/dataLoader";
import { validateCSV } from "./utils/validator";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/mass_balance_synthetic_dataset.csv")
      .then((res) => res.text())
      .then((text) => loadCSV(new File([text], "default.csv")))
      .then((rows) => setData(rows));
  }, []);

  return <Dashboard data={data} />;
}

export default App;

