import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import GetPlatformIcon from "../components/GetPlatformIcon";
import Pagination from "../components/Pagination";
import "../assets/css/gamelistings.css";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";
import NotFound from "./NotFound.jsx";

// TODO: Replace games data and games listings Connect to backend API (available games/game listings endpoint)

const gamesData = [
  {
    id: "donkey-kong",
    name: "Donkey Kong",
    genre: "Action",
    description:
      "Classic arcade platformer where you climb platforms, avoid barrels, and rescue Pauline from Donkey Kong.",
    img: donkeyKong,
  },
  {
    id: "indiana-jones",
    name: "Indiana Jones",
    genre: "Adventure",
    description:
      "Explore ancient ruins, solve puzzles, and uncover legendary artifacts in a cinematic adventure.",
    img: indianaJones,
  },
  {
    id: "zelda",
    name: "Zelda",
    genre: "RPG",
    description:
      "Journey through Hyrule, battle enemies, solve puzzles, and restore peace to the kingdom.",
    img: zelda,
  },
  {
    id: "hogwarts-legacy",
    name: "Hogwarts Legacy",
    genre: "RPG",
    description:
      "Live as a student at Hogwarts, master spells, and uncover hidden magical secrets.",
    img: hogwarts,
  },
  {
    id: "pokemon-za",
    name: "Pokemon ZA",
    genre: "Racing",
    description:
      "Race with Pokémon through fast-paced tracks and compete in high-speed challenges.",
    img: pokemon,
  },
];

const listingsData = {
  "donkey-kong": [
    { id: 1, listedBy: "Alex", price: 35, platform: "Nintendo" },
    { id: 2, listedBy: "Sarah", price: 40, platform: "Arcade" },
    { id: 3, listedBy: "Mike", price: 30, platform: "Nintendo" },
  ],

  "indiana-jones": [
    { id: 1, listedBy: "John", price: 55, platform: "Windows" },
    { id: 2, listedBy: "Emma", price: 60, platform: "PlayStation" },
    { id: 3, listedBy: "Chris", price: 50, platform: "Xbox" },
  ],

  zelda: [
    { id: 1, listedBy: "Alice", price: 50, platform: "Nintendo" },
    { id: 2, listedBy: "Bob", price: 60, platform: "Windows" },
    { id: 3, listedBy: "Charlie", price: 45, platform: "Nintendo" },
  ],

  "hogwarts-legacy": [
    { id: 1, listedBy: "Luna", price: 70, platform: "Windows" },
    { id: 2, listedBy: "Drake", price: 65, platform: "PlayStation" },
    { id: 3, listedBy: "Nina", price: 68, platform: "Xbox" },
  ],

  "pokemon-za": [
    { id: 1, listedBy: "Mike", price: 40, platform: "Nintendo" },
    { id: 2, listedBy: "Sara", price: 55, platform: "Windows" },
    { id: 3, listedBy: "Leo", price: 45, platform: "Nintendo" },
  ],
};

export default function GameListings() {
  const { id } = useParams();

  const game = useMemo(() => gamesData.find((g) => g.id === id), [id]);
  const listings = useMemo(() => listingsData[id] || [], [id]);

  // * Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { paginatedListings, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(listings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedListings = listings.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    return { paginatedListings, totalPages };
  }, [currentPage, listings]);

  if (!game) {
    return <NotFound />;
  }

  return (
    <main className="listings-main">
      {
        // * Header Section
      }
      <section className="secondary-hero listings-hero">
        <img src={game.img} alt={game.name} className="secondary-img" />

        <div className="top">
          <h1>{game.name}</h1>

          <div className="genre">
            <p className="label">Genre:</p>
            <p>{game.genre}</p>
          </div>
        </div>

        <p>{game.description}</p>
      </section>

      {
        // * Listings
      }
      <section className="listings-content">
        <div className="width-wrap">
          <h2 className="title">
            <span class="pixel">►</span>
            <span>Available Listings</span>
          </h2>

          <div className="table-wrapper">
            {/* HEADER */}
            <ul className="table-head">
              <li>
                <span>Listed By</span>
                <span>Price (AED)</span>
                <span>Platform</span>
                <span>Action</span>
              </li>
            </ul>

            {/* BODY */}
            <ul className="table-content">
              {paginatedListings.map((listing) => (
                <li key={listing.id}>
                  <span>{listing.listedBy}</span>

                  <span>{listing.price}</span>

                  <GetPlatformIcon platform={listing.platform} />

                  <span>
                    <button className="rent-btn">Rent</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* PAGINATION */}
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
