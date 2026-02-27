import React, { useEffect, useState } from "react";
import "./Categories.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Categories = () => {
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
  const [iconPreview, setIconPreview] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_es: "",
    image: null,
    icon: null,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/categories`,
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
  useEffect(() => {
    fetchCategories();
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
    setEditingCategory(null);
    setImagePreview(null);
    setIconPreview(null);
    setFormData({
      name_en: "",
      name_es: "",
      image: null,
      icon: null,
    });
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setImagePreview(null);
    setIconPreview(null);
    setFormData({
      name_en: "",
      name_es: "",
      image: null,
      icon: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category?.name?.en || "",
      name_es: category?.name?.es || "",
      image: null,
      icon: null,
    });
    if (category?.image) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${category.image}`);
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
          `${import.meta.env.VITE_API_URL}/api/admin/categories/${categoryId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/categories`,
          formDataToSend,
          config
        );
      }
      await fetchCategories();
      handleModalClose();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} category:`,
        error
      );
      alert(
        `Category ${isEditMode ? "updated" : "created"
        }. Error occurred.`
      );
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/categories/${id}`,
        { headers }
      );
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Category not deleted. Error occurred.");
    }
  };

  return (
    <div className="categories-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Categories</h1>
        </div>
        <div className="button-section">
          <button className="addition-button" onClick={openAddModal}>
            + Add
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Icon</th>
              <th>Name (En)</th>
              <th>Name (Es)</th>
              <th>Actions</th>
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
                        alt={category.name?.az || "Category"}
                        className="category-image"
                      />
                    ) : (
                      <span className="no-image">Image not found</span>
                    )}
                  </td>
                  <td>
                    {category.iconSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${category.iconSrc}`}
                        alt={category.name?.az || "Category"}
                        className="category-icon"
                      />
                    ) : (
                      <span className="no-icon">Icon yoxdur</span>
                    )}
                  </td>
                  <td>{category.name?.en || "-"}</td>
                  <td>{category.name?.es || "-"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  Category not found
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
                  ? "Edit Category"
                  : "New Category"}
              </h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitCategory}>
              <div className="form-group">
                <label htmlFor="name_en">Category name (English)</label>
                <input
                  id="name_en"
                  name="name_en"
                  type="text"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  placeholder="Category name (EN)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name_es">Category name (Spanish)</label>
                <input
                  id="name_es"
                  name="name_es"
                  type="text"
                  value={formData.name_es}
                  onChange={handleInputChange}
                  placeholder="Category name (ES)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image</label>
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
                        : "Image select (click)"}
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
                <label>Icon</label>
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
                        : "Image select (click)"}
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
                  Cancel
                </button>
                <button type="submit" className="primary">
                  {editingCategory ? "Edit" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
