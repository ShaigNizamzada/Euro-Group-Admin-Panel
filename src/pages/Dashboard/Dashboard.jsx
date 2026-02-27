
import "./Dashboard.scss";
import { useCookies } from "react-cookie";
import { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcom to the admin panel, Admin! 🎉</h2>
          <p>You have successfully logged in to the admin panel, Admin! 🎉</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
