import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';
import { SidebarSection } from './SidebarSection';

export type SidebarProps = Omit<AreaHTMLAttributes<HTMLAreaElement>, 'id'>;

/**
 * Main Sidebar component.
 */
function Sidebar({ children, className, ...props }: SidebarProps) {
  const classNames = clsx('protobooth-toolbar-stack', className);

  return (
    <aside id='sidebar' className={classNames} {...props}>
      {children}
    </aside>
  );
}

Sidebar.Section = SidebarSection;

export { Sidebar };
