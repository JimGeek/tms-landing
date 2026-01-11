import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, ContactShadows } from '@react-three/drei';

const GateModel = ({ width, height, material, design }) => {
    const group = useRef();

    // Scale factor to map feet to 3D units roughly
    const w = width * 0.5;
    const h = height * 0.5;
    const thickness = 0.2;

    // Material Colors
    const colors = {
        iron: '#2a2a2a',
        steel: '#e0e0e0',
        aluminum: '#d1d5db'
    };

    const matColor = colors[material] || colors.iron;
    const metalness = material === 'iron' ? 0.6 : 0.9;
    const roughness = material === 'iron' ? 0.7 : 0.2;

    // Procedural Bars Generation
    const numBars = Math.floor(width * 1.5); // Density
    const bars = [];
    const spacing = (w - thickness) / numBars; // Adjust spacing logic for group centering

    // Generate bars centered
    // Start x: -w/2 + margin, End x: w/2 - margin
    // We'll just distribute them
    const startX = -w / 2 + 0.3;
    const totalDist = w - 0.6;
    const step = totalDist / (numBars - 1);

    for (let i = 0; i < numBars; i++) {
        bars.push(startX + (i * step));
    }

    return (
        <group ref={group} position={[0, h / 2, 0]}>
            {/* Left Post */}
            <mesh position={[-w / 2, 0, 0]}>
                <boxGeometry args={[0.3, h, 0.3]} />
                <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
            </mesh>

            {/* Right Post */}
            <mesh position={[w / 2, 0, 0]}>
                <boxGeometry args={[0.3, h, 0.3]} />
                <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
            </mesh>

            {/* Top Rail */}
            <mesh position={[0, h / 2 - 0.1, 0]}>
                <boxGeometry args={[w, 0.2, 0.1]} />
                <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
            </mesh>

            {/* Bottom Rail */}
            <mesh position={[0, -h / 2 + 0.1, 0]}>
                <boxGeometry args={[w, 0.2, 0.1]} />
                <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
            </mesh>

            {/* Middle Rail (if Classic) */}
            {design === 'classic' && (
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[w, 0.15, 0.1]} />
                    <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
                </mesh>
            )}

            {/* Vertical Bars */}
            {bars.map((posX, idx) => (
                <mesh key={idx} position={[posX, 0, 0]}>
                    {design === 'minimal' ? (
                        <boxGeometry args={[0.05, h, 0.05]} />
                    ) : (
                        <cylinderGeometry args={[0.03, 0.03, h - 0.4, 8]} />
                    )}
                    <meshStandardMaterial color={matColor} metalness={metalness} roughness={roughness} />
                </mesh>
            ))}

            {/* Decorative Spikes (Classic Only) */}
            {design === 'classic' && bars.map((posX, idx) => (
                <mesh key={`spike-${idx}`} position={[posX, h / 2 + 0.15, 0]}>
                    <coneGeometry args={[0.06, 0.3, 8]} />
                    <meshStandardMaterial color="#d4ae00" metalness={1} roughness={0.1} /> {/* Gold tips */}
                </mesh>
            ))}

        </group>
    );
};

const Gate3D = (props) => {
    return (
        <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
            <color attach="background" args={['#f3f4f6']} />
            <fog attach="fog" args={['#f3f4f6', 10, 20]} />

            <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.5, blur: 2 }}>
                <GateModel {...props} />
            </Stage>

            <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
        </Canvas>
    );
};

export default Gate3D;
