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

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const initialFormState = {
    title_en: "",
    title_es: "",
    description_en: "",
    description_es: "",
    details_en: "",
    details_es: "",
    productCode: "",
    cost: "",
    weight: "",
    is_active: "1",
    categoryID: "",
    brandID: "",
    titleImage: null,
    images: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const [titleImagePreview, setTitleImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);

  // ================= FETCH DATA =================

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/products?limit=100`,
        { headers }
      );
      setProducts(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/categories`,
        { headers }
      );
      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/brands`,
        { headers }
      );
      setBrands(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  // ================= FORM HANDLERS =================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, titleImage: file }));

    const reader = new FileReader();
    reader.onloadend = () => setTitleImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagesPreview((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeTitleImage = () => {
    setFormData((prev) => ({ ...prev, titleImage: null }));
    setTitleImagePreview(null);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setTitleImagePreview(null);
    setImagesPreview([]);
  };

  // ================= OPEN MODALS =================

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

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
      is_active: String(product.is_active ?? "1"),
      categoryID: String(product.categoryID || ""),
      brandID: String(product.brandID || ""), // FIX
      titleImage: null,
      images: [],
    });

    setTitleImagePreview(
      product.titleImgSrc
        ? `${import.meta.env.VITE_API_URL}${product.titleImgSrc}`
        : null
    );

    setIsModalOpen(true);
  };

  // ================= SUBMIT =================

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    const isEditMode = Boolean(editingProduct?.id);
    const productId = editingProduct?.id;

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images" && key !== "titleImage") {
          formDataToSend.append(key, value);
        }
      });

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
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/products`,
          formDataToSend,
          config
        );
      }

      await fetchProducts(); // REFRESH WITHOUT PAGE RELOAD
      handleModalClose();
    } catch (error) {
      console.error("Product submit error:", error);
      alert("Əməliyyat uğursuz oldu.");
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Silmək istədiyinizə əminsiniz?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/products/${id}`,
        { headers }
      );

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Silinmədi.");
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
                  <td>{product.categoryID ? categories?.find(category => category.id === product.categoryID)?.name?.en || "-" : "-"}</td>
                  <td>{product.brandID ? brands?.find(brand => brand.id === product.brandID)?.name?.en || "-" : "-"}</td>
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
              <h2>{editingProduct ? "Məhsulu - Redaktə et" : "Məhsul - Əlavə et"}</h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title_en">Başlıq (EN) *</label>
                  <input
                    id="title_en"
                    name="title_en"
                    type="text"
                    value={formData.title_en}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="title_es">Başlıq (ES) *</label>
                  <input
                    id="title_es"
                    name="title_es"
                    type="text"
                    value={formData.title_es}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description_en">Təsvir (EN) *</label>
                  <input
                    id="description_en"
                    name="description_en"
                    type="text"
                    value={formData.description_en}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description_es">Təsvir (ES) *</label>
                  <input
                    id="description_es"
                    name="description_es"
                    type="text"
                    value={formData.description_es}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="details_en">Ətraflı Məlumat (EN) *</label>
                  <input
                    id="details_en"
                    name="details_en"
                    type="text"
                    value={formData.details_en}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="details_es">Ətraflı Məlumat (ES) *</label>
                  <input
                    id="details_es"
                    name="details_es"
                    type="text"
                    value={formData.details_es}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="productCode">Məhsul Kodu *</label>
                  <input
                    id="productCode"
                    name="productCode"
                    type="text"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Çəki (kq) *</label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cost">Qiymət *</label>
                  <input
                    id="cost"
                    name="cost"
                    type="number"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="is_active">Aktivlik *</label>
                  <select
                    id="is_active"
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Aktiv</option>
                    <option value="0">Deaktiv</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="categoryID">Kateqoriya (EN) *</label>
                  <select
                    id="categoryID"
                    name="categoryID"
                    value={formData.categoryID}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Kateqoriya (EN) seçin</option>
                    {categories && categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name?.en || cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="brandID">Brend (EN) *</label>
                  <select
                    id="brandID"
                    name="brandID"
                    value={formData.brandID}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Brend (EN) seçin</option>
                    {brands && brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name?.en || brand.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="titleImage">Əsas Şəkil *</label>
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
                        <button
                          type="button"
                          className="remove-image"
                          onClick={removeTitleImage}
                        >
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
