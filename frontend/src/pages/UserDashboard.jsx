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
import { FormatDate } from "../components/FormatDate";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  Xbox: ["Xbox", "Xbox 360", "Xbox One", "Xbox Series X"],
  PlayStation: [
    "Playstation",
    "Playstation 2",
    "Playstation 3",
    "Playstation 4",
    "Playstation 5",
  ],
  Nintendo: [
    "Nintendo Entertainment System",
    "Super Nintendo Entertainment System",
    "Nintendo 64",
    "Nintendo GameCube",
    "Wii",
    "Wii U",
    "Nintendo Switch",
  ],
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

  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeTab, setActiveTab] = useState("borrowed_games");
  const [formMode, setFormMode] = useState(null); // null | "create" | "edit" | "report"
  const [formData, setFormData] = useState(null);

  // ! ---------------- API STATES ----------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // ! ---------------- USER ROLE ----------------
  const role = user?.role || "regular";
  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG.regular;

  /*
    ! Modal State Grouping
    * True if any modal is open
  */
  const isAnyModalOpen = formMode !== null || !!confirmAction;

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
    {
      key: "reports",
      icon: MdReport,
      label: "My Reports",
    },
  ];

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ! ---------------- API HELPER FUNCTIONS ----------------

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const handleApiError = (err, customMessage = "An error occurred") => {
    console.error(customMessage, err);
    setError(err.message || customMessage);
    setToast({
      color: "red",
      title: "Error",
      message: err.message || customMessage,
    });
  };

  // ! ---------------- DATA FETCHING ----------------

  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch listings
      const listingsRes = await fetch(`${API_URL}/dashboard/listings/my`, {
        headers: getAuthHeaders(),
      });

      if (!listingsRes.ok) {
        throw new Error("Failed to fetch listings");
      }

      const listingsData = await listingsRes.json();

      if (listingsData.success) {
        setPendingListings(listingsData.data.pending || []);
        setListedGames(listingsData.data.active || []);
        setListingHistory(listingsData.data.history || []);
      }

      // Fetch borrowed games
      const rentalsRes = await fetch(
        `${API_URL}/dashboard/rentals/my-borrowed`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!rentalsRes.ok) {
        throw new Error("Failed to fetch borrowed games");
      }

      const rentalsData = await rentalsRes.json();

      if (rentalsData.success) {
        setBorrowedGames(rentalsData.data.active || []);
        setBorrowedGamesHistory(rentalsData.data.history || []);
      }

      // Fetch reports
      const reportsRes = await fetch(`${API_URL}/dashboard/reports/my`, {
        headers: getAuthHeaders(),
      });

      if (!reportsRes.ok) {
        throw new Error("Failed to fetch reports");
      }

      const reportsData = await reportsRes.json();

      if (reportsData.success) {
        setReportedUsers(reportsData.data.reports || []);
      }

      setDataFetched(true);
    } catch (err) {
      handleApiError(err, "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && !dataFetched) {
      fetchDashboardData();
    }
  }, [token]);

  // ! ---------------- LENDER DATABASE ----------------

  /*
    ! State: Pending Listings
    * Games currently sent to the admin for approval
  */
  const [pendingListings, setPendingListings] = useState([]);

  /*
    ! State: Active Listings
    * Games currently listed by the user
  */
  const [listedGames, setListedGames] = useState([]);

  /*
    ! Listing History
    * Past listings owned by user
  */
  const [listingHistory, setListingHistory] = useState([]);

  // ! ---------------- BORROWER DATABASE ----------------

  /*
    ! Borrowed Games (Current)
    * Games user is currently renting
  */
  const [borrowedGames, setBorrowedGames] = useState([]);

  /*
    ! Borrowed Games History
    * Past borrowed games completed by user
  */
  const [borrowedGamesHistory, setBorrowedGamesHistory] = useState([]);

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
    * Handles both new listing creation and edits via API
  */
  const handleSaveListing = async (newListing) => {
    try {
      // Debug: Check image data
      console.log("handleSaveListing called");
      console.log("newListing.image:", newListing.image);
      console.log("is File?", newListing.image instanceof File);
      console.log("is String?", typeof newListing.image === "string");

      // Calculate borrowDuration from startDate and endDate
      if (newListing.startDate && newListing.endDate) {
        const start = new Date(newListing.startDate);
        const end = new Date(newListing.endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (diffDays < 1 || diffDays > 30) {
          setToast({
            color: "red",
            title: "Invalid Dates",
            message: "Borrow period must be between 1 and 30 days",
          });
          return;
        }

        newListing.borrowDuration = diffDays;
        newListing.dueDate = newListing.endDate;
      }

      // Prepare form data for file upload
      const submitFormData = new FormData();
      submitFormData.append("name", newListing.name);
      submitFormData.append("platform", newListing.platform);
      submitFormData.append("consoleModel", newListing.consoleModel);
      submitFormData.append("price", newListing.price);
      submitFormData.append("about", newListing.about);
      submitFormData.append("borrowDuration", newListing.borrowDuration);
      submitFormData.append("deliveryMethod", newListing.deliveryMethod);

      // Handle arrays and optional fields
      newListing.genre.forEach((g) => {
        submitFormData.append("genre", g);
      });
      newListing.tag.forEach((t) => {
        submitFormData.append("tag", t);
      });

      if (newListing.hasExpansions) {
        submitFormData.append("hasExpansions", newListing.hasExpansions);
      }

      if (newListing.commercialBulking) {
        submitFormData.append(
          "commercialBulking",
          newListing.commercialBulking,
        );
      }

      // Handle image - append file if it's a File object
      if (newListing.image instanceof File) {
        submitFormData.append("image", newListing.image);
      } else if (typeof newListing.image === "string" && newListing.image) {
        submitFormData.append("image", newListing.image);
      }

      if (formMode === "edit") {
        // Update existing listing
        const response = await fetch(
          `${API_URL}/dashboard/listings/${formData._id || formData.id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: submitFormData,
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update listing");
        }

        const data = await response.json();

        // Update local state
        setListedGames((prev) =>
          prev.filter((l) => (l._id || l.id) !== (formData._id || formData.id)),
        );
        setPendingListings((prev) => {
          const exists = prev.some(
            (l) =>
              (l._id || l.id) ===
              (data.data.listing._id || data.data.listing.id),
          );

          if (exists) {
            return prev.map((l) =>
              (l._id || l.id) ===
              (data.data.listing._id || data.data.listing.id)
                ? data.data.listing
                : l,
            );
          }

          return [data.data.listing, ...prev];
        });

        setToast({
          color: "blue",
          icon: "edit",
          title: newListing.name,
          message: "sent for re-approval!",
        });
      } else {
        // Check listing limits
        if (totalListings >= currentRole.maxListings) {
          setToast({
            color: "red",
            title: "Limit reached",
            message: `You can only list ${currentRole.maxListings} games. Upgrade to Premium for unlimited listings.`,
          });
          return;
        }

        // Create new listing
        const response = await fetch(`${API_URL}/dashboard/listings`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: submitFormData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create listing");
        }

        const data = await response.json();

        // Update local state
        setPendingListings((prev) => [data.data.listing, ...prev]);

        setToast({
          color: "green",
          icon: "plus",
          title: newListing.name,
          message: "is pending admin approval!",
        });
      }

      setFormMode(null);
      setFormData(null);
    } catch (err) {
      handleApiError(
        err,
        formMode === "edit"
          ? "Failed to update listing"
          : "Failed to create listing",
      );
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  /*
    ! Edit Listing 
    * Opens form pre-filled with data
  */
  const handleEditListing = (listing) => {
    setFormMode("edit");

    setFormData({
      ...listing,
      startDate: formatDateForInput(listing.startDate),
      endDate: formatDateForInput(listing.dueDate),
    });
  };

  /*
  ! Confirm Returned
  * Confirms that a rented game has been returned to the lender via API
*/
  const handleConfirmReturned = async () => {
    const game = confirmAction?.game;

    if (!game) return;

    try {
      const rentalId = game._id || game.id;

      const response = await fetch(
        `${API_URL}/dashboard/rentals/${rentalId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "returned" }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to confirm return");
      }

      // Update local state
      setListedGames((prev) =>
        prev.map((g) =>
          (g._id || g.id) === (game._id || game.id)
            ? { ...g, status: "returned" }
            : g,
        ),
      );

      setToast({
        color: "blue",
        icon: "check",
        title: game?.name || "Return Confirmed",
        message: "Game marked as returned.",
      });
    } catch (err) {
      handleApiError(err, "Failed to confirm return");
    }

    setConfirmAction(null);
  };

  /*
  ! Confirm Delete 
  * Permanently removes a game from the backend via API
  ? Triggered from ConfirmModal when user confirms deletion
*/
  const handleConfirmDelete = async () => {
    const game = confirmAction?.game;
    if (!game) return;

    try {
      const listingId = game._id || game.id;

      const response = await fetch(
        `${API_URL}/dashboard/listings/${listingId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete listing");
      }

      // Update local state
      setListedGames((prev) =>
        prev.filter((l) => (l._id || l.id) !== (game._id || game.id)),
      );
      setPendingListings((prev) =>
        prev.filter((l) => (l._id || l.id) !== (game._id || game.id)),
      );

      setToast({
        color: "red",
        icon: "error",
        title: game?.name,
        message: "was deleted successfully!",
      });
    } catch (err) {
      handleApiError(err, "Failed to delete listing");
    }

    setConfirmAction(null);
  };

  /*
  ! Submit Report
  * Report the borrowed user via API
*/
  const handleSubmitReport = async (data) => {
    try {
      const reportData = {
        reportedUserId: formData?.lenderId || formData?.rentedBy,
        listingId: formData?.listingId || formData?._id || formData?.id,
        category: data.reason,
        reason: data.reason,
        description: data.description,
      };

      const response = await fetch(`${API_URL}/dashboard/reports`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit report");
      }

      const result = await response.json();

      // Update local state
      setReportedUsers((prev) => [result.data.report, ...prev]);

      setToast({
        color: "red",
        icon: "check",
        title: "Report Submitted",
        message: "Your report has been sent for review.",
      });

      setFormMode(null);
      setFormData(null);
    } catch (err) {
      handleApiError(err, "Failed to submit report");
    }
  };

  // ! ---------------- BORROWER HANDLERS ----------------

  /*
  ! Confirm Returning 
  * Marks a game as being returned by the borrower via API
*/
  const handleConfirmReturning = async () => {
    const game = confirmAction?.game;

    if (!game) return;

    try {
      const rentalId = game._id || game.id;

      const response = await fetch(
        `${API_URL}/dashboard/rentals/${rentalId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "returning" }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate return");
      }

      // Update local state
      setBorrowedGames((prev) =>
        prev.map((g) =>
          (g._id || g.id) === (game._id || game.id)
            ? { ...g, status: "returning" }
            : g,
        ),
      );

      setToast({
        color: "blue",
        icon: "truck",
        title: game?.name,
        message: "will be returned.",
      });
    } catch (err) {
      handleApiError(err, "Failed to initiate return");
    }

    setConfirmAction(null);
  };

  /*
  ! Confirm Delivery 
  * Marks a game delivery as confirmed by the borrower via API
*/
  const handleConfirmDelivery = async () => {
    const game = confirmAction?.game;

    if (!game) return;

    try {
      const rentalId = game._id || game.id;

      const response = await fetch(
        `${API_URL}/dashboard/rentals/${rentalId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "active" }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to confirm delivery");
      }

      const data = await response.json();
      const rental = data.data.rental;

      // Update local state
      setBorrowedGames((prev) =>
        prev.map((g) =>
          (g._id || g.id) === (game._id || game.id)
            ? {
                ...g,
                status: "rented",
                startDate: rental.startDate,
                dueDate: rental.dueDate,
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
    } catch (err) {
      handleApiError(err, "Failed to confirm delivery");
    }

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
      name: "startDate",
      label: "Start Date",
      type: "date",
      isValid: (data) => !!data.startDate,
    },
    {
      name: "endDate",
      label: "End Date (Max 30 days)",
      type: "date",
      isValid: (data) => {
        if (!data.startDate || !data.endDate) return false;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diffDays >= 1 && diffDays <= 30;
      },
      validationMessage: "Borrow period must be between 1 and 30 days",
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
      name: "commercialBulking",
      label: "Available for Commercial Bulking?",
      type: "radio",
      inputClass: "radio-ctr",
      options: [
        { value: "short-term", label: "Short Term" },
        { value: "long-term", label: "Long Term" },
        { value: "no", label: "No" },
      ],
      isValid: (data) =>
        ["short-term", "long-term", "no"].includes(data.commercialBulking),
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
      options: ["Pick-up", "Meet-up", "Drop-off"],
      isValid: (data) => !!data.deliveryMethod,
    },
  ];

  /*
  ! Report Form Fields
  * Used for reporting the user
  */
  const reportFields = [
    {
      name: "reason",
      label: "Report Reason",
      type: "radio",
      inputClass: "radio-ctr",
      options: [
        "Communication Problems",
        "Legal & Policy Violations",
        "Platform Misuse",
        "Fraud & Trust Issues",
        "Safety & Harassment",
      ],
      isValid: (data) => !!data.reason,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Provide additional details...",
      isValid: (data) => data.description?.trim().length > 10,
    },
  ];

  /*
    ! Dashboard Table Configuration
    * Controls how tables are rendered dynamically
  */

  const [reportedUsers, setReportedUsers] = useState([]);

  const USER_TABLES = [
    {
      key: "reports",
      sectionTitle: "My Reports",
      tables: [
        {
          title: "Reported Users",
          data: reportedUsers,
          columns: [
            COLS.text("Submitted On", "submittedOn"),
            COLS.text("Reported User (Name)", "firstName"),
            COLS.text("Reported User (Email)", "email"),
            COLS.text("Category", "category"),
            COLS.text("Reason", "reason"),
          ],
        },
      ],
    },
    {
      key: "borrowed_games",
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
            COLS.text("Commercial Bulking", "commercialBulking"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.status,
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.text("Duration (Days)", "borrowDuration"),
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
            COLS.text("Commercial Bulking", "commercialBulking"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.text("Duration (Days)", "borrowDuration"),
            COLS.date("Returned On", "returnedOn"),
          ],
        },
      ],
    },

    {
      key: "listings",
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
            COLS.text("Commercial Bulking", "commercialBulking"),
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
            COLS.text("Commercial Bulking", "commercialBulking"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.status,
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.text("Duration (Days)", "borrowDuration"),
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
            COLS.text("Commercial Bulking", "commercialBulking"),
            COLS.text("Delivery Method", "deliveryMethod"),
            COLS.date("Start Date", "startDate"),
            COLS.date("Due Date", "dueDate"),
            COLS.text("Duration (Days)", "borrowDuration"),
            COLS.date("Returned On", "returnedOn"),
          ],
        },
      ],
    },
  ];

  const visibleSections = USER_TABLES.filter(
    (section) => section.key === activeTab,
  );

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
        {/* Loading State */}
        {loading && (
          <section className="dashboard-content">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "3rem",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid #f07c68",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !loading && (
          <section className="dashboard-content">
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#d32f2f" }}
            >
              <p style={{ marginBottom: "1rem" }}>
                Failed to load dashboard data
              </p>
              <button
                onClick={fetchDashboardData}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#f07c68",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {!loading &&
          !error &&
          visibleSections.map((section, i) => (
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

                          setFormMode("create");
                          setFormData(null);
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
                                        src={
                                          row[col.key]?.startsWith("http")
                                            ? row[col.key]
                                            : `${API_URL.replace("/api", "")}${row[col.key]}`
                                        }
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
                                    rejected: "Rejected",
                                  };

                                  const status =
                                    statusLabels[statusClass] || "—";
                                  const rejectionReason = row.rejectionReason;

                                  return (
                                    <span
                                      key={colIndex}
                                      className={`status ${statusClass}`}
                                      title={rejectionReason || undefined}
                                    >
                                      {status}
                                      {statusClass === "rejected" &&
                                        rejectionReason && (
                                          <span
                                            style={{
                                              display: "block",
                                              fontSize: "0.75rem",
                                              fontStyle: "italic",
                                              opacity: 0.8,
                                              marginTop: "2px",
                                            }}
                                          >
                                            Reason: {rejectionReason}
                                          </span>
                                        )}
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
                                  } else if (
                                    table.title === "Pending Listings"
                                  ) {
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
                                        <button
                                          className="icon-btn report"
                                          onClick={() => {
                                            setFormMode("report");
                                            setFormData(row);
                                          }}
                                        >
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
            setFormMode(null);
            setFormData(null);
            setConfirmAction(null);
          }}
        />

        {(formMode === "create" || formMode === "edit") && (
          <DashboardForm
            title={formMode === "edit" ? "Edit Listing" : "Create Listing"}
            mode={formMode}
            fields={listingFields}
            initialData={formData || {}}
            onClose={() => {
              setFormMode(null);
              setFormData(null);
            }}
            onSubmit={handleSaveListing}
          />
        )}

        {formMode === "report" && (
          <DashboardForm
            title="Report User"
            subtitle={formData?.rentedBy}
            mode="report"
            fields={reportFields}
            initialData={{}}
            onClose={() => {
              setFormMode(null);
              setFormData(null);
            }}
            onSubmit={handleSubmitReport}
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
                      handleConfirmDelete();
                      break;

                    case ACTIONS.DELIVERY_CONFIRM:
                      handleConfirmDelivery();
                      break;

                    case ACTIONS.RETURN_START:
                      handleConfirmReturning();
                      break;

                    case ACTIONS.RETURN_CONFIRM:
                      handleConfirmReturned();
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
