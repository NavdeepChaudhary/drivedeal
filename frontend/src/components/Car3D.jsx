import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Side profiles (x = length, y = height). Front of the car points to +x.
const PROFILES = {
  hatchback: { L: 3.9, belt: 0.98, cabin: [[-1.55, 0.98], [-1.38, 1.5], [0.5, 1.52], [1.05, 0.98]] },
  sedan: { L: 4.5, belt: 0.98, cabin: [[-1.05, 0.98], [-0.72, 1.46], [0.45, 1.48], [0.98, 0.98]] },
  suv: { L: 4.3, belt: 1.08, cabin: [[-1.9, 1.08], [-1.82, 1.74], [0.7, 1.76], [1.2, 1.08]] },
  mpv: { L: 4.5, belt: 1.06, cabin: [[-1.95, 1.06], [-1.86, 1.7], [0.95, 1.72], [1.45, 1.06]] },
};

function roundedProfile(L, y0, y1, r = 0.22) {
  const x0 = -L / 2, x1 = L / 2;
  const s = new THREE.Shape();
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - 0.12);
  s.quadraticCurveTo(x1 - 0.05, y1, x1 - 0.5, y1 + 0.02); // bonnet slope
  s.lineTo(x0 + 0.35, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - 0.2);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

function CarModel({ type = 'hatchback', color = '#c8202b', spin = true }) {
  const group = useRef();
  const p = PROFILES[type] || PROFILES.hatchback;

  const { bodyGeo, cabinGeo, roofGeo } = useMemo(() => {
    const ext = (shape, depth, bevel) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 12 });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    const body = ext(roundedProfile(p.L, 0.38, p.belt, 0.2), 1.62, 0.1);
    const c = p.cabin;
    const cabinShape = new THREE.Shape(c.map(([x, y]) => new THREE.Vector2(x, y)));
    const cabin = ext(cabinShape, 1.4, 0.06);
    const roofShape = new THREE.Shape([
      new THREE.Vector2(c[1][0] + 0.08, c[1][1] - 0.02),
      new THREE.Vector2(c[2][0] - 0.06, c[2][1] - 0.02),
      new THREE.Vector2(c[2][0] - 0.06, c[2][1] + 0.04),
      new THREE.Vector2(c[1][0] + 0.08, c[1][1] + 0.04),
    ]);
    const roof = ext(roofShape, 1.38, 0.05);
    return { bodyGeo: body, cabinGeo: cabin, roofGeo: roof };
  }, [p]);

  useFrame((_, dt) => {
    if (spin && group.current) group.current.rotation.y += dt * 0.35;
  });

  const paint = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, metalness: 0.65, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
    [color]
  );
  const wheelX = p.L / 2 - 0.85;

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh geometry={bodyGeo} material={paint} castShadow />
      <mesh geometry={cabinGeo} castShadow>
        <meshPhysicalMaterial color="#27394a" metalness={0.5} roughness={0.08} clearcoat={1} envMapIntensity={1.4} />
      </mesh>
      <mesh geometry={roofGeo} material={paint} />
      {[-wheelX, wheelX].flatMap((x) => [-1, 1].map((side) => (
        <group key={`${x}${side}`} position={[x, 0.42, side * 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          {/* dark wheel arch */}
          <mesh position={[0, side * 0.1, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.1, 40]} />
            <meshStandardMaterial color="#07080a" roughness={1} />
          </mesh>
          {/* tyre */}
          <mesh castShadow position={[0, side * 0.12, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.3, 40]} />
            <meshStandardMaterial color="#111216" roughness={0.85} />
          </mesh>
          {/* alloy */}
          <mesh position={[0, side * 0.275, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.03, 36]} />
            <meshStandardMaterial color="#d5d9e0" metalness={1} roughness={0.18} />
          </mesh>
          <mesh position={[0, side * 0.295, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.03, 20]} />
            <meshStandardMaterial color="#30343b" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>
      )))}
      {/* head & tail lamps */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={`h${z}`} position={[p.L / 2 + 0.02, p.belt - 0.28, z]}>
          <boxGeometry args={[0.06, 0.12, 0.34]} />
          <meshStandardMaterial color="#fff6d6" emissive="#fff0b8" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {[-0.58, 0.58].map((z) => (
        <mesh key={`t${z}`} position={[-p.L / 2 - 0.02, p.belt - 0.3, z]}>
          <boxGeometry args={[0.06, 0.12, 0.3]} />
          <meshStandardMaterial color="#e11d2e" emissive="#ff1a2a" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <mesh position={[p.L / 2 + 0.01, 0.62, 0]}>
        <boxGeometry args={[0.05, 0.16, 0.7]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function Car3D({ type = 'hatchback', color = '#c8202b', height = 420, controls = true, spin = true, className = '' }) {
  return (
    <div className={className} style={{ height }}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [5.2, 2.1, 5.4], fov: 32 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={3} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={2} position={[6, 1, -2]} scale={[6, 3, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer form="ring" intensity={2} position={[0, 2, -6]} scale={4} />
          </Environment>
          <CarModel type={type} color={color} spin={spin} />
          <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={12} blur={2.6} far={3} />
        </Suspense>
        {controls && (
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.9} maxPolarAngle={1.55} />
        )}
      </Canvas>
    </div>
  );
}
