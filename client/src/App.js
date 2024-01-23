import logo from "./logo.svg";
import { Table } from "antd";
import axios from "axios";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [mydata, setMydata] = useState([]);
  const fetchdata = async () => {
    try {
      const response = await axios.get("http://localhost:7000/");
      console.log(response);
      setMydata(response?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Last", dataIndex: "last", key: "last" },
    { title: "Buy", dataIndex: "buy", key: "buy" },
    { title: "Sell", dataIndex: "sell", key: "sell" },
    { title: "Volume", dataIndex: "volume", key: "volume" },
    { title: "Base Unit", dataIndex: "base_unit", key: "base_unit" },
  ];

  useEffect(() => {
    fetchdata();
  }, []);

  return (
    <div className="App">
      <Table dataSource={mydata} columns={columns} />
    </div>
  );
}

export default App;
