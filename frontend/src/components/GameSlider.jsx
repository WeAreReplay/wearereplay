import GetPlatformIcon from "./GetPlatformIcon";
import ItemSlider from "./ItemSlider";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";

import reddead from "../assets/images/reddead.webp";
import fifa from "../assets/images/fifa25.webp";
import callofduty from "../assets/images/callofduty.webp";
import spiderman from "../assets/images/spiderman.webp";

export default function GameSlider({ link, title, type = "new" }) {
  const newReleases = [
    {
      id: 1,
      name: "Hogwarts Legacy",
      createdAt: "2026-03-01",
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
      name: "Indiana Jones and the Great Circle",
      createdAt: "2026-03-02",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      genre: "Shooter",
      tag: "Multiplayer",
      image: indianaJones,
    },
    {
      id: 3,
      name: "The Legend of Zelda: Breath of the Wild",
      createdAt: "2026-03-03",
      platform: "PlayStation",
      consoleModel: "PS5",
      genre: "Adventure",
      tag: "Story Rich",
      image: zelda,
    },
    {
      id: 8,
      name: "Pokemon ZA",
      createdAt: "2026-03-05",
      platform: "PlayStation",
      consoleModel: "PS5",
      genre: "Action",
      tag: "Single Player",
      image: pokemon,
    },
  ];

  const bulkRentals = [
    {
      id: 9,
      name: "Red Dead Redemption 2",
      createdAt: "2026-03-06",
      platform: "PlayStation",
      consoleModel: "PS5",
      genre: ["Action", "Adventure"],
      tag: ["Open World", "Story Rich"],
      image: reddead,
    },
    {
      id: 10,
      name: "FIFA 25",
      createdAt: "2026-03-07",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      genre: "Sports",
      tag: ["Multiplayer", "Competitive"],
      image: fifa,
    },
    {
      id: 11,
      name: "Call of Duty: Modern Warfare III",
      createdAt: "2026-03-08",
      platform: "PlayStation",
      consoleModel: "PS5",
      genre: "Shooter",
      tag: ["Multiplayer", "War"],
      image: callofduty,
    },
    {
      id: 12,
      name: "Spider-Man 2",
      createdAt: "2026-03-09",
      platform: "PlayStation",
      consoleModel: "PS5",
      genre: ["Action", "Adventure"],
      tag: ["Single Player", "Story Rich"],
      image: spiderman,
    },
  ];

  // choose dataset based on type
  const selectedData = type === "bulk" ? bulkRentals : newReleases;

  const latestGames = useMemo(() => {
    return [...selectedData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [selectedData]);

  return (
    <ItemSlider title={title} right={true} pageLink={link}>
      {latestGames.map((item) => (
        <Link
          key={item.id}
          to={type === "bulk" ? "/BulkRentals" : "/catalogue"}
          className="games-card"
        >
          <img src={item.image} alt={item.name} />

          <div className="head">
            <h3>{item.name}</h3>
          </div>

          <ul className="details">
            <li>
              <GetPlatformIcon platform={item.platform} />
              <span>{item.consoleModel}</span>
            </li>

            <li>
              <span className="array">
                {Array.isArray(item.genre) ? item.genre.join(", ") : item.genre}
              </span>
            </li>

            <li>
              <span className="array">
                {Array.isArray(item.tag) ? item.tag.join(", ") : item.tag}
              </span>
            </li>
          </ul>
        </Link>
      ))}
    </ItemSlider>
  );
}
