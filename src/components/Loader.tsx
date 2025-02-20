/**
 * Importing React and the loader CSS.
 */
import React from "react";
import "../css/loader.css";

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
const Loader: React.FC = () => {
  return (
    <div className="loader">
      <div className="container">
        <div className="load"></div>
      </div>
    </div>
  );
};

export default Loader;
