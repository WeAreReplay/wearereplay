import { useState, useEffect } from "react";
import "../assets/css/dashboard.css";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaEye, FaList } from "react-icons/fa";
import { MdReport } from "react-icons/md";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";
import AdminReview from "../components/AdminReview";
import Overlay from "../components/Overlay";
import Toast from "../components/Toast";
import GetPlatformIcon from "../components/GetPlatformIcon";

// TODO: Replace approval listings and reported users data and connect to backend API (reported users, approval listings)

// ! ---------------- HELPERS ----------------

const ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  VIEW: "view",
};

const CONFIRM_CONFIG = {
  [ACTIONS.APPROVE]: {
    title: "Approve Listing",
    message: "Are you sure you want to approve this listing?",
    confirmText: "Approve",
  },
  [ACTIONS.REJECT]: {
    title: "Reject Listing",
    message: "Are you sure you want to reject this listing?",
    confirmText: "Reject",
  },
};

const getValue = (obj, path) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

// ! ---------------- COLUMNS CONFIG ----------------

const COLS = {
  text: (label, key) => ({ label, key }),
  image: { label: "Image", key: "image", isImage: true },
  platform: { label: "Platform", key: "platform", isIcon: true },
  actions: { label: "Actions", key: "actions", isActions: true },
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({
    type: null,
    data: null,
  });
  const [activeTab, setActiveTab] = useState("approvals");

  const isAnyModalOpen = modal.type !== null;

  const tabs = [
    { key: "approvals", icon: FaList, label: "Listing Approvals" },
    { key: "reports", icon: MdReport, label: "User Reports" },
  ];

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ! ---------------- LISTING HANDLERS ----------------

  const handleViewListing = (listing) => {
    setModal({
      type: "approval",
      data: listing,
    });
  };

  const handleApprove = () => {
    setApprovalListings((prev) =>
      prev.filter((item) => item.id !== modal.data.id),
    );

    setToast({
      color: "green",
      icon: "check",
      title: modal.data.submittedBy.name,
      message: "approved successfully!",
    });

    handleCloseModal();
  };

  const handleReject = () => {
    setApprovalListings((prev) =>
      prev.filter((item) => item.id !== modal.data.id),
    );

    setToast({
      color: "red",
      icon: "trash",
      title: modal.data.submittedBy.name,
      message: "was rejected!",
    });

    handleCloseModal();
  };

  // ! ---------------- REPORT HANDLERS ----------------

  const handleViewReport = (report) => {
    setModal({
      type: "report",
      data: report,
    });
  };

  const handleCancelReport = () => {
    setReportedUsers((prev) => prev.filter((r) => r.id !== modal.data.id));

    setToast({
      color: "blue",
      icon: "info",
      title: modal.data.reportedUser.name,
      message: "report canceled!",
    });

    handleCloseModal();
  };

  const handleFreeze = () => {
    setReportedUsers((prev) => prev.filter((r) => r.id !== modal.data.id));

    setToast({
      color: "yellow",
      icon: "freeze",
      title: modal.data.reportedUser.name,
      message: "report removed!",
    });

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setModal({
      type: null,
      data: null,
    });
  };

  /*
    ! Pending Listings (for approval)
  */
  const [approvalListings, setApprovalListings] = useState([
    {
      id: 101,
      name: "Red Dead Redemption 2",
      platform: "PlayStation",
      consoleModel: "PS5",
      price: 130,
      genre: "Action",
      tag: "Open World",
      status: "Pending",
      about: "Excellent condition disc, original case included.",
      borrowDuration: 180,
      hasExpansions: "no",
      deliveryMethod: "Meet-Up",
      image: hogwarts,
      submittedBy: {
        name: "PlayerOne",
        email: "player@replay.com",
      },
      submittedOn: "2026-04-15",
    },
    {
      id: 102,
      name: "Cyberpunk 2077",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      price: 90,
      genre: "RPG",
      tag: "Futuristic",
      status: "Pending",
      about: "Updated version with DLC expansion.",
      borrowDuration: 90,
      hasExpansions: "yes",
      deliveryMethod: "Drop-off",
      image: pokemon,
      submittedBy: {
        name: "PlayerThirty",
        email: "player@third.com",
      },
      submittedOn: "2026-04-16",
    },
    {
      id: 103,
      name: "Animal Crossing: New Horizons",
      platform: "Nintendo",
      consoleModel: "Switch",
      price: 70,
      genre: "Simulation",
      tag: "Relaxing",
      status: "Pending",
      about: "Lightly used cartridge in perfect condition.",
      borrowDuration: 60,
      hasExpansions: "yes",
      deliveryMethod: "Pick-up",
      image: donkeyKong,
      submittedBy: {
        name: "PlayerFive",
        email: "player@five.com",
      },
      submittedOn: "2026-04-17",
    },
  ]);

  /*
    ! Reported Users
  */
  const [reportedUsers, setReportedUsers] = useState([
    {
      id: 1,
      reportedBy: {
        name: "PlayerA",
        email: "playerA@email.com",
      },
      reportedUser: {
        name: "PlayerX",
        email: "playerX@email.com",
      },
      category: "Game Return Issue",
      reason: "Did not return game",
      submittedOn: "2026-04-18",
    },

    {
      id: 2,
      reportedBy: {
        name: "PlayerB",
        email: "playerB@email.com",
      },
      reportedUser: {
        name: "ToxicPlayer",
        email: "toxic@email.com",
      },
      category: "Abusive Behavior",
      reason: "Abusive behavior in chat",
      submittedOn: "2026-04-19",
    },
  ]);

  /*
    ! Dashboard Table Configuration
    * Controls how tables are rendered dynamically
  */
  const ADMIN_TABLES = [
    {
      section: "approvals",
      title: "Listing Approvals",
      data: approvalListings,
      columns: [
        COLS.text("Submitted On", "submittedOn"),
        COLS.text("User Name", "submittedBy.name"),
        COLS.text("User Email", "submittedBy.email"),
        COLS.text("Game", "name"),
        COLS.text("Platform", "platform"),
        COLS.text("Console Model", "consoleModel"),
        COLS.text("Price (AED)", "price"),
        COLS.image,
        COLS.text("About", "about"),
        COLS.text("Genre", "genre"),
        COLS.text("Tag", "tag"),
        COLS.text("Expansions", "hasExpansions"),
        COLS.text("Delivery", "deliveryMethod"),
        COLS.text("Borrow Duration (Days)", "borrowDuration"),
        COLS.actions,
      ],
    },
    {
      section: "reports",
      title: "Reported Users",
      data: reportedUsers,
      columns: [
        COLS.text("Submitted On", "submittedOn"),
        COLS.text("Reported By (Name)", "reportedBy.name"),
        COLS.text("Reported By (Email)", "reportedBy.email"),
        COLS.text("Reported User (Name)", "reportedUser.name"),
        COLS.text("Reported User (Email)", "reportedUser.email"),
        COLS.text("Category", "category"),
        COLS.text("Reason", "reason"),
        COLS.actions,
      ],
    },
  ];

  /*
    ! Review Layout Configuration
    * Controls how the review layout are rendered dynamically
  */
  const approvalReviewLayout = (listing) => [
    {
      title: "Game Info",
      items: [
        { label: "Game", value: listing.name },
        {
          label: "Platform",
          value: <GetPlatformIcon platform={listing.platform} />,
        },
        { label: "Console Model", value: listing.consoleModel },
        { label: "Price", value: `${listing.price} AED` },
        { label: "Genre", value: listing.genre },
        { label: "Tag", value: listing.tag },
        { label: "About", value: listing.about, isDescription: true },
      ],
    },
    {
      title: "Rental Info",
      items: [
        { label: "Borrow Duration", value: `${listing.borrowDuration} days` },
        { label: "Delivery Method", value: listing.deliveryMethod },
        { label: "Expansions", value: listing.hasExpansions },
      ],
    },
    {
      title: "Submission Info",
      items: [
        { label: "Submitted By", value: listing.submittedBy?.name },
        { label: "Email", value: listing.submittedBy?.email },
        { label: "Submitted On", value: listing.submittedOn, isDate: true },
      ],
    },
  ];

  const reportReviewLayout = (report) => [
    {
      title: "Report Info",
      items: [
        { label: "Submitted On", value: report.submittedOn, isDate: true },
        { label: "Category", value: report.category },
        { label: "Reason", value: report.reason, isDescription: true },
      ],
    },
    {
      title: "Reported By",
      items: [
        { label: "Name", value: report.reportedBy?.name },
        { label: "Email", value: report.reportedBy?.email },
      ],
    },
    {
      title: "Reported User",
      items: [
        { label: "Name", value: report.reportedUser?.name },
        { label: "Email", value: report.reportedUser?.email },
      ],
    },
  ];

  return (
    <>
      <DashboardHeader
        userName={user?.firstName || "Admin"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />
      <main className="dashboard-main">
        {ADMIN_TABLES.filter((t) => t.section === activeTab).map((table, i) => (
          <section className="dashboard-content" key={i}>
            <div className="title">
              <h2>{table.title}</h2>
            </div>
            <div className="table-wrapper">
              <div className="dashboard-table">
                <ul className="table-head">
                  <li>
                    {table.columns.map((col, k) => (
                      <span key={k}>{col.label}</span>
                    ))}
                  </li>
                </ul>
                <ul className="table-content">
                  {table.data.map((row, rowIndex) => (
                    <li key={rowIndex}>
                      {table.columns.map((col, colIndex) => {
                        {
                          // ! IMAGES
                        }
                        if (col.isImage) {
                          return (
                            <span key={colIndex}>
                              <img
                                src={row[col.key]}
                                alt={row.name}
                                className="table-image"
                              />
                            </span>
                          );
                        }

                        {
                          // ! ACTIONS
                        }
                        if (col.isActions) {
                          /*
                              ! Approval Actions
                            */
                          if (table.section === "approvals") {
                            return (
                              <span key={colIndex} className="actions">
                                <button
                                  className="icon-btn view"
                                  onClick={() => handleViewListing(row)}
                                >
                                  <FaEye /> View
                                </button>
                              </span>
                            );
                          }

                          /*
                              ! Report Actions
                            */
                          if (table.section === "reports") {
                            return (
                              <span key={colIndex} className="actions">
                                <button
                                  className="icon-btn view"
                                  onClick={() => handleViewReport(row)}
                                >
                                  <FaEye /> View
                                </button>
                              </span>
                            );
                          }
                        }

                        return (
                          <span key={colIndex}>
                            {getValue(row, col.key) || "—"}
                          </span>
                        );
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        <Overlay isModalOpen={modal.type !== null} onClick={handleCloseModal} />

        {modal.type === "approval" && (
          <AdminReview
            title="Review Listing"
            image={modal.data.image}
            sections={approvalReviewLayout(modal.data)}
            onClose={handleCloseModal}
            secondaryAction={{
              label: "Reject",
              onClick: handleReject,
            }}
            primaryAction={{
              label: "Approve",
              onClick: handleApprove,
            }}
          />
        )}

        {modal.type === "report" && (
          <AdminReview
            title="Review Report"
            sections={reportReviewLayout(modal.data)}
            onClose={handleCloseModal}
            secondaryAction={{
              label: "Cancel Report",
              onClick: handleCancelReport,
            }}
            primaryAction={{
              label: "Freeze User",
              onClick: handleFreeze,
            }}
          />
        )}
      </main>
      <Toast
        color={toast?.color}
        icon={toast?.icon}
        title={toast?.title}
        message={toast?.message}
        isVisible={!!toast}
      />
    </>
  );
}
