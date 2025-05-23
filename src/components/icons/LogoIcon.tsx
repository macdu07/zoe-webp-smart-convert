import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 100 100"
      fill="currentColor" // Inherits color from parent, e.g., text-primary
      aria-label="Zoe Convert Logo Icon"
      {...props}
    >
      <rect
        x="25" // Adjusted for better centering in 100x100 box
        y="35"
        width="50" // Adjusted for proportion
        height="30"
        rx="10" // Rounded corners
        ry="10"
        transform="rotate(-20 50 50)" // Slight tilt
      />
    </svg>
  );
}
