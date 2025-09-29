import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';

export interface ToolbarProps extends AreaHTMLAttributes<HTMLAreaElement> {
  id: string;
}

/**
 * Main `Toolbar` component.
 */
export function Toolbar({ id, className, children, ...props }: ToolbarProps) {
  const classNames = clsx(['protobooth-toolbar', id, className]);

  return (
    <section id={id} className={classNames} {...props}>
      {children}
    </section>
  );
}
