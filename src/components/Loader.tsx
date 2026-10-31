/**
 * Importing React and the loader CSS.
 */
import React from "react";
import "../css/loader.css";

/**
 * Props for the Loader component.
 */
interface LoaderProps {
  /** Fades the loader out, while the model comes forward. */
  closing: boolean;
  /** Called once the loader has faded out, for the page to remove it. */
  onClosed: () => void;
}

/**
 * Loader component that displays a loading animation.
 *
 * This component includes:
 * - A Loader animation.
 *
 * @component
 * @example
 * return (
 *   <Loader />
 * )
 */
const Loader: React.FC<LoaderProps> = ({ closing, onClosed }) => {
  return (
    <div
      className={`loader${closing ? " closing" : ""}`}
      onAnimationEnd={(event) => {
        // The fade-in ends here too, and inner animations bubble up: only the fade-out counts.
        if (event.target === event.currentTarget && event.animationName === "loaderOut") {
          onClosed();
        }
      }}
    >
      <div className="container">
        <div className="load"></div>
      </div>
    </div>
  );
};

export default Loader;
