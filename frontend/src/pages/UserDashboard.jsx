import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/dashboard.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import DashboardForm from "../components/DashboardForm";
import Overlay from "../components/Overlay";
import ConfirmModal from "../components/ConfirmModal";
import {
  FaTrash,
  FaEdit,
  FaTruck,
  FaCheck,
  FaShoppingBasket,
  FaList,
  FaPlus,
} from "react-icons/fa";
import { MdReport, MdChatBubble } from "react-icons/md";
import Toast from "../components/Toast";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";
import { FormatDate } from "../components/FormatDate";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";

// TODO: Replace borrowed games, listings and history data and connect to backend API (current borrowed games, rental history, active listings, listing history endpoint)

// ! ---------------- HELPERS ----------------

const ROLE_CONFIG = {
  regular: {
    maxListings: 6,
    maxBorrows: 3,
    protectionFeeMin: 6,
    protectionFeeMax: 10,
    gracePeriod: 0,
    hasPrioritySupport: false,
    hasBadge: false,
  },

  premium: {
    maxListings: Infinity,
    maxBorrows: 10,
    protectionFeeCap: 6,
    gracePeriod: 2,
    hasPrioritySupport: true,
    hasBadge: true,
  },
};

const STATUS = {
  AVAILABLE: "available",
  PENDING: "pending",
  DELIVERING: "delivering",
  RENTED: "rented",
  RETURNING: "returning",
  RETURNED: "returned",
  OVERDUE: "overdue",
};

const ACTIONS = {
  EDIT: "edit",
  DELETE: "delete",
  DELIVERY_CONFIRM: "delivery_confirm",
  RETURN_START: "return_start",
  RETURN_CONFIRM: "return_confirm",
};

const CONFIRM_CONFIG = {
  [ACTIONS.DELETE]: {
    title: "Confirm Deletion",
    message: "Are you sure you want to delete this game?",
    confirmText: "Delete",
  },

  [ACTIONS.DELIVERY_CONFIRM]: {
    title: "Confirm Delivery",
    message: "Have you received this game?",
    confirmText: "Confirm",
  },

  [ACTIONS.RETURN_START]: {
    title: "Confirm Return",
    message: "Are you sure you want return this game?",
    confirmText: "Confirm",
  },

  [ACTIONS.RETURN_CONFIRM]: {
    title: "Confirm Return",
    message: "Has this game been returned?",
    confirmText: "Confirm",
  },
};

const PLATFORM_MODELS = {
  Xbox: ["Xbox One", "Xbox Series S", "Xbox Series X"],
  PlayStation: ["PS4", "PS4 Pro", "PS5"],
  Nintendo: ["Switch", "Switch OLED", "Switch Lite"],
};

const calculateDueDate = (startDate, borrowDuration) => {
  const start = startDate ? new Date(startDate) : new Date();

  const due = new Date(start);
  due.setDate(due.getDate() + Number(borrowDuration));

  return due;
};

const isOverdue = (startDate, borrowDuration, role) => {
  if (!startDate) return false;

  const start = new Date(startDate);
  const due = new Date(start);

  const grace = ROLE_CONFIG[role]?.gracePeriod || 0;

  // * Add a grace period to the due date
  due.setDate(due.getDate() + Number(borrowDuration) + grace);

  return new Date() > due;
};

// ! ---------------- LENDER SIDE ----------------

/*
  ! Lender Status Logic (Owner Side)
  * Determines state of a listed game
  ? Used for lender's listing availability
*/
const getLenderStatus = (game, role) => {
  const status = game.status?.toLowerCase();
  const overdue = isOverdue(game.startDate, game.borrowDuration, role);

  if (status === STATUS.PENDING) return STATUS.PENDING;
  if (status === STATUS.DELIVERING) return STATUS.DELIVERING;
  if (status === STATUS.RETURNED) return STATUS.RETURNED;
  if (status === STATUS.RETURNING) return STATUS.RETURNING;

  if (!game.rentedBy) return STATUS.AVAILABLE;

  if (overdue) return STATUS.OVERDUE;

  return STATUS.RENTED;
};

const getLenderActions = (game) => {
  const status = getLenderStatus(game);

  switch (status) {
    case STATUS.AVAILABLE:
      return ["edit", "delete"];

    case STATUS.DELIVERING:
      return ["chat"];

    case STATUS.RENTED:
      return ["chat"];

    case STATUS.RETURNING:
      return ["chat", "confirm_return"];

    case STATUS.OVERDUE:
      return ["chat", "report"];

    default:
      return [];
  }
};

// ! ---------------- BORROWER SIDE ----------------

/*
  ! Borrow Status Logic (Renter Side)
  * Determines state of a rented game
  ? Used for UI status badges
*/
const getBorrowStatus = (game, role) => {
  const status = game.status?.toLowerCase();
  const overdue = isOverdue(game.startDate, game.borrowDuration, role);

  if (status === STATUS.DELIVERING) return STATUS.DELIVERING;
  if (status === STATUS.RETURNING) return STATUS.RETURNING;
  if (status === STATUS.RETURNED) return STATUS.RETURNED;

  if (overdue) return STATUS.OVERDUE;

  return STATUS.RENTED;
};

const getBorrowerActions = (game) => {
  const status = getBorrowStatus(game);

  switch (status) {
    case STATUS.DELIVERING:
      return ["chat", "confirm_delivery"];

    case STATUS.RETURNING:
      return ["chat"];

    case STATUS.RENTED:
    case STATUS.OVERDUE:
      return ["chat", "return"];

    default:
      return [];
  }
};

// ! ---------------- COLUMNS CONFIG ----------------

const COLS = {
  text: (label, key) => ({ label, key }),
  image: { label: "Image", key: "image", isImage: true },
  platform: { label: "Platform", key: "platform", isIcon: true },
  status: { label: "Status", key: "status", isStatus: true },
  date: (label, key) => ({ label, key, isDate: true }),
  actions: { label: "Actions", key: "actions", isActions: true },
};

export default function Dashboard() {
  // ! ---------------- UI STATES ----------------

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeTab, setActiveTab] = useState("borrowed_games");

  // ! ---------------- USER ROLE ----------------
  const role = user?.role || "regular";
  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG.regular;

  /*
    ! Modal State Grouping
    * True if any modal is open
  */
  const isAnyModalOpen = showForm || !!confirmAction;

  const tabs = [
    {
      key: "borrowed_games",
      icon: FaShoppingBasket,
      label: "My Borrowed Games",
    },
    {
      key: "listings",
      icon: FaList,
      label: "My Listings",
    },
  ];

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ! ---------------- LENDER DATABASE ----------------

  /*
    ! State: Pending Listings
    * Games currently sent to the admin for approval
  */
  const [pendingListings, setPendingListings] = useState([
    {
      id: 101,
      name: "Red Dead Redemption 2",
      platform: "PlayStation",
      consoleModel: "PS4",
      price: 130,
      genre: ["Action"],
      tag: ["Open World"],
      status: "Pending",
      about: "Excellent condition disc, original case included.",
      borrowDuration: 180,
      hasExpansions: "no",
      deliveryMethod: "Meet-up",
      image: hogwarts,
    },
    {
      id: 102,
      name: "Cyberpunk 2077",
      platform: "Xbox",
      consoleModel: "Xbox One",
      price: 90,
      genre: ["RPG"],
      tag: ["Futuristic"],
      status: "Pending",
      about: "Updated version with DLC expansion.",
      borrowDuration: 90,
      hasExpansions: "yes",
      deliveryMethod: "Drop-off",
      image: pokemon,
    },
    {
      id: 103,
      name: "Animal Crossing: New Horizons",
      platform: "Nintendo",
      consoleModel: "Switch",
      price: 70,
      genre: ["Simulation"],
      tag: ["Relaxing"],
      status: "Pending",
      about: "Lightly used cartridge in perfect condition.",
      borrowDuration: 60,
      hasExpansions: "yes",
      deliveryMethod: "Pick-up",
      image: donkeyKong,
    },
  ]);

  /*
    ! State: Active Listings
    * Games currently listed by the user
  */
  const [listedGames, setListedGames] = useState([
    {
      id: 3,
      name: "Call of Duty MW3",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      price: 110,
      genre: ["Shooter"],
      tag: ["Competitive"],
      status: "rented",
      rentedBy: "PlayerTwo",
      startDate: "2026-04-10",
      dueDate: "2026-04-15", // should now be overdue
      about: "Disc in perfect condition.",
      borrowDuration: 5,
      hasExpansions: "no",
      deliveryMethod: "Meet-up",
      image: pokemon,
    },

    {
      id: 4,
      name: "Spider-Man 2",
      platform: "PlayStation",
      consoleModel: "PS5",
      price: 150,
      genre: ["Action"],
      tag: ["Story Rich"],
      status: "returning",
      rentedBy: "PlayerThree",
      startDate: "2026-04-12",
      dueDate: "2026-04-20",
      about: "Includes bonus content.",
      borrowDuration: 8,
      hasExpansions: "yes",
      deliveryMethod: "Drop-off",
      image: hogwarts,
    },

    {
      id: 5,
      name: "Forza Horizon 5",
      platform: "Xbox",
      consoleModel: "Xbox Series S",
      price: 100,
      genre: ["Racing"],
      tag: ["Open World"],
      status: "available",
      rentedBy: null,
      startDate: null,
      dueDate: null,
      about: "Like new condition.",
      borrowDuration: 120,
      hasExpansions: "yes",
      deliveryMethod: "Pick-up",
      image: donkeyKong,
    },
    {
      id: 6,
      name: "The Legend of Zelda: Tears of the Kingdom",
      platform: "Nintendo",
      consoleModel: "Switch OLED",
      price: 160,
      genre: ["Adventure"],
      tag: ["Open World"],
      status: "delivering",
      rentedBy: "PlayerFour",
      startDate: null,
      dueDate: null,
      about: "On its way to the borrower.",
      borrowDuration: 7,
      hasExpansions: "no",
      deliveryMethod: "Drop-off",
      image: zelda,
    },
    {
      id: 7,
      name: "Elden Ring",
      platform: "PlayStation",
      consoleModel: "PS5",
      price: 140,
      genre: ["RPG"],
      tag: ["Challenging"],
      status: "rented",
      rentedBy: "PlayerFive",
      startDate: "2026-04-14",
      dueDate: "2026-04-24",
      about: "Highly rated RPG, well maintained disc.",
      borrowDuration: 10,
      hasExpansions: "yes",
      deliveryMethod: "Meet-up",
      image: indianaJones,
    },
  ]);

  /*
    ! Listing History
    * Past listings owned by user
  */
  const listingHistory = [
    {
      id: 1,
      name: "Hogwarts Legacy",
      platform: "Nintendo",
      consoleModel: "Switch",
      rentedBy: "PlayerFour",
      startDate: "2026-03-18",
      dueDate: "2026-03-21",
      returnedOn: "2026-03-22",
      price: 120,
      genre: ["Adventure"],
      tag: ["Open World"],
      about: "No scratches, well maintained disc.",
      borrowDuration: 240,
      hasExpansions: "yes",
      deliveryMethod: "Meet-up",
      image: indianaJones,
    },
  ];

  // ! ---------------- BORROWER DATABASE ----------------

  /*
    ! Borrowed Games (Current)
    * Games user is currently renting
  */
  const [borrowedGames, setBorrowedGames] = useState([
    {
      id: 2,
      name: "Elden Ring",
      platform: "PlayStation",
      consoleModel: "PS5",
      listedBy: "PlayerSix",
      status: "rented",
      startDate: "2026-04-10",
      dueDate: "2026-04-25",
      price: 140,
      genre: ["RPG"],
      tag: ["Challenging"],
      about: "Hardcore RPG experience.",
      borrowDuration: 15,
      hasExpansions: "yes",
      deliveryMethod: "Meet-up",
      image: indianaJones,
    },

    {
      id: 3,
      name: "Halo Infinite",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      listedBy: "PlayerSeven",
      status: "returned",
      startDate: "2026-04-05",
      dueDate: "2026-04-15",
      price: 80,
      genre: ["Shooter"],
      tag: ["Multiplayer"],
      about: "Includes multiplayer pass.",
      borrowDuration: 10,
      hasExpansions: "no",
      deliveryMethod: "Drop-off",
      image: pokemon,
    },

    {
      id: 4,
      name: "Zelda Tears of the Kingdom",
      platform: "Nintendo",
      consoleModel: "Switch OLED",
      listedBy: "PlayerEight",
      status: "delivering",
      startDate: null,
      dueDate: null,
      price: 160,
      genre: ["Adventure"],
      tag: ["Open World"],
      about: "Brand new sealed.",
      borrowDuration: 7,
      hasExpansions: "no",
      deliveryMethod: "Pick-up",
      image: zelda,
    },

    {
      id: 5,
      name: "NBA 2K24",
      platform: "PlayStation",
      consoleModel: "PS4",
      listedBy: "PlayerNine",
      status: "rented",
      startDate: "2026-04-01",
      dueDate: "2026-04-05", // overdue
      price: 75,
      genre: ["Sports"],
      tag: ["Competitive"],
      about: "Used but good condition.",
      borrowDuration: 4,
      hasExpansions: "no",
      deliveryMethod: "Meet-up",
      image: donkeyKong,
    },
  ]);
  /*
    ! Borrowed Games History
    * Past borrowed games completed by user
  */
  const borrowedGamesHistory = [
    {
      id: 1,
      name: "Breath of the Wild",
      platform: "Nintendo",
      consoleModel: "Switch OLED",
      listedBy: "PlayerThree",
      startDate: "2026-03-20",
      dueDate: "2026-03-27",
      returnedOn: "2026-03-28",
      price: 150,
      genre: ["Adventure"],
      tag: ["Open World"],
      about: "Complete edition in excellent condition.",
      borrowDuration: 500,
      hasExpansions: "yes",
      deliveryMethod: "Meet-up",
      image: zelda,
    },
  ];

  const isActiveBorrow = (game) => {
    const status = game.status?.toLowerCase();

    return status !== "returned";
  };

  const activeBorrowedGames = borrowedGames.filter(isActiveBorrow).length;

  const activeListings = listedGames.filter(
    (game) => game.status?.toLowerCase() !== "returned",
  ).length;

  const totalListings = activeListings + pendingListings.length;

  // ! ---------------- LENDER HANDLERS ----------------

  /*
    ! Create / Update Listing
    * Handles both new listing creation and edits
  */
  const handleSaveListing = (newListing) => {
    if (editData) {
      setListedGames((prev) => prev.filter((l) => l.id !== editData.id));

      const updatedItem = {
        ...editData,
        name: newListing.name,
        platform: newListing.platform,
        consoleModel: newListing.consoleModel,
        price: Number(newListing.price),
        genre: newListing.genre,
        tag: newListing.tag,
        about: newListing.about,
        borrowDuration: newListing.borrowDuration,
        hasExpansions: newListing.hasExpansions,
        deliveryMethod: newListing.deliveryMethod,
        image: newListing.image,
        status: "Pending",
      };

      setPendingListings((prev) =>
        prev.map((item) => (item.id === editData.id ? updatedItem : item)),
      );

      setToast({
        color: "blue",
        icon: "edit",
        title: newListing.name,
        message: "sent for re-approval!",
      });
    } else {
      if (totalListings >= currentRole.maxListings) {
        setToast({
          color: "red",
          title: "Limit reached",
          message: `You can only list ${currentRole.maxListings} games. Upgrade to Premium for unlimited listings.`,
        });
        return;
      }

      const newItem = {
        id: Date.now(),
        name: newListing.name,
        platform: newListing.platform,
        consoleModel: newListing.consoleModel,
        rentedBy: null,
        daysLeft: null,
        startDate: null,
        dueDate: null,
        status: "Pending",
        price: Number(newListing.price),
        genre: newListing.genre,
        tag: newListing.tag,
        about: newListing.about,
        borrowDuration: newListing.borrowDuration,
        hasExpansions: newListing.hasExpansions,
        deliveryMethod: newListing.deliveryMethod,
        image: newListing.image,
      };

      setPendingListings((prev) => [newItem, ...prev]);

      setToast({
        color: "green",
        icon: "plus",
        title: newListing.name,
        message: "is pending admin approval!",
      });
    }

    setShowForm(false);
    setEditData(null);
  };

  /*
    ! Edit Listing 
    * Opens form pre-filled with data
  */
  const handleEditListing = (listing) => {
    setEditData(listing);
    setShowForm(true);
  };

  /*
  ! Confirm Returned
  * Confirms that a rented game has been returned to the lender
*/
  const handleConfirmReturned = () => {
    const game = confirmAction?.game;

    if (!game) return;

    setListedGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              status: "returned",
            }
          : g,
      ),
    );

    setToast({
      color: "blue",
      icon: "check",
      title: game?.name || "Return Confirmed",
      message: "Game marked as returned.",
    });

    setConfirmAction(null);
  };

  /*
  ! Confirm Delete 
  * Permanently removes a game from the listed games state
  ? Triggered from ConfirmModal when user confirms deletion
*/
  const handleConfirmDelete = () => {
    const game = confirmAction?.game;
    if (!game) return;

    setListedGames((prev) => prev.filter((l) => l.id !== game.id));
    setPendingListings((prev) => prev.filter((l) => l.id !== game.id));

    setToast({
      color: "red",
      icon: "error",
      title: game?.name,
      message: "was deleted successfully!",
    });

    setConfirmAction(null);
  };

  // ! ---------------- BORROWER HANDLERS ----------------

  /*
  ! Confirm Returning 
  * Marks a game as being returned by the borrower
*/
  const handleConfirmReturning = () => {
    const game = confirmAction?.game;

    if (!game) return;

    setBorrowedGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              status: "returning",
            }
          : g,
      ),
    );

    setToast({
      color: "blue",
      icon: "truck",
      title: game?.name,
      message: "will be returned.",
    });

    setConfirmAction(null);
  };

  /*
  ! Confirm Delivery 
  * Marks a game delivery as confirmed by the borrower
*/
  const handleConfirmDelivery = () => {
    const game = confirmAction?.game;

    if (!game) return;

    const today = new Date();

    const startDate = today.toISOString();
    const dueDate = calculateDueDate(today, game.borrowDuration).toISOString();

    setBorrowedGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              status: "rented",
              startDate,
              dueDate,
            }
          : g,
      ),
    );

    setToast({
      color: "green",
      icon: "check",
      title: game?.name,
      message: "is now marked as rented.",
    });

    setConfirmAction(null);
  };

  /*
  ! Listing Form Fields
  * Used for create + edit listing
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
      name: "image",
      label: "Image File",
      type: "file",
      placeholder: "Image path or URL",
      isValid: (data) => !!data.image,
    },

    {
      name: "genre",
      label: "Genre",
      type: "checkbox",
      inputClass: "radio-ctr",
      options: [
        "Action",
        "Adventure",
        "RPG",
        "Shooter",
        "Sports",
        "Racing",
        "Simulation",
        "Horror",
        "Puzzle",
        "Sandbox",
      ],
      isValid: (data) => Array.isArray(data.genre) && data.genre.length > 0,
    },

    {
      name: "tag",
      label: "Tag",
      type: "checkbox",
      inputClass: "radio-ctr",
      options: [
        "Single Player",
        "Multiplayer",
        "Co-op",
        "Competitive",
        "Open World",
        "Story Rich",
        "Casual",
        "Family Friendly",
      ],
      isValid: (data) => Array.isArray(data.tag) && data.tag.length > 0,
    },

    {
      name: "about",
      label: "About the Item",
      type: "textarea",
      placeholder: "Describe condition, inclusions, notes, etc.",
      isValid: (data) => data.about?.trim().length > 10,
    },

    {
      name: "borrowDuration",
      label: "Borrow Duration (Days)",
      type: "number",
      placeholder: "e.g. 10",
      isValid: (data) =>
        Number(data.borrowDuration) > 0 && !isNaN(data.borrowDuration),
    },

    {
      name: "platform",
      label: "Platform",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["Xbox", "PlayStation", "Nintendo"],
      isValid: (data) => data.platform?.trim() !== "",
    },

    {
      name: "consoleModel",
      label: "Console Model",
      type: "radio",
      inputClass: "radio-ctr",
      options: (data) => PLATFORM_MODELS[data.platform] || [],
      isValid: (data) => !!data.consoleModel,
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
      name: "price",
      label: "Original Price (AED)",
      type: "number",
      placeholder: "Enter price",
      isValid: (data) => Number(data.price) > 0,
    },

    {
      name: "deliveryMethod",
      label: "Delivery Method",
      type: "radio",
      inputClass: "radio-ctr",
      options: ["Pick-up", "Meet-up", "Drop-off"],
      isValid: (data) => !!data.deliveryMethod,
    },
  ];

  /*
    ! Dashboard Table Configuration
    * Controls how tables are rendered dynamically
  */
  const USER_TABLES = [
    {
      sectionTitle: "My Borrowed Games",
      tables: [
        {
          title: "Active Borrowed Games",
          data: borrowedGames,
          statusFn: getBorrowStatus,
          columns: [
            COLS.text("Listed By", "listedBy"),
            COLS.text("Game", "name"),
            COLS.platform,
            COLS.text("Console Model", "consoleModel"),
            COLS.text("Price (AED)", "price"),
            COLS.image,
            COLS.text("About", "about"),
            COLS.text("Genre", "genre"),
            COLS.text("Tag", "tag"),
            COLS.text("Expansions", "hasExpansions"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.status,
            COLS.text("Borrow Duration (Days)", "borrowDuration"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.actions,
          ],
        },
        {
          title: "Borrowed Games History",
          data: borrowedGamesHistory,
          columns: [
            COLS.text("Listed By", "listedBy"),
            COLS.text("Game", "name"),
            COLS.platform,
            COLS.text("Console Model", "consoleModel"),
            COLS.text("Price (AED)", "price"),
            COLS.image,
            COLS.text("About", "about"),
            COLS.text("Genre", "genre"),
            COLS.text("Tag", "tag"),
            COLS.text("Expansions", "hasExpansions"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.text("Borrow Duration (Days)", "borrowDuration"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.date("Returned On", "returnedOn"),
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
          statusFn: getLenderStatus,
          columns: [
            COLS.text("Game", "name"),
            COLS.platform,
            COLS.text("Console Model", "consoleModel"),
            COLS.text("Price (AED)", "price"),
            COLS.image,
            COLS.text("About", "about"),
            COLS.text("Genre", "genre"),
            COLS.text("Tag", "tag"),
            COLS.text("Expansions", "hasExpansions"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.text("Borrow Duration (Days)", "borrowDuration"),
            COLS.status,
            COLS.actions,
          ],
        },
        {
          title: "Active Listings",
          data: listedGames,
          statusFn: getLenderStatus,
          columns: [
            COLS.text("Rented By", "rentedBy"),
            COLS.text("Game", "name"),
            COLS.platform,
            COLS.text("Console Model", "consoleModel"),
            COLS.text("Price (AED)", "price"),
            COLS.image,
            COLS.text("About", "about"),
            COLS.text("Genre", "genre"),
            COLS.text("Tag", "tag"),
            COLS.text("Expansions", "hasExpansions"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.status,
            COLS.text("Borrow Duration (Days)", "borrowDuration"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.actions,
          ],
        },
        {
          title: "Listing History",
          data: listingHistory,
          columns: [
            COLS.text("Rented By", "rentedBy"),
            COLS.text("Game", "name"),
            COLS.platform,
            COLS.text("Console Model", "consoleModel"),
            COLS.text("Price (AED)", "price"),
            COLS.image,
            COLS.text("About", "about"),
            COLS.text("Genre", "genre"),
            COLS.text("Tag", "tag"),
            COLS.text("Expansions", "hasExpansions"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.text("Borrow Duration (Days)", "borrowDuration"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.date("Returned On", "returnedOn"),
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
        {USER_TABLES.filter((section) =>
          activeTab === "borrowed_games"
            ? section.sectionTitle === "My Borrowed Games"
            : section.sectionTitle === "My Listings",
        ).map((section, i) => (
          <section className="dashboard-content" key={i}>
            <div className="title">
              <h2>{section.sectionTitle}</h2>
            </div>

            {section.tables.map((table, j) => (
              <div key={j}>
                <div className="table-header">
                  <h4>{table.title}</h4>

                  {table.title === "Active Borrowed Games" && (
                    <Link to="/games" className="table-action-link">
                      <FaShoppingBasket className="icon" />
                      <span>
                        {currentRole.maxBorrows === Infinity
                          ? "Browse More Games"
                          : `Browse More Games (${activeBorrowedGames}/${currentRole.maxBorrows})`}
                      </span>
                    </Link>
                  )}

                  {table.title === "Active Listings" && (
                    <button
                      className="table-action-link"
                      onClick={() => {
                        if (totalListings >= currentRole.maxListings) {
                          setToast({
                            color: "red",
                            title: "Limit reached",
                            message: `You can only list ${currentRole.maxListings} games. Upgrade to Premium for unlimited listings.`,
                          });
                          return;
                        }

                        setShowForm(true);
                      }}
                    >
                      <FaPlus className="icon" />

                      <span>
                        {currentRole.maxListings === Infinity
                          ? "Create Listing"
                          : `Create Listing (${totalListings}/${currentRole.maxListings})`}
                      </span>
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
                          ? table.statusFn(row, role)
                          : null;

                        return (
                          <li key={rowIndex}>
                            {table.columns.map((col, colIndex) => {
                              {
                                // ! ICONS
                              }
                              if (col.isIcon)
                                return (
                                  <GetPlatformIcon
                                    platform={row[col.key]}
                                    key={colIndex}
                                  />
                                );
                              {
                                // ! IMAGES
                              }
                              if (col.isImage)
                                return (
                                  <span key={colIndex}>
                                    <img
                                      src={row[col.key]}
                                      alt={row.name}
                                      className="table-image"
                                    />
                                  </span>
                                );

                              {
                                // ! STATUS
                              }
                              if (col.isStatus) {
                                const statusLabels = {
                                  available: "Available",
                                  pending: "Pending",
                                  delivering: "Delivering",
                                  rented: "Rented",
                                  returning: "Returning",
                                  returned: "Returned",
                                  overdue: "Overdue",
                                };

                                return (
                                  <span
                                    key={colIndex}
                                    className={`status ${statusClass}`}
                                  >
                                    {statusLabels[statusClass] || "—"}
                                  </span>
                                );
                              }

                              {
                                // ! DATES
                              }
                              if (col.isDate) {
                                return (
                                  <span key={colIndex}>
                                    {FormatDate(row[col.key])}
                                  </span>
                                );
                              }

                              {
                                // ! ACTIONS
                              }
                              if (col.isActions) {
                                let actions = [];

                                if (table.title === "Active Listings") {
                                  actions = getLenderActions(row);
                                } else if (table.title === "Pending Listings") {
                                  actions = ["edit", "delete"];
                                } else {
                                  actions = getBorrowerActions(row);
                                }

                                if (!actions.length) {
                                  return (
                                    <span
                                      key={colIndex}
                                      className="actions none"
                                    >
                                      —
                                    </span>
                                  );
                                }
                                return (
                                  <span key={colIndex} className="actions">
                                    {actions.includes("chat") && (
                                      <button className="icon-btn chat">
                                        <MdChatBubble /> Chat
                                      </button>
                                    )}

                                    {actions.includes("report") && (
                                      <button className="icon-btn report">
                                        <MdReport /> Report
                                      </button>
                                    )}

                                    {actions.includes("edit") && (
                                      <button
                                        className="icon-btn edit"
                                        onClick={() => handleEditListing(row)}
                                      >
                                        <FaEdit /> Edit
                                      </button>
                                    )}

                                    {actions.includes("delete") && (
                                      <button
                                        className="icon-btn delete"
                                        onClick={() =>
                                          setConfirmAction({
                                            type: ACTIONS.DELETE,
                                            game: row,
                                          })
                                        }
                                      >
                                        <FaTrash /> Delete
                                      </button>
                                    )}

                                    {actions.includes("return") && (
                                      <button
                                        className="icon-btn return"
                                        onClick={() =>
                                          setConfirmAction({
                                            type: ACTIONS.RETURN_START,
                                            game: row,
                                          })
                                        }
                                      >
                                        <FaTruck /> Return
                                      </button>
                                    )}

                                    {actions.includes("confirm_delivery") && (
                                      <button
                                        className="icon-btn confirm"
                                        onClick={() =>
                                          setConfirmAction({
                                            type: ACTIONS.DELIVERY_CONFIRM,
                                            game: row,
                                          })
                                        }
                                      >
                                        <FaCheck /> Confirm
                                      </button>
                                    )}

                                    {actions.includes("confirm_return") && (
                                      <button
                                        className="icon-btn confirm"
                                        onClick={() =>
                                          setConfirmAction({
                                            type: ACTIONS.RETURN_CONFIRM,
                                            game: row,
                                          })
                                        }
                                      >
                                        <FaCheck /> Confirm
                                      </button>
                                    )}
                                  </span>
                                );
                              }

                              return (
                                <span key={colIndex}>
                                  {Array.isArray(row[col.key])
                                    ? row[col.key].join(", ")
                                    : row[col.key] || "—"}
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
            setConfirmAction(null);
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

        {confirmAction &&
          (() => {
            const config = CONFIRM_CONFIG[confirmAction.type];

            return (
              <ConfirmModal
                title={config.title}
                message={config.message}
                itemName={confirmAction.game?.name}
                confirmText={config.confirmText}
                cancelText="Cancel"
                onCancel={() => setConfirmAction(null)}
                onConfirm={() => {
                  switch (confirmAction.type) {
                    case ACTIONS.DELETE:
                      handleConfirmDelete(confirmAction.game);
                      break;

                    case ACTIONS.DELIVERY_CONFIRM:
                      handleConfirmDelivery(confirmAction.game);
                      break;

                    case ACTIONS.RETURN_START:
                      handleConfirmReturning(confirmAction.game);
                      break;

                    case ACTIONS.RETURN_CONFIRM:
                      handleConfirmReturned(confirmAction.game);
                      break;
                  }

                  setConfirmAction(null);
                }}
              />
            );
          })()}
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
