import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

/*
  ! Overlay
  --------------------------------------------------
  ? A full-screen semi-transparent overlay
  ? Used for modals, menus, drawers, etc.
  
  * Props:
  * - isModalOpen (boolean): controls visibility of the overlay
  * - onClick (function): triggers when user clicks the overlay (usually to close)
*/

export default function Overlay({ isModalOpen, onClick }) {
  /*
    ! Lock body scroll when overlay is open
    * Prevents background scrolling (important UX)
  */
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // ! Cleanup to ensure scroll is restored
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    // * AnimatePresence allows exit animations when component unmounts
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          key="overlay"
          className="overlay"
          // * Initial state (before animation)
          initial={{ opacity: 0 }}
          // * Animate to visible
          animate={{ opacity: 1 }}
          // * Exit animation when removed
          exit={{ opacity: 0 }}
          // * Smooth fade transition
          transition={{ duration: 0.25, ease: "easeInOut" }}
          // ! Clicking overlay usually closes modal/menu
          onClick={onClick}
        />
      )}
    </AnimatePresence>
  );
}
