/**
 * Importing react and the Tilt component. As long as the css
 */
import React, { useEffect, useRef } from "react";
import Tilt from "react-parallax-tilt";
import "../css/bleachcard.css";

import { Link } from "react-router-dom";
import BleachType from "./BleachType";

/**
 * Props for the BleachCard component.
 *
 * @interface BleachCardProps
 * @property {number} id - The unique identifier for the Bleach Character.
 * @property {string} name - The name of the Bleach Character.
 * @property {string} city - The city of the Bleach Character.
 * @property {string} type - The type of the Bleach Character.
 */
interface BleachCardProps {
  id: number;
  name: string;
  type: string[];
  city: string[];
}

/**
 * The tilt library sizes its glare once, when the pointer enters the card.
 * The active card keeps growing after that (a 0.3 s height transition), so a
 * pointer arriving during the growth got a glare sized on the smaller card,
 * which left the corners bare until it came back. The card is measured again
 * whenever its layout size changes. setSize is internal to the library (not in
 * its types): it is called only if present.
 */
function useGlareFollowsSize() {
  const ref = useRef<Tilt>(null);
  useEffect(() => {
    const tilt = ref.current as unknown as {
      setSize?: () => void;
      wrapperEl?: { node: HTMLElement | null };
    } | null;
    const node = tilt?.wrapperEl?.node;
    if (!tilt || !node || typeof tilt.setSize !== "function" || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => tilt.setSize?.());
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/**
 * BleachCard component that displays a Bleach Character card with its name, ID, types, and image.
 */
const BleachCard: React.FC<BleachCardProps> = (bleachcharacter) => {
  const glareRef = useGlareFollowsSize();
  return (
    <Tilt
      ref={glareRef}
      className={`background-stripes bleach-cards ${bleachcharacter.city[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, "-").replace("'s", "")}`}
      glareEnable
      glareMaxOpacity={0.3}
      glareColor="white"
      glarePosition="all"
      glareBorderRadius="20px"
      scale={1.1}
    >
      <div className="inner-element">
        <Link to={`/${bleachcharacter.id}`}>
          <div className="bleach-types">
            {bleachcharacter.type.map((typeItem) => (
              <BleachType key={typeItem} type={typeItem} />
            ))}
          </div>
          <p>{bleachcharacter.name}</p>
          <img
            className="bleach-character-image"
            src={`${import.meta.env.BASE_URL}/sprites/${
              bleachcharacter.name
            }.webp`}
            alt={bleachcharacter.name}
          />
        </Link>
      </div>
    </Tilt>
  );
};

export default BleachCard;
