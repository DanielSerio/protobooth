import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';

export interface SidebarSectionProps
  extends AreaHTMLAttributes<HTMLAreaElement> {
  id: string;
}

/**
 * Main `SidebarSection` component.
 */
export function SidebarSection({
  id,
  className,
  children,
  ...props
}: SidebarSectionProps) {
  const classNames = clsx(['sidebar-section', id, className]);

  return (
    <section id={id} className={classNames} {...props}>
      {children}
    </section>
  );
}
