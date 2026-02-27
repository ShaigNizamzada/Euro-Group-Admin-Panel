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

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        { headers }
      );
      setContacts(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete contact
  const handleDelete = async (id) => {
    if (!window.confirm("Əlaqəni silməyə əminsiniz?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/contact/${id}`,
        { headers }
      );
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Əlaqə silinmədi. Xəta baş verdi.");
    }
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
              <th>Soyad</th>
              <th>Telefon</th>
              <th>E-mail</th>
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
                  <td>{contact.surname || "-"}</td>
                  <td>{contact.number || "-"}</td>
                  <td>{contact.mail || "-"}</td>
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
    </div>
  );
};

export default Contacts;
