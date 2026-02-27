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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    username: "",
    birthday: "",
    role_id: "1",
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`,
        { headers }
      );
      setUsers(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Users fetching
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      username: "",
      birthday: "",
      role_id: "1",
    });
  };

  // Edit modal open
  const openEditModal = (user) => {
    setEditingUser(user);
    const birthdayDate = user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "";
    setFormData({
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
      birthday: birthdayDate,
      role_id: user?.role_id?.toString() ?? "1",
    });
    setIsModalOpen(true);
  };

  // User submit PUT
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const userId = editingUser?.id;
    try {
      const dataToSend = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        username: formData.username,
        birthday: formData.birthday,
        role_id: parseInt(formData.role_id),
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
        dataToSend,
        { headers }
      );

      // Refresh users list
      await fetchUsers();
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
        `${import.meta.env.VITE_API_URL}/api/users/${id}`,
        { headers }
      );
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("İstifadəçi silinmədi. Xəta baş verdi.");
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
              <th>Ad</th>
              <th>Soyad</th>
              <th>İstifadəçi adı</th>
              <th>E-poçt</th>
              <th>Telefon</th>
              <th>Doğum tarixi</th>
              <th>Rol</th>
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
                  <td>{user?.first_name || "-"}</td>
                  <td>{user?.last_name || "-"}</td>
                  <td>{user?.username || "-"}</td>
                  <td>{user?.email || "-"}</td>
                  <td>{user?.phone || "-"}</td>
                  <td>{formatDate(user?.birthday)}</td>
                  <td>
                    <span className="role-badge">
                      {user?.role_name || "-"}
                    </span>
                  </td>
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
                <label htmlFor="first_name">Ad</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Ad"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Soyad</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Soyad"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">İstifadəçi adı</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
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
                <label htmlFor="birthday">Doğum tarixi</label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="role_id">Rol</label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">İstifadəçi</option>
                  <option value="2">Admin</option>
                </select>
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
    </div>
  );
};

export default Users;
