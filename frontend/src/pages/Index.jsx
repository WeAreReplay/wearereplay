import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/css/index.css";
import HeroVid from "../assets/videos/hero-bg.webp";
import HeroTitle from "../components/SVGs/HeroTitle";
import BenefitIcon1 from "../components/SVGs/BenefitIcon1";
import BenefitIcon2 from "../components/SVGs/BenefitIcon2";
import BenefitIcon3 from "../components/SVGs/BenefitIcon3";
import { FaPeopleGroup } from "react-icons/fa6";
import { GiGameConsole, GiExtraTime } from "react-icons/gi";
import {
  AiFillCrown,
  AiFillSmile,
  AiFillAppstore,
  AiFillGift,
  AiFillSafetyCertificate,
  AiFillCustomerService,
} from "react-icons/ai";
import ItemSlider from "../components/ItemSlider";
import { useAuth } from "../contexts/AuthContext";
import GameSlider from "../components/GameSlider";

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="home-main">
      <Hero isAuthenticated={isAuthenticated} user={user} />
      <HowItWorks />
      <Benefits />
      <GameSlider
        title="New Releases"
        link={
          <Link to="/catalogue" className="more-link right">
            <span>View More</span>
            <span className="pixel">►</span>
          </Link>
        }
      />
      <Subscription />
      <Testimonials />
    </main>
  );
}

const Hero = ({ isAuthenticated, user }) => {
  return (
    <section className="hero">
      {
        // * Hero Background
      }
      <img
        src={HeroVid}
        alt="A montage of games"
        className="hero-bg"
        loading="eager"
        decoding="async"
      />
      {
        // ! TV Effect Overlay
      }
      <div className="tv-effect"></div>
      <div className="width-wrap">
        {
          // * Hero Title
        }
        <h1 className="hero-title">
          {isAuthenticated() ? (
            <>
              <span>Welcome Back, </span>
              <span>{user?.firstName || "Player"}!</span>
            </>
          ) : (
            <HeroTitle />
          )}
        </h1>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const howItWorksData = [
    {
      description:
        "Browse  games and choose what you want to play from the library.",
      icon: GiGameConsole,
    },
    {
      description: "Borrow games for a set duration based on your preference.",
      icon: GiExtraTime,
    },
    {
      description:
        "Connect with real players by lending and borrowing games within the community.",
      icon: FaPeopleGroup,
    },
  ];

  return (
    <section className="howitworks">
      <div className="width-wrap">
        <h2 className="title">
          <span className="pixel">►</span>
          <span>How Re:Play Works</span>
          <span className="pixel">◄</span>
        </h2>
        <div className="howitworks-ctr">
          {howItWorksData.map((works, i) => (
            <article className="card" key={i}>
              <works.icon className="icon" />
              <p className="desc">{works.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefitsData = [
    {
      title: "Affordable",
      description:
        "Save money by accessing premium story-driven games without buying them outright.",
      icon: <BenefitIcon1 />,
    },
    {
      title: "Flexible",
      description:
        "Enjoy flexible access that fits your schedule, borrow for a few days or longer and play at your own pace without pressure.",
      icon: <BenefitIcon2 />,
    },
    {
      title: "Sustainable",
      description:
        "Be part of a shared gaming community where every game gets more value through reuse.",
      icon: <BenefitIcon3 />,
    },
  ];

  return (
    <section className="benefits">
      <div className="width-wrap">
        <h2 className="title">
          <span className="pixel">►</span> Why Use Re:Play?
        </h2>
        <div className="benefits-ctr">
          {benefitsData.map((benefit, i) => (
            <article className="card" key={i}>
              {benefit.icon}
              <div className="info">
                <h3 className="name">{benefit.title}</h3>
                <p className="desc">{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const Subscription = () => {
  const subscriptionPlans = [
    {
      type: "regular",
      title: "Regular Player",
      badge: AiFillSmile,
      button: "Start Free",
      price: 0,
      description:
        "Casual gamers who want flexible access to a few games at a time.",
      variant: "secondary",
      sections: [
        {
          heading: "Listings & Visibility",
          icon: AiFillAppstore,
          items: [
            "Limited Game Listings (max 6)",
            "Standard visibility in search results",
          ],
        },
        {
          heading: "Borrowing Access",
          icon: AiFillGift,
          items: [
            "Basic Borrowing Capacity (max 3)",
            "Standard Protection Fees",
            "Standard return deadline with a 2-day grace period",
          ],
        },
        {
          heading: "Protection & Security",
          icon: AiFillSafetyCertificate,
          items: ["Security Deposit required", "Basic protection policies"],
        },
        {
          heading: "Support & Trust",
          icon: AiFillCustomerService,
          items: [
            "Standard support for inquiries",
            "Basic user profile (no badge)",
          ],
        },
      ],
    },
    {
      type: "premium",
      title: "Premium Member",
      badge: AiFillCrown,
      price: 25.99,
      description:
        "Dedicated gamers who want faster access, better perks, and maximum borrowing flexibility.",
      button: "Upgrade to Premium",
      variant: "primary",
      sections: [
        {
          heading: "Listings & Visibility",
          icon: AiFillAppstore,
          items: [
            "Unlimited Game Listings",
            "Featured Listings for increased visibility",
          ],
        },
        {
          heading: "Borrowing Benefits",
          icon: AiFillGift,
          items: [
            "Expanded Borrowing Capacity (up to 10 active borrows)",
            "50% off flat on Protections Fees",
            "Extended Return Grace Period (4 days)",
          ],
        },
        {
          heading: "Protection & Security",
          icon: AiFillSafetyCertificate,
          items: ["Damage Protection Coverage (50% compensation + Security Deposit)"],
        },
        {
          heading: "Support & Trust",
          icon: AiFillCustomerService,
          items: [
            "Priority Support for faster dispute resolution",
            "Premium Badge displayed on your profile and Discord",
          ],
        },
      ],
    },
  ];

  return (
    <section className="subscription">
      <div className="width-wrap">
        <h2 className="title">
          <span className="pixel">►</span>
          <span>Choose your Play Style</span>
          <span className="pixel">◄</span>
        </h2>

        <p className="subtitle">
          Choose a plan that fits your playstyle. Whether you’re a casual gamer
          or a dedicated player, Re:Play gives you flexible access to games
          without the cost of owning them.
        </p>

        <div className="subscription-ctr">
          {subscriptionPlans.map((plan, i) => (
            <article key={i} className={`card ${plan.type}`}>
              <div className="card-head">
                {<plan.badge className="icon" />}
                <h3 className="name">{plan.title}</h3>
              </div>
              <p className="description">{plan.description}</p>

              <div className="price-head">
                <h4>
                  <span>AED</span>
                  <span>{plan.price}</span>
                </h4>
                <p> /month</p>
              </div>

              <ul className="info-ctr">
                {plan.sections.map((section, idx) => (
                  <li className="info" key={idx}>
                    <div className="sub-head">
                      <section.icon className="icon" />
                      <h5>{section.heading}</h5>
                    </div>

                    <ul className="details">
                      {section.items.map((item, i) => (
                        <li className="desc" key={i}>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {/* <button className={`btn ${plan.variant}`}>{plan.button}</button> */}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

import indianaJones from "../assets/images/indiana-jones.webp";

const Testimonials = () => {
  const testimonialsData = [
    {
      name: "Alex R.",
      subject: "Loved the fast game rotation",
      description:
        "Re:Play completely changed how I experience games. I finish something in a few days and instantly jump into the next one without spending extra.",
    },
    {
      name: "Sara M.",
      subject: "Perfect for story lovers",
      description:
        "As someone who enjoys story-driven games, this is amazing. I can try different titles without worrying if they’re worth buying.",
    },
    {
      name: "Daniel K.",
      subject: "Hidden gems everywhere",
      description:
        "I’ve discovered so many underrated indie games through Re:Play. It’s like having a curated library instead of guessing what to buy.",
    },
    {
      name: "Liam T.",
      subject: "Saves me money every month",
      description:
        "I used to spend a lot on games I never finished. Now I just borrow, play, and return—it’s way more efficient.",
    },
    {
      name: "Nina P.",
      subject: "Super convenient system",
      description:
        "The whole borrowing process is smooth and easy. No downloads cluttering my device, just pick and play.",
    },
    {
      name: "Omar H.",
      subject: "Great for casual gamers",
      description:
        "I don’t play every day, so buying games felt wasteful. This lets me enjoy gaming at my own pace without pressure.",
    },
  ];

  return (
    <ItemSlider
      title="Voices of Re:Players"
      draggable={true}
      sliderClass="testimonials"
    >
      {testimonialsData.map((item, index) => (
        <div className="card-wrap" key={index}>
          <div className="test-card">
            <div className="top">
              <div className="test-head">
                <img src={indianaJones} />
                <h3 className="name">{item.name}</h3>
              </div>
              <h4 className="subject">{item.subject}</h4>
            </div>
            <p className="description">{item.description}</p>
          </div>
        </div>
      ))}
    </ItemSlider>
  );
};
