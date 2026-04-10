import { Link } from "react-router-dom";

/*
  ! ItemSlider 
  --------------------------------------------------
  ? Displays a horizontal slider of items (games, products, etc.)

  * Props:
  * - title (string): section title
  * - items (array): list of items to display
  * - moreLink (string): optional link to view more items
  * - right (boolean): flips layout direction (for styling)
*/

export default function ItemSlider({
  title,
  items = [], // ! Prevents crash if items is undefined
  moreLink,
  right = false,
}) {
  return (
    <section className="item-slider">
      <div className="width-wrap">
        {
          // * Section Title
          // ? Direction changes arrow position
        }
        <h2 className={`title ${right ? "right" : ""}`}>
          {right ? (
            <>
              {title} <span className="pixel">◄</span>
            </>
          ) : (
            <>
              <span className="pixel">►</span> {title}
            </>
          )}
        </h2>

        {
          // * Slider Container
        }
        <div className="slider-ctr">
          {items.map((item, i) => (
            <div className="card" key={item.id || i} draggable="false">
              {
                // * Item Image
                // ? Fallback in case there's no image
              }
              <div className="img-ctr">
                <img
                  src={item.img || "/placeholder.png"}
                  alt={item.name || "Item"}
                  loading="lazy"
                />
              </div>

              {
                // * Item Info
              }
              <div className="info">
                <h3 className="name">{item.name || "Unknown"}</h3>
                <p className="genre">{item.genre || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>

        {
          // * View More Link
          // ? Only shows if moreLink is provided
        }
        {moreLink && (
          <Link to={moreLink} className={`more-link ${right ? "right" : ""}`}>
            <span>View More</span>
          </Link>
        )}
      </div>
    </section>
  );
}
