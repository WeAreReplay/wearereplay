import { useState } from "react";
import { Link } from "react-router-dom";
import { RiLogoutCircleLine, RiHome7Fill } from "react-icons/ri";
import { AiFillSmile, AiOutlineCaretRight } from "react-icons/ai";

import { MdGamepad } from "react-icons/md";
import Overlay from "../components/Overlay";

/*
  ! DashboardHeader
  --------------------------------------------------
  ? Reusable dashboard top header component
  ? Handles user submenu, navigation tabs, and menu toggle

  * Props:
  * - activeTab (string): currently selected tab key
  * - setActiveTab (function): updates active tab state
  * - onLogout (function): logs user out
  * - userName (string): displayed username
  * - tabs (array): dynamic tab configuration
*/

export default function DashboardHeader({
  activeTab,
  setActiveTab,
  onLogout,
  userName = "User",
  tabs = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  return (
    <>
      {/* OVERLAY */}
      <Overlay
        isModalOpen={menuOpen || submenuOpen}
        onClick={() => {
          setMenuOpen(false);
          setSubmenuOpen(false);
        }}
      />

      <header className="dashboard-header">
        <div className="width-wrap">
          <nav>
            <ul className="nav-items">
              <li>
                <button
                  className="submenu-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    setSubmenuOpen((prev) => !prev);
                  }}
                >
                  <AiFillSmile className="icon" />
                  <span>Welcome, {userName}</span>
                </button>

                <ul className={`submenu ${submenuOpen ? "open" : ""}`}>
                  <li>
                    <Link
                      to="/"
                      className="user-link"
                      onClick={() => setSubmenuOpen(false)}
                    >
                      <RiHome7Fill className="icon" />
                      <span>Home</span>
                    </Link>
                  </li>

                  <li>
                    <button
                      className="logout-btn"
                      onClick={() => {
                        onLogout();
                        setSubmenuOpen(false);
                      }}
                    >
                      <RiLogoutCircleLine className="icon" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </li>
              <li>
                <button
                  className="submenu-btn"
                  onClick={() => {
                    setSubmenuOpen(false);
                    setMenuOpen((prev) => !prev);
                  }}
                >
                  <MdGamepad className="icon" />
                  <span>{menuOpen ? "Close" : "Menu"}</span>
                </button>
                <ul className={`submenu ${menuOpen ? "open" : ""}`}>
                  {tabs.map((tab) => (
                    <li key={tab.key}>
                      <button
                        type="button"
                        className={activeTab === tab.key ? "tab active" : "tab"}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setMenuOpen(false);
                        }}
                      >
                        <div className="left">
                          {tab.icon && <tab.icon className="icon" />}
                          <span>{tab.label}</span>
                        </div>
                        <AiOutlineCaretRight />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
