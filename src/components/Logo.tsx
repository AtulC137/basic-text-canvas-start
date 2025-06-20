
import './Logo.css';
import { cn } from '@/lib/utils';

interface LogoProps {
  animated?: boolean;
  className?: string;
}

export const Logo = ({ animated = false, className }: LogoProps) => {
  return (
    <div className={cn(className)} {...(animated && { id: 'triangle' })}>
      <svg id="Layer_1" data-name="Layer 1" version="1.1" viewBox="0 0 2000 2000">
        <polygon
          className={animated ? 'cls-1' : 'static-cls-1'}
          points="928 781 1021 951 784.5 1371.97 1618 1371.97 1530.32 1544 509 1539 928 781"
        ></polygon>
        <polygon
          className={animated ? 'cls-3' : 'static-cls-3'}
          points="1618 1371.97 784.5 1371.97 874.93 1211 1346 1211 923.1 456 1110.06 456 1618 1371.97"
        ></polygon>
        <g id="Layer_2" data-name="Layer 2">
          <polygon
            className={animated ? 'cls-2' : 'static-cls-2'}
            points="418 1372.74 509 1539 928 781 1162.32 1211 1346 1211 923.1 456 418 1372.74"
          ></polygon>
        </g>
      </svg>
    </div>
  );
};
