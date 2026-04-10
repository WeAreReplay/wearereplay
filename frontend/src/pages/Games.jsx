import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import "../assets/css/games.css";
import Pagination from "../components/Pagination";
import StoreImg from "../assets/images/store.webp";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";

// TODO: Replace static game data and connect to backend API (available games endpoint)

const gamesData = [
  { name: "Donkey Kong", genre: "Action", img: donkeyKong },
  { name: "Indiana Jones", genre: "RPG", img: indianaJones },
  { name: "Pokemon ZA", genre: "Racing", img: pokemon },
  { name: "Zelda", genre: "RPG", img: zelda },
  { name: "Hogwarts Legacy", genre: "RPG", img: hogwarts },
  { name: "Donkey Kong", genre: "Action", img: donkeyKong },
  { name: "Indiana Jones", genre: "RPG", img: indianaJones },
  { name: "Pokemon ZA", genre: "Racing", img: pokemon },
  { name: "Zelda", genre: "RPG", img: zelda },
  { name: "Hogwarts Legacy", genre: "RPG", img: hogwarts },
  { name: "Hogwarts Legacy", genre: "RPG", img: hogwarts },
  { name: "Hogwarts Legacy", genre: "RPG", img: hogwarts },
  { name: "Hogwarts Legacy", genre: "RPG", img: hogwarts },
];

// * Convert name → URL slug
const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

export default function Store() {
  // * Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { paginatedGames, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(gamesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedGames = gamesData.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    return { paginatedGames, totalPages };
  }, [currentPage]);

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
          <div className="games-ctr">
            {paginatedGames.map((game, index) => (
              <Link
                key={`${game.name}-${index}`}
                to={`/listings/${createSlug(game.name)}`}
                className="card"
                draggable="false"
              >
                <div className="img-ctr">
                  <img src={game.img} alt={game.name} loading="lazy" />
                </div>

                <div className="info">
                  <h2 className="name">{game.name}</h2>
                  <p className="genre">{game.genre}</p>
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
