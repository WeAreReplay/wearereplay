import GetPlatformIcon from "../components/GetPlatformIcon";
import ItemSlider from "../components/ItemSlider";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";

export default function NewReleases({ link }) {
  const gamesData = [
    {
      id: 1,
      name: "Forza Horizon 5",
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
      name: "Halo Infinite",
      createdAt: "2026-03-02",
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
      createdAt: "2026-03-03",
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
      createdAt: "2026-03-05",
      listedBy: "PlayerFour",
      platform: "PlayStation",
      consoleModel: "PS5",
      price: 130,
      genre: "Action",
      tag: "Single Player",
      borrowDuration: 5,
      image: pokemon,
    },
  ];

  const latestGames = useMemo(() => {
    return [...gamesData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, []);

  return (
    <ItemSlider title="New Releases" right={true} pageLink={link}>
      {latestGames.map((item, i) => (
        <Link key={item.id} to={`/listing/${item.id}`} className="games-card">
          <img src={item.image} alt={item.name} />
          <p>AED {item.price}</p>
          <div className="head">
            <h3>{item.name}</h3>
            <h4>By {item.listedBy}</h4>
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
