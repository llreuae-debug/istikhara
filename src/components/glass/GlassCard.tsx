import type { HTMLAttributes, ReactNode } from "react";
import { useCardTilt, useGlassPointerLight } from "@/lib/glass/useGlassInteraction";

export type GlassVariant = "glass-1" | "glass-2" | "list" | "solid-verse";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  tilt?: boolean;
  hoverLift?: boolean;
  specular?: boolean;
  children: ReactNode;
}

export function GlassCard({
  variant = "glass-2",
  tilt = false,
  hoverLift = false,
  specular = true,
  className = "",
  children,
  style,
  ...rest
}: GlassCardProps) {
  const light = useGlassPointerLight<HTMLDivElement>();
  const cardTilt = useCardTilt(4, tilt);

  const surfaceClass =
    variant === "solid-verse"
      ? "glass-solid-verse"
      : variant === "list"
        ? "glass-list-card"
        : variant;

  const isVerse = variant === "solid-verse";

  return (
    <div
      ref={light.ref}
      onPointerMove={(e) => {
        if (!isVerse && specular) light.onPointerMove(e);
        if (!isVerse && tilt) cardTilt.onPointerMove(e);
      }}
      onPointerLeave={() => {
        if (!isVerse && tilt) cardTilt.onPointerLeave();
      }}
      style={{
        ...style,
        transform:
          !isVerse && tilt && (cardTilt.tilt.rx !== 0 || cardTilt.tilt.ry !== 0)
            ? `perspective(900px) rotateX(${cardTilt.tilt.rx}deg) rotateY(${cardTilt.tilt.ry}deg)`
            : style?.transform,
        transition: tilt ? "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)" : undefined,
      }}
      className={`rounded-[28px] glass-border-mask ${!isVerse ? "glass-noise" : ""} ${surfaceClass} ${
        hoverLift ? "glass-hover-lift" : ""
      } ${className}`}
      {...rest}
    >
      {!isVerse && specular && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] glass-specular-spot opacity-70"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
