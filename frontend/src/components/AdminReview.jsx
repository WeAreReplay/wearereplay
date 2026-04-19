import { IoClose } from "react-icons/io5";
import { FormatDate } from "./FormatDate";

/*
  ! AdminReview (Reusable - Custom Buttons)
  --------------------------------------------------
  ? Fully flexible review modal
  ? Parent controls button text + actions

  * Props:
  * - title
  * - image (optional)
  * - sections
  * - onClose
  * - primaryAction { label, onClick, className }
  * - secondaryAction { label, onClick, className }
*/

export default function AdminReview({
  title,
  image,
  sections = [],
  onClose,
  primaryAction,
  secondaryAction,
}) {
  if (!sections) return null;

  return (
    <div className="review-wrap">
      <div className="review-ctr">
        <div className="head">
          <h1>{title}</h1>

          <button type="button" className="close-btn" onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        {image && <img src={image} alt={title} className="preview-img" />}

        <div className="review-content">
          {sections.map((section, i) => (
            <div className="info-ctr" key={i}>
              <h2 className="info-title">{section.title}</h2>

              <ul className="info-list">
                {section.items.map((item, j) => (
                  <li
                    key={j}
                    className={`info ${item.isDescription ? "description" : "other"}`}
                  >
                    <span className="label">{item.label}:</span>
                    <span className="data">
                      {item.isDate ? FormatDate(item.value) : item.value || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="opts-ctr">
          {secondaryAction && (
            <li>
              <button onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </button>
            </li>
          )}

          {primaryAction && (
            <li>
              <button
                onClick={primaryAction.onClick}
                className={primaryAction.className}
              >
                {primaryAction.label}
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
