import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BirsaytLogo from "../../assets/images/Logo.webp";
import "./Login.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [cookies, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = cookies?.token;
      if (!token) {
        setIsCheckingAuth(false);
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
          navigate("/dashboard", { replace: true });
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [cookies, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      })
      .then((res) => {
        toast.success(res.data.message);
        const token = res?.data?.token;
        if (token) {
          const isSecure = window.location.protocol === "https:";
          setCookie("token", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: "lax",
            secure: isSecure, // Only secure on HTTPS
            domain: window.location.hostname.includes("europrogroup.es")
              ? "europrogroup.es"
              : undefined, // Set domain for subdomain support
          });
        }
        navigate("/dashboard");
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Yanlış email və ya şifrə"
        );
      });
  };

  if (isCheckingAuth) {
    return (
      <div className="login-page-section">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-section">
      <div className="login-page-container">
        <section className="top-section">
          <img src={BirsaytLogo} alt="Birsayt Logo" className="birsayt-logo" />
          <h1>Xoş gəlmisiniz! 👋</h1>
        </section>
        <section className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12">
                <label>İstifadəçi adı</label>
                <input
                  ref={emailRef}
                  type="text"
                  id="email"
                  placeholder="İstifadəçi adı"
                  required
                />
              </div>
              <div className="col-12">
                <label>Şifrə</label>
                <input
                  ref={passwordRef}
                  type="password"
                  id="password"
                  placeholder="Şifrə"
                  required
                />
              </div>
              <div className="col-12">
                <button type="submit">Daxil ol </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
