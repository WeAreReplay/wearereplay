import { motion, AnimatePresence } from "motion/react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaBoxOpen,
  FaTruck,
  FaCheck,
} from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";

/*
  ! Toast Icons Map
  --------------------------------------------------
  ? Maps toast types to corresponding icons

  * Types:
  * - added: item created
  * - edited: item updated
  * - deleted: item removed
  * - rented: item rented/active
  * - due: item nearing deadline
  * - overdue: item past deadline
  * - delivery: item out for delivery
*/
const icons = {
  added: <FaPlus />,
  edited: <FaEdit />,
  deleted: <FaTrash />,
  rented: <FaBoxOpen />,
  due: <MdAccessTime />,
  overdue: <MdAccessTime />,
  delivery: <FaTruck />,
  correct: <FaCheck />,
  wrong: <FaXmark />,
};

/*
  ! Toast Component
  --------------------------------------------------
  ? Animated notification popup component

  * Props:
  * - type (string): toast type (added, edited, deleted, etc.)
  * - message (string): text message to display
  * - isVisible (boolean): controls visibility of toast
*/
const Toast = ({ type, message, isVisible }) => {
  return (
    <AnimatePresence>
      {
        // * Render toast only when visible
      }
      {isVisible && (
        <motion.div
          className={`toast ${type}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {
            // * Render icon based on toast type
          }
          {icons[type]}

          {
            // * Toast Message
          }
          <p>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
