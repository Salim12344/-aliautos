import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVisits } from "./VisitsContext.jsx";
import { auth } from "./storage";
import "./ScheduleVisit.css";

function ScheduleVisit() {
  const [q] = useSearchParams();
  const carId = q.get("carId");
  const { scheduleVisit, cars } = useVisits();
  const car = cars.find(c => c.id === carId) || null;
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const user = auth.verifyToken() || auth.getCurrentUser();
    if (!user) {
      const redirectUrl = '/schedule' + (carId ? `?carId=${carId}` : '');
      navigate(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setCurrentUser(user);
    setLoading(false);
  }, [navigate, carId]);

  const [form, setForm] = useState({ name: "", email: "", phone: "", visitDate: "", visitTime: "", date: "", time: "", message: "" });

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (currentUser && currentUser.email) {
      setForm(prev => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  const change = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();

    // Double-check authentication before submitting
    const user = auth.verifyToken() || auth.getCurrentUser();
    if (!user) {
      alert("You must be logged in to schedule a visit.");
      navigate('/auth');
      return;
    }

    scheduleVisit(form, car);
    alert("Visit scheduled successfully!");
    navigate("/my-visits");
  };

  if (loading) {
    return <div className="schedule-page"><p>Loading...</p></div>;
  }

  if (!currentUser) {
    return null; // Will redirect
  }

  return (
    <div className="schedule-page">
      <h1>Schedule a Visit</h1>
      {car && <p>Scheduling for: <strong>{car.make} {car.model} {car.year}</strong></p>}
      <form className="form-card" onSubmit={submit}>
        <label>Name <input name="name" value={form.name} onChange={change} required /></label>
        <label>Email <input name="email" type="email" value={form.email} onChange={change} required /></label>
        <label>Phone <input name="phone" value={form.phone} onChange={change} required /></label>
        <label>Date <input name="visitDate" type="date" value={form.visitDate} onChange={change} required /></label>
        <label>Time <input name="visitTime" type="time" value={form.visitTime} onChange={change} required /></label>
        <label>Message <textarea name="message" value={form.message} onChange={change} /></label>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn primary" type="submit">Confirm Visit</button>
          <button className="btn ghost" type="button" onClick={() => navigate(car ? `/cars/${car.id}` : '/cars')}>Back</button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleVisit;
