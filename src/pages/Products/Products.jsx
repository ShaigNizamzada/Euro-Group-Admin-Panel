import React, { useEffect, useState } from "react";
import "./Products.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Products = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [products, setProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title_en: "",
    title_es: "",
    description_en: "",
    description_es: "",
    details_en: "",
    details_es: "",
    productCode: "",
    cost: "",
    weight: "",
    is_active: "",
    categoryID: "",
    brandID: "",
    titleImage: null,
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  // Image previews
  const [titleImagePreview, setTitleImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/products`,
        { headers }
      );
      setProducts(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle title image
  const handleTitleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, titleImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setTitleImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple images
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreview((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove title image
  const removeTitleImage = () => {
    setFormData((prev) => ({ ...prev, titleImage: null }));
    setTitleImagePreview(null);
  };

  // Remove additional image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      title_en: "",
      title_es: "",
      description_en: "",
      description_es: "",
      details_en: "",
      details_es: "",
      productCode: "",
      cost: "",
      weight: "",
      is_active: "",
      categoryID: "",
      brandID: "",
      titleImage: null,
      images: [],
    });
    setTitleImagePreview(null);
    setImagesPreview([]);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title_en: product.title?.en || "",
      title_es: product.title?.es || "",
      description_en: product.description?.en || "",
      description_es: product.description?.es || "",
      details_en: product.details?.en || "",
      details_es: product.details?.es || "",
      productCode: product.productCode || "",
      cost: product.cost || "",
      weight: product.weight || "",
      is_active: product.is_active || "",
      categoryID: product.categoryID || "",
      titleImage: null,
      images: [],
    });
    setTitleImagePreview(product.titleImgSrc ? `${import.meta.env.VITE_API_URL}${product.titleImgSrc}` : null);
    setIsModalOpen(true);
  };

  // Submit product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const isEditMode = Boolean(editingProduct?.id);
    const productId = editingProduct?.id;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title_en", formData.title_en);
      formDataToSend.append("title_es", formData.title_es);
      formDataToSend.append("description_en", formData.description_en);
      formDataToSend.append("description_es", formData.description_es);
      formDataToSend.append("details_en", formData.details_en);
      formDataToSend.append("details_es", formData.details_es);
      formDataToSend.append("productCode", formData.productCode);
      formDataToSend.append("cost", parseFloat(formData.cost));
      formDataToSend.append("weight", parseFloat(formData.weight));
      formDataToSend.append("is_active", formData.is_active);
      formDataToSend.append("categoryID", parseInt(formData.categoryID));
      formDataToSend.append("brandID", parseInt(formData.brandID));

      if (formData.titleImage) {
        formDataToSend.append("titleImage", formData.titleImage);
      }

      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const config = {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products`,
          formDataToSend,
          config
        );
      }

      handleModalClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} product:`, error);
      alert(`Product ${isEditMode ? "updated" : "created"}. Error occurred.`);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        { headers }
      );
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Product not deleted. Error occurred.");
    }
  };

  return (
    <div className="products-page-section">
      <div className="top-section">
        <div className="top-row">
          <div className="title-section">
            <h1>Products</h1>
          </div>
          <div className="button-section">
            <button className="addition-button" onClick={openAddModal}>
              + Əlavə et
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Şəkil</th>
              <th>Şəkillər</th>
              <th>Başlıq (EN)</th>
              <th>Başlıq (ES)</th>
              <th>Təsvir (EN)</th>
              <th>Təsvir (ES)</th>
              <th>Ətraflı Məlumat (EN)</th>
              <th>Ətraflı Məlumat (ES)</th>
              <th>Kateqoriya</th>
              <th>Brend</th>
              <th>Məhsul Kodu</th>
              <th>Çəki (kq)</th>
              <th>Qiymət</th>
              <th>Aktivlik</th>
              <th>Yaradılma Tarixi</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="17" className="loading-cell">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : products && products.length > 0 ? (
              products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>
                    {product.titleImgSrc ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.titleImgSrc}`}
                        alt={product.title?.az || "Product"}
                        className="product-image"
                      />
                    ) : (
                      <span className="no-image">Şəkil yoxdur</span>
                    )}
                  </td>
                  <td>
                    {product.images && product.images.length > 0 ? (
                      <div className="images-list">
                        {product.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={`${import.meta.env.VITE_API_URL}${image}`}
                            alt={`${product.title?.az} ${idx + 1}`}
                            className="additional-image"
                          />
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{product.title?.en || "-"}</td>
                  <td>{product.title?.es || "-"}</td>
                  <td>{product.description?.en || "-"}</td>
                  <td>{product.description?.es || "-"}</td>
                  <td>{product.details?.en || "-"}</td>
                  <td>{product.details?.es || "-"}</td>
                  <td>{product.categoryID || "-"}</td>
                  <td>{product.brandID || "-"}</td>
                  <td>{product.productCode || "-"}</td>
                  <td>{product.weight || "-"}</td>
                  <td>{product.cost || "-"}</td>
                  <td>{product.is_active ? "Aktiv" : "Deaktiv"}</td>



                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleString('az-AZ') : "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openEditModal(product)}
                      >
                        Redaktə et
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="17" className="no-data-cell">
                  Məhsul tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>



      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? "Məhsulu Dəyişdir" : "Yeni Məhsul"}</h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title_az">Başlıq (AZ) *</label>
                  <input
                    id="title_az"
                    name="title_az"
                    type="text"
                    value={formData.title_az}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="title_ru">Başlıq (RU) *</label>
                  <input
                    id="title_ru"
                    name="title_ru"
                    type="text"
                    value={formData.title_ru}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description_az">Təsvir (AZ) *</label>
                  <textarea
                    id="description_az"
                    name="description_az"
                    value={formData.description_az}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description_ru">Təsvir (RU) *</label>
                  <textarea
                    id="description_ru"
                    name="description_ru"
                    value={formData.description_ru}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryID">Kateqoriya *</label>
                  <select
                    id="categoryID"
                    name="categoryID"
                    value={formData.categoryID}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Kateqoriya seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name?.az || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ceki">Çəki (kq) *</label>
                  <input
                    id="ceki"
                    name="ceki"
                    type="number"
                    step="0.01"
                    value={formData.ceki}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Əsas Şəkil *</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTitleImageChange}
                    className="file-input"
                    id="titleImage"
                  />
                  <label htmlFor="titleImage" className="file-upload-label">
                    <i>📁</i>
                    <span>Əsas şəkil seçin</span>
                  </label>
                  {titleImagePreview && (
                    <div className="image-preview">
                      <img src={titleImagePreview} alt="Preview" />
                      <button type="button" className="remove-image" onClick={removeTitleImage}>
                        <i>✕</i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Əlavə Şəkillər</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="file-input"
                    id="images"
                  />
                  <label htmlFor="images" className="file-upload-label">
                    <i>📁</i>
                    <span>Əlavə şəkillər seçin (çoxlu)</span>
                  </label>
                  {imagesPreview.length > 0 && (
                    <div className="images-preview-grid">
                      {imagesPreview.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview} alt={`Preview ${index}`} />
                          <button
                            type="button"
                            className="remove-image-small"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              <div className="modal-footer">
                <button type="button" onClick={handleModalClose}>
                  İmtina
                </button>
                <button type="submit" className="primary">
                  {editingProduct ? "Dəyişdir" : "Əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
