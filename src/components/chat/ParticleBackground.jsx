import { useMemo } from "react";
import { motion } from "framer-motion";

export default function ParticleBackground({ lite = false }) {
  const particles = useMemo(
    () =>
      Array.from({ length: lite ? 4 : 10 }, (_, index) => ({
        id: index,
        left: `${8 + Math.random() * 84}%`,
        top: `${6 + Math.random() * 84}%`,
        duration: 16 + Math.random() * 10,
        delay: Math.random() * 5,
        size: lite ? 3 + Math.random() * 3 : 4 + Math.random() * 5,
        color:
          index % 2 === 0
            ? "linear-gradient(135deg, rgba(255,107,53,0.95), rgba(255,166,82,0.8))"
            : "linear-gradient(135deg, rgba(34,211,238,0.95), rgba(96,165,250,0.75))",
      })),
    [lite],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) =>
        lite ? (
          <span
            key={particle.id}
            className="absolute rounded-full opacity-50 blur-[0.4px]"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow:
                particle.id % 2 === 0
                  ? "0 0 10px rgba(255,107,53,0.22)"
                  : "0 0 10px rgba(34,211,238,0.18)",
            }}
          />
        ) : (
          <motion.span
            key={particle.id}
            className="absolute rounded-full blur-[0.5px]"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow:
                particle.id % 2 === 0
                  ? "0 0 18px rgba(255,107,53,0.45)"
                  : "0 0 18px rgba(34,211,238,0.4)",
            }}
            animate={{
              y: [0, -22, 0, 18, 0],
              x: [0, 14, -10, 12, 0],
              opacity: [0.12, 0.75, 0.18, 0.65, 0.12],
              scale: [1, 1.15, 0.92, 1.08, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ),
      )}
    </div>
  );
}
