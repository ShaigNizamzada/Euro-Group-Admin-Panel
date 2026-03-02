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
        contact_phone_number: { en: "", es: "" },
        contact_email: { en: "", es: "" },
        contact_address: { en: "", es: "" },
        whatsapp: { en: "", es: "" },
        instagram: { en: "", es: "" },
        facebook: { en: "", es: "" },
    });

    // Fetch settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/settings`,
                );
                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    setSettings(data);
                    setFormData({
                        contact_phone_number: {
                            en: data.contact_phone_number?.en || "",
                            es: data.contact_phone_number?.es || "",
                        },
                        contact_email: {
                            en: data.contact_email?.en || "",
                            es: data.contact_email?.es || "",
                        },
                        contact_address: {
                            en: data.contact_address?.en || "",
                            es: data.contact_address?.es || "",
                        },
                        whatsapp: {
                            en: data.whatsapp?.en || "",
                            es: data.whatsapp?.es || "",
                        },
                        instagram: {
                            en: data.instagram?.en || "",
                            es: data.instagram?.es || "",
                        },
                        facebook: {
                            en: data.facebook?.en || "",
                            es: data.facebook?.es || "",
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
            await axios.patch(
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
                    contact_phone_number: {
                        en: updatedData.contact_phone_number?.en || "",
                        es: updatedData.contact_phone_number?.es || "",
                    },
                    contact_email: {
                        en: updatedData.contact_email?.en || "",
                        es: updatedData.contact_email?.es || "",
                    },
                    contact_address: {
                        en: updatedData.contact_address?.en || "",
                        es: updatedData.contact_address?.es || "",
                    },
                    whatsapp: {
                        en: updatedData.whatsapp?.en || "",
                        es: updatedData.whatsapp?.es || "",
                    },
                    instagram: {
                        en: updatedData.instagram?.en || "",
                        es: updatedData.instagram?.es || "",
                    },
                    facebook: {
                        en: updatedData.facebook?.en || "",
                        es: updatedData.facebook?.es || "",
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
                contact_phone_number: {
                    en: settings.contact_phone_number?.en || "",
                    es: settings.contact_phone_number?.es || "",
                },
                contact_email: {
                    en: settings.contact_email?.en || "",
                    es: settings.contact_email?.es || "",
                },
                contact_address: {
                    en: settings.contact_address?.en || "",
                    es: settings.contact_address?.es || "",
                },
                whatsapp: {
                    en: settings.whatsapp?.en || "",
                    es: settings.whatsapp?.es || "",
                },
                instagram: {
                    en: settings.instagram?.en || "",
                    es: settings.instagram?.es || "",
                },
                facebook: {
                    en: settings.facebook?.en || "",
                    es: settings.facebook?.es || "",
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
                        <label htmlFor="contact_phone_number_en">Telefon Nömrəsi (En)</label>
                        <input
                            id="contact_phone_number_en"
                            name="contact_phone_number_en"
                            type="text"
                            value={formData.contact_phone_number.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_phone_number_es">Telefon Nömrəsi (Es)</label>
                        <input
                            id="contact_phone_number_es"
                            name="contact_phone_number_es"
                            type="text"
                            value={formData.contact_phone_number.es}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email_en">Email (En)</label>
                        <input
                            id="contact_email_en"
                            name="contact_email_en"
                            type="email"
                            value={formData.contact_email.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email_es">Email (Es)</label>
                        <input
                            id="contact_email_es"
                            name="contact_email_es"
                            type="email"
                            value={formData.contact_email.es}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_address_en">Ünvan (En)</label>
                        <input
                            id="contact_address_en"
                            name="contact_address_en"
                            type="text"
                            value={formData.contact_address.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_address_es">Ünvan (Es)</label>
                        <input
                            id="contact_address_es"
                            name="contact_address_es"
                            type="text"
                            value={formData.contact_address.es}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="whatsapp_en">WhatsApp (En)</label>
                        <input
                            id="whatsapp_en"
                            name="whatsapp_en"
                            type="text"
                            value={formData.whatsapp.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="whatsapp_es">WhatsApp (Es)</label>
                        <input
                            id="whatsapp_es"
                            name="whatsapp_es"
                            type="text"
                            value={formData.whatsapp.es}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="instagram_en">Instagram (En)</label>
                        <input
                            id="instagram_en"
                            name="instagram_en"
                            type="text"
                            value={formData.instagram.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="instagram_es">Instagram (Es)</label>
                        <input
                            id="instagram_es"
                            name="instagram_es"
                            type="text"
                            value={formData.instagram.es}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="facebook_en">Facebook (En)</label>
                        <input
                            id="facebook_en"
                            name="facebook_en"
                            type="text"
                            value={formData.facebook.en}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="facebook_es">Facebook (Es)</label>
                        <input
                            id="facebook_es"
                            name="facebook_es"
                            type="text"
                            value={formData.facebook.es}
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