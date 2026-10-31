import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoltIcon } from '../common/BoltIcon';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ThreeDSSplashProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const ThreeDSSplash: React.FC<ThreeDSSplashProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing 3D Telemetry Twin...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if already seen in session
    const hasSeen = sessionStorage.getItem('voltsure_splash_seen');
    if (hasSeen && !forcePlay) {
      onComplete();
      return;
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    // Non-dark clean slate/white ambient background
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.8, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x84cc16, 2.0); // Volt lime light
    directionalLight.position.set(5, 8, 5);
    scene.add(directionalLight);

    const cyanPointLight = new THREE.PointLight(0x0284c7, 3.0, 20); // Pulse cyan
    cyanPointLight.position.set(-4, 3, 2);
    scene.add(cyanPointLight);

    // --- 3D Center Object: Futuristic EV Battery Hologram & Chassis Core ---
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    // 1. Futuristic EV Chassis Main Body (Low-poly aerodynamic silhouette)
    const bodyGeometry = new THREE.BoxGeometry(2.8, 0.5, 1.4);
    const bodyWireMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const chassisMesh = new THREE.Mesh(bodyGeometry, bodyWireMaterial);
    chassisMesh.position.y = 0.4;
    vehicleGroup.add(chassisMesh);

    // 2. Cabin Windshield Dome (Aerodynamic curve)
    const cabinGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8);
    cabinGeometry.rotateZ(Math.PI / 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const cabinMesh = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabinMesh.position.set(0.1, 0.8, 0);
    vehicleGroup.add(cabinMesh);

    // 3. Glowing Prismatic Energy Core (Battery Pack)
    const coreGeometry = new THREE.OctahedronGeometry(0.65, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x65a30d,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });
    const energyCore = new THREE.Mesh(coreGeometry, coreMaterial);
    energyCore.position.y = 0.4;
    vehicleGroup.add(energyCore);

    // 4. Orbiting Energy Rings (Confidence & Range Rings)
    const ringGeo1 = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x84cc16, transparent: true, opacity: 0.8 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    vehicleGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.8, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    vehicleGroup.add(ring2);

    // 5. Orbiting Telemetry Particles (Data Points)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.2 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i + 1] = radius * Math.sin(phi) + 0.4;
      particlePositions[i + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x65a30d,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    vehicleGroup.add(particleSystem);

    // 6. Ground Telemetry Grid
    const gridHelper = new THREE.GridHelper(20, 24, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // --- Interactive Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous 3D rotation
      vehicleGroup.rotation.y = elapsedTime * 0.45 + mouseX * 0.4;
      vehicleGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 + mouseY * 0.2;
      vehicleGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      // Pulse energy core
      energyCore.rotation.x = elapsedTime * 0.8;
      energyCore.rotation.z = elapsedTime * 0.6;
      const pulseScale = 1 + Math.sin(elapsedTime * 3) * 0.06;
      energyCore.scale.set(pulseScale, pulseScale, pulseScale);

      // Spin rings & particles
      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.x = elapsedTime * 0.25;
      particleSystem.rotation.y = -elapsedTime * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Progress Timeline ---
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 2;
        clearInterval(progressInterval);
        return 100;
      });
    }, 45);

    const s1 = setTimeout(() => setStatusText('Synthesizing Vehicle Aerodynamic & Rolling Resistance Twin...'), 700);
    const s2 = setTimeout(() => setStatusText('Linking Bayesian Charger Freshness Decay...'), 1500);
    const s3 = setTimeout(() => setStatusText('Calibrating 2,000-Scenario Risk Engine...'), 2300);
    const s4 = setTimeout(() => setStatusText('Vehicle Handshake Ready!'), 3100);

    const exitTimer = setTimeout(() => {
      handleComplete();
    }, 3600);

    const handleComplete = () => {
      setIsExiting(true);
      setTimeout(() => {
        sessionStorage.setItem('voltsure_splash_seen', 'true');
        onComplete();
      }, 500);
    };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(exitTimer);
      clearInterval(progressInterval);
      cancelAnimationFrame(animationFrameId);

      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onComplete, forcePlay]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      sessionStorage.setItem('voltsure_splash_seen', 'true');
      onComplete();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between bg-slate-50 text-slate-900 transition-opacity duration-500 select-none ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <div className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-md">
            <BoltIcon size={24} className="text-lime-600" />
          </div>
          <div>
            <span className="font-heading font-black text-2xl tracking-tight text-slate-900">
              VoltSure <span className="text-lime-600 font-mono">AI</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              3D EV Mobility Intelligence
            </span>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-300 text-xs font-mono font-bold text-slate-700 hover:text-slate-950 hover:bg-white shadow-md transition-all"
        >
          <span>Skip 3D Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Telemetry HUD Overlay */}
      <div className="relative z-10 p-6 sm:p-10 max-w-2xl mx-auto w-full text-center space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            &ldquo;Don&rsquo;t just predict the range.{' '}
            <span className="text-lime-600">Prove the journey is feasible.</span>&rdquo;
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {statusText}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Loading 3D Physics Engine</span>
            <span className="font-bold text-lime-700">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-lime-500 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-mono text-slate-600 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-lime-600" />
          <span>Interactive 3D Viewport • Drag to rotate vehicle angle</span>
        </div>
      </div>
    </div>
  );
};

