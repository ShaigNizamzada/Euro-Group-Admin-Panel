import React, { useEffect, useState } from "react";
import "./Orders.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Orders = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [orders, setOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/orders`,
        { headers }
      );
      setOrders(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm("Sifarişi silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}`,
        { headers }
      );
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Sifariş silinmədi. Xəta baş verdi.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${amount} ₼`;
  };

  // Format date for modal (DD.MM.YYYY hour format)
  const formatDateForModal = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Fetch order details by ID
  const fetchOrderDetails = async (id) => {
    setIsLoadingOrder(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}`,
        { headers }
      );
      setSelectedOrder(response?.data?.data || response?.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      alert("Sifariş məlumatları yüklənə bilmədi. Xəta baş verdi.");
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // Open modal with order details
  const handleViewOrder = (id) => {
    fetchOrderDetails(id);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="orders-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Sifarişlər</h1>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>İnvoys ID</th>
              <th>İstifadəçi</th>
              <th>E-mail</th>
              <th>Telefon</th>
              <th>Məhsul sayı</th>
              <th>Məbləğ</th>
              <th>Tarix</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : orders && orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td className="invoice-cell">{order.invoiceID || "-"}</td>
                  <td>
                    {order.user
                      ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "-"
                      : "-"}
                  </td>
                  <td>{order.user?.email || "-"}</td>
                  <td>{order.user?.phone || "-"}</td>
                  <td className="center-cell">{order.productCount || 0}</td>
                  <td className="amount-cell">{formatCurrency(order.total || 0)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        Bax
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(order.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data-cell">
                  Sifariş tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sifariş Detalları</h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {isLoadingOrder ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="order-detail-section">
                    <h3>İnvoys Məlumatları</h3>
                    <div className="detail-row">
                      <span className="detail-label">İnvoys ID:</span>
                      <span className="detail-value">{selectedOrder.invoiceID || "-"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tarix:</span>
                      <span className="detail-value">
                        {formatDateForModal(selectedOrder.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="order-detail-section">
                    <h3>İstifadəçi Məlumatları</h3>
                    <div className="detail-row">
                      <span className="detail-label">Ad:</span>
                      <span className="detail-value">
                        {selectedOrder.user?.firstName || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Soyad:</span>
                      <span className="detail-value">
                        {selectedOrder.user?.lastName || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">İstifadəçi adı:</span>
                      <span className="detail-value">
                        {selectedOrder.user?.username || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">E-mail:</span>
                      <span className="detail-value">
                        {selectedOrder.user?.email || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Telefon:</span>
                      <span className="detail-value">
                        {selectedOrder.user?.phone || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="order-detail-section">
                    <h3>Məhsullar</h3>
                    {selectedOrder.products && selectedOrder.products.length > 0 ? (
                      <div className="products-list">
                        {selectedOrder.products.map((product, index) => (
                          <div key={index} className="product-item">
                            <div className="product-image">
                              {product.productImage ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL}${product.productImage}`}
                                  alt={product.productTitle?.az || "Məhsul"}
                                  onError={(e) => {
                                    e.target.src = "/placeholder-image.png";
                                  }}
                                />
                              ) : (
                                <div className="no-image">Şəkil yoxdur</div>
                              )}
                            </div>
                            <div className="product-details">
                              <div className="detail-row">
                                <span className="detail-label">Başlıq (AZ):</span>
                                <span className="detail-value">
                                  {product.productTitle?.az || "-"}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Başlıq (EN):</span>
                                <span className="detail-value">
                                  {product.productTitle?.en || product.productTitle?.ru || "-"}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Say:</span>
                                <span className="detail-value">{product.say || "-"}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Qiymət:</span>
                                <span className="detail-value">
                                  {formatCurrency(product.qiymet || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-products">Məhsul tapılmadı</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleModalClose}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
