import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import GetPlatformIcon from "../components/GetPlatformIcon";
import "../assets/css/games.css";
import Pagination from "../components/Pagination";
import { RiSearchEyeFill } from "react-icons/ri";
import hogwarts from "../assets/images/hogwarts.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import pokemon from "../assets/images/pokemon.webp";
import { IoClose } from "react-icons/io5";

const gamesData = [
  {
    id: 1,
    name: "Forza Horizon 5",
    listedBy: "PlayerOne",
    platform: "Xbox",
    consoleModel: "Xbox Series S",
    price: 100,
    genre: ["Racing", "Adventure"],
    tag: ["Open World", "Coop"],
    borrowDuration: 5,
    image: hogwarts,
  },
  {
    id: 2,
    name: "Halo Infinite",
    listedBy: "PlayerTwo",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 95,
    genre: "Shooter",
    tag: "Multiplayer",
    borrowDuration: 4,
    image: indianaJones,
  },
  {
    id: 3,
    name: "The Last of Us Part II",
    listedBy: "PlayerThree",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 110,
    genre: "Adventure",
    tag: "Story Rich",
    borrowDuration: 6,
    image: zelda,
  },
  {
    id: 8,
    name: "God of War Ragnarök",
    listedBy: "PlayerFour",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 130,
    genre: "Action",
    tag: "Single Player",
    borrowDuration: 5,
    image: pokemon,
  },
  {
    id: 9,
    name: "Spider-Man 2",
    listedBy: "PlayerFive",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 120,
    genre: "Action",
    tag: "Open World",
    borrowDuration: 5,
    image: zelda,
  },
  {
    id: 10,
    name: "Gran Turismo 7",
    listedBy: "PlayerSix",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 90,
    genre: "Racing",
    tag: "Simulation",
    borrowDuration: 4,
    image: hogwarts,
  },
  {
    id: 11,
    name: "Gears 5",
    listedBy: "PlayerSeven",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 85,
    genre: "Shooter",
    tag: "Co-op",
    borrowDuration: 3,
    image: indianaJones,
  },
  {
    id: 12,
    name: "Flight Simulator",
    listedBy: "PlayerEight",
    platform: "Xbox",
    consoleModel: "Xbox Series S",
    price: 140,
    genre: "Simulation",
    tag: "Realistic",
    borrowDuration: 6,
    image: hogwarts,
  },
  {
    id: 13,
    name: "Zelda: Tears of the Kingdom",
    listedBy: "PlayerNine",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 110,
    genre: "Adventure",
    tag: "Open World",
    borrowDuration: 5,
    image: zelda,
  },
  {
    id: 14,
    name: "Mario Kart 8 Deluxe",
    listedBy: "PlayerTen",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 80,
    genre: "Racing",
    tag: "Multiplayer",
    borrowDuration: 4,
    image: pokemon,
  },
  {
    id: 15,
    name: "Animal Crossing",
    listedBy: "PlayerEleven",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 70,
    genre: "Simulation",
    tag: "Relaxing",
    borrowDuration: 7,
    image: pokemon,
  },
  {
    id: 16,
    name: "Call of Duty MW3",
    listedBy: "PlayerTwelve",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 130,
    genre: "Shooter",
    tag: "Multiplayer",
    borrowDuration: 5,
    image: indianaJones,
  },
  {
    id: 17,
    name: "Elden Ring",
    listedBy: "PlayerThirteen",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 125,
    genre: "RPG",
    tag: "Open World",
    borrowDuration: 6,
    image: zelda,
  },
  {
    id: 18,
    name: "Dark Souls III",
    listedBy: "PlayerFourteen",
    platform: "Xbox",
    consoleModel: "Xbox Series S",
    price: 75,
    genre: "RPG",
    tag: "Challenging",
    borrowDuration: 4,
    image: indianaJones,
  },
  {
    id: 19,
    name: "Horizon Forbidden West",
    listedBy: "PlayerFifteen",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 115,
    genre: "Adventure",
    tag: "Open World",
    borrowDuration: 5,
    image: hogwarts,
  },
  {
    id: 20,
    name: "FIFA 24",
    listedBy: "PlayerSixteen",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 95,
    genre: "Sports",
    tag: "Multiplayer",
    borrowDuration: 3,
    image: pokemon,
  },
  {
    id: 21,
    name: "NBA 2K24",
    listedBy: "PlayerSeventeen",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 100,
    genre: "Sports",
    tag: "Multiplayer",
    borrowDuration: 3,
    image: indianaJones,
  },
  {
    id: 22,
    name: "Minecraft",
    listedBy: "PlayerEighteen",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 60,
    genre: "Sandbox",
    tag: "Creative",
    borrowDuration: 7,
    image: pokemon,
  },
  {
    id: 23,
    name: "Fortnite",
    listedBy: "PlayerNineteen",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 0,
    genre: "Battle Royale",
    tag: "Multiplayer",
    borrowDuration: 2,
    image: zelda,
  },
  {
    id: 24,
    name: "Apex Legends",
    listedBy: "PlayerTwenty",
    platform: "Xbox",
    consoleModel: "Xbox Series S",
    price: 0,
    genre: "Battle Royale",
    tag: "Multiplayer",
    borrowDuration: 2,
    image: indianaJones,
  },
  {
    id: 25,
    name: "Resident Evil 4",
    listedBy: "PlayerTwentyOne",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 105,
    genre: "Horror",
    tag: "Story Rich",
    borrowDuration: 5,
    image: hogwarts,
  },
  {
    id: 26,
    name: "Dead Space",
    listedBy: "PlayerTwentyTwo",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 110,
    genre: "Horror",
    tag: "Single Player",
    borrowDuration: 5,
    image: indianaJones,
  },
  {
    id: 27,
    name: "Cyberpunk 2077",
    listedBy: "PlayerTwentyThree",
    platform: "PlayStation",
    consoleModel: "PS5",
    price: 100,
    genre: "RPG",
    tag: "Open World",
    borrowDuration: 6,
    image: zelda,
  },
  {
    id: 28,
    name: "Assassin's Creed Mirage",
    listedBy: "PlayerTwentyFour",
    platform: "Xbox",
    consoleModel: "Xbox Series S",
    price: 95,
    genre: "Adventure",
    tag: "Stealth",
    borrowDuration: 4,
    image: hogwarts,
  },
  {
    id: 29,
    name: "Super Smash Bros Ultimate",
    listedBy: "PlayerTwentyFive",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 90,
    genre: "Fighting",
    tag: "Multiplayer",
    borrowDuration: 4,
    image: pokemon,
  },
  {
    id: 30,
    name: "Splatoon 3",
    listedBy: "PlayerTwentySix",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 85,
    genre: "Shooter",
    tag: "Multiplayer",
    borrowDuration: 4,
    image: pokemon,
  },
  {
    id: 31,
    name: "Starfield",
    listedBy: "PlayerTwentySeven",
    platform: "Xbox",
    consoleModel: "Xbox Series X",
    price: 135,
    genre: "RPG",
    tag: "Open World",
    borrowDuration: 6,
    image: indianaJones,
  },
  {
    id: 32,
    name: "Metroid Dread",
    listedBy: "PlayerTwentyEight",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 80,
    genre: "Action",
    tag: "Single Player",
    borrowDuration: 4,
    image: zelda,
  },
];

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
  Xbox: ["Xbox One", "Xbox Series S", "Xbox Series X"],
  PlayStation: ["PS4", "PS4 Pro", "PS5"],
  Nintendo: ["Switch", "Switch OLED", "Switch Lite"],
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
    return gamesData.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPlatform =
        platformFilter === "All" || game.platform === platformFilter;

      const matchesGenre =
        genreFilter.length === 0 || genreFilter.includes(game.genre);
      const matchesTag = tagFilter.length === 0 || tagFilter.includes(game.tag);

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
  }, [search, platformFilter, genreFilter, tagFilter, modelFilter]);

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

          {filteredGames.length === 0 ? (
            <></>
          ) : (
            <div className="games-ctr">
              {paginatedGames.map((game) => (
                <Link key={game.id} to={`/listing/${game.id}`} className="card">
                  <img src={game.image} alt={game.name} />
                  <p>AED {game.price}</p>
                  <div className="head">
                    <h3>{game.name}</h3>
                    <h4>By {game.listedBy}</h4>
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
              ))}
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
    </main>
  );
}
