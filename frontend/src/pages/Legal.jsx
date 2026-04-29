import "../assets/css/legal.css";

export default function Legal({ type }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      intro:
        "Your privacy matters to us. This Privacy Policy explains how RE collects, uses, stores, and protects your information when you use our platform.",

      sections: [
        {
          h2: "Information We Collect",
          intro: "We may collect the following:",
          groups: [
            {
              sub: "A. Personal Information",
              items: [
                "Name, email address, and contact details",
                "Account credentials (username, password)",
              ],
            },
            {
              sub: "B. Transaction Information",
              items: [
                "Borrowing and lending activity",
                "Payment and deposit records",
              ],
            },
            {
              sub: "C. Usage Data",
              items: [
                "Device information (browser, IP address, device type)",
                "Platform activity (pages visited, features used)",
              ],
            },
          ],
        },
        {
          h2: "How We Use Your Information",
          intro: "We use your information to:",
          groups: [
            {
              items: [
                "Create and manage your account",
                "Facilitate borrowing and lending transactions",
                "Process payments, deposits, and protection fees",
                "Improve platform functionality and user experience",
                "Communicate updates, support responses, and important notices",
                "Ensure safety, prevent fraud, and enforce our Terms & Conditions",
              ],
            },
          ],
        },
        {
          h2: "Sharing of Information",
          intro:
            "We do not sell your personal data. However, we may share information with:",
          groups: [
            {
              items: [
                "Other Users: Limited details (e.g., username, ratings) for transaction transparency",
                "Service Providers: Payment processors or technical partners that help operate the platform",
                "Legal Authorities: When required by law or to protect rights, safety, and platform integrity",
              ],
            },
          ],
        },
        {
          h2: "Data Security",
          intro:
            "We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or misuse. However, no system is completely secure, and users may share information at their own risk.",
          groups: [
          ],
        },
        {
          h2: "Data Retention",
          intro:
            "We retain your information only as long as necessary to:",
          groups: [
            {
              items: [
                "Provide our services",
                "Comply with legal obligations",
                "Resolve disputes and enforce agreements",
              ],
            },
          ],
        },
        {
          h2: "Damage, Loss & Liability",
          groups: [
            {
              items: [
                "Borrowers are responsible for any damage or loss incurred during the borrowing period.",
                "In case of disputes, RE:PLAY may review evidence from both parties and make a final decision.",
                "RE:PLAY is not liable for indirect damages or disputes beyond reasonable control but will assist in resolution when possible.",
              ],
            },
          ],
        },
        {
          h2: "Third Party Links",
          intro:
            "Our platform may contain links to third-party services. RE:PLAY is not responsible for the privacy practices or content of these external sites.",
          groups: [
          ],
        },
        {
          h2: "Changes to these Policies",
          intro:
            "We may update this Privacy Policy from time to time. Continued use of RE:PLAY after any changes indicates your acceptance of the revised policy.",
          groups: [
          ],
        },
        {
          h2: "Contacts & Support",
          intro:
            "If you have questions or concerns about this Privacy Policy, you may contact RE:PLAY support through the platform.",
          groups: [
          ],
        },
      ],
    },

    terms: {
      title: "Terms & Conditions",
      intro:
        "Our platform is designed to provide users with a seamless and secure experience for engaging with our services.",

      sections: [
        {
          h2: "Overview of Service",
          groups: [
            {
              items: [
                "RE:PLAY is a peer-to-peer platform that allows users to lend and borrow physical video games.",
                "Games listed on the platform are owned by individual users, and availability may vary.",
              ],
            },
          ],
        },
        {
          h2: "User Responsibilities",
          intro: "By using RE:PLAY, you agree to:",
          groups: [
            {
              items: [
                "Provide accurate and complete account information.",
                "Treat borrowed items with care and return them on time.",
                "Respect other users and engage in fair transactions.",
              ],
            },
          ],
        },
        {
          h2: "Borrowing Policy",
          groups: [
            {
              items: [
                "Users may borrow games for a specified period set by the lender.",
                "A refundable deposit may be required before borrowing.",
                "Late returns may result in penalties or additional fees.",
              ],
            },
          ],
        },
        {
          h2: "Lending Policy",
          groups: [
            {
              items: [
                "Lenders must ensure that listed games are in good, playable condition.",
                "Accurate descriptions and images of the game must be provided",
                "Lenders have the right to set availability and borrowing duration.",
              ],
            },
          ],
        },
        {
          h2: "Deposits & Payment",
          groups: [
            {
              items: [
                "Deposits are held as security and will be refunded once the game is returned in its original condition and within the agreed period.",
                "If a game is returned damaged, lost, or not returned at all, the deposit may be partially or fully forfeited.",
                "Lenders have the right to set availability and borrowing duration.",
              ],
            },
          ],
        },
        {
          h2: "Damages, Loss, & Liability",
          groups: [
            {
              items: [
                "Borrowers are responsible for any damage or loss incurred during the borrowing period.",
                "In case of disputes, RE may review evidence from both parties and make a final decision.",
                "RE:PLAY is not liable for indirect damages or disputes beyond reasonable control but will assist in resolution when possible.",
              ],
            },
          ],
        },
        {
          h2: "Trust & Rating System",
          groups: [
            {
              items: [
                "Users may rate each other based on their transaction experience.",
                "Abuse of the rating system (e.g., false reviews, manipulation) may result in penalties.",
              ],
            },
          ],
        },
        {
          h2: "Prohibited Activities",
          intro: "Users agree not to:",
          groups: [
            {
              items: [
                "List counterfeit or non-functional games.",
                "Engage in fraudulent transactions.",
                "Abuse deposits or exploit platform policies.",
                "Harass or harm other users.",
              ],
            },
          ],
        },
        {
          h2: "Acount Suspention & Termination",
          intro:
            "RE:PLAY reserves the right to suspend or terminate accounts that violate these terms, including repeated late returns, fraudulent activity, or abuse of the platform.",
          groups: [
          ],
        },
        {
          h2: "Modifications to Terms",
          intro:
            "RE:PLAY may update these Terms & Conditions at any time. Continued use of the platform after changes are made constitutes acceptance of the revised terms.",
          groups: [
          ],
        },
        {
          h2: "Contact & Support",
          intro:
            "For questions, disputes, or concerns, users may contact RE:PLAY support through the platform’s official channels.",
          groups: [
          ],
        },
      ],
    },
  };

  const page = content[type] || content.terms;

  return (
    <main className="legal">
      <section className="legal__hero">
        <h1>{page.title}</h1>
      </section>

      <section className="legal__container">
        <div className="legal__left">

          <div className="legal__status">
            <p><em>Effective Date: 4/30/2026</em></p>
            <p>Our Terms & Condition has been updated.</p>
          </div>

          <div className="legal__spacer-40"></div>

          <h2 className="legal__headline">
            PLAY FAIR. STAY PROTECTED. KNOW THE RULES:
          </h2>

          <div className="legal__intro">
            <p>Welcome to RE:PLAY.</p>
            <p>{page.intro}</p>
            <p>
              These terms outline your rights and responsibilities as a user,
              as well as the rules governing the use of our platform. Please
              read them carefully before proceeding.
            </p>
          </div>

          <div className="legal__divider"></div>
          <div className="legal__spacer-40"></div>

          {page.sections.map((section, index) => (
            <section key={index} id={`section-${index}`} className="legal__section">
              <h3>{section.h2}</h3>

              {section.intro && <p>{section.intro}</p>}

              {section.groups.map((group, i) => (
                <div key={i} className="legal__group">
                  {group.sub && (
                    <p className="legal__subheading">{group.sub}</p>
                  )}

                  <ul>
                    {group.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="legal__divider"></div>
            </section>
          ))}
          <p className="legal__ending">
                By using RE:PLAY, you acknowledge that you have read, understood, and agreed to our Privacy Policy and Terms and Conditions.
              </p>
        </div>

        <aside className="legal__toc">
          <div className="toc-box">
            <h4>Table of Contents:</h4>
            <ul>
              {page.sections.map((item, index) => (
                <li key={index}>
                  <a href={`#section-${index}`}>
                    {index + 1}. {item.h2}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}