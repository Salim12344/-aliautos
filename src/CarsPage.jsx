import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useVisits } from "./VisitsContext.jsx";
import "./CarsPage.css";

function CarsPage() {
  const { cars } = useVisits();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");


  const filtered = cars.filter(c => {
    if (make && c.make !== make) return false;
    if (model && c.model !== model) return false;
    if (year && String(c.year) !== String(year)) return false;
    return true;
  });

  return (
    <div className="cars-browse">
      <div className="browse-hero">
        <div className="container">
          <h1>Browse Our Cars</h1>
          <div className="filters-row">
            <select value={make} onChange={e => setMake(e.target.value)}>
              <option value="">All Makes</option>
              {Array.from(new Set(cars.map(x => x.make))).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select value={model} onChange={e => setModel(e.target.value)}>
              <option value="">All Models</option>
              {Array.from(new Set(cars.map(x => x.model))).map(mo => (
                <option key={mo} value={mo}>{mo}</option>
              ))}
            </select>

            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Year (Any)</option>
              {Array.from(new Set(cars.map(x => x.year))).sort((a, b) => b - a).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button className="btn btn-outline" onClick={() => { setMake(""); setModel(""); setYear(""); }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="container cars-list">
        <div className="cards-grid">
          {filtered.map(car => (
            <div className="card-small" key={car.id}>
              <div className="card-thumb">
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} />
              </div>
              <div className="card-body-small">
                <h3>{car.make} {car.model} <span className="car-year">{car.year}</span></h3>
                <div className="price-small">₦{car.price.toLocaleString('en-NG')}</div>
                <p className="short-small">{car.shortDescription}</p>
                <div className="card-actions-small">
                  <Link to={`/cars/${car.id}`} className="btn small">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarsPage;
