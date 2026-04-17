import "../assets/css/listing.css";
import GetPlatformIcon from "../components/GetPlatformIcon";
import { MdChatBubble } from "react-icons/md";
import { FaMoneyBill } from "react-icons/fa";
import { useParams, Navigate } from "react-router-dom";

const listings = [
  {
    id: 1,
    name: "Hogwarts Legacy",
    platform: "Windows",
    genre: "Adventure",
    deliveryMethod: "Drop-off",
    hasExpansions: "yes",
    description:
      "Deluxe edition with bonus content. Barely used, excellent condition.",
    durationOfOwnership: 200,
    price: 120,
    listedBy: "PlayerFour",
  },
  {
    id: 2,
    name: "Mario Kart 8 Deluxe",
    platform: "Nintendo",
    genre: "Racing",
    deliveryMethod: "Meet-Up",
    hasExpansions: "no",
    description: "Original cartridge with box included. Works perfectly.",
    durationOfOwnership: 320,
    price: 85,
    listedBy: "PlayerTwo",
  },
  {
    id: 3,
    name: "Elden Ring",
    platform: "PlayStation",
    genre: "RPG",
    deliveryMethod: "Drop-off",
    hasExpansions: "yes",
    description: "Includes Shadow of the Erdtree DLC. Slight wear on case.",
    durationOfOwnership: 150,
    price: 140,
    listedBy: "PlayerFive",
  },
];

export default function Listing() {
  const { id } = useParams();

  const item = listings.find((l) => l.id === Number(id));

  if (!item) {
    return <Navigate to="/notfound" replace />;
  }

  return (
    <main className="listing-main">
      <section>
        <div className="width-wrap">
          <aside className="left">
            <h1>{item?.name}</h1>

            <div className="listing-wrapper">
              <h2>Product Information</h2>
              <ul>
                <li>
                  <h3>Platform:</h3>
                  <span>
                    <GetPlatformIcon platform={item?.platform} />
                  </span>
                </li>

                <li>
                  <h3>Genre:</h3>
                  <span>{item?.genre}</span>
                </li>

                <li>
                  <h3>Delivery Method:</h3>
                  <span>{item?.deliveryMethod}</span>
                </li>

                <li>
                  <h3>Has Expansions:</h3>
                  <span>{item?.hasExpansions}</span>
                </li>
              </ul>
            </div>

            <div className="listing-wrapper">
              <h2>About The Item</h2>
              <ul>
                <li>
                  <p>{item?.description}</p>
                </li>
                <li>
                  <h3>Duration of Ownership:</h3>
                  <span>{item?.durationOfOwnership} days</span>
                </li>
              </ul>
            </div>
            <div className="listing-wrapper">
              <h2>Read Before Requesting:</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam
                amet nostrum aspernatur incidunt facilis temporibus recusandae
                quos, repellendus cumque quia?
              </p>
            </div>
          </aside>
          <aside className="right">
            <div className="top">
              <h2>
                <span>Listed By: </span>
                <span>{item?.listedBy}</span>
              </h2>
              <h3>
                <span>Price: </span> <span>AED {item?.price} </span>
              </h3>
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
