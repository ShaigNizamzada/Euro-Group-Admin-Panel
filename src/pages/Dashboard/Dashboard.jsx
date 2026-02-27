
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

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/orders/stats/summary`,
          { headers }
        );
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Məlumatlar yüklənərkən xəta baş verdi");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("az-AZ", {
      style: "currency",
      currency: "AZN",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Yüklənir...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Xoş gəlmisiniz, Admin! 🎉</h2>
          <p>Admin panelinə uğurla daxil oldunuz.</p>
        </div>

        {dashboardData && (
          <>
            <div className="stats-grid">
              <div className="stat-card orders">
                <span className="stat-icon">📦</span>
                <h3>Ümumi Sifarişlər</h3>
                <div className="stat-number">{dashboardData.totalOrders}</div>
              </div>

              <div className="stat-card revenue">
                <span className="stat-icon">💰</span>
                <h3>Ümumi Gəlir</h3>
                <div className="stat-number">
                  {formatCurrency(dashboardData.totalRevenue)}
                </div>
              </div>

              <div className="stat-card customers">
                <span className="stat-icon">👥</span>
                <h3>Aktiv Müştərilər</h3>
                <div className="stat-number">
                  {dashboardData.ordersByUser?.length || 0}
                </div>
              </div>

              <div className="stat-card average">
                <span className="stat-icon">📊</span>
                <h3>Orta Sifariş Dəyəri</h3>
                <div className="stat-number">
                  {dashboardData.totalOrders > 0
                    ? formatCurrency(
                        dashboardData.totalRevenue / dashboardData.totalOrders
                      )
                    : formatCurrency(0)}
                </div>
              </div>
            </div>

            {dashboardData.ordersByUser &&
              dashboardData.ordersByUser.length > 0 && (
                <div className="section-card">
                  <h3 className="section-title">Top Müştərilər</h3>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Müştəri</th>
                          <th>Email</th>
                          <th>Sifarişlər</th>
                          <th>Ümumi Xərc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.ordersByUser.map((userOrder) => (
                          <tr key={userOrder.user.id}>
                            <td>
                              {userOrder.user.firstName}{" "}
                              {userOrder.user.lastName}
                            </td>
                            <td>{userOrder.user.email}</td>
                            <td>{userOrder.orderCount}</td>
                            <td className="amount">
                              {formatCurrency(userOrder.totalSpent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {dashboardData.recentOrders &&
              dashboardData.recentOrders.length > 0 && (
                <div className="section-card">
                  <h3 className="section-title">Son Sifarişlər</h3>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Sifariş ID</th>
                          <th>Müştəri</th>
                          <th>Məbləğ</th>
                          <th>Tarix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="invoice-id">{order.invoiceID}</td>
                            <td>{order.customer}</td>
                            <td className="amount">
                              {formatCurrency(order.total)}
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
