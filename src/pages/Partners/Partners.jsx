import React, { useEffect, useState } from "react";
import "./Partners.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Partners = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [partners, setPartners] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    logo: null,
  });


  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/partners`,
        { headers }
      );
      setPartners(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
    setImagePreview(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  // Open add modal
  const openAddModal = () => {
    setEditingPartner(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
    setIsModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
    if (partner?.logoSrc) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${partner.logoSrc}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmitPartner = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingPartner?.id);
    const partnerId = editingPartner?.id;

    try {
      const formDataToSend = new FormData();

      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      const config = {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/admin/partners/${partnerId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/partners`,
          formDataToSend,
          config
        );
      }
      await fetchPartners();
      handleModalClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} partner:`,
        error
      );
      alert(
        `Partner ${isEditMode ? "yenilənmədi" : "əlavə edilmədi"
        }. Xəta baş verdi.`
      );
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/partners/${id}`,
        { headers }
      );
      setPartners((prev) => prev.filter((partner) => partner.id !== id));
    } catch (error) {
      console.error("Failed to delete partner:", error);
      alert("Partner silinmədi. Xəta baş verdi.");
    }
  };

  return (
    <div className="partners-page-section">
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
        <table className="partners-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Şəkil</th>

              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : partners && partners.length > 0 ? (
              partners.map((partner, index) => (
                <tr key={partner.id}>
                  <td>{index + 1}</td>
                  <td>
                    {partner.logoSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${partner.logoSrc}`}
                        alt={partner.id || "Partner"}
                        className="partner-image"
                      />
                    ) : (
                      <span className="no-image">Şəkil yoxdur</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(partner)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(partner.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  Partner tapılmadı
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
                {editingPartner
                  ? "Partnerni Dəyişdir"
                  : "Yeni Partner"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitPartner}>
              <div className="form-group">
                <label>Şəkil</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="logo" className="file-upload-label">
                    <i className="upload-icon">📁</i>
                    <span>
                      {formData.logo
                        ? formData.logo.name
                        : "Şəkil seçin (klik edin)"}
                    </span>
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={handleRemoveImage}
                      >
                        <i>✕</i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleModalClose}>
                  İmtina
                </button>
                <button type="submit" className="primary">
                  {editingPartner ? "Dəyişdir" : "Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
