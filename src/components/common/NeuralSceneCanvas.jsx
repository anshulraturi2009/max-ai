import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusKnotGeometry,
  WebGLRenderer,
} from "three";
import { usePerformance } from "../../context/PerformanceContext";
import { cx } from "../../lib/cx";

export default function NeuralSceneCanvas({
  accent = "101, 229, 255",
  className,
}) {
  const mountRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const { isLowPerformance } = usePerformance();

  useEffect(() => {
    if (isLowPerformance || !mountRef.current) {
      return undefined;
    }

    const container = mountRef.current;
    const scene = new Scene();
    const camera = new PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const accentColor = new Color(`rgb(${accent})`);
    const secondaryColor = new Color("#8f7cff");

    const rootGroup = new Group();
    scene.add(rootGroup);

    const orbGeometry = new IcosahedronGeometry(1.75, 5);
    const orbMaterial = new MeshPhysicalMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.55,
      roughness: 0.18,
      metalness: 0.68,
      transmission: 0.28,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
    });
    const orb = new Mesh(orbGeometry, orbMaterial);
    rootGroup.add(orb);

    const frameGeometry = new TorusKnotGeometry(2.5, 0.035, 260, 24);
    const frameMaterial = new MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.38,
      wireframe: true,
    });
    const frame = new Mesh(frameGeometry, frameMaterial);
    frame.rotation.set(Math.PI / 4, Math.PI / 6, 0);
    rootGroup.add(frame);

    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 3.4 + Math.random() * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pointIndex = index * 3;

      particlePositions[pointIndex] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[pointIndex + 1] =
        radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[pointIndex + 2] = radius * Math.cos(phi);
    }

    const particlesGeometry = new BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new BufferAttribute(particlePositions, 3),
    );

    const particlesMaterial = new PointsMaterial({
      color: accentColor,
      size: 0.028,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const particles = new Points(particlesGeometry, particlesMaterial);
    rootGroup.add(particles);

    const ambientLight = new AmbientLight("#7dd3fc", 0.75);
    const keyLight = new PointLight(accentColor, 3.5, 24, 2.1);
    keyLight.position.set(3.8, 2.4, 5.5);
    const rimLight = new PointLight("#ffffff", 1.6, 26, 2.2);
    rimLight.position.set(-4.4, -2.4, 4.2);
    scene.add(ambientLight, keyLight, rimLight);

    function handleResize() {
      if (!container.clientWidth || !container.clientHeight) {
        return;
      }

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function handlePointerMove(event) {
      const bounds = container.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerRef.current.y = -(
        ((event.clientY - bounds.top) / bounds.height - 0.5) *
        2
      );
    }

    function handlePointerLeave() {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    }

    const clock = new Clock();
    let frameId = 0;

    function renderFrame() {
      const elapsed = clock.getElapsedTime();
      const { x, y } = pointerRef.current;

      rootGroup.rotation.y = elapsed * 0.18 + x * 0.22;
      rootGroup.rotation.x = elapsed * 0.08 + y * 0.16;
      rootGroup.position.x = x * 0.38;
      rootGroup.position.y = y * 0.24;
      rootGroup.position.z = Math.sin(elapsed * 0.9) * 0.2;

      frame.rotation.y = elapsed * 0.15;
      frame.rotation.z = elapsed * 0.12;
      particles.rotation.y = -elapsed * 0.04;
      particles.rotation.z = elapsed * 0.025;
      orb.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.015);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    }

    handleResize();
    renderFrame();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      renderer.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [accent, isLowPerformance]);

  if (isLowPerformance) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className={cx(
        "pointer-events-none absolute inset-0 opacity-85 mix-blend-screen",
        className,
      )}
      aria-hidden="true"
    />
  );
}
