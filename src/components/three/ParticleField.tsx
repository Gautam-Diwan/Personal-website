import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildShape } from "./shapes";
import { GROUPS, GROUP_BY_ID, type SceneShape } from "../../lib/groups";

type Props = {
  shape: SceneShape;
  isDark: boolean;
  reducedMotion: boolean;
  /** Horizontal placement: "right" leaves room for hero copy on wide screens */
  align: "center" | "right";
};

const vertex = /* glsl */ `
  attribute vec3 color;
  attribute float aRand;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.65 + 0.35 * sin(uTime * 1.6 + aRand * 6.2831);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRand * 0.8) * tw / -mv.z;
    gl_Position = projectionMatrix * mv;
    vColor = color;
    vTwinkle = tw;
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.8);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * uOpacity * (0.55 + 0.45 * vTwinkle));
  }
`;

function buildColors(shape: SceneShape, positions: Float32Array, isDark: boolean) {
  const n = positions.length / 3;
  const out = new Float32Array(n * 3);
  const idx = isDark ? 0 : 1;
  const white = new THREE.Color(isDark ? "#ffffff" : "#0c0e13");
  const c = new THREE.Color();

  if (shape === "home") {
    // Sweep through all four domain colors around the vertical axis
    const palette = GROUPS.map((g) => new THREE.Color(g.hex[idx]));
    for (let i = 0; i < n; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const t = ((Math.atan2(z, x) / (Math.PI * 2) + 1) % 1) * palette.length;
      const k = Math.floor(t);
      c.copy(palette[k % palette.length]).lerp(palette[(k + 1) % palette.length], t - k);
      c.lerp(white, (i * 0.618) % 1 < 0.12 ? 0.55 : 0.05);
      c.toArray(out, i * 3);
    }
    return out;
  }

  const base = new THREE.Color(GROUP_BY_ID[shape].hex[idx]);
  for (let i = 0; i < n; i++) {
    const mix = (i * 0.618033) % 1;
    c.copy(base).lerp(white, mix < 0.15 ? 0.6 : mix * 0.12);
    c.toArray(out, i * 3);
  }
  return out;
}

function Points({ shape, isDark, reducedMotion, align }: Props) {
  const { size, viewport, gl } = useThree();
  const count = size.width < 768 ? 3200 : 6000;

  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const target = useRef<{ pos: Float32Array; col: Float32Array } | null>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uOpacity: { value: 0.9 },
        },
      }),
    [],
  );

  // Allocate buffers when count changes; start from the target shape
  useEffect(() => {
    const pos = buildShape(shape, count);
    const col = buildColors(shape, pos, isDark);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = ((i * 0.754877666) % 1 + (i * 0.569840291) % 1) % 1;
    // Start scattered so the first shape assembles on load
    const start = new Float32Array(pos.length);
    for (let i = 0; i < start.length; i++) start[i] = pos[i] * (reducedMotion ? 1 : 2.6) + (reducedMotion ? 0 : Math.sin(i * 12.9898) * 1.5);
    geometry.setAttribute("position", new THREE.BufferAttribute(start, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(col.slice(), 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    target.current = { pos, col };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, geometry]);

  // Retarget when shape or theme changes
  useEffect(() => {
    const pos = buildShape(shape, count);
    target.current = { pos, col: buildColors(shape, pos, isDark) };
    material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.uniforms.uOpacity.value = isDark ? 0.9 : 0.75;
    material.needsUpdate = true;
  }, [shape, isDark, count, material]);

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += reducedMotion ? 0 : dt;
    const t = target.current;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    const colAttr = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (t && posAttr && colAttr && posAttr.count === t.pos.length / 3) {
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 2.6);
      const p = posAttr.array as Float32Array;
      const c = colAttr.array as Float32Array;
      for (let i = 0; i < p.length; i++) {
        p[i] += (t.pos[i] - p[i]) * k;
        c[i] += (t.col[i] - c[i]) * k;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    const g = group.current;
    if (!g) return;
    if (!reducedMotion) g.rotation.y += dt * 0.09;
    const px = reducedMotion ? 0 : state.pointer.x;
    const py = reducedMotion ? 0 : state.pointer.y;
    g.rotation.x += ((shape === "ai" ? 0.5 : 0.12) - py * 0.18 - g.rotation.x) * 0.04;
    g.rotation.z += (px * 0.08 - g.rotation.z) * 0.04;
    const wide = size.width >= 1024;
    const tx = align === "right" && wide ? viewport.width * 0.2 : 0;
    g.position.x += (tx - g.position.x) * 0.05;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default function ParticleField(props: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <Points {...props} />
    </Canvas>
  );
}
