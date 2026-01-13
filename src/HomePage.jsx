import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import { useVisits } from "./VisitsContext.jsx";
import "./HomePage.css";

// Critical Component (Keep inline or static import for Hero if it was huge, 
// but here we keep Hero inline to ensure instant LCP)
// Non-critical sections lazy loaded:
const WhyUs = React.lazy(() => import("./sections/WhyUs.jsx"));
const Heritage = React.lazy(() => import("./sections/Heritage.jsx"));
const FeaturedCars = React.lazy(() => import("./sections/FeaturedCars.jsx"));
const CTA = React.lazy(() => import("./sections/CTA.jsx"));

function HomePage() {
  const { cars } = useVisits();

  return (
    <div className="home-page">
      {/* Hero Section - CRITICAL LCP ELEMENT (Not Lazy Loaded) */}
      <section className="hero-section">
        <div className="hero-bg-wrapper">
          <div className="hero-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920"
            srcSet="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=640 640w,
                    https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200 1200w,
                    https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920 1920w"
            sizes="100vw"
            alt="Luxury Car Background"
            className="hero-bg-image"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Ali Autos</h1>
            <p className="hero-subtitle">Find your perfect car with confidence. Premium vehicles, trusted service.</p>
            <div className="hero-buttons">
              <Link to="/cars" className="btn btn-primary">Browse Cars</Link>
              <Link to="/contact" className="btn btn-outline">Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy load the rest of the page to free up Main Thread for LCP */}

      {/* Why Us Section */}
      <Suspense fallback={<div style={{ height: '400px' }}></div>}>
        <WhyUs />
      </Suspense>

      {/* Heritage Section */}
      <Suspense fallback={<div style={{ height: '600px' }}></div>}>
        <Heritage />
      </Suspense>

      {/* Featured Cars */}
      <Suspense fallback={<div style={{ height: '500px' }}></div>}>
        <FeaturedCars cars={cars} />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<div style={{ height: '300px' }}></div>}>
        <CTA />
      </Suspense>
    </div>
  );
}

export default HomePage;
