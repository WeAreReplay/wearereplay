import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import GetPlatformIcon from "../components/GetPlatformIcon";
import "../assets/css/games.css";
import Pagination from "../components/Pagination";
import StoreImg from "../assets/images/store.webp";

// TODO: Replace static game data and connect to backend API (available games endpoint)

const gamesData = [
  {
    id: 1,
    name: "Hogwarts Legacy",
    listedBy: "PlayerFour",
    platform: "Windows",
    genre: "Adventure",
    price: 120,
  },
  {
    id: 2,
    name: "Mario Kart 8 Deluxe",
    listedBy: "PlayerTwo",
    platform: "Nintendo",
    genre: "Racing",
    price: 85,
  },
  {
    id: 3,
    name: "Elden Ring",
    listedBy: "PlayerFive",
    platform: "PlayStation",
    genre: "RPG",
    price: 140,
  },
];

export default function Games() {
  // * Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");

  const filteredGames = useMemo(() => {
    return gamesData.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPlatform =
        platformFilter === "All" || game.platform === platformFilter;

      const matchesGenre = genreFilter === "All" || game.genre === genreFilter;

      return matchesSearch && matchesPlatform && matchesGenre;
    });
  }, [search, platformFilter, genreFilter]);

  const { paginatedGames, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedGames = filteredGames.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    return { paginatedGames, totalPages };
  }, [currentPage, filteredGames]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, platformFilter, genreFilter]);

  return (
    <main className="games-main">
      {
        // * Header Section
      }
      <section className="secondary-hero">
        <img
          src={StoreImg}
          alt="Games Illustration"
          className="secondary-img"
        />
        <h1>
          <span className="pixel">►</span>
          <span>Games</span>
          <span className="pixel">◄</span>
        </h1>
      </section>

      {
        // * Games Section
      }
      <section className="games-content">
        <div className="width-wrap">
          <div className="platform-filters">
            {["All", "Nintendo", "Xbox", "PlayStation", "Mac", "Windows"].map(
              (platform) => (
                <label
                  key={platform}
                  className={`platform-btn ${
                    platformFilter === platform ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={platformFilter === platform}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                  />
                  <GetPlatformIcon platform={platform} />
                </label>
              ),
            )}
          </div>
          <div className="bottom">
            {
              // * Search
            }
            <div className="search-box">
              <input
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {
              // * Genre Filter
            }
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="All">All Genres</option>
              <option value="Adventure">Adventure</option>
              <option value="RPG">RPG</option>
              <option value="Racing">Racing</option>
              <option value="Simulation">Simulation</option>
            </select>
          </div>

          <h2>About {filteredGames.length} results</h2>

          <div className="games-ctr">
            {paginatedGames.map((game) => (
              <Link
                key={game.id}
                to={`/listing/${game.id}`}
                className="card"
                draggable="false"
              >
                <div className="info">
                  <h3 className="name">{game.name}</h3>
                  <h4 className="listedBy">{game.listedBy}</h4>
                  <ul>
                    <li>
                      <GetPlatformIcon platform={game.platform} />
                    </li>
                    <li>
                      <span className="genre">{game.genre}</span>
                    </li>
                    <li>
                      <span className="price">AED {game.price}</span>
                    </li>
                  </ul>
                </div>
              </Link>
            ))}
          </div>

          {
            // * Pagination
          }
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </main>
  );
}
