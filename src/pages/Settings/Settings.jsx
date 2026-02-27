import React, { useEffect, useState } from "react";
import "./Settings.scss";
import axios from "axios";
import { useCookies } from "react-cookie";

const Settings = () => {
    const [cookies] = useCookies(["token"]);
    const token = cookies?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const [settings, setSettings] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone_number: { az: "", ru: "" },
        contact_email: { az: "", ru: "" },
        contact_address: { az: "", ru: "" },
        instagram: { az: "", ru: "" },
        facebook: { az: "", ru: "" },
        whatsapp: { az: "", ru: "" },
        linkedin: { az: "", ru: "" },
    });

    // Fetch settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/public/settings`,
                );
                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    setSettings(data);
                    setFormData({
                        phone_number: {
                            az: data.phone_number?.az || "",
                            ru: data.phone_number?.ru || "",
                        },
                        contact_email: {
                            az: data.contact_email?.az || "",
                            ru: data.contact_email?.ru || "",
                        },
                        contact_address: {
                            az: data.contact_address?.az || "",
                            ru: data.contact_address?.ru || "",
                        },
                        instagram: {
                            az: data.instagram?.az || "",
                            ru: data.instagram?.ru || "",
                        },
                        facebook: {
                            az: data.facebook?.az || "",
                            ru: data.facebook?.ru || "",
                        },
                        whatsapp: {
                            az: data.whatsapp?.az || "",
                            ru: data.whatsapp?.ru || "",
                        },
                        linkedin: {
                            az: data.linkedin?.az || "",
                            ru: data.linkedin?.ru || "",
                        },
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };

        fetchSettings();
    }, []);

    // Input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Split by last underscore to separate field name and language
        const lastUnderscoreIndex = name.lastIndexOf("_");
        const field = name.substring(0, lastUnderscoreIndex);
        const lang = name.substring(lastUnderscoreIndex + 1);
        setFormData((prev) => ({
            ...prev,
            [field]: {
                ...prev[field],
                [lang]: value,
            },
        }));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/public/settings`,
                formData,
                { headers }
            );
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/public/settings`,
                { headers }
            );
            if (response.data.success && response.data.data) {
                const updatedData = response.data.data;
                setSettings(updatedData);
                setFormData({
                    phone_number: {
                        az: updatedData.phone_number?.az || "",
                        ru: updatedData.phone_number?.ru || "",
                    },
                    contact_email: {
                        az: updatedData.contact_email?.az || "",
                        ru: updatedData.contact_email?.ru || "",
                    },
                    contact_address: {
                        az: updatedData.contact_address?.az || "",
                        ru: updatedData.contact_address?.ru || "",
                    },
                    instagram: {
                        az: updatedData.instagram?.az || "",
                        ru: updatedData.instagram?.ru || "",
                    },
                    facebook: {
                        az: updatedData.facebook?.az || "",
                        ru: updatedData.facebook?.ru || "",
                    },
                    whatsapp: {
                        az: updatedData.whatsapp?.az || "",
                        ru: updatedData.whatsapp?.ru || "",
                    },
                    linkedin: {
                        az: updatedData.linkedin?.az || "",
                        ru: updatedData.linkedin?.ru || "",
                    },
                });
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update settings:", error);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        if (settings) {
            setFormData({
                phone_number: {
                    az: settings.phone_number?.az || "",
                    ru: settings.phone_number?.ru || "",
                },
                contact_email: {
                    az: settings.contact_email?.az || "",
                    ru: settings.contact_email?.ru || "",
                },
                contact_address: {
                    az: settings.contact_address?.az || "",
                    ru: settings.contact_address?.ru || "",
                },
                instagram: {
                    az: settings.instagram?.az || "",
                    ru: settings.instagram?.ru || "",
                },
                facebook: {
                    az: settings.facebook?.az || "",
                    ru: settings.facebook?.ru || "",
                },
                whatsapp: {
                    az: settings.whatsapp?.az || "",
                    ru: settings.whatsapp?.ru || "",
                },
                linkedin: {
                    az: settings.linkedin?.az || "",
                    ru: settings.linkedin?.ru || "",
                },
            });
        }
        setIsEditing(false);
    };

    if (!settings) {
        return <div className="contact-page-section">Yüklənir...</div>;
    }

    return (
        <div className="contact-page-section">
            <div className="top-section">
                <div className="title-section">
                    <h1>Əlaqə Məlumatları</h1>
                </div>
                {!isEditing && (
                    <div className="button-section">
                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                            Redaktə et
                        </button>
                    </div>
                )}
            </div>

            <div className="contact-form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="phone_number_az">Telefon Nömrəsi (AZ)</label>
                        <input
                            id="phone_number_az"
                            name="phone_number_az"
                            type="text"
                            value={formData.phone_number.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone_number_ru">Telefon Nömrəsi (RU)</label>
                        <input
                            id="phone_number_ru"
                            name="phone_number_ru"
                            type="text"
                            value={formData.phone_number.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email_az">Email (AZ)</label>
                        <input
                            id="contact_email_az"
                            name="contact_email_az"
                            type="email"
                            value={formData.contact_email.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email_ru">Email (RU)</label>
                        <input
                            id="contact_email_ru"
                            name="contact_email_ru"
                            type="email"
                            value={formData.contact_email.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_address_az">Ünvan (AZ)</label>
                        <input
                            id="contact_address_az"
                            name="contact_address_az"
                            type="text"
                            value={formData.contact_address.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_address_ru">Ünvan (RU)</label>
                        <input
                            id="contact_address_ru"
                            name="contact_address_ru"
                            type="text"
                            value={formData.contact_address.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="instagram_az">Instagram (AZ)</label>
                        <input
                            id="instagram_az"
                            name="instagram_az"
                            type="text"
                            value={formData.instagram.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="instagram_ru">Instagram (RU)</label>
                        <input
                            id="instagram_ru"
                            name="instagram_ru"
                            type="text"
                            value={formData.instagram.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="facebook_az">Facebook (AZ)</label>
                        <input
                            id="facebook_az"
                            name="facebook_az"
                            type="text"
                            value={formData.facebook.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="facebook_ru">Facebook (RU)</label>
                        <input
                            id="facebook_ru"
                            name="facebook_ru"
                            type="text"
                            value={formData.facebook.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="whatsapp_az">WhatsApp (AZ)</label>
                        <input
                            id="whatsapp_az"
                            name="whatsapp_az"
                            type="text"
                            value={formData.whatsapp.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="whatsapp_ru">WhatsApp (RU)</label>
                        <input
                            id="whatsapp_ru"
                            name="whatsapp_ru"
                            type="text"
                            value={formData.whatsapp.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="linkedin_az">LinkedIn (AZ)</label>
                        <input
                            id="linkedin_az"
                            name="linkedin_az"
                            type="text"
                            value={formData.linkedin.az}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="linkedin_ru">LinkedIn (RU)</label>
                        <input
                            id="linkedin_ru"
                            name="linkedin_ru"
                            type="text"
                            value={formData.linkedin.ru}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                            >
                                İmtina
                            </button>
                            <button type="submit" className="save-button">
                                Yadda saxla
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Settings;