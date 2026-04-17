import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/dashboard.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import DashboardForm from "../components/DashboardForm";
import Overlay from "../components/Overlay";
import DeleteModal from "../components/DeleteModal";
import { FaTrash, FaEdit, FaTruck } from "react-icons/fa";
import { MdReport, MdChatBubble } from "react-icons/md";
import Toast from "../components/Toast";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";
import { FaShoppingBasket, FaList } from "react-icons/fa";

/* 
? Backend
TODO: Replace rentals, listings and history data and connect to backend API (current rentals, rental history, active listings, listing history endpoint)

TODO: Update user's profile name (image?), saved/deleted/edited listings, updating status?

TODO: Form should automatically add the genre depending on the available games on the website

TODO: Fetch from the API the image url

? Frontend

TODO: DashboardHeader with Logout and Go Back Home Links, navigation? Admin: Available Games Managaement, Contact with Users?, Users: Rentals and Listings Tab?
*/

/*
  * Formats date into readable format
  ? Returns "—" if no date exists
*/
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/*
  ! Rental Status Logic (Renter Side)
  * Determines state of a rented game
  ? Used for UI status badges
*/
const getRentalStatus = (game) => {
  const today = new Date();
  const due = new Date(game.dueDate);

  if (game.status === "Out for Delivery") return "delivery";
  if (today > due) return "overdue";
  if (game.daysLeft <= 2) return "due";

  return "rented";
};

/*
  ! Listing Status Logic (Owner Side)
  * Determines state of a listed game
  ? Used for listing availability + rental state
*/
const getListingStatus = (game) => {
  const today = new Date();
  const due = new Date(game.dueDate);

  if (game.status === "Pending") return "pending";
  if (game.status === "Out for Delivery") return "delivery";
  if (!game.rentedBy) return "available";
  if (today > due) return "overdue";
  if (game.daysLeft <= 2) return "due";

  return "rented";
};

export default function Dashboard() {
  /*
    ! State: Active Listings
    * Games currently listed by the user
  */
  const [listedGames, setListedGames] = useState([
    {
      id: 1,
      name: "Hogwarts Legacy",
      platform: "Windows",
      price: 120,
      genre: "Adventure",
      status: "Rented",
      rentedBy: "PlayerFour",
      daysLeft: 3,
      rentedOn: "2026-03-18",
      dueDate: "2026-03-21",
      about: "Deluxe edition with bonus content.",
      ownershipDuration: 200,
      hasExpansions: "yes",
      ageRating: "T",
      deliveryMethod: "Drop-off",
    },
    {
      id: 2,
      name: "Mario Kart 8 Deluxe",
      platform: "Nintendo",
      price: 85,
      genre: "Racing",
      status: "Available",
      rentedBy: null,
      daysLeft: null,
      rentedOn: null,
      dueDate: null,
      about: "Well-maintained cartridge, original box included.",
      ownershipDuration: 320,
      hasExpansions: "no",
      ageRating: "E",
      deliveryMethod: "Meet-Up",
    },
    {
      id: 3,
      name: "Zelda: Tears of the Kingdom",
      platform: "Nintendo",
      price: 100,
      genre: "RPG",
      status: "Rented",
      rentedBy: "PlayerX",
      daysLeft: 1,
      rentedOn: "2026-04-08",
      dueDate: "2026-04-11",
      about: "Collector’s edition, includes map and extras.",
      ownershipDuration: 150,
      hasExpansions: "yes",
      ageRating: "T",
      deliveryMethod: "Pick-up",
    },
  ]);

  /*
    ! State: Pending Listings
    * Games currently sent to the admin for approval
  */
  const [pendingListings, setPendingListings] = useState([
    {
      id: 101,
      name: "Red Dead Redemption 2",
      platform: "PlayStation",
      price: 130,
      genre: "Action",
      status: "Pending",
      about: "Excellent condition disc, original case included.",
      ownershipDuration: 180,
      hasExpansions: "no",
      ageRating: "18+",
      deliveryMethod: "Meet-Up",
    },
    {
      id: 102,
      name: "Cyberpunk 2077",
      platform: "Xbox",
      price: 90,
      genre: "RPG",
      status: "Pending",
      about: "Updated version with DLC expansion.",
      ownershipDuration: 90,
      hasExpansions: "yes",
      ageRating: "18+",
      deliveryMethod: "Drop-off",
    },
    {
      id: 103,
      name: "Animal Crossing: New Horizons",
      platform: "Nintendo",
      price: 70,
      genre: "Simulation",
      status: "Pending",
      about: "Lightly used cartridge in perfect condition.",
      ownershipDuration: 60,
      hasExpansions: "yes",
      ageRating: "E",
      deliveryMethod: "Pick-up",
    },
  ]);

  /*
    ! UI State Controls
    * Handles modals (create/edit + delete)
  */
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteListing, setDeleteListing] = useState(null);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("rentals");
  const navigate = useNavigate();

  const tabs = [
    {
      key: "rentals",
      icon: FaShoppingBasket,
      label: "My Rentals",
    },
    {
      key: "listings",
      icon: FaList,
      label: "My Listings",
    },
  ];

  /*
    ! Modal State Grouping
    * True if any modal is open
  */
  const isAnyModalOpen = showForm || deleteListing;

  /*
    ! Rentals (Current)
    * Games user is currently renting
  */
  const rentedGames = [
    {
      name: "Elden Ring",
      platform: "PlayStation",
      listedBy: "PlayerFive",
      status: "Rented",
      daysLeft: 1,
      rentedOn: "2026-04-07",
      dueDate: "2026-04-11",
      price: 140,
      genre: "RPG",
      about: "Includes Shadow of the Erdtree DLC.",
      ownershipDuration: 180,
      hasExpansions: "yes",
      ageRating: "18+",
      deliveryMethod: "Meet-Up",
    },
    {
      name: "Spider-Man Remastered",
      platform: "PlayStation",
      listedBy: "PlayerSix",
      status: "Overdue",
      daysLeft: -1,
      rentedOn: "2026-04-01",
      dueDate: "2026-04-09",
      price: 130,
      genre: "Action",
      about: "Minor scratches but fully playable.",
      ownershipDuration: 220,
      hasExpansions: "no",
      ageRating: "16+",
      deliveryMethod: "Pick-up",
    },
    {
      name: "Minecraft",
      platform: "Windows",
      listedBy: "PlayerSeven",
      status: "Rented",
      daysLeft: 6,
      rentedOn: "2026-04-05",
      dueDate: "2026-04-16",
      price: 70,
      genre: "Sandbox",
      about: "Java + Bedrock edition included.",
      ownershipDuration: 400,
      hasExpansions: "no",
      ageRating: "7+",
      deliveryMethod: "Drop-off",
    },
  ];

  /*
    ! Rental History
    * Past rentals completed by user
  */
  const rentHistory = [
    {
      name: "Breath of the Wild",
      platform: "Nintendo",
      listedBy: "PlayerThree",
      rentedOn: "2026-03-20",
      returnedOn: "2026-03-27",
      price: 150,
      genre: "Adventure",
      about: "Complete edition in excellent condition.",
      ownershipDuration: 500,
      hasExpansions: "yes",
      ageRating: "12+",
      deliveryMethod: "Meet-Up",
    },
  ];

  /*
    ! Listing History
    * Past listings owned by user
  */

  const listingHistory = [
    {
      name: "Hogwarts Legacy",
      platform: "Windows",
      rentedBy: "PlayerFour",
      rentedOn: "2026-03-18",
      returnedOn: "2026-03-21",
      price: 120,
      genre: "Adventure",
      about: "No scratches, well maintained disc.",
      ownershipDuration: 240,
      hasExpansions: "yes",
      ageRating: "16+",
      deliveryMethod: "Meet-Up",
    },
  ];
  /*
    ! Create / Update Listing Handler
    * Handles both new listing creation and edits
  */
  const handleSaveListing = (newListing) => {
    if (editData) {
      setListedGames((prev) => prev.filter((l) => l.id !== editData.id));

      const updatedItem = {
        ...editData,
        name: newListing.name,
        platform: newListing.platform,
        price: Number(newListing.price),
        genre: newListing.genre,
        about: newListing.about,
        ownershipDuration: newListing.ownershipDuration,
        hasExpansions: newListing.hasExpansions,
        ageRating: newListing.ageRating,
        deliveryMethod: newListing.deliveryMethod,
        status: "Pending",
      };

      setPendingListings((prev) => [updatedItem, ...prev]);

      setToast({
        type: "edited",
        message: `${newListing.name} sent for re-approval!`,
      });
    } else {
      const newItem = {
        id: Date.now(),
        name: newListing.name,
        platform: newListing.platform,
        rentedBy: null,
        daysLeft: null,
        rentedOn: null,
        dueDate: null,
        status: "Pending",
        price: Number(newListing.price),
        genre: newListing.genre,
        about: newListing.about,
        ownershipDuration: newListing.ownershipDuration,
        hasExpansions: newListing.hasExpansions,
        ageRating: newListing.ageRating,
        deliveryMethod: newListing.deliveryMethod,
      };

      setPendingListings((prev) => [newItem, ...prev]);

      setToast({
        type: "added",
        message: `"${newListing.name}" is pending admin approval!`,
      });
    }

    setShowForm(false);
    setEditData(null);
  };

  /*
    ! Delete Listing Handler
    * Opens confirmation modal
  */
  const handleDeleteListing = (name) => {
    setDeleteListing(name);
  };

  /*
    ! Confirm Delete Action
    * Removes listing from state
  */
  const confirmDelete = () => {
    setListedGames((prev) => prev.filter((l) => l.name !== deleteListing));

    setToast({
      type: "deleted",
      message: `${deleteListing} was deleted successfully!`,
    });

    setDeleteListing(null);
  };

  /*
    ! Edit Listing Handler
    * Opens form pre-filled with data
  */
  const handleEditListing = (listing) => {
    setEditData(listing);
    setShowForm(true);
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
  ! Listing Form Fields
  * Reusable configuration for DashboardForm
  ? Used for create + edit listing
*/
  const listingFields = [
    {
      name: "name",
      label: "Game Title",
      type: "text",
      placeholder: "Enter game name",
      isValid: (data) => data.name?.trim().length > 2,
    },

    {
      name: "genre",
      label: "Genre",
      type: "text",
      placeholder: "Enter game genre",
      isValid: (data) => data.name?.trim().length > 2,
    },

    {
      name: "about",
      label: "About the Item",
      type: "textarea",
      placeholder: "Describe condition, inclusions, notes, etc.",
      isValid: (data) => data.about?.trim().length > 10,
    },

    {
      name: "ownershipDuration",
      label: "Days Owned",
      type: "number",
      placeholder: "e.g. 120",
      isValid: (data) =>
        Number(data.ownershipDuration) > 0 && !isNaN(data.ownershipDuration),
    },

    {
      name: "platform",
      label: "Platform",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["Windows", "Xbox", "PlayStation", "Nintendo", "Mac"],
      isValid: (data) => data.platform?.trim() !== "",
    },

    {
      name: "hasExpansions",
      label: "Has Expansions?",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["yes", "no"],
      isValid: (data) =>
        data.hasExpansions === "yes" || data.hasExpansions === "no",
    },

    {
      name: "ageRating",
      label: "Age Rating",
      type: "text",
      placeholder: "e.g. E, T, M, 18+",
      isValid: (data) => data.ageRating?.trim().length > 0,
    },

    {
      name: "price",
      label: "Price (AED)",
      type: "number",
      placeholder: "Enter price",
      isValid: (data) => Number(data.price) > 0,
    },

    {
      name: "deliveryMethod",
      label: "Delivery Method",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["Pick-up", "Meet-Up", "Drop-off"],
      isValid: (data) => !!data.deliveryMethod,
    },
  ];

  /*
    ! Dashboard Table Configuration
    * Controls how tables are rendered dynamically
  */
  const commonTables = [
    {
      sectionTitle: "My Rentals",
      tables: [
        {
          title: "Current Rentals",
          data: rentedGames,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "About", key: "about" },
            { label: "Age Rating", key: "ageRating" },
            { label: "Expansions", key: "hasExpansions" },
            { label: "Delivery", key: "deliveryMethod" },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "Listed By", key: "listedBy" },
            { label: "Status", key: "status", isStatus: true },
            { label: "Days Left", key: "daysLeft" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Due Date", key: "dueDate", isDate: true },
            { label: "Actions", key: "actions", isActions: true },
          ],
          statusFn: getRentalStatus,
        },
        {
          title: "Renting History",
          data: rentHistory,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "About", key: "about" },
            { label: "Age Rating", key: "ageRating" },
            { label: "Expansions", key: "hasExpansions" },
            { label: "Delivery", key: "deliveryMethod" },
            { label: "Listed By", key: "listedBy" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Returned On", key: "returnedOn", isDate: true },
          ],
        },
      ],
    },
    {
      sectionTitle: "My Listings",
      tables: [
        {
          title: "Pending Listings",
          data: pendingListings,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "About", key: "about" },
            { label: "Age Rating", key: "ageRating" },
            { label: "Expansions", key: "hasExpansions" },
            { label: "Delivery", key: "deliveryMethod" },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "Status", key: "status", isStatus: true },
          ],
          statusFn: getListingStatus,
        },
        {
          title: "Active Listings",
          data: listedGames,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "Rented By", key: "rentedBy" },
            { label: "About", key: "about" },
            { label: "Age Rating", key: "ageRating" },
            { label: "Expansions", key: "hasExpansions" },
            { label: "Delivery", key: "deliveryMethod" },
            { label: "Status", key: "status", isStatus: true },
            { label: "Days Left", key: "daysLeft" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Due Date", key: "dueDate", isDate: true },
            { label: "Actions", key: "actions", isActions: true },
          ],
          statusFn: getListingStatus,
        },
        {
          title: "Listing History",
          data: listingHistory,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "About", key: "about" },
            { label: "Age Rating", key: "ageRating" },
            { label: "Expansions", key: "hasExpansions" },
            { label: "Delivery", key: "deliveryMethod" },

            { label: "Rented By", key: "rentedBy" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Returned On", key: "returnedOn", isDate: true },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <DashboardHeader
        userName={user?.firstName || "User"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />
      <main className="dashboard-main">
        {commonTables
          .filter((section) =>
            activeTab === "rentals"
              ? section.sectionTitle === "My Rentals"
              : section.sectionTitle === "My Listings",
          )
          .map((section, i) => (
            <section className="dashboard-content" key={i}>
              <div className="title">
                <h2>{section.sectionTitle}</h2>
              </div>

              {section.tables.map((table, j) => (
                <div key={j}>
                  <div className="table-header">
                    <h4>{table.title}</h4>

                    {table.title === "Current Rentals" && (
                      <Link to="/games" className="table-action-link">
                        Browse More Games
                      </Link>
                    )}

                    {table.title === "Active Listings" && (
                      <button
                        className="table-action-link"
                        onClick={() => setShowForm(true)}
                      >
                        Create Listing
                      </button>
                    )}
                  </div>

                  <div className="table-wrapper">
                    <div className="dashboard-table" key={j}>
                      <ul className="table-head">
                        <li>
                          {table.columns.map((col, k) => (
                            <span key={k}>{col.label}</span>
                          ))}
                        </li>
                      </ul>
                      <ul className="table-content">
                        {table.data.map((row, rowIndex) => {
                          const statusClass = table.statusFn
                            ? table.statusFn(row)
                            : null;

                          return (
                            <li key={rowIndex}>
                              {table.columns.map((col, colIndex) => {
                                if (col.isIcon)
                                  return (
                                    <GetPlatformIcon
                                      platform={row[col.key]}
                                      key={colIndex}
                                    />
                                  );

                                if (col.isStatus)
                                  return (
                                    <span
                                      key={colIndex}
                                      className={`status ${statusClass}`}
                                    >
                                      {statusClass === "delivery"
                                        ? "Out for Delivery"
                                        : statusClass === "overdue"
                                          ? "Overdue"
                                          : statusClass === "due"
                                            ? "Due Soon"
                                            : statusClass === "available"
                                              ? "Available"
                                              : statusClass === "rented"
                                                ? "Rented"
                                                : statusClass === "pending"
                                                  ? "Pending"
                                                  : "Active"}
                                    </span>
                                  );

                                if (col.isDate)
                                  return (
                                    <span key={colIndex}>
                                      {formatDate(row[col.key])}
                                    </span>
                                  );

                                if (col.isActions) {
                                  if (table.title === "Current Rentals") {
                                    return (
                                      <span key={colIndex} className="actions">
                                        {/* Chat always */}
                                        <button
                                          className="icon-btn chat"
                                          onClick={() =>
                                            console.log(
                                              "Chat with",
                                              row.listedBy,
                                            )
                                          }
                                        >
                                          Chat
                                          <MdChatBubble />
                                        </button>

                                        {/* Return only when allowed */}
                                        {["rented", "due", "overdue"].includes(
                                          statusClass,
                                        ) && (
                                          <button
                                            className="icon-btn return"
                                            onClick={() =>
                                              console.log("Return", row.name)
                                            }
                                          >
                                            Return
                                            <FaTruck />
                                          </button>
                                        )}
                                      </span>
                                    );
                                  }

                                  if (table.title === "Active Listings") {
                                    return (
                                      <span key={colIndex} className="actions">
                                        {statusClass === "available" ? (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleEditListing(row)
                                              }
                                              className="icon-btn edit"
                                            >
                                              Edit
                                              <FaEdit />
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleDeleteListing(row.name)
                                              }
                                              className="icon-btn delete"
                                            >
                                              Delete
                                              <FaTrash />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            {/* Chat always when not available */}
                                            <button
                                              className="icon-btn chat"
                                              onClick={() =>
                                                console.log(
                                                  "Chat with",
                                                  row.rentedBy,
                                                )
                                              }
                                            >
                                              Chat
                                              <MdChatBubble />
                                            </button>

                                            {/* Report only if overdue */}
                                            {statusClass === "overdue" && (
                                              <button
                                                className="icon-btn report"
                                                onClick={() =>
                                                  console.log(
                                                    "Report",
                                                    row.name,
                                                  )
                                                }
                                              >
                                                Report
                                                <MdReport />
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </span>
                                    );
                                  }
                                }

                                return (
                                  <span key={colIndex}>
                                    {row[col.key] || "—"}
                                  </span>
                                );
                              })}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ))}

        <Overlay
          isModalOpen={isAnyModalOpen}
          onClick={() => {
            setShowForm(false);
            setEditData(null);
            setDeleteListing(null);
          }}
        />

        {showForm && (
          <DashboardForm
            title={editData ? "Edit Listing" : "Create Listing"}
            mode={editData ? "edit" : "create"}
            fields={listingFields}
            initialData={editData || {}}
            onClose={() => {
              setShowForm(false);
              setEditData(null);
            }}
            onSubmit={handleSaveListing}
          />
        )}

        {deleteListing && (
          <DeleteModal
            name={deleteListing}
            onCancel={() => setDeleteListing(null)}
            onConfirm={confirmDelete}
          />
        )}
      </main>
      <Toast type={toast?.type} message={toast?.message} isVisible={!!toast} />
    </>
  );
}
