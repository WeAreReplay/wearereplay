import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AiFillSmile, AiOutlineCaretRight } from "react-icons/ai";
import { RiQuestionFill, RiInformationFill, RiStoreFill } from "react-icons/ri";
import { BiLogoFacebookSquare, BiLogoInstagramAlt } from "react-icons/bi";
import { MdGamepad } from "react-icons/md";
import Overlay from "../components/Overlay";
import Logo from "../components/SVGs/Logo";

// TODO: Update the link to direct the user to the dashboard, replace text or profile with user's,

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navList = [
    { txt: "Games", path: "/games", icon: RiStoreFill },
    { txt: "Support", path: "/support", icon: RiQuestionFill },
    { txt: "About", path: "/about", icon: RiInformationFill },
  ];

  const socialList = [
    {
      path: "https://www.instagram.com/weare.replay",
      icon: BiLogoInstagramAlt,
    },
    {
      path: "https://www.facebook.com/people/We-Are-Replay/61586375025531",
      icon: BiLogoFacebookSquare,
    },
  ];

  const getLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <>
      {
        // * Checks if either the menu is open to determine if the overlay should be displayed
      }
      <Overlay
        isModalOpen={menuOpen}
        onClick={() => {
          setMenuOpen(false);
        }}
      />

      <header>
        <div className="width-wrap">
          <nav>
            {
              // ! Options
            }
            <ul className="opt-items">
              <li>
                <Link to="/" className="logo">
                  <Logo />
                </Link>
              </li>

              <li>
                {
                  // * Login Link
                }
                <Link to="/login" className="login-link">
                  <AiFillSmile className="icon" />
                  <span>Login</span>
                </Link>
              </li>

              <li>
                {
                  // * Menu Button And Icon with Rotation Animation
                }
                <button
                  className="menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <MdGamepad
                    className="icon"
                    style={{
                      transform: menuOpen ? "rotateZ(315deg)" : "rotateZ(0deg)",
                    }}
                  />
                  {
                    // ? Changes the button text based on whether the menu is open or closed
                  }
                  <span>{menuOpen ? "Close" : "Menu"}</span>
                </button>
              </li>
            </ul>
            {
              // ? Checks if the menu is open to determine whether to display the navigation and social links
            }
            {menuOpen && (
              <>
                {
                  // ! Navigation Links
                }
                <ul className="nav-items">
                  {
                    // ? Map through the navList to create navigation links with icons and hover effects
                  }
                  {navList.map((nav, i) => (
                    <li key={i}>
                      <NavLink
                        to={nav.path}
                        className={getLinkClass}
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="link-left">
                          {
                            // * Navigation Icon and Text
                          }
                          <nav.icon className="icon" />
                          <span className="nav-txt">{nav.txt}</span>
                        </div>
                        {
                          // * Hover Icon
                        }
                        <span>
                          <AiOutlineCaretRight className="icon" />
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
                {
                  // ! Social Links
                }
                <ul className="social-items">
                  {
                    // ? Map through the socialList to create social media links with icons
                  }
                  {socialList.map((social, i) => (
                    <li key={i}>
                      <a
                        href={social.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        <social.icon className="icon" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
