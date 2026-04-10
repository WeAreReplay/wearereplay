import {
  BsNintendoSwitch,
  BsPlaystation,
  BsXbox,
  BsApple,
  BsWindows,
} from "react-icons/bs";

/*
  ! GetPlatformIcon
  --------------------------------------------------
  ? Returns the correct platform icon based on input

  * Props:
  * - platform (string): platform name (e.g. "pc", "ps5", "xbox")

  * Example usage:
  * <GetPlatformIcon platform="pc" />
*/

export default function GetPlatformIcon({ platform }) {
  // ! Safety check: prevents crashes if platform is undefined or null
  if (!platform) return <span>Unknown</span>;

  // * Normalize input to avoid case sensitivity issues
  const normalizedPlatform = platform.toLowerCase();

  // * Platform mapping for cleaner logic
  const platformMap = {
    windows: { icon: BsWindows, label: "Windows" },
    mac: { icon: BsApple, label: "Mac" },
    xbox: { icon: BsXbox, label: "Xbox" },
    playstation: { icon: BsPlaystation, label: "PlayStation" },
    nintendo: { icon: BsNintendoSwitch, label: "Nintendo" },
  };

  // * Get platform config
  const platformData = platformMap[normalizedPlatform];

  // ! Fallback if platform is not recognized
  if (!platformData) return <span>{platform}</span>;

  const Icon = platformData.icon;

  return (
    <span className="platform-badge">
      <span className="platform-label">{platformData.label} </span>
      <Icon title={platformData.label} />
    </span>
  );
}
