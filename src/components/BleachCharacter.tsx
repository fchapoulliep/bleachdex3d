/**
 * Importing React, the Loader component, the BleachType component, and the Link component.
 */
import React, { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import bleachList from "../data/bleachcharacters.json";
import Loader from "./Loader";
import * as THREE from "three";
import "../css/BleachCharacter.css";
import BleachType from "./BleachType";
import { Link } from "react-router-dom";

/**
 * Interface for the BleachProps type, which includes the Character ID.
 */
interface BleachProps {
  bleachId: string;
}

/**
 * Interface for the BleachModelProps type, which includes the model path and Character ID.
 */
interface BleachModelProps {
  modelPath: string;
}

/**
 * Component that renders a 3D model of a Bleach Character using the provided model path and Character ID.
 * It handles loading the model, playing idle animations, and adjusting the model's scale and materials.
 *
 * @component
 * @param {BleachModelProps} props - The properties for the BleachModel component.
 * @param {string} props.modelPath - The path to the 3D model file.
 * @returns {JSX.Element} The rendered 3D model of the Bleach Character.
 */
const BleachModel: React.FC<BleachModelProps> = ({ modelPath }) => {
  const { scene, animations } = useGLTF(modelPath);
  const mixer = new THREE.AnimationMixer(scene);
  const [minZoomDistance, setMinZoomDistance] = React.useState(0);

  useEffect(() => {
    if (animations.length > 0) {
      const idleAnimation = animations.find(
        (clip) =>
          clip.name.toLowerCase().includes("idle") ||
          clip.name.toLowerCase().includes("wait") ||
          clip.name === "0"
      );
      const action = mixer.clipAction(idleAnimation || animations[0]);
      action.play();
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
    };
  }, [animations, mixer, scene]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);

      scene.position.y -= center.y;

      const size = new THREE.Vector3();
      box.getSize(size);

      setMinZoomDistance(Math.max(size.x, size.y, size.z) * 0.5);
    }
  }, [scene]);

  return (
    <group>
      <Bounds fit clip observe margin={1.2}>
        <primitive object={scene} />
        <PerspectiveCamera makeDefault position={[0, 10, 50]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.25}
          enableRotate
          target={[0, 0, 0]}
          autoRotate
          minDistance={minZoomDistance}
          maxDistance={5}
        />
      </Bounds>
    </group>
  );
};

/**
 *  Component that renders a Bleach Character page with a 3D model, description, and type information.
 * @param bleachId The ID of the Character to display.
 * @returns The Bleach Character page with the 3D model, description, and type information.
 */
const BleachCharacter: React.FC<BleachProps> = ({ bleachId }) => {
  const bleachcharacter = bleachList.find((p) => p.id === parseInt(bleachId));
  const [loading, setLoading] = React.useState(true);

  const bleachcharacterName = bleachcharacter ? bleachcharacter.name : "";

  const modelPath = useMemo(
    () =>
      `${
        import.meta.env.BASE_URL
      }models/${bleachcharacterName}/${bleachcharacterName}.glb?v=${new Date().getTime()}`,
    [bleachcharacterName]
  );

  useEffect(() => {
    const loader = document.querySelector(".loader");
    if (loader) {
      loader.classList.remove("animation");
    }
    setLoading(false);
  }, [modelPath]);

  if (!bleachcharacter) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        The Bleach Character does not exist
        <Link to="/">Go back to the BleachDex</Link>
      </div>
    );
  }

  useEffect(() => {
    const loader = document.querySelector(".loader");
    if (loader && !loading) {
      setTimeout(() => {
        loader.classList.add("animation");
      }, 1500);
    }
  });

  return (
    <div
      id="bleach-overlay"
      style={{
        backgroundImage: `url(${
          import.meta.env.BASE_URL
        }backgrounds/${bleachcharacter.city[0]
          .normalize("NFD")
          .toLowerCase()
          .replace(/ /g, "-")
          .replace("'s", "")}.webp)`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Loader />
      <div className="bleach-description">
        <h2>{bleachcharacter.name}</h2>
        <p>{bleachcharacter.description}</p>
      </div>
      <div className="bleach-types">
        {bleachcharacter.type.map((typeItem) => (
          <BleachType key={typeItem} type={typeItem} />
        ))}
      </div>

      <Canvas style={{ background: "transparent" }} shadows key={modelPath}>
        <ambientLight intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={2} castShadow />
        <directionalLight position={[5, 5, -5]} intensity={2} castShadow />
        <BleachModel modelPath={modelPath} />
      </Canvas>
    </div>
  );
};

export default BleachCharacter;
