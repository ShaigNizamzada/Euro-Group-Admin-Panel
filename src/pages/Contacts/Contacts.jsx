import React, { useEffect, useState } from "react";
import "./Contacts.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Contacts = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [contacts, setContacts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContacts = async (pageParam = page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/contacts?page=${pageParam}&limit=${limit}`,
        { headers }
      );
      const data = response?.data;

      setContacts(data?.data || data || []);

      const pagination = data?.pagination;

      if (pagination) {
        setTotalItems(pagination.total || 0);

        const backendLimit = pagination.limit || limit;

        if (typeof pagination.page === "number" && pagination.page !== page) {
          setPage(pagination.page);
        }

        const calculatedTotalPages =
          pagination.total && backendLimit
            ? Math.ceil(pagination.total / backendLimit)
            : 1;

        setTotalPages(calculatedTotalPages);
      } else {
        const length = Array.isArray(data?.data)
          ? data.data.length
          : Array.isArray(data)
            ? data.length
            : 0;
        setTotalItems(length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  useEffect(() => {
    fetchContacts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Delete contact
  const handleDelete = async (id) => {
    if (!window.confirm("Əlaqəni silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/contact/${id}`,
        { headers }
      );
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
      setTotalItems((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Əlaqə silinmədi. Xəta baş verdi.");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="contacts-page-section">
      <div className="top-section">
        <div className="title-section">
          <h1>Əlaqələr</h1>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Başlıq</th>
              <th>Sifariş Nömrəsi</th>
              <th>E-mail</th>
              <th>Mesaj</th>
              <th>Tarix</th>
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
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <tr key={contact.id}>
                  <td>{index + 1}</td>
                  <td>{contact.name || "-"}</td>
                  <td>{contact.topic || "-"}</td>
                  <td>{contact.orderID || "-"}</td>
                  <td>{contact.mail || "-"}</td>
                  <td>{contact.text || "-"}</td>
                  <td>{formatDate(contact.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(contact.id)}
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
                  Əlaqə tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ‹ Əvvəlki
          </button>
          <div className="pagination-info">
            Səhifə {page} / {totalPages}
            {totalItems > 0 && (
              <span> · Toplam {totalItems} əlaqə</span>
            )}
          </div>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Növbəti ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Contacts;
