import React, { useEffect, useMemo, useState } from "react";
import "./SubCategories.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const SubCategories = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [subCategories, setSubCategories] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [formData, setFormData] = useState({
    categoryID: "",
    name_en: "",
    name_es: "",
    image: null,
    icon: null,
  });

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category?.name?.en || `#${category.id}`;
      return acc;
    }, {});
  }, [categories]);

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/subcategories`,
        { headers }
      );
      setSubCategories(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch sub categories:", error);
      setSubCategories([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/categories`,
        { headers }
      );
      setCategories(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchSubCategories(), fetchCategories()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        icon: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
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

  const handleRemoveIcon = () => {
    setFormData((prev) => ({
      ...prev,
      icon: null,
    }));
    setIconPreview(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
    setImagePreview(null);
    setIconPreview(null);
    setFormData({
      categoryID: "",
      name_en: "",
      name_es: "",
      image: null,
      icon: null,
    });
  };

  const openAddModal = () => {
    setEditingSubCategory(null);
    setImagePreview(null);
    setIconPreview(null);
    setFormData({
      categoryID: "",
      name_en: "",
      name_es: "",
      image: null,
      icon: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      categoryID: String(subCategory?.categoryID || ""),
      name_en: subCategory?.name?.en || "",
      name_es: subCategory?.name?.es || "",
      image: null,
      icon: null,
    });

    if (subCategory?.imgSrc) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${subCategory.imgSrc}`);
    } else {
      setImagePreview(null);
    }

    if (subCategory?.iconSrc) {
      setIconPreview(`${import.meta.env.VITE_API_URL}${subCategory.iconSrc}`);
    } else {
      setIconPreview(null);
    }

    setIsModalOpen(true);
  };

  const handleSubmitSubCategory = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingSubCategory?.id);
    const subCategoryId = editingSubCategory?.id;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("categoryID", Number(formData.categoryID));
      formDataToSend.append("name_en", formData.name_en);
      formDataToSend.append("name_es", formData.name_es);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      if (formData.icon) {
        formDataToSend.append("icon", formData.icon);
      }

      const config = {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/admin/subcategories/${subCategoryId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/subcategories`,
          formDataToSend,
          config
        );
      }

      await fetchAllData();
      handleModalClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} sub category:`,
        error
      );
      alert(
        `Alt kateqoriya ${isEditMode ? "yeniləndi" : "əlavə edildi"}. Xəta baş verdi.`
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu alt kateqoriyani silmək istədiyinizdən əminsiniz?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/subcategories/${id}`,
        { headers }
      );
      setSubCategories((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete sub category:", error);
      alert("Alt kateqoriya silinmedi. Xəta baş verdi.");
    }
  };

  return (
    <div className="sub-categories-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Alt Kateqoriyalar</h1>
        </div>
        <div className="button-section">
          <button className="addition-button" onClick={openAddModal}>
            + Əlavə et
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="sub-categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Şəkil</th>
              <th>Ikon</th>
              <th>Category</th>
              <th>Ad (EN)</th>
              <th>Ad (ES)</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : subCategories && subCategories.length > 0 ? (
              subCategories.map((subCategory, index) => (
                <tr key={subCategory.id}>
                  <td>{index + 1}</td>
                  <td>
                    {subCategory.imgSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${subCategory.imgSrc}`}
                        alt={subCategory.name?.en || "Sub category"}
                        className="subcategory-image"
                      />
                    ) : (
                      <span className="no-image">Şəkil yoxdur</span>
                    )}
                  </td>
                  <td>
                    {subCategory.iconSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${subCategory.iconSrc}`}
                        alt={subCategory.name?.en || "Sub category"}
                        className="subcategory-icon"
                      />
                    ) : (
                      <span className="no-icon">Ikon yoxdur</span>
                    )}
                  </td>
                  <td>
                    {categoryMap[subCategory.categoryID] ||
                      `Category #${subCategory.categoryID}`}
                  </td>
                  <td>{subCategory.name?.en || "-"}</td>
                  <td>{subCategory.name?.es || "-"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(subCategory)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(subCategory.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data-cell">
                  Alt kateqoriya tapılmadı
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
                {editingSubCategory
                  ? "Alt Kateqoriya - Redaktə et"
                  : "Alt Kateqoriya - Əlavə et"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitSubCategory}>
              <div className="form-group">
                <label htmlFor="categoryID">Kateqoriya</label>
                <select
                  id="categoryID"
                  name="categoryID"
                  value={formData.categoryID}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Kateqoriya seçin
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category?.name?.en || `Category #${category.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name_en">Alt kateqoriya adı (English)</label>
                <input
                  id="name_en"
                  name="name_en"
                  type="text"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  placeholder="Alt kateqoriya adı (EN)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name_es">Alt kateqoriya adı (Spanish)</label>
                <input
                  id="name_es"
                  name="name_es"
                  type="text"
                  value={formData.name_es}
                  onChange={handleInputChange}
                  placeholder="Alt kateqoriya adı (ES)"
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

              <div className="form-group">
                <label>Ikon</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="icon"
                    name="icon"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="file-input"
                  />
                  <label htmlFor="icon" className="file-upload-label">
                    <i className="upload-icon">📁</i>
                    <span>
                      {formData.icon
                        ? formData.icon.name
                        : "Ikon seç (klikləyin)"}
                    </span>
                  </label>
                  {iconPreview && (
                    <div className="icon-preview">
                      <img src={iconPreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-icon"
                        onClick={handleRemoveIcon}
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
                  {editingSubCategory ? "Redaktə et" : "Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;
