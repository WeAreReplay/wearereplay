import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/dashboard.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import DashboardForm from "../components/DashboardForm";
import Overlay from "../components/Overlay";
import DeleteModal from "../components/DeleteModal";
import { FaTrash, FaEdit } from "react-icons/fa";
import DonkeyKong from "../assets/images/donkey-kong.webp";
import indiana from "../assets/images/indiana-jones.webp";
import Toast from "../components/Toast";
import DashboardHeader from "../layouts/DashboardHeader";

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

  if (game.status === "Out for Delivery") return "delivery";
  if (!game.rentedBy) return "available";
  if (today > due) return "overdue";
  if (game.daysLeft <= 2) return "due";

  return "rented";
};

export default function Dashboard() {
  /*
    ! User Info
  */
  const user = {
    0: { name: "PlayerOne", role: "common" },
    1: { name: "ReplayAdmin", role: "admin" },
  };

  const currentUser = user[0];

  /*
    ! State: Active Listings
    * Games currently listed by the user
  */
  const [listedGames, setListedGames] = useState([
    {
      id: 1,
      name: "Hogwarts",
      platform: "Windows",
      rentedBy: "PlayerFour",
      daysLeft: 3,
      rentedOn: "2026-03-18",
      dueDate: "2026-03-21",
      status: "Rented", // → rented
      price: 120,
      genre: "Adventure",
    },
    {
      id: 2,
      name: "Mario Kart",
      platform: "Nintendo",
      rentedBy: null,
      daysLeft: null,
      rentedOn: null,
      dueDate: null,
      status: "Available",
      price: 85,
      genre: "Racing",
    },
    {
      id: 3,
      name: "Zelda",
      platform: "Nintendo",
      rentedBy: "PlayerX",
      daysLeft: 1,
      rentedOn: "2026-04-08",
      dueDate: "2026-04-11",
      status: "Rented",
      price: 100,
      genre: "RPG",
    },
    {
      id: 4,
      name: "FIFA 25",
      platform: "PlayStation",
      rentedBy: "PlayerY",
      daysLeft: -2,
      rentedOn: "2026-04-01",
      dueDate: "2026-04-08",
      status: "Rented",
      price: 95,
      genre: "Sports",
    },
    {
      id: 5,
      name: "Call of Duty",
      platform: "Xbox",
      rentedBy: "PlayerZ",
      daysLeft: 4,
      rentedOn: "2026-04-09",
      dueDate: "2026-04-14",
      status: "Out for Delivery",
      price: 110,
      genre: "Shooter",
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
  const [showGameForm, setShowGameForm] = useState(false);
  const [editGameData, setEditGameData] = useState(null);
  const [deleteGame, setDeleteGame] = useState(null);

  const handleSaveGame = (newGame) => {
    if (editGameData) {
      setAvailableGames((prev) =>
        prev.map((g) =>
          g.id === editGameData.id
            ? {
                ...g,
                name: newGame.name,
                genre: newGame.genre,
                description: newGame.description,
                image: newGame.image,
              }
            : g,
        ),
      );
      setToast({
        type: "edited",
        message: `${newGame.name} was updated successfully!`,
      });
    } else {
      const newItem = {
        id: Date.now(),
        name: newGame.name,
        genre: newGame.genre,
        description: newGame.description,
        image: newGame.image,
      };

      setAvailableGames((prev) => [newItem, ...prev]);

      setToast({
        type: "added",
        message: `${newGame.name} was added successfully!`,
      });
    }

    setShowGameForm(false);
    setEditGameData(null);
  };

  const handleEditGame = (game) => {
    setEditGameData(game);
    setShowGameForm(true);
  };

  const handleDeleteGame = (name) => {
    setDeleteGame(name);
  };

  const confirmDeleteGame = () => {
    setAvailableGames((prev) => prev.filter((g) => g.name !== deleteGame));

    setToast({
      type: "deleted",
      message: `${deleteGame} was removed from games!`,
    });

    setDeleteGame(null);
  };
  /*
    ! Modal State Grouping
    * True if any modal is open
  */
  const isAnyModalOpen =
    showForm || deleteListing || showGameForm || deleteGame;

  /*
    ! Rentals (Current)
    * Games user is currently renting
  */
  const rentedGames = [
    {
      name: "Donkey Kong",
      platform: "Nintendo",
      listedBy: "PlayerTwo",
      status: "Out for Delivery",
      daysLeft: 5,
      rentedOn: "2026-04-09",
      dueDate: "2026-04-15",
      price: 90,
      genre: "Platformer",
    },
    {
      name: "Elden Ring",
      platform: "PlayStation",
      listedBy: "PlayerFive",
      status: "Rented",
      daysLeft: 1,
      rentedOn: "2026-04-07",
      dueDate: "2026-04-11",
      price: 140,
      genre: "RPG", // → due
    },
    {
      name: "Spider-Man",
      platform: "PlayStation",
      listedBy: "PlayerSix",
      status: "Rented",
      daysLeft: -1,
      rentedOn: "2026-04-01",
      dueDate: "2026-04-09",
      price: 130,
      genre: "Action",
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
    },
  ];

  /*
    ! Rental History
    * Past rentals completed by user
  */
  const rentHistory = [
    {
      name: "Zelda",
      platform: "Nintendo",
      listedBy: "PlayerThree",
      rentedOn: "2026-03-20",
      returnedOn: "2026-03-27",
      price: 150,
      genre: "Adventure",
    },
  ];

  /*
    ! Listing History
    * Past listings owned by user
  */
  const listingHistory = [
    {
      name: "Hogwarts",
      platform: "Windows",
      listedBy: "PlayerOne",
      rentedOn: "2026-03-18",
      returnedOn: "2026-03-21",
      price: 120,
      genre: "Adventure",
    },
  ];

  /*
    ! Create / Update Listing Handler
    * Handles both new listing creation and edits
  */
  const handleSaveListing = (newListing) => {
    if (editData) {
      // UPDATE
      setListedGames((prev) =>
        prev.map((l) =>
          l.id === editData.id
            ? {
                ...l,
                name: newListing.name,
                platform: newListing.platform,
                price: Number(newListing.price),
                genre: newListing.genre,
              }
            : l,
        ),
      );

      setToast({
        type: "edited",
        message: `${newListing.name} was updated successfully!`,
      });
    } else {
      // CREATE
      const newItem = {
        id: Date.now(),
        name: newListing.name,
        platform: newListing.platform,
        rentedBy: null,
        daysLeft: null,
        rentedOn: null,
        dueDate: null,
        status: "Available",
        price: Number(newListing.price),
        genre: newListing.genre,
      };

      setListedGames((prev) => [newItem, ...prev]);

      setToast({
        type: "added",
        message: `"${newListing.name}" was created successfully!`,
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
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "Listed By", key: "listedBy" },
            { label: "Status", key: "status", isStatus: true },
            { label: "Days Left", key: "daysLeft" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Due Date", key: "dueDate", isDate: true },
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
          title: "Active Listings",
          data: listedGames,
          columns: [
            { label: "Game", key: "name" },
            { label: "Platform", key: "platform", isIcon: true },
            { label: "Price (AED)", key: "price" },
            { label: "Genre", key: "genre" },
            { label: "Rented By", key: "rentedBy" },
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
            { label: "Listed By", key: "listedBy" },
            { label: "Rented On", key: "rentedOn", isDate: true },
            { label: "Returned On", key: "returnedOn", isDate: true },
          ],
        },
      ],
    },
  ];

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
      name: "price",
      label: "Price (AED)",
      type: "number",
      placeholder: "Enter price",
      isValid: (data) => Number(data.price) > 0,
    },
    {
      name: "platform",
      label: "Platform",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["Windows", "Xbox", "PlayStation", "Nintendo", "Mac"],
      isValid: (data) => data.platform?.trim() !== "",
    },
  ];

  const [availableGames, setAvailableGames] = useState([
    {
      id: 1,
      name: "God of War",
      image: DonkeyKong,
      genre: "Action",
      description: "Epic Norse adventure",
    },
    {
      id: 2,
      name: "Forza Horizon",
      image: indiana,
      genre: "Racing",
      description: "Open-world racing",
    },
  ]);

  const adminTables = [
    {
      sectionTitle: "Admin Panel",
      tables: [
        {
          title: "All Games",
          data: availableGames,
          columns: [
            { label: "Name", key: "name" },
            { label: "Image", key: "image", isImage: true },
            { label: "Genre", key: "genre" },
            { label: "Description", key: "description" },
            { label: "Actions", key: "actions", isActions: true },
          ],
        },
      ],
    },
  ];

  const gameFields = [
    {
      name: "name",
      label: "Game Name",
      type: "text",
      placeholder: "Enter game name",
      isValid: (data) => data.name?.trim().length > 2,
    },
    {
      name: "genre",
      label: "Genre",
      type: "text",
      placeholder: "Enter genre",
      isValid: (data) => data.genre?.trim().length > 2,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
      isValid: (data) => data.description?.trim().length > 5,
    },
    {
      name: "image",
      label: "Image File",
      type: "file",
      placeholder: "Image path or URL",
      isValid: (data) => !!data.image,
    },
  ];

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <main className="dashboard-main">
        <h2>Welcome, {currentUser.name}!</h2>

        {
          // ! COMMON
        }
        {currentUser.role === "common" && (
          <>
            {commonTables.map((section, i) => (
              <section className="dashboard-content" key={i}>
                <div className="title">
                  <h2>{section.sectionTitle}</h2>
                </div>

                {section.tables.map((table, j) => (
                  <div key={j}>
                    <div className="table-header">
                      <h4>{table.title}</h4>

                      {table.title === "Current Rentals" && (
                        <Link to="/browse-games" className="table-action-link">
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
                                                  : "Active"}
                                      </span>
                                    );

                                  if (col.isDate)
                                    return (
                                      <span key={colIndex}>
                                        {formatDate(row[col.key])}
                                      </span>
                                    );

                                  if (col.isActions)
                                    return (
                                      <span key={colIndex} className="actions">
                                        {statusClass === "available" ? (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleEditListing(row)
                                              }
                                              className="icon-btn edit"
                                              aria-label="Edit"
                                            >
                                              Edit
                                              <FaEdit />
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleDeleteListing(row.name)
                                              }
                                              className="icon-btn delete"
                                              aria-label="Delete"
                                            >
                                              Delete
                                              <FaTrash />
                                            </button>
                                          </>
                                        ) : (
                                          <span className="na-text">N/A</span>
                                        )}
                                      </span>
                                    );

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
          </>
        )}

        {
          // ! ADMIN
        }
        {currentUser.role === "admin" && (
          <>
            {adminTables.map((section, i) => (
              <section className="dashboard-content" key={i}>
                <div className="title">
                  <h2>{section.sectionTitle}</h2>
                </div>

                {section.tables.map((table, j) => (
                  <div key={j}>
                    <div className="table-header">
                      <h4>{table.title}</h4>

                      <button
                        className="table-action-link"
                        onClick={() => setShowGameForm(true)}
                      >
                        Add Game
                      </button>
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
                                if (col.isImage)
                                  return (
                                    <span key={colIndex}>
                                      <img
                                        src={row[col.key]}
                                        alt={row.name}
                                        style={{
                                          width: "50px",
                                          borderRadius: "6px",
                                        }}
                                      />
                                    </span>
                                  );

                                if (col.isActions)
                                  return (
                                    <span key={colIndex} className="actions">
                                      <button
                                        onClick={() => handleEditGame(row)}
                                        className="icon-btn edit"
                                      >
                                        <FaEdit />
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteGame(row.name)
                                        }
                                        className="icon-btn delete"
                                      >
                                        <FaTrash />
                                      </button>
                                    </span>
                                  );

                                return (
                                  <span key={colIndex}>
                                    {row[col.key] || "—"}
                                  </span>
                                );
                              })}
                            </li>
                          ))}
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
                setShowGameForm(false);
                setEditGameData(null);
                setDeleteGame(null);
              }}
            />

            {showGameForm && (
              <DashboardForm
                title={editGameData ? "Edit Game" : "Add Game"}
                mode={editGameData ? "edit" : "create"}
                fields={gameFields}
                initialData={editGameData || {}}
                onClose={() => {
                  setShowGameForm(false);
                  setEditGameData(null);
                }}
                onSubmit={handleSaveGame}
              />
            )}

            {deleteGame && (
              <DeleteModal
                name={deleteGame}
                onCancel={() => setDeleteGame(null)}
                onConfirm={confirmDeleteGame}
              />
            )}
          </>
        )}
      </main>
      {toast && (
        <Toast
          type={toast?.type}
          message={toast?.message}
          isVisible={!!toast}
        />
      )}
    </>
  );
}
