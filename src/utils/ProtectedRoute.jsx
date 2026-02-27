import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const token = cookies?.token;
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsChecking(false);
        setIsValid(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.data?.success === true) {
          setIsValid(true);
        } else {
          removeCookie("token", { path: "/" });
          setIsValid(false);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        removeCookie("token", { path: "/" });
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, [token, removeCookie]);

  if (isChecking) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
