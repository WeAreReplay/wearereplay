import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import GetPlatformIcon from "../components/GetPlatformIcon";
import "../assets/css/games.css";
import Pagination from "../components/Pagination";
import { RiSearchEyeFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import ItemSlider from "../components/ItemSlider";
import GameSlider from "../components/GameSlider";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const GENRE_OPTIONS = [
  "All",
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
];

const TAG_OPTIONS = [
  "All",
  "Single Player",
  "Multiplayer",
  "Co-op",
  "Competitive",
  "Open World",
  "Story Rich",
  "Casual",
  "Family Friendly",
];

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

export default function Games() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const sectionRef = useRef(null);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  const [modelFilter, setModelFilter] = useState([]);
  const [openFilter, setOpenFilter] = useState("");
  const checkBoxRef = useRef(null);

  // Listings data from API
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/dashboard/listings/public`);

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        if (data.success) {
          setListings(data.data.listings || []);
        } else {
          throw new Error(data.message || "Failed to fetch listings");
        }
      } catch (err) {
        console.error("Fetch listings error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const toggleFilter = (key) => {
    setOpenFilter((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  /*
    ! Reset dependent filters when platform changes
    * Ensures model/genre/tag don’t conflict with new platform
  */
  useEffect(() => {
    setModelFilter([]);
    setGenreFilter([]);
    setTagFilter([]);
    setSearch("");
  }, [platformFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (checkBoxRef.current && !checkBoxRef.current.contains(e.target)) {
        setOpenFilter(null); // close it
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
    ! Reset page on filter change
    * Keeps pagination consistent
  */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, platformFilter, genreFilter, tagFilter, modelFilter]);

  /*
    ! Filtering logic
    * Applies search + platform + genre + tag + model filters
  */
  const filteredGames = useMemo(() => {
    return listings.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPlatform =
        platformFilter === "All" || game.platform === platformFilter;

      // Handle genre as array or string
      const gameGenres = Array.isArray(game.genre)
        ? game.genre
        : [game.genre].filter(Boolean);
      const matchesGenre =
        genreFilter.length === 0 ||
        gameGenres.some((g) => genreFilter.includes(g));

      // Handle tag as array or string
      const gameTags = Array.isArray(game.tag)
        ? game.tag
        : [game.tag].filter(Boolean);
      const matchesTag =
        tagFilter.length === 0 || gameTags.some((t) => tagFilter.includes(t));

      const matchesModel =
        modelFilter.length === 0 || modelFilter.includes(game.consoleModel);

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesGenre &&
        matchesTag &&
        matchesModel
      );
    });
  }, [listings, search, platformFilter, genreFilter, tagFilter, modelFilter]);

  /*
    ! Dynamic console model options
    * Changes based on selected platform
  */
  const availableModels = useMemo(() => {
    if (platformFilter === "All") {
      return ["All", ...Object.values(PLATFORM_MODELS).flat()];
    }
    return ["All", ...(PLATFORM_MODELS[platformFilter] || [])];
  }, [platformFilter]);

  const getFilterLabel = (items, defaultLabel) => {
    if (items.length === 0) return defaultLabel;
    return items.join(", ");
  };

  const clearModel = () => setModelFilter([]);
  const clearGenre = () => setGenreFilter([]);
  const clearTag = () => setTagFilter([]);

  const latestGames = useMemo(() => {
    return [...listings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [listings]);

  /*
    ! Pagination calculation
    * Splits filtered results into pages
  */
  const { paginatedGames, totalPages } = useMemo(() => {
    const totalPages =
      filteredGames.length === 0
        ? 0
        : Math.ceil(filteredGames.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedGames = filteredGames.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    return { paginatedGames, totalPages };
  }, [currentPage, filteredGames]);

  return (
    <main className="games-main">
      <section className="hero">
        <div className="width-wrap">
          {
            // * Search Filter
          }
          <ul className="platform-filters">
            {["All", "Nintendo", "Xbox", "PlayStation"].map((platform) => (
              <li
                key={platform}
                className={`platform-btn ${
                  platformFilter === platform ? "selected" : ""
                }`}
              >
                <label>
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={platformFilter === platform}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                  />
                  <GetPlatformIcon platform={platform} />
                </label>
              </li>
            ))}
          </ul>
          <ul className="filter-bar">
            {
              // * Search Filter
            }
            <li className="search">
              <label htmlFor="search" className="invisible">
                Search
              </label>
              <RiSearchEyeFill className="icon" />
              <input
                id="search"
                type="text"
                placeholder="Type to search for games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="clear-btn"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <IoClose className="icon" />
                </button>
              )}
            </li>
            <ul className="group-filters">
              {
                // * Model Filter
              }
              <li className="filter-item">
                <button onClick={() => toggleFilter("model")}>
                  <span>{getFilterLabel(modelFilter, "All Models")}</span>
                  {modelFilter.length > 0 && (
                    <span
                      className="clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearModel();
                      }}
                    >
                      <IoClose className="icon" />
                    </span>
                  )}
                </button>
              </li>
              {
                // * Genre Filter
              }
              <li className="filter-item">
                <button onClick={() => toggleFilter("genre")}>
                  <span>{getFilterLabel(genreFilter, "All Genres")}</span>
                  {genreFilter.length > 0 && (
                    <span
                      className="clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearGenre();
                      }}
                    >
                      <IoClose className="icon" />
                    </span>
                  )}
                </button>
              </li>
              {
                // * Tag Filter
              }
              <li className="filter-item">
                <button onClick={() => toggleFilter("tag")}>
                  <span>{getFilterLabel(tagFilter, "All Tags")}</span>
                  {tagFilter.length > 0 && (
                    <span
                      className="clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTag();
                      }}
                    >
                      <IoClose className="icon" />
                    </span>
                  )}
                </button>
              </li>

              <li
                className={`checkbox-ctr ${openFilter ? "open" : ""}`}
                ref={checkBoxRef}
              >
                {openFilter === "tag" &&
                  TAG_OPTIONS.filter((t) => t !== "All").map((t) => (
                    <label
                      key={t}
                      className={tagFilter.includes(t) ? "selected" : ""}
                    >
                      <input
                        type="checkbox"
                        checked={tagFilter.includes(t)}
                        onChange={() => {
                          setTagFilter((prev) =>
                            prev.includes(t)
                              ? prev.filter((x) => x !== t)
                              : [...prev, t],
                          );
                        }}
                      />
                      {t}
                    </label>
                  ))}

                {openFilter === "genre" &&
                  GENRE_OPTIONS.filter((g) => g !== "All").map((g) => (
                    <label
                      key={g}
                      className={genreFilter.includes(g) ? "selected" : ""}
                    >
                      <input
                        type="checkbox"
                        checked={genreFilter.includes(g)}
                        onChange={() => {
                          setGenreFilter((prev) =>
                            prev.includes(g)
                              ? prev.filter((x) => x !== g)
                              : [...prev, g],
                          );
                        }}
                      />
                      {g}
                    </label>
                  ))}

                {openFilter === "model" &&
                  availableModels
                    .filter((m) => m !== "All")
                    .map((model) => (
                      <label
                        key={model}
                        className={
                          modelFilter.includes(model) ? "selected" : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={modelFilter.includes(model)}
                          onChange={() => {
                            setModelFilter((prev) =>
                              prev.includes(model)
                                ? prev.filter((x) => x !== model)
                                : [...prev, model],
                            );
                          }}
                        />
                        {model}
                      </label>
                    ))}
              </li>
            </ul>
          </ul>
        </div>
      </section>

      <section className="content" ref={sectionRef}>
        <div className="width-wrap">
          <h1>Our Catalogue</h1>
          {
            // * Results Count
          }
          <h2>About {filteredGames.length} results</h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid #f07c68",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "1rem", color: "#666" }}>
                Loading games...
              </p>
            </div>
          ) : error ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#d32f2f" }}
            >
              <p>Failed to load games. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#f07c68",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#666" }}
            >
              <p>No games found matching your criteria.</p>
            </div>
          ) : (
            <div className="games-ctr">
              {paginatedGames.map((game) => {
                // Build full image URL - handle both uploaded files and external URLs
                const imageUrl = game.image
                  ? game.image.startsWith("http")
                    ? game.image
                    : `${API_URL.replace("/api", "")}${game.image}`
                  : "/placeholder-game.jpg";

                console.log(
                  "Game:",
                  game.name,
                  "Image URL:",
                  imageUrl,
                  "Raw image:",
                  game.image,
                );

                return (
                  <Link
                    key={game._id || game.id}
                    to={`/listing/${game._id || game.id}`}
                    className="card"
                  >
                    <img src={imageUrl} alt={game.name} />
                    <p>AED {game.price}</p>
                    <div className="head">
                      <h3>{game.name}</h3>
                      <h4>
                        By{" "}
                        {game.lender?.firstName || game.listedBy || "Unknown"}
                      </h4>
                    </div>

                    <ul className="details">
                      <li>
                        <GetPlatformIcon platform={game.platform} />
                        <span>{game.consoleModel}</span>
                      </li>
                      <li>
                        <span className="array">
                          {Array.isArray(game.genre)
                            ? game.genre.join(", ")
                            : game.genre}
                        </span>
                      </li>
                      <li>
                        <span className="array">
                          {Array.isArray(game.tag)
                            ? game.tag.join(", ")
                            : game.tag}
                        </span>
                      </li>
                    </ul>
                  </Link>
                );
              })}
            </div>
          )}

          {
            // * Pagination
          }
          {filteredGames.length > 0 && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>

      <GameSlider title="Bulk Rentals" type="bulk" />
    </main>
  );
}
