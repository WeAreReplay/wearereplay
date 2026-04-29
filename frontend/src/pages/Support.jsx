import React, { useState, useRef } from "react";
import "../assets/css/support.css";

const faqData = [
  {
    category: "GENERAL",
    items: [
      {
        q: "What is RE:PLAY?",
        a: "RE:PLAY is a peer-to-peer platform that allows users to borrow and lend physical video games. Instead of buying new games, you can access a shared library from other users in your area."
      },
      {
        q: "Who owns the games in RE:PLAY?",
        a: "All games listed on RE:PLAY are owned by individual users. The platform simply connects borrowers and lenders while providing protection and transaction support."
      }
    ]
  },
  {
    category: "BORROWING",
    items: [
      {
        q: "How do I borrow a game?",
        a: "Browse the catalogue, choose a game you want, and send a borrow request. Once the lender accepts, you can proceed with payment and arrange the exchange."
      },
      {
        q: "Do I need to pay anything upfront?",
        a: "Yes, you’ll typically pay a small borrowing fee along with a refundable deposit. The deposit ensures the safety of the lender’s game."
      },
      {
        q: "Will I get my deposit back?",
        a: "Yes. As long as the game is returned in the same condition and on time, your deposit will be fully refunded after the lender confirms the return."
      },
      {
        q: "What happens if I return a game late?",
        a: "Late returns may result in additional charges depending on the lender’s terms. Repeated late returns can also affect your account standing."
      }
    ]
  },
  {
    category: "LENDING",
    items: [
      {
        q: "How do I list my games?",
        a: "You can list your games from your dashboard by creating a new listing. Simply add game details, set your price, deposit, and availability."
      },
      {
        q: "Can I set my own borrowing duration?",
        a: "Yes. As a lender, you have full control over how long your games can be borrowed, along with pricing and conditions."
      },
      {
        q: "Do I earn money from lending?",
        a: "Yes. Every successful borrow transaction earns you money based on the price you set. The more active your listings, the more you can earn."
      }
    ]
  },
  {
    category: "SAFETY & PAYMENTS",
    items: [
      {
        q: "Why is there a deposit?",
        a: "The deposit acts as protection for lenders. It ensures that if a game is lost, damaged, or not returned, the lender is compensated."
      },
      {
        q: "What is the 6 AED Protection fee for?",
        a: "The protection fee helps cover platform services such as secure transactions, dispute handling, and maintaining a safe borrowing environment."
      },
      {
        q: "What if a game gets damaged or lost?",
        a: "If a game is returned damaged or not returned at all, the deposit may be used to compensate the lender. Additional actions may be taken depending on the situation."
      },
      {
        q: "Does RE:PLAY handle disputes?",
        a: "Yes. RE:PLAY provides dispute support to ensure fair outcomes for both borrowers and lenders in case of issues."
      }
    ]
  },
  {
    category: "TRUST & ACCOUNTS",
    items: [
      {
        q: "How do I know if a user is trustworthy?",
        a: "You can check a user’s ratings, reviews, and transaction history before interacting with them. This helps you make informed decisions."
      },
      {
        q: "Can my account be suspended?",
        a: "Yes. Accounts may be suspended for violations such as misuse of the platform, repeated late returns, or fraudulent behavior."
      }
    ]
  },
  {
    category: "OTHER",
    items: [
      {
        q: "Can I cancel a borrow request?",
        a: "Yes. You can cancel a request before it is accepted by the lender. Once accepted, cancellation may depend on the lender’s policy."
      },
      {
        q: "Is RE:PLAY available everywhere?",
        a: "Currently, RE:PLAY is available in select regions. Availability may expand as the platform grows."
      }
    ]
  }
];

const Support = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const refs = useRef([]);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  let counter = 0;

  return (
    <div className="support">
      <div className="support__container">

        {/* LEFT */}
        <div className="support__left">
          <h1 className="support__title">FREQUENTLY ASKED QUESTIONS!</h1>

          <div className="support__intro">
            <p>Got questions? We’ve got answers. Here are the most common things users ask about RE:PLAY.</p>
            <p>For further inquiries or need additional support, feel free to reach out to us through our contact channels. Our team is always ready to help and ensure you have the best experience on RE.</p>
          </div>

          <button
            className="support__cta"
            onClick={() => window.location.href = "/contact"}
          >
            INQUIRE HERE
          </button>
        </div>

        {/* RIGHT */}
        <div className="support__right">
          {faqData.map((section, i) => (
            <div key={i} className="support__section">
              <h2>{section.category}</h2>

              {section.items.map((item, j) => {
                const index = counter++;

                return (
                  <div key={index} className="support__item">
                    <div
                      className="support__question"
                      onClick={() => toggle(index)}
                    >
                      <span>{item.q}</span>
                      <span className={`plus ${activeIndex === index ? "open" : ""}`}>
                        +
                      </span>
                    </div>

                    <div
                      ref={(el) => (refs.current[index] = el)}
                      className={`support__answer-wrapper ${
                        activeIndex === index ? "open" : ""
                      }`}
                      style={{
                        maxHeight:
                          activeIndex === index
                            ? refs.current[index]?.scrollHeight + "px"
                            : "0px",
                      }}
                    >
                      <div className="support__answer">
                        {item.a}
                      </div>
                    </div>

                    <div className="support__divider"></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Support;