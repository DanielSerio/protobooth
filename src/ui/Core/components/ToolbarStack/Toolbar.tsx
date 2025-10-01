import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';

export interface ToolbarProps extends AreaHTMLAttributes<HTMLDivElement> {
  id: string;
}

/**
 * Main `Toolbar` component.
 */
export function Toolbar({ id, className, children, ...props }: ToolbarProps) {
  const classNames = clsx(['toolbar', id, className]);

  return (
    <div id={id} className={classNames} {...props}>
      {children}
    </div>
  );
}
