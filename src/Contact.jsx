import React, { useState } from "react";
import { FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope } from "react-icons/fa";
import { contactMessages } from "./storage";
import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Save contact message to localStorage
      contactMessages.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      alert("Thank you for your message! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      alert("There was an error sending your message. Please try again.");
      console.error("Error saving contact message:", error);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with our team. We're here to help!</p>
        </div>
      </div>

      <div className="container contact-content">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a Message</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+234 810 555 1122"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Your message here..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
        </form>

        <div className="contact-info">
          <h2>Contact Information</h2>

          <div className="info-card">
            <h3><FaMapMarkerAlt style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Location</h3>
            <p>102 Ahmadu Bello Way, Kado</p>
            <p>Abuja, Nigeria</p>
          </div>

          <div className="info-card">
            <h3><FaPhone style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Phone</h3>
            <p>+234 810 555 1122</p>
            <p>+234 810 555 1133</p>
          </div>

          <div className="info-card">
            <h3><FaClock style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Hours</h3>
            <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
            <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
            <p><strong>Sunday:</strong> Closed</p>
          </div>

          <div className="info-card">
            <h3><FaEnvelope style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Email</h3>
            <p>info@aliautos.com</p>
            <p>support@aliautos.com</p>
          </div>
        </div>
      </div>

      <div className="container map-section">
        <h2 className="map-title">Find Us At</h2>
        <div className="map-container">
          <iframe
            title="ABUJACAR Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.2345678901234!2d7.4856!3d9.0456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0a9b8c7d6e5f%3A0x1a2b3c4d5e6f7a8b!2s102%20Ahmadu%20Bello%20Way%2C%20Kado%2C%20Abuja!5e0!3m2!1sen!2sng!4v1703084500000!5m2!1sen!2sng"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
