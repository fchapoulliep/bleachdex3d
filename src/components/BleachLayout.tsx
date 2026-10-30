// BleachLayout.tsx
import React from "react";
import NavBar from "./NavBar";
import Slider from "./Slider";
import { useParams } from "react-router-dom";
import BleachCharacter from "./BleachCharacter";
import bleachList from "../data/bleachcharacters.json";

// Read from the data rather than hardcoded, so the right arrow stays correct when characters are added.
const lastId = String(Math.max(...bleachList.map((c) => c.id)));

/**
 * `BleachLayout` is a React functional component that renders the layout for displaying a Bleach Character.
 * It uses the `useParams` hook to extract the `bleachId` from the URL parameters.
 *
 * The component includes:
 * - A `NavBar` component at the top.
 * - A `Slider` component with direction "left" if the `bleachId` is not "1".
 * - A `BleachCharacter` component that displays the Character based on the `bleachId` or a default ID if `bleachId` is not available.
 * - A `Slider` component with direction "right" if the `bleachId` is not the last character's id.
 *
 * @returns {JSX.Element} The rendered layout for the Bleach Character page.
 */
const BleachLayout: React.FC = () => {
  const { bleachId } = useParams<{ bleachId: string }>();

  return (
    <>
      <NavBar />
      {bleachId !== "1" && <Slider direction="left" />}
      <BleachCharacter bleachId={bleachId || "defaultId"} />
      {bleachId !== lastId && <Slider direction="right" />}
    </>
  );
};

export default BleachLayout;
