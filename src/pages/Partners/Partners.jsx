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

  const [categories, setCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name_az: "",
    name_ru: "",
    image: null,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        { headers }
      );
      setCategories(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
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

  // Image file handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
  };

  // Modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImagePreview(null);
    setFormData({
      name_az: "",
      name_ru: "",
      image: null,
    });
  };

  // Open add modal
  const openAddModal = () => {
    setEditingCategory(null);
    setImagePreview(null);
    setFormData({
      name_az: "",
      name_ru: "",
      image: null,
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name_az: category?.name?.az || "",
      name_ru: category?.name?.ru || "",
      image: null,
    });
    // Set existing image as preview
    if (category?.imgSrc) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${category.imgSrc}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  // Submit category (POST/PUT)
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingCategory?.id);
    const categoryId = editingCategory?.id;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name_az", formData.name_az);
      formDataToSend.append("name_ru", formData.name_ru);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const config = {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/categories`,
          formDataToSend,
          config
        );
      }

      // Refresh categories list
      await fetchCategories();
      handleModalClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} category:`,
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
        `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
        { headers }
      );
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Kateqoriya silinmədi. Xəta baş verdi.");
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
              <th>Ad (AZ)</th>
              <th>Ad (RU)</th>
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
            ) : categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>
                    {category.imgSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${category.imgSrc}`}
                        alt={category.name?.az || "Partner"}
                        className="partner-image"
                      />
                    ) : (
                      <span className="no-image">Şəkil yoxdur</span>
                    )}
                  </td>
                  <td>{category.name?.az || "-"}</td>
                  <td>{category.name?.ru || "-"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(category)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(category.id)}
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
                {editingCategory
                  ? "Partnerni Dəyişdir"
                  : "Yeni Partner"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitCategory}>
              <div className="form-group">
                <label htmlFor="name_az">Ad (Azərbaycan)</label>
                <input
                  id="name_az"
                  name="name_az"
                  type="text"
                  value={formData.name_az}
                  onChange={handleInputChange}
                  placeholder="Partner adı (AZ)"
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
                  placeholder="Название партнера (RU)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Şəkil</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-upload-label">
                    <i className="upload-icon">📁</i>
                    <span>
                      {formData.image
                        ? formData.image.name
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
                  {editingCategory ? "Dəyişdir" : "Əlavə et"}
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
