import { Link } from "react-router-dom";
import { IoDocumentText } from "react-icons/io5";
import { MdPolicy } from "react-icons/md";
import { FaCopyright } from "react-icons/fa";
import FooterTitle from "../components/SVGs/FooterTitle";
import FooterLogo from "../components/SVGs/FooterLogo";

export default function Footer() {
  const infoList = [
    {
      icon: IoDocumentText,
      label: "Terms and Conditions",
      path: "/terms-and-conditions",
    },
    {
      icon: MdPolicy,
      label: "Privacy Policy",
      path: "/privacy-policy",
    },
  ];

  const navList = [
    { txt: "Catalogue", path: "/catalogue" },
    { txt: "Support", path: "/support" },
    { txt: "About", path: "/about" },
    { txt: "Contact", path: "/contact" },
  ];

  const contactList = [
    {
      label: "Email",
      txt: "we.are.replay.cc@gmail.com",
      path: "mailto:we.are.replay.cc@gmail.com",
    },
    { label: "Phone", txt: "+123567890", path: "tel:+123567890" },
  ];

  return (
    <footer>
      <div className="width-wrap">
        <FooterLogo />
        <div className="top">
          <nav className="foot-ctr">
            <ul className="nav-items">
              {
                // ? Map through the navList to create navigation links with icons and hover effects
              }
              {navList.map((nav, i) => (
                <li key={i}>
                  <Link to={nav.path} className="nav-link">
                    <span className="nav-txt">{nav.txt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="contact-items foot-ctr">
            {
              // ? Map through the contactList to create contact links with icons and hover effects
            }
            {contactList.map((nav, i) => (
              <li key={i}>
                <span className="contact-label">{nav.label}</span>
                <a href={nav.path} className="contact-link">
                  <span className="contact-txt">{nav.txt}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <FooterTitle />
        <div className="bottom">
          <ul className="info-items">
            {infoList.map((info, i) => {
              return (
                <li key={i} className="info-item">
                  <Link to={info.path} className="info-link">
                    <info.icon className="icon" />
                    <span>{info.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="copyright">
            <FaCopyright className="icon" />
            <span>2026 Re:Play. All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
