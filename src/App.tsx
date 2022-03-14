import {
  Environment,
  OrbitControls,
  PerspectiveCamera
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import React, {
  Suspense,
  useLayoutEffect,
  useEffect,
  useRef,
  useState
} from "react";
import { useControls } from "leva";
import { Vector3 } from "three";

import "./styles.css";

let environmentMapPresets = [
  "warehouse",
  "sunset",
  "dawn",
  "night",
  "forest",
  "apartment",
  "studio",
  "city",
  "park",
  "lobby"
] as const;

let Torus = React.memo(function Torus({
  position,
  rotation,
  scale,
  clearcoat,
  roughness,
  clearcoatRoughness,
  color,
  setTarget
}: any) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow onPointerDown={(e) => setTarget(e.point)}>
        <torusGeometry args={[1, 0.3, 32, 200]} />
        <meshPhysicalMaterial
          color={color}
          clearcoat={+clearcoat}
          clearcoatRoughness={+clearcoatRoughness}
          roughness={+roughness}
        />
      </mesh>
    </group>
  );
});

function Post({ target = new Vector3(0, 0, 0) }) {
  const { focusDistance, focalLength, bokehScale } = useControls("post", {
    focusDistance: {
      min: 0,
      max: 1,
      value: 0,
      step: 0.01
    },
    focalLength: {
      min: 0.02,
      max: 1,
      value: 0.9999,
      step: 0.01
    },
    bokehScale: {
      min: 0,
      max: 10,
      value: 0
    }
  });

  const dof = useRef();

  const [vec] = useState(() => new Vector3(0, 0, 0));
  useFrame(() => {
    vec.lerp(target, 0.1);
  });
  useLayoutEffect(() => {
    if (dof.current) {
      dof.current.setTarget(vec);
    }
  }, []);

  return (
    <EffectComposer>
      <DepthOfField
        ref={dof}
        focusDistance={0}
        focalLength={0.0486}
        bokehScale={bokehScale}
        height={480}
      />
    </EffectComposer>
  );
}

function Camera() {
  const {
    v: [near, far]
  } = useControls("camera", {
    v: { value: [0.1, 100], min: 0.1, max: 100, step: 0.1 }
  });

  return (
    <PerspectiveCamera
      position={[0, 0, -5]}
      near={near}
      far={far}
      makeDefault
    />
  );
}

export default function Index() {
  const {
    color,
    groundColor,
    count,
    scale,
    contrast,
    roughness,
    clearcoat,
    clearcoatRoughness,
    environmentMapPreset
  } = useControls({
    environmentMapPreset: {
      options: environmentMapPresets
    },
    color: `#5300eb`,
    groundColor: `#b997f8`,
    roughness: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01
    },
    clearcoat: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01
    },
    clearcoatRoughness: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01
    },
    count: {
      value: 34,
      min: 1,
      max: 100,
      step: 1
    },
    scale: {
      value: 1.77,
      min: 0.1,
      max: 5,
      step: 0.01
    },
    contrast: {
      value: 0.3,
      min: 0.1,
      max: 2,
      step: 0.01
    }
  });

  let transforms = React.useMemo(() => {
    return [...Array(+count)].map((e, i) => {
      let monoScale = +scale * (1 + (Math.random() - 0.5) * +contrast);
      return {
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          Math.random() * 50
        ],
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0],
        scale: [monoScale, monoScale, monoScale]
      };
    });
  }, [count, scale, contrast]);

  const [target, setTarget] = useState();
  return (
    <Canvas
      style={{ background: groundColor }}
      dpr={[1, 2]}
      gl={{ antialias: true, depth: false }}
    >
      <OrbitControls />
      <fog attach="fog" args={["lightpink", 60, 100]} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight
          shadow-radius={10}
          position={[0, 0, 10]}
          color="white"
          intensity={0.5}
        />
        <pointLight position={[0, -5, 5]} intensity={0.5} />
        <directionalLight position={[5, 5, 0]} intensity={1} castShadow />
        <Environment preset={environmentMapPreset} />

        <Torus
          roughness={roughness}
          color={color}
          clearcoat={clearcoat}
          clearcoatRoughness={clearcoatRoughness}
          position={[0, 0, 0]}
          scale={1}
          setTarget={setTarget}
        />

        {transforms.map((transform, i) => (
          <Torus
            key={i}
            setTarget={setTarget}
            roughness={roughness}
            color={color}
            clearcoat={clearcoat}
            clearcoatRoughness={clearcoatRoughness}
            {...transform}
          />
        ))}
        <Camera />
        <Post target={target} />
      </Suspense>
    </Canvas>
  );
}
