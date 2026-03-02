
import "./Dashboard.scss";
// import { useCookies } from "react-cookie";
// import { useState, useEffect } from "react";
// import axios from "axios";

const Dashboard = () => {
  // const [cookies] = useCookies(["token"]);
  // const token = cookies?.token;
  // const headers = {
  //   Authorization: `Bearer ${token}`,
  // };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Admin panelə xoş gəlmisiniz! 🎉</h2>
          <p>Siz müvəffəqiyyətlə admin panelinə daxil olmusunuz! 🎉</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
