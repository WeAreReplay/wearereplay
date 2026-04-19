import { motion, AnimatePresence } from "motion/react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaBoxOpen,
  FaTruck,
  FaCheck,
} from "react-icons/fa";
import { MdAccessTime, MdInfo } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";

const iconMap = {
  plus: FaPlus,
  edit: FaEdit,
  check: FaCheck,
  box: FaBoxOpen,
  truck: FaTruck,
  trash: FaTrash,
  time: MdAccessTime,
  error: FaXmark,
  info: MdInfo,
};

/*
  ! Color Map
*/
const colorMap = {
  green: "green",
  blue: "blue",
  red: "red",
  black: "black",
  yellow: "yellow",
};

/*
  ! Toast Component
  --------------------------------------------------
  ? Displays animated notification messages.

  * Props:
  * - color: visual theme (green, blue, red, etc.)
  * - icon: icon key from iconMap
  * - title: optional heading text
  * - message: main toast message
  * - isVisible: controls whether toast is shown
*/
const Toast = ({
  color = "blue",
  icon = "info",
  title,
  message,
  isVisible,
}) => {
  const Icon = iconMap[icon] || iconMap.info;
  const colorClass = colorMap[color] || colorMap.blue;

  return (
    <AnimatePresence>
      {
        // * Render toast only when visible
      }
      {isVisible && (
        <motion.div
          className={`toast ${colorClass}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {
            // * Toast Icon
          }
          {<Icon className="icon" />}

          {
            // * Toast Message
          }
          <div className="toast-content">
            <span>{title}</span>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
