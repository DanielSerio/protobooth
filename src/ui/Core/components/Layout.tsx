import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';

export interface LayoutProps extends AreaHTMLAttributes<HTMLDivElement> {
  id: string;
}

/**
 * Main layout component. Encapsulates namespaced classNames
 * @returns The layout component
 */
export function Layout({ children, id, className, ...props }: LayoutProps) {
  const classNames = clsx(['layout', className]);

  return (
    <div className={classNames} id={id} {...props}>
      {children}
    </div>
  );
}
