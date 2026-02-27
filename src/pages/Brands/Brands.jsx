import React, { useEffect, useState } from "react";
import "./Brands.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Brands = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [services, setServices] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name_az: "",
    name_ru: "",
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/public/services`,
        { headers }
      );
      setServices(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch services
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Input change handler
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
    setEditingService(null);
    setFormData({
      name_az: "",
      name_ru: "",
    });
  };

  // Open add modal
  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name_az: "",
      name_ru: "",
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name_az: service?.name?.az || "",
      name_ru: service?.name?.ru || "",
    });
    setIsModalOpen(true);
  };

  // Submit service (POST/PUT)
  const handleSubmitService = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingService?.id);
    const serviceId = editingService?.id;

    try {
      const dataToSend = {
        name_az: formData.name_az,
        name_ru: formData.name_ru,
      };

      const config = {
        headers,
      };

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/public/services/${serviceId}`,
          dataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/public/services`,
          dataToSend,
          config
        );
      }

      // Refresh services list
      await fetchServices();
      handleModalClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} service:`,
        error
      );
      alert(
        `Xidmət ${isEditMode ? "yenilənmədi" : "əlavə edilmədi"
        }. Xəta baş verdi.`
      );
    }
  };

  // Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/public/services/${id}`,
        { headers }
      );
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Xidmət silinmədi. Xəta baş verdi.");
    }
  };

  return (
    <div className="brands-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Partnerlər</h1>
        </div>
        <div className="button-section">
          <button className="addition-button" onClick={openAddModal}>
            + Əlavə et
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="brands-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad (AZ)</th>
              <th>Ad (RU)</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : services && services.length > 0 ? (
              services.map((service, index) => (
                <tr key={service.id}>
                  <td>{index + 1}</td>
                  <td>{service.name?.az || "-"}</td>
                  <td>{service.name?.ru || "-"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(service)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(service.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-cell">
                  Xidmət tapılmadı
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
              <h2>
                {editingService
                  ? "Xidməti Dəyişdir"
                  : "Yeni Xidmət"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitService}>
              <div className="form-group">
                <label htmlFor="name_az">Ad (Azərbaycan)</label>
                <input
                  id="name_az"
                  name="name_az"
                  type="text"
                  value={formData.name_az}
                  onChange={handleInputChange}
                  placeholder="Xidmət adı (AZ)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name_ru">Ad (Русский)</label>
                <input
                  id="name_ru"
                  name="name_ru"
                  type="text"
                  value={formData.name_ru}
                  onChange={handleInputChange}
                  placeholder="Название услуги (RU)"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleModalClose}>
                  İmtina
                </button>
                <button type="submit" className="primary">
                  {editingService ? "Dəyişdir" : "Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
