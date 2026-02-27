import React, { useEffect, useState } from "react";
import "./Products.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import FilterIcon from "../../assets/icons/FilterIcon.svg";

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
    title_az: "",
    title_ru: "",
    description_az: "",
    description_ru: "",
    ceki: "",
    categoryID: "",
    titleImage: null,
    images: [],
    eventIDs: [],
    eventTypeIDs: [],
    serviceIDs: [],
    subcategoryIDs: [],
    terkibiIDs: [],
    cixis: [{ say: "", qiymet: "" }],
  });

  // Dropdown/checkbox data
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  // Image previews
  const [titleImagePreview, setTitleImagePreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    categoryID: "",
    eventIDs: "",
    eventTypeIDs: "",
    serviceIDs: "",
    subcategoryIDs: "",
    terkibiIDs: "",
    search: "",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Fetch all dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, eventsRes, eventTypesRes, servicesRes, subcategoriesRes, ingredientsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/categories`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/public/events`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/public/event-types`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/public/services`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/public/sub-categories`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/terkibi`, { headers }),
        ]);

        setCategories(categoriesRes?.data?.data || []);
        setEvents(eventsRes?.data?.data || []);
        setEventTypes(eventTypesRes?.data?.data || []);
        setServices(servicesRes?.data?.data || []);
        setSubcategories(subcategoriesRes?.data?.data || []);
        setIngredients(ingredientsRes?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };

    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.categoryID) params.categoryID = filters.categoryID;
      if (filters.eventIDs) params.eventIDs = filters.eventIDs;
      if (filters.eventTypeIDs) params.eventTypeIDs = filters.eventTypeIDs;
      if (filters.serviceIDs) params.serviceIDs = filters.serviceIDs;
      if (filters.subcategoryIDs) params.subcategoryIDs = filters.subcategoryIDs;
      if (filters.terkibiIDs) params.terkibiIDs = filters.terkibiIDs;
      if (filters.search) params.search = filters.search;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products`,
        { headers, params }
      );
      setProducts(response?.data?.data || []);
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
  }, [filters]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (name, id) => {
    setFormData((prev) => {
      const currentIds = prev[name];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];
      return { ...prev, [name]: newIds };
    });
  };

  // Handle filter checkbox change
  const handleFilterCheckboxChange = (name, id) => {
    setTempFilters((prev) => {
      const currentIds = prev[name] ? prev[name].split(',').map(Number) : [];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];
      return { ...prev, [name]: newIds.length > 0 ? newIds.join(',') : '' };
    });
  };

  // Open filter modal
  const openFilterModal = () => {
    setTempFilters({ ...filters });
    setIsFilterModalOpen(true);
  };

  // Close filter modal
  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // Apply filters
  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterModalOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    const emptyFilters = {
      categoryID: "",
      eventIDs: "",
      eventTypeIDs: "",
      serviceIDs: "",
      subcategoryIDs: "",
      terkibiIDs: "",
      search: "",
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setIsFilterModalOpen(false);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categoryID) count++;
    if (filters.eventIDs) count++;
    if (filters.eventTypeIDs) count++;
    if (filters.serviceIDs) count++;
    if (filters.subcategoryIDs) count++;
    if (filters.terkibiIDs) count++;
    if (filters.search) count++;
    return count;
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

  // Handle cixis change
  const handleCixisChange = (index, field, value) => {
    setFormData((prev) => {
      const newCixis = [...prev.cixis];
      newCixis[index][field] = value;
      return { ...prev, cixis: newCixis };
    });
  };

  // Add cixis
  const addCixis = () => {
    setFormData((prev) => ({
      ...prev,
      cixis: [...prev.cixis, { say: "", qiymet: "" }],
    }));
  };

  // Remove cixis
  const removeCixis = (index) => {
    setFormData((prev) => ({
      ...prev,
      cixis: prev.cixis.filter((_, i) => i !== index),
    }));
  };

  // Modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      title_az: "",
      title_ru: "",
      description_az: "",
      description_ru: "",
      ceki: "",
      categoryID: "",
      titleImage: null,
      images: [],
      eventIDs: [],
      eventTypeIDs: [],
      serviceIDs: [],
      subcategoryIDs: [],
      terkibiIDs: [],
      cixis: [{ say: "", qiymet: "" }],
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
      title_az: product.title?.az || "",
      title_ru: product.title?.ru || "",
      description_az: product.description?.az || "",
      description_ru: product.description?.ru || "",
      ceki: product.ceki || "",
      categoryID: product.categoryID || "",
      titleImage: null,
      images: [],
      eventIDs: product.events?.map((e) => e.id) || [],
      eventTypeIDs: product.eventTypes?.map((e) => e.id) || [],
      serviceIDs: product.services?.map((s) => s.id) || [],
      subcategoryIDs: product.subcategories?.map((s) => s.id) || [],
      terkibiIDs: product.terkibi?.map((t) => t.id) || [],
      cixis: product.cixis?.length > 0 ? product.cixis.map(c => ({ say: c.say, qiymet: c.qiymet })) : [{ say: "", qiymet: "" }],
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
      formDataToSend.append("title_az", formData.title_az);
      formDataToSend.append("title_ru", formData.title_ru);
      formDataToSend.append("description_az", formData.description_az);
      formDataToSend.append("description_ru", formData.description_ru);
      formDataToSend.append("ceki", parseFloat(formData.ceki));
      formDataToSend.append("categoryID", parseInt(formData.categoryID));

      if (formData.titleImage) {
        formDataToSend.append("titleImage", formData.titleImage);
      }

      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      if (formData.eventIDs.length > 0) {
        formDataToSend.append("eventIDs", formData.eventIDs.join(","));
      }
      if (formData.eventTypeIDs.length > 0) {
        formDataToSend.append("eventTypeIDs", formData.eventTypeIDs.join(","));
      }
      if (formData.serviceIDs.length > 0) {
        formDataToSend.append("serviceIDs", formData.serviceIDs.join(","));
      }
      if (formData.subcategoryIDs.length > 0) {
        formDataToSend.append("subcategoryIDs", formData.subcategoryIDs.join(","));
      }
      if (formData.terkibiIDs.length > 0) {
        formDataToSend.append("terkibiIDs", formData.terkibiIDs.join(","));
      }

      // Filter out empty cixis and create JSON string
      const validCixis = formData.cixis.filter(c => c.say && c.qiymet);
      if (validCixis.length > 0) {
        const cixisJson = JSON.stringify(validCixis.map(c => ({
          say: c.say,
          qiymet: parseFloat(c.qiymet)
        })));
        formDataToSend.append("cixis", cixisJson);
      }

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

      await fetchProducts();
      handleModalClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} product:`, error);
      alert(`Məhsul ${isEditMode ? "yenilənmədi" : "əlavə edilmədi"}. Xəta baş verdi.`);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Məhsulu silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        { headers }
      );
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Məhsul silinmədi. Xəta baş verdi.");
    }
  };

  return (
    <div className="products-page-section">
      <div className="top-section">
        <div className="top-row">
          <div className="title-section">
            <h1>Məhsullar</h1>
          </div>
          <div className="button-section">
            <button className="addition-button" onClick={openAddModal}>
              + Əlavə et
            </button>
          </div>
        </div>
        <div className="bottom-row">
          <div className="filter-search-section">
            <button className="filter-button" onClick={openFilterModal}>
              <img src={FilterIcon} alt="Filter" />
              <span>Filter</span>
              {getActiveFiltersCount() > 0 && (
                <span className="filter-badge">{getActiveFiltersCount()}</span>
              )}
            </button>
            <input
              type="text"
              placeholder="Axtar..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
            {getActiveFiltersCount() > 0 && (
              <button className="clear-filter-button" onClick={clearFilters}>
                Filtri təmizlə
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Şəkil</th>
              <th>Başlıq (AZ)</th>
              <th>Başlıq (RU)</th>
              <th>Təsvir (AZ)</th>
              <th>Təsvir (RU)</th>
              <th>Kateqoriya</th>
              <th>Çəki (kq)</th>
              <th>Tərkib</th>
              <th>Tədbirlər</th>
              <th>Tədbir Növləri</th>
              <th>Xidmətlər</th>
              <th>Alt Kateqoriyalar</th>
              <th>Çıxışlar</th>
              <th>Əlavə Şəkillər</th>
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
                  <td>{product.title?.az || "-"}</td>
                  <td>{product.title?.ru || "-"}</td>
                  <td>{product.description?.az || "-"}</td>
                  <td>{product.description?.ru || "-"}</td>
                  <td>{product.category?.az || "-"}</td>
                  <td>{product.ceki || "-"}</td>
                  <td>
                    {product.terkibi && product.terkibi.length > 0 ? (
                      <div className="tags-list">
                        {product.terkibi.map((item) => (
                          <span key={item.id} className="tag">
                            {item.name?.az || item.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.events && product.events.length > 0 ? (
                      <div className="tags-list">
                        {product.events.map((event) => (
                          <span key={event.id} className="tag">
                            {event.name?.az || event.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.eventTypes && product.eventTypes.length > 0 ? (
                      <div className="tags-list">
                        {product.eventTypes.map((type) => (
                          <span key={type.id} className="tag">
                            {type.name?.az || type.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.services && product.services.length > 0 ? (
                      <div className="tags-list">
                        {product.services.map((service) => (
                          <span key={service.id} className="tag">
                            {service.name?.az || service.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.subcategories && product.subcategories.length > 0 ? (
                      <div className="tags-list">
                        {product.subcategories.map((sub) => (
                          <span key={sub.id} className="tag">
                            {sub.name?.az || sub.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.cixis && product.cixis.length > 0 ? (
                      <div className="cixis-list">
                        {product.cixis.map((cixis) => (
                          <div key={cixis.id} className="cixis-item">
                            <span className="cixis-say">{cixis.say} ədəd</span>
                            <span className="cixis-price">{cixis.qiymet} ₼</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {product.images && product.images.length > 0 ? (
                      <div className="images-list">
                        {product.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={`${import.meta.env.VITE_API_URL}/uploads/${image}`}
                            alt={`${product.title?.az} ${idx + 1}`}
                            className="additional-image"
                          />
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
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

      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={closeFilterModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter</h2>
              <button className="close-button" onClick={closeFilterModal}>
                &times;
              </button>
            </div>
            <div className="modal-body filter-modal-body">
              <div className="form-group">
                <label htmlFor="filter-category">Kateqoriya</label>
                <select
                  id="filter-category"
                  value={tempFilters.categoryID}
                  onChange={(e) => setTempFilters((prev) => ({ ...prev, categoryID: e.target.value }))}
                >
                  <option value="">Hamısı</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name?.az || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tədbirlər</label>
                <div className="checkbox-grid">
                  {events.map((event) => (
                    <label key={event.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.eventIDs ? tempFilters.eventIDs.split(',').map(Number).includes(event.id) : false}
                        onChange={() => handleFilterCheckboxChange("eventIDs", event.id)}
                      />
                      {event.name?.az || event.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tədbir Növləri</label>
                <div className="checkbox-grid">
                  {eventTypes.map((type) => (
                    <label key={type.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.eventTypeIDs ? tempFilters.eventTypeIDs.split(',').map(Number).includes(type.id) : false}
                        onChange={() => handleFilterCheckboxChange("eventTypeIDs", type.id)}
                      />
                      {type.name?.az || type.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Xidmətlər</label>
                <div className="checkbox-grid">
                  {services.map((service) => (
                    <label key={service.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.serviceIDs ? tempFilters.serviceIDs.split(',').map(Number).includes(service.id) : false}
                        onChange={() => handleFilterCheckboxChange("serviceIDs", service.id)}
                      />
                      {service.name?.az || service.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Alt Kateqoriyalar</label>
                <div className="checkbox-grid">
                  {subcategories.map((sub) => (
                    <label key={sub.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.subcategoryIDs ? tempFilters.subcategoryIDs.split(',').map(Number).includes(sub.id) : false}
                        onChange={() => handleFilterCheckboxChange("subcategoryIDs", sub.id)}
                      />
                      {sub.name?.az || sub.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tərkiblər</label>
                <div className="checkbox-grid">
                  {ingredients.map((ingredient) => (
                    <label key={ingredient.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.terkibiIDs ? tempFilters.terkibiIDs.split(',').map(Number).includes(ingredient.id) : false}
                        onChange={() => handleFilterCheckboxChange("terkibiIDs", ingredient.id)}
                      />
                      {ingredient.name?.az || ingredient.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={clearFilters}>
                  Təmizlə
                </button>
                <button type="button" className="primary" onClick={applyFilters}>
                  Tətbiq et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              <div className="form-group">
                <label>Tədbirlər</label>
                <div className="checkbox-grid">
                  {events.map((event) => (
                    <label key={event.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.eventIDs.includes(event.id)}
                        onChange={() => handleCheckboxChange("eventIDs", event.id)}
                      />
                      {event.name?.az || event.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tədbir Növləri</label>
                <div className="checkbox-grid">
                  {eventTypes.map((type) => (
                    <label key={type.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.eventTypeIDs.includes(type.id)}
                        onChange={() => handleCheckboxChange("eventTypeIDs", type.id)}
                      />
                      {type.name?.az || type.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Xidmətlər</label>
                <div className="checkbox-grid">
                  {services.map((service) => (
                    <label key={service.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.serviceIDs.includes(service.id)}
                        onChange={() => handleCheckboxChange("serviceIDs", service.id)}
                      />
                      {service.name?.az || service.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Alt Kateqoriyalar</label>
                <div className="checkbox-grid">
                  {subcategories.map((sub) => (
                    <label key={sub.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.subcategoryIDs.includes(sub.id)}
                        onChange={() => handleCheckboxChange("subcategoryIDs", sub.id)}
                      />
                      {sub.name?.az || sub.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tərkiblər</label>
                <div className="checkbox-grid">
                  {ingredients.map((ingredient) => (
                    <label key={ingredient.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.terkibiIDs.includes(ingredient.id)}
                        onChange={() => handleCheckboxChange("terkibiIDs", ingredient.id)}
                      />
                      {ingredient.name?.az || ingredient.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Çıxışlar (Porsiyalar)</label>
                {formData.cixis.map((cixis, index) => (
                  <div key={index} className="cixis-row">
                    <input
                      type="text"
                      placeholder="Say (məs. 120)"
                      value={cixis.say}
                      onChange={(e) => handleCixisChange(index, "say", e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Qiymət"
                      value={cixis.qiymet}
                      onChange={(e) => handleCixisChange(index, "qiymet", e.target.value)}
                    />
                    {formData.cixis.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-cixis"
                        onClick={() => removeCixis(index)}
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add-cixis" onClick={addCixis}>
                  + Çıxış əlavə et
                </button>
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
