import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function EarthSphere() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
      // subtle mouse parallax tilt
      earthRef.current.rotation.x = THREE.MathUtils.lerp(
        earthRef.current.rotation.x,
        pointer.y * 0.25,
        0.05
      );
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.1;
    }
  });

  // Procedural earth-like surface via canvas texture
  const earthTexture = useMemo(() => createEarthTexture(), []);
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  return (
    <group>
      {/* Earth body */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.85}
          metalness={0.1}
          emissive={new THREE.Color('#0a1410')}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.015}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmoRef} scale={1.15}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial
          color="#3b8ab5"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial
          color="#7ba593"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function createEarthTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  // ocean base
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0a2136');
  grad.addColorStop(0.5, '#0e3050');
  grad.addColorStop(1, '#061421');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // land masses — organic blobs
  const continents = [
    { x: 0.15, y: 0.35, r: 0.12 },
    { x: 0.28, y: 0.55, r: 0.08 },
    { x: 0.48, y: 0.3, r: 0.14 },
    { x: 0.62, y: 0.5, r: 0.1 },
    { x: 0.78, y: 0.4, r: 0.11 },
    { x: 0.88, y: 0.6, r: 0.07 },
    { x: 0.4, y: 0.65, r: 0.06 },
  ];

  for (const c of continents) {
    const cx = c.x * canvas.width;
    const cy = c.y * canvas.height;
    const rad = c.r * canvas.width;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, '#2d5141');
    g.addColorStop(0.6, '#1d3528');
    g.addColorStop(1, 'rgba(13,53,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    // irregular shape
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const variance = 0.7 + Math.random() * 0.6;
      const px = cx + Math.cos(a) * rad * variance;
      const py = cy + Math.sin(a) * rad * variance * 0.7;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // subtle noise
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCloudTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const rad = Math.random() * 40 + 15;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, 'rgba(244,241,234,0.4)');
    g.addColorStop(1, 'rgba(244,241,234,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface EarthSceneProps {
  className?: string;
}

export function EarthScene({ className = '' }: EarthSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.3} color="#e7d3a4" />
        <pointLight position={[-5, -2, -3]} intensity={0.5} color="#3b8ab5" />
        <EarthSphere />
        <Stars radius={50} depth={30} count={1200} factor={3} fade speed={0.5} />
      </Canvas>
    </div>
  );
}
