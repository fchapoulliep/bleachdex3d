/**
 * Importing React and the BleachType CSS.
 */
import React from "react";
import "../css/bleachtype.css";

/**
 * Interface for the BleachTypeProps type, which includes the Bleach Character type.
 */
interface BleachTypeProps {
  type: string;
}

/**
 * A React functional component that displays a Bleach Character type icon and its name.
 *
 * @component
 * @param {BleachTypeProps} props - The properties object.
 * @param {string} props.type - The type of the Bleach Character.
 * @returns {JSX.Element} A div containing an image of the Bleach Character type and its name.
 */
const BleachType: React.FC<BleachTypeProps> = ({ type }) => {
  return (
    <div className={`type-div`}>
      <img
        className="bleach-type"
        id={type
          .normalize("NFD")
          .replace(" ", "-")
          .replace("'s", "")
          .toLowerCase()}
        src={`${import.meta.env.BASE_URL}type_icons/${type
          .normalize("NFD")
          .replace(" ", "-")
          .replace("'s", "")
          .toLowerCase()}.svg`}
        alt={type}
      />
      <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
    </div>
  );
};

export default BleachType;
