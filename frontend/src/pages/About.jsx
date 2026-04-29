import "../assets/css/about.css";

import { GiGameConsole, GiExtraTime } from "react-icons/gi";
import { FaPeopleGroup } from "react-icons/fa6";
import { AiOutlineInbox } from "react-icons/ai";
import {
  AiOutlineDollar,
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineStar,
} from "react-icons/ai";
import { FiFeather } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function About() {
  return (
    <main className="about-main">
      <Hero />
      <HowItWorks />
      <WhyChoose />
      <Trust />
      <CTA />
    </main>
  );
}

/* ================= HERO ================= */

const Hero = () => {
  return (
    <section className="about-hero">
      <div className="width-wrap">
        <div className="hero-content">
          <h1 className="hero-title">ABOUT RE:PLAY</h1>

          <h2 className="hero-subtitle">
            GAME SMARTER. SHARE MORE. SPEND LESS.
          </h2>

          <p className="hero-desc">
            Re:Play is a community-driven platform that brings gamers together
            to borrow and lend video games. We believe great games should be
            experienced, not just purchased.
          </p>
        </div>
      </div>

      <div className="hero-bg-shape"></div>
    </section>
  );
};

/* ================= HOW ================= */

const HowItWorks = () => {
  const data = [
    {
      title: "BROWSE",
      description:
        "Explore our catalogue of games listed by real players.",
      icon: GiGameConsole,
    },
    {
      title: "BORROW",
      description:
        "Request a game and borrow it for the duration that suits you.",
      icon: GiExtraTime,
    },
    {
      title: "PLAY",
      description:
        "Enjoy the game and make the most of your time.",
      icon: FaPeopleGroup,
    },
    {
      title: "RETURN",
      description:
        "Return the game on time so others can enjoy it too.",
      icon: AiOutlineInbox,
    },
  ];

  return (
    <section className="how-about">
      <div className="width-wrap how-wrap">
        <h2 className="section-title outlined">
          <span className="pixel">►</span>
          <span>HOW RE:PLAY WORKS</span>
          <span className="pixel">◄</span>
        </h2>

        <div className="how-grid">
          {data.map((item, i) => (
            <article className="card" key={i}>
              <item.icon className="icon" />
              <h3 className="card-title">
                {item.title}
              </h3>
              <p className="card-desc">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= WHY ================= */

const WhyChoose = () => {
  const data = [
    {
      title: "AFFORDABLE",
      description:
        "Save money by borrowing games instead of buying them. Play more for less.",
      icon: AiOutlineDollar,
    },
    {
      title: "FLEXIBLE",
      description:
        "Choose how long you want to borrow and play at your own pace.",
      icon: AiOutlineCalendar,
    },
    {
      title: "COMMUNITY DRIVEN",
      description:
        "Connect with trusted gamers in a respectful and supportive community.",
      icon: AiOutlineTeam,
    },
    {
      title: "SUSTAINABLE",
      description:
        "Reduce waste and give games more life by sharing what we love.",
      icon: FiFeather,
    },
  ];

  return (
    <section className="why-about">
      <div className="width-wrap how-wrap">
        <h2 className="section-title outlined">
          <span className="pixel">►</span>
          <span>WHY CHOOSE RE:PLAY?</span>
          <span className="pixel">◄</span>
        </h2>

        <div className="how-grid">
          {data.map((item, i) => (
            <article className="card" key={i}>
              <item.icon className="icon" />
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= TRUST ================= */

const Trust = () => {
  return (
    <section className="trust-about">
      <div className="width-wrap how-wrap">
        <div className="trust-card">
          <div className="trust-left">
            <div className="trust-icon"></div>

            <div className="trust-content">
              <h3 className="trust-title">BUILT ON TRUST</h3>
              <p className="trust-desc">
                Your safety and satisfaction matter to us. Re:Play provides
                verified users, secure payments, protection fees, and a rating
                system to ensure a smooth and trustworthy experience for
                everyone.
              </p>
            </div>
          </div>

          <div className="trust-divider"></div>

          <div className="trust-right">
            <div className="trust-item">
              <AiOutlineUser />
              <span>Verified Users</span>
            </div>

            <div className="trust-item">
              <AiOutlineLock />
              <span>Secure Transactions</span>
            </div>

            <div className="trust-item">
              <AiOutlineStar />
              <span>Ratings & Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================= CTA ================= */

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-about">
      <div className="width-wrap how-wrap">
        <div className="cta-card">
          <div className="cta-left">
            <h3>READY TO START PLAYING SMARTER?</h3>
            <p>
              Join the Re:Play community today and discover a better way to
              experience games.
            </p>
          </div>

          <div className="cta-actions">
            <button
              className="btn secondary"
              onClick={() => navigate("/catalogue")}
            >
              BROWSE GAMES ►
            </button>

            <button
              className="btn primary"
              onClick={() => navigate("/register")}
            >
              JOIN RE:PLAY ►
            </button>
          </div>

          <div className="cta-heart"></div>
        </div>
      </div>
    </section>
  );
};