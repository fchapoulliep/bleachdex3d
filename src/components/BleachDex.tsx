/* Importing React and Link from react-router-dom */
import React from "react";

/* Importing Swiper components */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import SwiperCore from "swiper/core";
SwiperCore.use([Keyboard, Navigation]);
import "swiper/swiper-bundle.css";

/* Importing the CSS file */
import "../css/bleachdex.css";

/* Importing the list of Bleach Character */
import bleachCharacterList from "../data/bleachcharacters.json";

/* Importing the Footer component */
import Footer from "./Footer";
import BleachCard from "./BleachCard";

import bleachLogo from "../assets/logo/bleachLogo.png";

/**
 * BleachDex component that displays a list of Bleach Characters as links.
 * Each Bleach Character name is converted to lowercase and used as the URL path.
 *
 * @component
 * @example
 * return (
 *   <BleachDex />
 * )
 */
const BleachDex: React.FC = () => {
  const [bleachCharacterToShow, setBleachCharacterToShow] =
    React.useState(bleachCharacterList);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("");

  /**
   * handleInput function that filters the Bleach Characters list based on the search query.
   */
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterBleachCharacter(query, selectedType);
  };

  /**
   * handleTypeChange function that filters the Bleach Characters list based on the selected type.
   */
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const type = event.target.value;
    setSelectedType(type);
    filterBleachCharacter(searchQuery, type);
  };

  /**
   * Normalizes a given text string by:
   * 1. Decomposing combined graphemes into their constituent parts (NFD normalization).
   * 2. Removing diacritical marks (accents).
   * 3. Converting the text to lowercase.
   *
   * @param text - The input string to be normalized.
   * @returns The normalized string.
   */
  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  /**
   * filterBleachCharacter function that filters the Bleach Characters list based on the search query and type.
   * @param query the search query
   * @param type the selected type
   */
  const filterBleachCharacter = (query: string, type: string) => {
    const filteredbleachCharacter = bleachCharacterList.filter(
      (bleachCharacter) => {
        const matchesName =
          normalizeText(bleachCharacter.name).startsWith(
            normalizeText(query)
          ) ||
          normalizeText(bleachCharacter.name).includes(normalizeText(query));
        const matchesType =
          type === "" ? true : bleachCharacter.city.includes(type);
        return matchesName && matchesType;
      }
    );
    setBleachCharacterToShow(filteredbleachCharacter);
  };

  return (
    <div id="bleachdex">
      <div id="bleachdex-navbar">
        <a
          href={`${import.meta.env.BASE_URL}`}
          style={{ height: "100%", display: "flex", alignItems: "center" }}
        >
          <img src={bleachLogo} alt="Mario Logo" style={{ width: "100px" }} />
        </a>
        <search id="search-bar">
          <input
            name="bleachcharacter-name"
            type="text"
            placeholder="Search Character"
            onInput={handleInput}
          />
          <select name="bleachcharacter-type" onChange={handleTypeChange}>
            <option value="">All Societies</option>
            {Array.from(
              new Set(
                bleachCharacterList.flatMap(
                  (bleachCharacter) => bleachCharacter.city
                )
              )
            ).map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </search>
      </div>
      <div id="bleachdex-container">
        <Swiper
          spaceBetween={30}
          slidesPerView="auto"
          centeredSlides={true}
          freeMode={true}
          navigation={true}
          initialSlide={2}
          keyboard
          cssMode
        >
          {bleachCharacterToShow.map((bleachCharacter, index) => (
            <SwiperSlide
              style={{
                width: "300px",
                textAlign: "center",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              key={index}
            >
              <BleachCard
                key={index}
                name={bleachCharacter.name}
                id={bleachCharacter.id}
                city={bleachCharacter.city}
                type={bleachCharacter.type}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Footer />
    </div>
  );
};

export default BleachDex;
