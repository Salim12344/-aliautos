import React from "react";
import { useVisits } from "./VisitsContext.jsx";
import "./MyVisits.css";
import "./VisitCard.css";

function MyVisits(){
  const { visits, cancelVisit } = useVisits();
  // Visits are already filtered by user in VisitsContext
  const userVisits = visits;

  const handleCancelVisit = (visitId) => {
    if (window.confirm('Are you sure you want to cancel this visit? This action cannot be undone.')) {
      cancelVisit(visitId);
    }
  };

  return (
    <div className="my-visits-page">
      <h1>My Visits</h1>
      <p>Manage your scheduled visits below.</p>
      {userVisits.length === 0 && <p>No scheduled visits.</p>}
      <div className="visit-list">
        {userVisits.map(v => (
          <div className="visit-card" key={v.id}>
            <div className="visit-top">
              <div><strong>{v.carName}</strong></div>
              <div className={`pill pill-${v.status}`}>{v.status}</div>
            </div>
            <div className="visit-body">
              <div>{v.date} · {v.time}</div>
              <div>{v.name} · {v.phone}</div>
              {v.message && <div className="muted">Note: {v.message}</div>}
            </div>
            <div className="visit-actions">
              {v.status === "scheduled" && <button className="btn ghost" onClick={()=> handleCancelVisit(v.id)}>Cancel Visit</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyVisits;
