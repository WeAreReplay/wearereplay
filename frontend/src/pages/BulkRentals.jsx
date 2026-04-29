import React from "react";
import "../assets/css/bulk-rentals.css";
import { useNavigate } from "react-router-dom";

const BulkRentals = () => {
  const navigate = useNavigate();
  return (
    <main className="bulk-main">
      
      {/* HERO */}
      <section className="bulk-hero">
        <div className="width-wrap">
          <div className="hero-content">

            <span className="hero-badge">B2B SOLUTIONS</span>

            <h1 className="hero-title">
              BULK GAME RENTALS
            </h1>

            <p className="hero-subtitle">
              FULLY MANAGED GAMING SETUPS FOR EVENTS, CAFÉS & BUSINESSES.
            </p>

            <p className="hero-desc">
              We provide consoles, games, monitors and controllers — delivered,
              set up and ready to play.
            </p>

            <div className="hero-actions">
              <button className="btn primary"
              onClick={() => navigate("/contact")}>BOOK A PACKAGE</button>
              <button className="btn secondary"
              onClick={() => navigate("/contact")}>CONTACT US</button>
            </div>

          </div>
        </div>

        <div className="hero-bg-shape"></div>
      </section>

      {/* FEATURES */}
      <section className="bulk-features">
        <div className="width-wrap">
          <div className="features-card">

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M3 7h18v13H3zM3 7l9-4 9 4"/></svg>
              </div>
              <div>
                <h4>OWNER INVENTORY</h4>
                <p>Instant availability. No waiting.</p>
              </div>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/></svg>
              </div>
              <div>
                <h4>FULLY MANAGED</h4>
                <p>We handle delivery, setup & support.</p>
              </div>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <h4>HIGH QUALITY</h4>
                <p>Well maintained consoles & games.</p>
              </div>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M3 4h18v18H3zM16 2v4M8 2v4"/></svg>
              </div>
              <div>
                <h4>FLEXIBLE RENTALS</h4>
                <p>Short-term or long-term options available.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="bulk-included">
        <div className="width-wrap">

          <h2 className="section-title outlined">
            <span className="pixel">►</span>
            <span>WHAT’S INCLUDED</span>
            <span className="pixel">◄</span>
          </h2>

          <div className="included-grid">

            {/* GAMES */}
            <div className="card">
              <div className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M6 12h12M8 9v6M16 9v6"/>
                </svg>
              </div>
              <h3 className="card-title">GAMES</h3>
              <p className="card-desc">
                15 – 30+ titles<br/>curated by REPLAY
              </p>
            </div>

            {/* CONTROLLERS */}
            <div className="card">
              <div className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M6 12h12M9 15l-2 3M15 15l2 3"/>
                </svg>
              </div>
              <h3 className="card-title">CONTROLLERS</h3>
              <p className="card-desc">
                4 – 10 controllers<br/>(varies by package)
              </p>
            </div>

            {/* MONITORS */}
            <div className="card">
              <div className="icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="12"/>
                </svg>
              </div>
              <h3 className="card-title">MONITORS</h3>
              <p className="card-desc">
                2 – 5 monitors<br/>(varies by package)
              </p>
            </div>

            {/* CONSOLES */}
            <div className="card">
              <div className="icon">
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="3" width="12" height="18"/>
                </svg>
              </div>
              <h3 className="card-title">CONSOLES</h3>
              <p className="card-desc">
                2 – 5 consoles<br/>(varies by package)
              </p>
            </div>

            {/* SUPPORT */}
            <div className="card">
              <div className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 12h18M5 6h14"/>
                </svg>
              </div>
              <h3 className="card-title">SETUP & SUPPORT</h3>
              <p className="card-desc">
                Delivery, setup<br/>and on-site support
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* WHO IT’S FOR */}
<section className="bulk-audience">
  <div className="width-wrap">

    <h2 className="section-title outlined">
      <span className="pixel">►</span>
      <span>WHO IT’S FOR</span>
      <span className="pixel">◄</span>
    </h2>

    <div className="audience-grid">

      {/* ITEM */}
      <div className="audience-card">
        <div className="audience-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z"/>
          </svg>
        </div>
        <div>
          <h3>EVENTS & ACTIVATIONS</h3>
          <p>Keep guests engaged with exciting multiplayer gaming experiences.</p>
        </div>
      </div>

      {/* ITEM */}
      <div className="audience-card">
        <div className="audience-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="13"/>
            <path d="M3 7l9-4 9 4"/>
          </svg>
        </div>
        <div>
          <h3>CORPORATE / OFFICES</h3>
          <p>Perfect for team-building, employee engagement and recreation.</p>
        </div>
      </div>

      {/* ITEM */}
      <div className="audience-card">
        <div className="audience-icon">
          <svg viewBox="0 0 24 24">
            <path d="M3 10h18M6 10V6h12v4"/>
          </svg>
        </div>
        <div>
          <h3>GAMING CAFÉS</h3>
          <p>Scale your gaming space without large upfront investments.</p>
        </div>
      </div>

      {/* ITEM */}
      <div className="audience-card">
        <div className="audience-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2v2M12 18v4"/>
          </svg>
        </div>
        <div>
          <h3>POP-UPS / MALLS</h3>
          <p>Attract crowds and create unforgettable interactive experiences.</p>
        </div>
      </div>

    </div>

  </div>
</section>

{/* PACKAGES */}
<section className="bulk-packages">
  <div className="width-wrap">

    <div className="packages-header">
      <h2 className="section-title outlined">
        <span className="pixel">►</span>
        <span>OUR PACKAGES</span>
        <span className="pixel">◄</span>
      </h2>

      <span className="packages-badge">
        CUSTOM PACKAGES AVAILABLE
      </span>
    </div>

    <div className="packages-grid">

      {/* SHORT TERM */}
      <div className="package-card">

        <div className="package-left">
          <span className="tag">SHORT-TERM</span>

          <h3 className="pkg-title">
            <span className="num">3 – 7</span> DAYS
          </h3>

          <h4 className="pkg-price">
            AED <span className="num">350 – 500</span>
          </h4>

          <p className="per">PER PACKAGE</p>
        </div>

        <div className="package-divider"></div>

        <div className="package-right">
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><path d="M6 12h12M8 9v6M16 9v6"/></svg></span> <span className="num">15</span> Games</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><path d="M6 12h12M9 15l-2 3M15 15l2 3"/></svg></span> <span className="num">4</span> Controllers</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18"/></svg></span> <span className="num">2</span> Consoles</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12"/></svg></span> <span className="num">2</span> Monitors</p>
        </div>

        <div className="package-footer">
          Perfect for events, conventions and casual groups.
        </div>
      </div>

      {/* LONG TERM */}
      <div className="package-card highlight">

        <div className="package-left">
          <span className="tag">LONG-TERM</span>

          <h3 className="pkg-title">
            <span className="num">3</span> MONTHS
          </h3>

          <h4 className="pkg-price">
            AED <span className="num">1600 – 1800</span>
          </h4>

          <p className="per">PER PACKAGE</p>
        </div>

        <div className="package-divider"></div>

        <div className="package-right">
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><path d="M6 12h12M8 9v6M16 9v6"/></svg></span> <span className="num">30</span> Games</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><path d="M6 12h12M9 15l-2 3M15 15l2 3"/></svg></span> <span className="num">10</span> Controllers</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18"/></svg></span> <span className="num">3 – 5</span> Consoles</p>
          <p><span className="pkg-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12"/></svg></span> <span className="num">3 – 5</span> Monitors</p>
        </div>

        <div className="package-footer">
          Ideal for gaming cafés, hubs and commercial partners.
        </div>
      </div>

    </div>

  </div>
</section>

{/* WHY CHOOSE REPLAY */}
<section className="bulk-why">
  <div className="width-wrap">

    <h2 className="section-title outlined">
      <span className="pixel">►</span>
      <span>WHY CHOOSE RE:PLAY?</span>
      <span className="pixel">◄</span>
    </h2>

    <div className="why-card">

      {/* ITEM */}
      <div className="why-item">
        <div className="why-icon">
          <svg viewBox="0 0 24 24">
            <path d="M13 2L3 14h7v8l11-14h-7z"/>
          </svg>
        </div>
        <div>
          <h4>IMMEDIATE AVAILABILITY</h4>
          <p>Our owned inventory means we can fulfill your requirements instantly.</p>
        </div>
      </div>

      <div className="why-divider"></div>

      {/* ITEM */}
      <div className="why-item">
        <div className="why-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 21l-8-7 8-11 8 11-8 7z"/>
          </svg>
        </div>
        <div>
          <h4>RELIABLE & TRUSTED</h4>
          <p>High quality equipment, secure rentals and professional service.</p>
        </div>
      </div>

      <div className="why-divider"></div>

      {/* ITEM */}
      <div className="why-item">
        <div className="why-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8z"/>
          </svg>
        </div>
        <div>
          <h4>FLEXIBLE & SCALABLE</h4>
          <p>From small events to large setups — we scale with your needs.</p>
        </div>
      </div>

      <div className="why-divider"></div>

      {/* ITEM */}
      <div className="why-item">
        <div className="why-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1a5 5 0 00-5 5v3H5v10h14V9h-2V6a5 5 0 00-5-5z"/>
          </svg>
        </div>
        <div>
          <h4>SUPPORT YOU CAN COUNT ON</h4>
          <p>On-site assistance and support throughout your rental period.</p>
        </div>
      </div>

    </div>

  </div>
</section>

{/* CTA */}
<section className="bulk-cta">
  <div className="width-wrap">
    <div className="cta-card">

      <div className="cta-left">
        <h2>LET’S BUILD YOUR SETUP</h2>
        <p>
          Ready to level up your event or business? Get in touch with us today.
        </p>
      </div>

      <div className="cta-actions">
        <button className="btn primary"
        onClick={() => navigate("/contact")}>REQUEST A QUOTE</button>
        <button className="btn secondary"
        onClick={() => navigate("/contact")}>CONTACT US</button>
      </div>

    </div>
  </div>
</section>

    </main>
  );
};


export default BulkRentals;