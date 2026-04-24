import { useState, useEffect } from "react";
import "../assets/css/listing.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import { MdChatBubble, MdEmail } from "react-icons/md";
import { FaMoneyBill, FaUser, FaStar, FaGamepad, FaHandHolding, FaCheck } from "react-icons/fa";
import { useParams, Navigate } from "react-router-dom";
import Toast from "../components/Toast";
import { RiVipCrownFill } from "react-icons/ri";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-game.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL.replace("/api", "")}${imagePath}`;
};

// Helper function to get lender profile picture URL
const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `${API_URL.replace("/api", "")}${profilePicture}`;
};

export default function ViewItem() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBorrowBlocked, setIsBorrowBlocked] = useState(false);

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Get auth token
  const getToken = () => localStorage.getItem("token");

  // Fetch listing data from backend
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/dashboard/listings/${id}/public`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Listing not found");
          } else {
            setError("Failed to load listing");
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setListing(data.data.listing);
        }
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Check borrowing limits (would come from user context in production)
  useEffect(() => {
    // TODO: Fetch current user's borrowed games count
    // For now, assume not blocked
    setIsBorrowBlocked(false);
  }, []);

  // Handle card number formatting (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Handle expiry date formatting (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Handle borrow button click
  const handleBorrowClick = () => {
    const token = getToken();
    if (!token) {
      setCheckoutError("Please log in to borrow this game");
      return;
    }
    setShowCheckout(true);
    setCheckoutError(null);
  };

  // Handle checkout submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError(null);

    // Validate delivery address
    if (!deliveryAddress.trim()) {
      setCheckoutError("Please enter a delivery address");
      return;
    }

    // Validate card details if paying by card
    if (paymentMethod === "card") {
      if (!cardDetails.cardholderName.trim()) {
        setCheckoutError("Please enter the cardholder name");
        return;
      }
      const cardNum = cardDetails.cardNumber.replace(/\s/g, "");
      if (cardNum.length < 16) {
        setCheckoutError("Please enter a valid 16-digit card number");
        return;
      }
      if (cardDetails.expiryDate.length < 5) {
        setCheckoutError("Please enter a valid expiry date (MM/YY)");
        return;
      }
      if (cardDetails.cvv.length < 3) {
        setCheckoutError("Please enter a valid CVV");
        return;
      }
    }

    setProcessingPayment(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create rental in backend
      const response = await fetch(`${API_URL}/dashboard/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
          paymentMethod,
          deliveryAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create rental");
      }

      // Success! Close modal and update listing status locally
      setShowCheckout(false);
      setListing({ ...listing, status: "pending" });

      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      setCheckoutError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="listing-main">
        <section>
          <div className="width-wrap">
            <div className="loading">Loading listing...</div>
          </div>
        </section>
      </main>
    );
  }

  // Error or not found
  if (error || !listing) {
    return <Navigate to="/notfound" replace />;
  }

  // Extract lender data
  const lender = listing.lender || {};
  const lenderName = `${lender.firstName || ""} ${lender.lastName || ""}`.trim() || "Unknown User";
  const lenderMetrics = lender.metrics || {};
  const lenderRating = lender.rating || 0;
  const isPremium = lender.subscriptionType === "premium";

  // Format array fields
  const genres = Array.isArray(listing.genre) ? listing.genre : [listing.genre].filter(Boolean);
  const tags = Array.isArray(listing.tag) ? listing.tag : [listing.tag].filter(Boolean);

  return (
    <main className="listing-main">
      <section>
        <div className="width-wrap">
          <aside className="left">
            {/* Game Title and Image */}
            <h1>{listing.name}</h1>
            <div className="listing-image">
              <img
                src={getImageUrl(listing.image)}
                alt={listing.name}
                onError={(e) => {
                  e.target.src = "/placeholder-game.jpg";
                }}
              />
            </div>

            <h2>Product Information</h2>

            {/* Details Section */}
            <div className="details">
              <ul>
                <li>
                  <h3>Platform:</h3>
                  <div>
                    <GetPlatformIcon platform={listing.platform} />
                    <span>| {listing.consoleModel}</span>
                  </div>
                </li>

                <li>
                  <h3>Genre:</h3>
                  <span>{genres.length > 0 ? genres.join(", ") : "N/A"}</span>
                </li>

                <li>
                  <h3>Tags:</h3>
                  <span>{tags.length > 0 ? tags.join(", ") : "N/A"}</span>
                </li>
              </ul>

              <ul>
                <li>
                  <h3>Has Expansion:</h3>
                  <span>{listing.hasExpansions || "no"}</span>
                </li>
                <li>
                  <h3>Original Price:</h3>
                  <span>{listing.price} AED</span>
                </li>
              </ul>
              <ul>
                <li>
                  <h3>Delivery Method:</h3>
                  <span>{listing.deliveryMethod}</span>
                </li>
                <li>
                  <h3>Borrow Duration:</h3>
                  <span>{listing.borrowDuration} days</span>
                </li>
              </ul>
            </div>

            {/* Status Badge */}
            <div className="listing-status">
              <span className={`status-badge ${listing.status}`}>
                {listing.status === "available" ? "Available" : listing.status}
              </span>
              {listing.isApproved && (
                <span className="approved-badge">
                  <FaCheck /> Approved
                </span>
              )}
            </div>

            {/* About Section */}
            <div className="about">
              <h2>About The Item</h2>
              <p>{listing.about}</p>
            </div>

            {/* Read Before Requesting */}
            <div className="read">
              <h2>Read Before Requesting:</h2>
              <p>
                Before you borrow a game on RE:PLAY, please take a moment to
                review a few important things:
              </p>
              <ul>
                <li>
                  <p>
                    Games listed on the platform are owned by other users, so
                    availability may vary. Make sure to check the borrowing
                    period and return the game on time to avoid penalties or
                    additional fees.
                  </p>
                </li>
                <li>
                  <p>
                    A refundable deposit of 40% of the original game price (50%
                    if it includes expansions) is required before borrowing.
                    This deposit is capped at a maximum of 80 AED and is only
                    for security purposes. It will be fully returned once the
                    game is safely returned in good condition.
                  </p>
                </li>
                <li>
                  <p>
                    A small protection fee of 6 AED is also included with each
                    transaction. This fee is non-refundable and helps cover
                    platform security and handling.
                  </p>
                </li>
                <li>
                  <p>
                    Be respectful of other users—treat borrowed games as if they
                    were your own. Any damage, loss, or failure to return may
                    result in account restrictions.
                  </p>
                </li>
                <li>
                  <p>
                    Lastly, always double-check platform compatibility
                    (Nintendo, PlayStation, Xbox) before confirming your
                    request.
                  </p>
                </li>
              </ul>
            </div>
          </aside>

          {/* Right Sidebar - Lender Info & Actions */}
          <aside className="right">
            {/* Lender Profile Card */}
            <div className="lender-card">
              <div className="lender-header">
                <div className="lender-avatar">
                  {getProfilePictureUrl(lender.profilePicture) ? (
                    <img
                      src={getProfilePictureUrl(lender.profilePicture)}
                      alt={lenderName}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="avatar-placeholder" style={{ display: getProfilePictureUrl(lender.profilePicture) ? "none" : "flex" }}>
                    <FaUser />
                  </div>
                </div>
                <div className="lender-info">
                  <h3>
                    {lenderName}
                    {isPremium && (
                      <span className="premium-badge" title="Premium Member">
                        <RiVipCrownFill />
                      </span>
                    )}
                  </h3>
                  <p className="lender-role">{lender.role || "User"}</p>
                </div>
              </div>

              {/* Lender Stats */}
              <div className="lender-stats">
                <div className="stat">
                  <FaHandHolding className="stat-icon" />
                  <span className="stat-value">{lenderMetrics.borrows || 0}</span>
                  <span className="stat-label">Borrows</span>
                </div>
                <div className="stat">
                  <FaHandHolding className="stat-icon" />
                  <span className="stat-value">{lenderMetrics.lends || 0}</span>
                  <span className="stat-label">Lends</span>
                </div>
                <div className="stat">
                  <FaStar className="stat-icon" />
                  <span className="stat-value">{lenderRating.toFixed(1)}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>

              <p className="listed-by-text">
                <span>Listed By</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="action-card">
              <p className="action-hint">
                Reach out to the lender for further inquiries regarding the item:
              </p>
              <ul className="action-buttons">
                <li>
                  <button className="btn-chat">
                    <MdChatBubble className="icon" />
                    <span>Chat</span>
                  </button>
                </li>
                <li>
                  <button
                    className="btn-borrow"
                    onClick={handleBorrowClick}
                    disabled={isBorrowBlocked || listing.status !== "available"}
                  >
                    <FaMoneyBill className="icon" />
                    <span>Borrow</span>
                  </button>
                </li>
              </ul>
              {listing.status !== "available" && (
                <p className="unavailable-message">
                  This item is currently {listing.status} and not available for borrowing.
                </p>
              )}
            </div>

            {isBorrowBlocked && (
              <Toast
                color="red"
                icon="error"
                title="Borrowing Restricted"
                message="You have reached your borrowing limit. Upgrade to Premium for higher limits."
                isVisible={true}
              />
            )}
          </aside>
        </div>
      </section>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal-overlay" onClick={() => !processingPayment && setShowCheckout(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-header">
              <h2>Complete Your Rental</h2>
              <button className="close-btn" onClick={() => !processingPayment && setShowCheckout(false)}>
                ×
              </button>
            </div>

            <div className="checkout-content">
              {/* Order Summary */}
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                  <img src={getImageUrl(listing.image)} alt={listing.name} />
                  <div className="summary-details">
                    <h4>{listing.name}</h4>
                    <p>{listing.platform} | {listing.consoleModel}</p>
                    <p className="price">{listing.price} AED</p>
                  </div>
                </div>
                <div className="summary-totals">
                  <div className="total-row">
                    <span>Rental Price:</span>
                    <span>{listing.price} AED</span>
                  </div>
                  <div className="total-row">
                    <span>Protection Fee:</span>
                    <span>6 AED</span>
                  </div>
                  <div className="total-row">
                    <span>Refundable Deposit:</span>
                    <span>{Math.min(Math.round(listing.price * 0.4), 80)} AED</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>{listing.price + 6 + Math.min(Math.round(listing.price * 0.4), 80)} AED</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="payment-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={processingPayment}
                    />
                    <div className="payment-content">
                      <div className="payment-icon">💵</div>
                      <div className="payment-info">
                        <span className="payment-title">Cash on Delivery</span>
                        <span className="payment-desc">Pay when you receive the game</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={processingPayment}
                    />
                    <div className="payment-content">
                      <div className="payment-icon">💳</div>
                      <div className="payment-info">
                        <span className="payment-title">Card Payment</span>
                        <span className="payment-desc">Pay securely with your card</span>
                      </div>
                      <div className="payment-brands">
                        <span className="brand visa">VISA</span>
                        <span className="brand mastercard">MC</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === "card" && (
                <div className="card-form">
                  <h3>Card Details</h3>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                      disabled={processingPayment}
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      disabled={processingPayment}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                        maxLength={5}
                        disabled={processingPayment}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                        maxLength={3}
                        disabled={processingPayment}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="delivery-section">
                <h3>Delivery Address</h3>
                <div className="form-group">
                  <textarea
                    placeholder="Enter your full delivery address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    disabled={processingPayment}
                  />
                </div>
              </div>

              {/* Error Message */}
              {checkoutError && (
                <div className="checkout-error">
                  <p>{checkoutError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="checkout-submit-btn"
                onClick={handleCheckout}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === "cod" ? "Confirm Rental" : "Pay & Confirm Rental"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      <Toast
        color="green"
        icon="check"
        title="Rental Request Created!"
        message="The lender has been notified. Check your dashboard for updates."
        isVisible={showSuccessToast}
      />
    </main>
  );
}

