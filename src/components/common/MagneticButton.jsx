import { useEffect, useRef } from "react";
import { cx } from "../../lib/cx";
import { gsap } from "../../lib/gsap";

export default function MagneticButton({
  children,
  className,
  strength = 20,
  disabled = false,
  ...props
}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (disabled || !buttonRef.current) {
      return undefined;
    }

    const button = buttonRef.current;
    const xTo = gsap.quickTo(button, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(button, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    function handlePointerMove(event) {
      const bounds = button.getBoundingClientRect();
      const relativeX = event.clientX - bounds.left - bounds.width / 2;
      const relativeY = event.clientY - bounds.top - bounds.height / 2;

      xTo((relativeX / bounds.width) * strength);
      yTo((relativeY / bounds.height) * strength);
    }

    function resetPosition() {
      xTo(0);
      yTo(0);
    }

    button.addEventListener("pointermove", handlePointerMove);
    button.addEventListener("pointerleave", resetPosition);

    return () => {
      button.removeEventListener("pointermove", handlePointerMove);
      button.removeEventListener("pointerleave", resetPosition);
    };
  }, [disabled, strength]);

  return (
    <button
      ref={buttonRef}
      className={cx("transform-gpu will-change-transform", className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
