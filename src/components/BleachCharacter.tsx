/**
 * Importing React, the Loader component, the BleachType component, and the Link component.
 */
import React, { Suspense, useEffect, useMemo, useRef } from "react";
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
import "../css/bleachcharacter.css";
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
  /** Comes forward from far behind its place, rather than showing up in place. */
  comesForward: boolean;
  /** Called once the model is drawn and its framing has settled. */
  onReady: () => void;
}

/** How long the model takes to come forward to its place, in seconds. */
const ENTRANCE_S = 0.5;

/**
 * How far behind its place the model starts, in camera distances: the camera
 * distance depends on the model's size (Bounds fit, clamped by the controls),
 * and 4 more puts it 5 times as far, so it first shows at a fifth of its size.
 */
const ENTRANCE_DEPTH = 4;

/**
 * Component that renders a 3D model of a Bleach Character using the provided model path and Character ID.
 * It handles loading the model, playing idle animations, and adjusting the model's scale and materials.
 *
 * @component
 * @param {BleachModelProps} props - The properties for the BleachModel component.
 * @param {string} props.modelPath - The path to the 3D model file.
 * @returns {JSX.Element} The rendered 3D model of the Bleach Character.
 */
const BleachModel: React.FC<BleachModelProps> = ({
  modelPath,
  comesForward,
  onReady,
}) => {
  const { scene, animations } = useGLTF(modelPath);
  // One mixer per model: created on every render, it restarted the animation
  // each time the page changed state (loader, description), hence the jolts
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const frames = useRef(0);
  const group = useRef<THREE.Group>(null);
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const entrance = useRef<{ from: THREE.Vector3; elapsed: number } | null>(null);
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

  useFrame(({ camera }, delta) => {
    mixer.update(delta);
    // A few frames let the framing settle (centering, scale, camera fit): only
    // then is the model shown, coming forward from far behind its place.
    frames.current += 1;
    if (frames.current === 5) {
      if (comesForward) {
        // Along the line of sight, from the orbit target to the camera, so that
        // the far-away model stands right behind the loader
        const target = controls.current?.target ?? new THREE.Vector3();
        const from = camera.position.clone().sub(target).multiplyScalar(-ENTRANCE_DEPTH);
        entrance.current = { from, elapsed: 0 };
      }
      onReady();
    }

    const move = entrance.current;
    if (move && group.current) {
      // A long first frame (shader compilation) must not skip half the move
      move.elapsed = Math.min(move.elapsed + Math.min(delta, 1 / 30), ENTRANCE_S);
      const progress = move.elapsed / ENTRANCE_S;
      // Fast at first, then slows down to settle in place
      const eased = 1 - Math.pow(1 - progress, 3);
      group.current.position.copy(move.from).multiplyScalar(1 - eased);
    }
  });

  useEffect(() => {
    if (scene) {
      // A model already seen comes back from the cache with the position of its
      // last visit: start from the origin so that it is centered the same way.
      scene.position.set(0, 0, 0);
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
      {/* The camera frames the model at once rather than gliding to it */}
      <Bounds fit clip observe margin={1.2} maxDuration={0.001}>
        {/* Moved by the entrance: it holds the model only, since the camera
            would otherwise move along with it */}
        <group ref={group}>
          <primitive object={scene} />
        </group>
        <PerspectiveCamera makeDefault position={[0, 10, 50]} />
        <OrbitControls
          ref={controls}
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
 * Models drawn during this visit. drei keeps them in memory: they show up in
 * place at once, without coming forward again.
 */
const seenModels = new Set<string>();

/**
 * How long a model may take to show before the loader appears: a quick one,
 * such as a model already seen during the visit, needs none.
 */
const LOADER_DELAY_MS = 150;

/**
 *  Component that renders a Bleach Character page with a 3D model, description, and type information.
 * @param bleachId The ID of the Character to display.
 * @returns The Bleach Character page with the 3D model, description, and type information.
 */
const BleachCharacter: React.FC<BleachProps> = ({ bleachId }) => {
  const bleachcharacter = bleachList.find((p) => p.id === parseInt(bleachId));

  const bleachcharacterName = bleachcharacter ? bleachcharacter.name : "";

  const modelPath = useMemo(
    () =>
      `${
        import.meta.env.BASE_URL
      }models/${bleachcharacterName}/${bleachcharacterName}.glb?v=${__BUILD_ID__}`,
    [bleachcharacterName]
  );

  // The loader stands where the model will appear, and only once the model
  // has taken more than LOADER_DELAY_MS to show.
  const [loaderPhase, setLoaderPhase] = React.useState<
    "visible" | "closing" | "hidden"
  >("hidden");
  const [drawnPath, setDrawnPath] = React.useState<string | null>(null);
  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  const modelDrawn = drawnPath === modelPath;
  // Decided once per model, before the effect below marks it as seen
  const comesForward = useMemo(() => !seenModels.has(modelPath), [modelPath]);

  useEffect(() => {
    if (modelDrawn) return;
    const timer = setTimeout(() => setLoaderPhase("visible"), LOADER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [modelDrawn, modelPath]);

  useEffect(() => {
    if (!modelDrawn) return;
    seenModels.add(modelPath);
    // The loader fades out while the model comes forward
    setLoaderPhase((phase) => (phase === "visible" ? "closing" : phase));
  }, [modelDrawn, modelPath]);

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
      {loaderPhase !== "hidden" && (
        <Loader
          closing={loaderPhase === "closing"}
          onClosed={() => setLoaderPhase("hidden")}
        />
      )}
      {/* On phones the description folds into a bar with the name, opened on demand;
          on wider screens it is always open and the toggle is hidden */}
      <div className={`bleach-description${descriptionOpen ? " open" : ""}`}>
        <div className="description-head">
          <h2>{bleachcharacter.name}</h2>
          <button
            type="button"
            className="description-toggle"
            aria-expanded={descriptionOpen}
            aria-controls="bleach-details"
            aria-label={descriptionOpen ? "Hide the description" : "Show the description"}
            onClick={() => setDescriptionOpen((open) => !open)}
          >
            {/* Lucide "chevron-up" icon (ISC license) */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
        </div>
        <div id="bleach-details" className="description-details">
          <p>{bleachcharacter.description}</p>
        </div>
      </div>
      <div className="bleach-types">
        {bleachcharacter.type.map((typeItem) => (
          <BleachType key={typeItem} type={typeItem} />
        ))}
      </div>

      <Canvas style={{
          background: "transparent",
          // Hidden until the model is in place, then faded in
          opacity: modelDrawn ? 1 : 0,
          transition: "opacity 150ms",
        }} shadows key={modelPath}>
        <ambientLight intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={2} castShadow />
        <directionalLight position={[5, 5, -5]} intensity={2} castShadow />
        {/* A model still loading suspends the scene only: without this boundary,
            the page itself would wait, and the previous page would stay on screen */}
        <Suspense fallback={null}>
          <BleachModel
            modelPath={modelPath}
            comesForward={comesForward}
            onReady={() => setDrawnPath(modelPath)}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BleachCharacter;
