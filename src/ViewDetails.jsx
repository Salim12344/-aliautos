import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVisits } from "./VisitsContext.jsx";
import { auth } from "./storage";
import "./ViewDetails.css";

function formatPrice(n) { return "₦" + n.toLocaleString("en-NG"); }

function ViewDetails() {
  const { id } = useParams();
  const { cars } = useVisits();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === id);
  const user = auth.verifyToken() || auth.getCurrentUser();
  if (!car) return <div className="section"><p>Car not found.</p></div>;

  return (
    <div className="details-wrap">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <div className="details-main">
        <img src={car.imageUrl} alt={car.model} />
        <h1>{car.make} {car.model} {car.year}</h1>
        <p className="price">{formatPrice(car.price)}</p>
        <div className="desc">
          <h3>Details</h3>
          <ul>{car.description.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>

      <aside className="details-side">
        <div className="card">
          <h3>Schedule a Visit</h3>
          <p>Visit Ali Autos to inspect this car in person.</p>
          {!user && (
            <p style={{ color: "#e74c3c", fontWeight: "500", marginTop: "12px", marginBottom: "12px" }}>
              ⚠️ You must be signed in to schedule a visit.
            </p>
          )}
          <button
            className="btn primary"
            onClick={() => {
              if (!user) {
                navigate(`/auth?redirect=/schedule?carId=${encodeURIComponent(car.id)}`);
              } else {
                navigate(`/schedule?carId=${encodeURIComponent(car.id)}`);
              }
            }}
          >
            {user ? "Schedule Visit" : "Sign In to Schedule"}
          </button>
        </div>

        <div className="card">
          <h4>Vehicle Info</h4>
          <dl className="vehicle-info-list">
            <div className="info-row">
              <dt>Year</dt><dd>{car.year}</dd>
            </div>
            <div className="info-row">
              <dt>Mileage</dt><dd>{car.mileage}</dd>
            </div>
            <div className="info-row">
              <dt>Body</dt><dd>{car.body}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

export default ViewDetails;
