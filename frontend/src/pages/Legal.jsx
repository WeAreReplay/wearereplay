import "../assets/css/legal.css";

export default function Legal({ type }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      desc: "Your privacy matters to us. This Privacy Policy explains how RE collects, uses, stores, and protects your information when you use our platform. By accessing or using RE, you agree to the practices described below.",
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
      desc: "Our platform is designed to provide users with a seamless and secure experience for engaging with our services. By accessing or using RE, you acknowledge that you have read, understood, and agree to comply with and be bound by the following Terms & Conditions.These terms outline your rights and responsibilities as a user, as well as the rules governing the use of our platform. Please read them carefully before proceeding.",
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
          <div>
            <h2>PLAY FAIR. STAY PROTECTED. KNOW THE RULES:</h2>
            <p>{page.desc}</p>
          </div>
          {page.sections.map((item, index) => (
            <div key={index}>
              <h2>
                <span className="legal-num">
                  {String(index + 1).padStart(2, "0")}.
                </span>{" "}
                {item.h2}
              </h2>
              {item.p && <p>{item.p}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
