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

  const [brands, setBrands] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_es: "",
    image: null,
  });

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/brands`,
        { headers },
      );
      setBrands(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
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
      image: null,
    }));
    setImagePreview(null);
  };
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
    setEditingBrand(null);
    setImagePreview(null);
    setFormData({
      name_en: "",
      name_es: "",
      image: null,
    });
  };

  // Open add modal
  const openAddModal = () => {
    setEditingBrand(null);
    setImagePreview(null);
    setFormData({
      name_en: "",
      name_es: "",
      image: null,
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name_en: brand?.name?.en || "",
      name_es: brand?.name?.es || "",
      image: null,
    });
    if (brand?.imgSrc) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${brand.imgSrc}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  // Submit brand (POST/PUT)
  const handleSubmitBrand = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingBrand?.id);
    const brandId = editingBrand?.id;

    try {
      const form = new FormData();

      form.append("name_en", formData.name_en);
      form.append("name_es", formData.name_es);

      // Əgər image varsa əlavə et
      if (formData.image) {
        form.append("image", formData.image);
      }

      const config = {
        headers: {
          ...headers,
        },
      };

      if (isEditMode) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/admin/brands/${brandId}`,
          form,
          config,
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/brands`,
          form,
          config,
        );
      }

      await fetchBrands();
      handleModalClose();
    } catch (error) {
      console.error("Xəta:", error.response?.data || error);
    }
  };

  // Delete brand
  const handleDelete = async (id) => {
    if (!window.confirm("Bu brendi silmək istədiyinizdən əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/brands/${id}`,
        { headers },
      );
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
    } catch (error) {
      console.error("Failed to delete brand:", error);
      alert("Brend silinmedi. Xəta baş verdi.");
    }
  };

  return (
    <div className="brands-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Brendlər</h1>
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
              <th>Ad (EN)</th>
              <th>Ad (ES)</th>
              <th>Şəkil</th>
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
            ) : brands && brands.length > 0 ? (
              brands.map((brand, index) => (
                <tr key={brand.id}>
                  <td>{index + 1}</td>
                  <td>{brand.name?.en || "-"}</td>
                  <td>{brand.name?.es || "-"}</td>
                  <td>
                    {brand.imgSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${brand.imgSrc}`}
                        alt={brand.id || "Brand"}
                        className="brand-image"
                      />
                    ) : (
                      <span className="no-image">Şəkil yoxdur</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(brand)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(brand.id)}
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
                  Brend tapılmadı
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
                {editingBrand ? "Brend - Redaktə et" : "Brend - Əlavə et"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitBrand}>
              <div className="form-group">
                <label htmlFor="name_en">Brend adı (English)</label>
                <input
                  id="name_en"
                  name="name_en"
                  type="text"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  placeholder="Brend adı (EN)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name_es">Brend adı (Spanish)</label>
                <input
                  id="name_es"
                  name="name_es"
                  type="text"
                  value={formData.name_es}
                  onChange={handleInputChange}
                  placeholder="Brend adı (ES)"
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
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-upload-label">
                    <i className="upload-icon">📁</i>
                    <span>
                      {formData.image
                        ? formData.image.name
                        : "Şəkil seç (klikləyin)"}
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
                  Ləğv et
                </button>
                <button type="submit" className="primary">
                  {editingBrand ? "Redaktə et" : "Əlavə et"}
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
