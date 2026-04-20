import "../assets/css/listing.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import { MdChatBubble } from "react-icons/md";
import { FaMoneyBill } from "react-icons/fa";
import { useParams, Navigate } from "react-router-dom";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";

const gamesData = [
  {
    id: 1,
    name: "Red Dead Redemption 2",
    platform: "PlayStation",
    consoleModel: "PS4",
    price: 130,
    genre: "Action",
    tag: "Open World",
    status: "Pending",
    about: "Excellent condition disc, original case included.",
    borrowDuration: 180,
    hasExpansions: "no",
    deliveryMethod: "Meet-up",
    image: hogwarts,
    listedBy: "PlayerOne",
  },
  {
    id: 2,
    name: "Cyberpunk 2077",
    platform: "Xbox",
    consoleModel: "Xbox One",
    price: 90,
    genre: "RPG",
    tag: "Futuristic",
    status: "Pending",
    about: "Updated version with DLC expansion.",
    borrowDuration: 90,
    hasExpansions: "yes",
    deliveryMethod: "Drop-off",
    image: pokemon,
    listedBy: "PlayerTwo",
  },
  {
    id: 3,
    name: "Animal Crossing: New Horizons",
    platform: "Nintendo",
    consoleModel: "Switch",
    price: 70,
    genre: "Simulation",
    tag: "Relaxing",
    status: "Pending",
    about: "Lightly used cartridge in perfect condition.",
    borrowDuration: 60,
    hasExpansions: "yes",
    deliveryMethod: "Pick-up",
    image: donkeyKong,
    listedBy: "PlayerThree",
  },
];

export default function Listing() {
  const { id } = useParams();

  const item = gamesData.find((l) => l.id === Number(id));

  if (!item) {
    return <Navigate to="/notfound" replace />;
  }

  return (
    <main className="listing-main">
      <section>
        <div className="width-wrap">
          <aside className="left">
            <h1>{item?.name}</h1>
            <h2>Product Information</h2>
            {
              // * Details
            }
            <div className="details">
              <ul>
                <li>
                  <h3>Platform:</h3>
                  <div>
                    <GetPlatformIcon platform={item?.platform} />
                    <span>| {item?.consoleModel}</span>
                  </div>
                </li>

                <li>
                  <h3>Genre:</h3>
                  <span>{item?.genre}</span>
                </li>

                <li>
                  <h3>Tag:</h3>
                  <span>{item?.tag}</span>
                </li>
              </ul>

              <ul>
                <li>
                  <h3>Has Expansion:</h3>
                  <span>{item?.hasExpansions}</span>
                </li>
                <li>
                  <h3>Original Price:</h3>
                  <span>{item?.price} AED</span>
                </li>
              </ul>
              <ul>
                <li>
                  <h3>Delivery Method:</h3>
                  <span>{item?.deliveryMethod}</span>
                </li>
                <li>
                  <h3>Return Deadline:</h3>
                  <span>{item?.borrowDuration} days from today</span>
                </li>
              </ul>
            </div>
            {
              // * About
            }
            <div className="about">
              <h2>About The Item</h2>
              <p>{item?.about}</p>
            </div>
            {
              // * Read
            }
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
          <aside className="right">
            <div className="top">
              <h2>
                <span>Listed By: </span>
                <span>{item?.listedBy}</span>
              </h2>
              <p>
                Reach out to the lender for further inquiries regarding the
                item:
              </p>
            </div>
            <ul className="bottom">
              <li>
                <button>
                  <MdChatBubble className="icon" />
                  <span>Chat</span>
                </button>
              </li>
              <li>
                <button>
                  <FaMoneyBill className="icon" />
                  <span>Borrow</span>
                </button>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
