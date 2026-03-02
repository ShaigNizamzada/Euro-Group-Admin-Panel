import React, { useEffect, useState } from "react";
import "./Users.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Users = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    roles: "",
    company: "",
    taxID: "",
    location: "",
  });

  const fetchUsers = async (pageParam = page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users?page=${pageParam}&limit=${limit}`,
        { headers }
      );
      const data = response?.data;

      setUsers(data?.data || data || []);

      const pagination = data?.pagination;

      if (pagination) {
        setTotalItems(pagination.total || 0);

        const backendLimit = pagination.limit || limit;

        if (typeof pagination.page === "number" && pagination.page !== page) {
          setPage(pagination.page);
        }

        const calculatedTotalPages =
          pagination.total && backendLimit
            ? Math.ceil(pagination.total / backendLimit)
            : 1;

        setTotalPages(calculatedTotalPages);
      } else {
        const length = Array.isArray(data?.data)
          ? data.data.length
          : Array.isArray(data)
            ? data.length
            : 0;
        setTotalItems(length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Users fetching
  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      roles: "",
      company: "",
      taxID: "",
      location: "",
    });
  };

  // Edit modal open
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      roles: user?.roles.toString() ?? "",
      company: user?.company ?? "",
      taxID: user?.taxID ?? "",
      location: user?.location ?? "",
    });
    setIsModalOpen(true);
  };

  // User submit PUT
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const userId = editingUser?.id;
    try {
      const dataToSend = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        roles: parseInt(formData.roles),
        company: formData.company,
        taxID: formData.taxID,
        location: formData.location,
      };

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        dataToSend,
        { headers }
      );

      // Refresh users list
      await fetchUsers(page);
      handleModalClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("İstifadəçi yenilənmədi. Xəta baş verdi.");
    }
  };

  // User delete
  const handleDelete = async (id) => {
    if (!window.confirm("İstifadəçini silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}`,
        { headers }
      );
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setTotalItems((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("İstifadəçi silinmədi. Xəta baş verdi.");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="users-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>İstifadəçilər</h1>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tam Adı</th>
              <th>E-poçt</th>
              <th>Telefon</th>
              <th>Rol</th>
              <th>Şirkət</th>
              <th>Tax id</th>
              <th>Məkan</th>
              <th>Yaradılma tarixi</th>


              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user?.full_name || "-"}</td>
                  <td>{user?.email || "-"}</td>
                  <td>{user?.phone || "-"}</td>
                  <td>
                    <span className="role-badge">
                      {user?.roles === 1 ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{user?.company}</td>
                  <td>{user?.taxID}</td>
                  <td>{user?.location}</td>
                  <td>{formatDate(user?.created)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(user)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data-cell">
                  İstifadəçi tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>İstifadəçini Dəyişdir</h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitUser}>
              <div className="form-group">
                <label htmlFor="full_name">Tam Ad</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Tam Ad"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-poçt</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+994 50 123 45 67"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="roles">Rol</label>
                <select
                  id="roles"
                  name="roles"
                  value={formData.roles}
                  onChange={handleInputChange}
                  required
                >
                  <option value="2">User</option>
                  <option value="1">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="company">Şirkət</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Şirkətin adı"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="taxID">Tax İd</label>
                <input
                  id="taxID"
                  name="taxID"
                  type="text"
                  value={formData.taxID}
                  onChange={handleInputChange}
                  placeholder="Şirkətin adı"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Məkan</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Məkan"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleModalClose}>
                  İmtina
                </button>
                <button type="submit" className="primary">
                  Dəyişdir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ‹ Əvvəlki
          </button>
          <div className="pagination-info">
            Səhifə {page} / {totalPages}
            {totalItems > 0 && (
              <span> · Toplam {totalItems} istifadəçi</span>
            )}
          </div>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Növbəti ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
