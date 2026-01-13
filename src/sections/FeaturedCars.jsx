import React from "react";
import { Link } from "react-router-dom";

export default function FeaturedCars({ cars }) {
    // Take only first 3 cars
    const featuredCars = cars ? cars.slice(0, 3) : [];

    return (
        <section className="featured-section">
            <div className="container">
                <h2>Featured Vehicles</h2>
                <div className="cars-grid">
                    {featuredCars.map(car => (
                        <div key={car.id} className="card-small">
                            <div className="card-thumb">
                                <img
                                    src={car.imageUrl}
                                    alt={`${car.make} ${car.model}`}
                                    loading="lazy"
                                    width="320"
                                    height="200"
                                    style={{ objectFit: 'contain' }}
                                />
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
                <div className="text-center mt-40">
                    <Link to="/cars" className="btn btn-primary">View All Cars</Link>
                </div>
            </div>
        </section>
    );
}
