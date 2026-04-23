import GetPlatformIcon from "./GetPlatformIcon";
import { useRef, useState, useEffect } from "react";

/*
  ! ItemSlider 
  --------------------------------------------------
  ? Displays a horizontal slider of items (items, products, etc.)

  * Props:
  * - title (string): section title
  * - items (array): list of items to display
  * - right (boolean): flips layout direction (for styling)
  *  - draggable (boolean): allows the motion dragging for certain sliders only
*/

export default function ItemSlider({
  title,
  children,
  right = false,
  pageLink,
  draggable = false,
  sliderClass = "",
}) {
  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    if (!draggable) return;

    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      isDown.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
    };

    const onMouseMove = (e) => {
      if (!isDown.current) return;

      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX.current) * 1.5;

      el.scrollLeft = scrollLeft.current - walk;
    };

    const stop = () => {
      isDown.current = false;
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", stop);
    el.addEventListener("mouseleave", stop);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", stop);
      el.removeEventListener("mouseleave", stop);
    };
  }, [draggable]);

  return (
    <section className="item-slider">
      <div className={`width-wrap ${sliderClass}`}>
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
        <div ref={containerRef} className="slider-ctr">
          {children}
        </div>
        {pageLink}
      </div>
    </section>
  );
}
