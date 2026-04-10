import "../assets/css/legal.css";

export default function Legal({ type }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          h2: "Introduction",
          p: "At Re:Play, we value your privacy and are committed to protecting your personal information.",
        },
        {
          h2: "Data Collection",
          p: "We collect basic information such as name, email address, and platform activity.",
        },
        {
          h2: "Data Usage",
          p: "We use your data to improve services, manage accounts, and support platform communication.",
        },
        {
          h2: "Data Security",
          p: "We implement reasonable security measures to protect your data, but no system is fully secure.",
        },
      ],
    },

    terms: {
      title: "Terms & Conditions",
      sections: [
        {
          h2: "Acceptance of Terms",
          p: "By using Re:Play, you agree to these terms and conditions.",
        },
        {
          h2: "User Responsibilities",
          p: "Users must provide accurate information and follow platform rules.",
        },
        {
          h2: "Liability",
          p: "Users engage in borrowing/lending at their own risk.",
        },
        {
          h2: "Changes to Terms",
          p: "We may update these terms at any time. Continued use means acceptance.",
        },
      ],
    },
  };

  const page = content[type] || content.terms;

  return (
    <main className="legal-main">
      <section className="secondary-hero legal-hero">
        <h1>
          <span className="pixel">►</span>
          <span>{page.title}</span>
          <span className="pixel">◄</span>
        </h1>
      </section>

      <section className="legal-content">
        <div className="width-wrap">
          {page.sections.map((item, index) => (
            <div key={index}>
              <h2>
                <span className="legal-num">
                  {String(index + 1).padStart(2, "0")}.
                </span>{" "}
                {item.h2}
              </h2>
              <p>{item.p}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
