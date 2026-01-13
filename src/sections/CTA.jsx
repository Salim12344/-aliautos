import React from "react";
import { Link } from "react-router-dom";

export default function CTA() {
    return (
        <section className="cta-section">
            <div className="container">
                <h2>Ready to Find Your Perfect Car?</h2>
                <p>Browse our full inventory and schedule a visit today.</p>
                <Link to="/cars" className="btn btn-secondary btn-lg">Explore Inventory</Link>
            </div>
        </section>
    );
}
