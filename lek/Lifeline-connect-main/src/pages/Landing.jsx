import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/" className="logo">
                    <i className="fa-solid fa-heart-pulse"></i>
                    LifeLine<span>Connect</span>
                </Link>
                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#about">About Us</a>
                    <Link to="/login" className="btn btn-secondary">Sign In</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="hero-content">
                    <h1>Bridging the Gap Between <br /><span>Donors</span> & <span>Recipients</span></h1>
                    <p>Every drop counts. Connect instantly with local donors or find someone in need. A seamless platform to save lives.</p>
                    <div className="cta-group">
                        <Link to="/register" className="btn btn-primary btn-large">
                            <i className="fa-solid fa-hand-holding-medical"></i> Request Blood
                        </Link>
                        <Link to="/register" className="btn btn-secondary btn-large">
                            <i className="fa-solid fa-hand-holding-heart"></i> Donate Blood
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="how-it-works" className="features">
                <div className="section-title">
                    <h2>How LifeLine Works</h2>
                    <p>Simple steps to make a big impact.</p>
                </div>
                <div className="grid">
                    <div className="card">
                        <div className="card-icon">
                            <i className="fa-solid fa-users-viewfinder"></i>
                        </div>
                        <h3>Find Donors Nearby</h3>
                        <p>Our geolocation technology helps you find available blood donors in your immediate vicinity quickly.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                        <h3>Real-time Alerts</h3>
                        <p>Donors get instant notifications when there is a matching blood request in their area.</p>
                    </div>
                    <div className="card">
                        <div className="card-icon">
                            <i className="fa-solid fa-shield-heart"></i>
                        </div>
                        <h3>Secure & Private</h3>
                        <p>We prioritize your privacy. Your information is secure and only shared when necessary for donation.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact">
                <div className="logo" style={{ justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
                    <i className="fa-solid fa-heart-pulse" style={{ color: 'var(--primary-color)' }}></i>
                    LifeLine<span>Connect</span>
                </div>
                <p>&copy; 2024 LifeLine Connect. All rights reserved.</p>
            </footer>
        </>
    );
}

export default Landing;
