import clsx from 'clsx';
import { AreaHTMLAttributes } from 'react';
import { SidebarSection } from './SidebarSection';
import { SidebarLink } from './SidebarLink';

export type SidebarProps = Omit<AreaHTMLAttributes<HTMLAreaElement>, 'id'>;

/**
 * Main Sidebar component.
 */
function Sidebar({ children, className, ...props }: SidebarProps) {
  const classNames = clsx('sidebar', className);

  return (
    <aside id='sidebar' className={classNames} {...props}>
      {children}
    </aside>
  );
}

Sidebar.Section = SidebarSection;
Sidebar.Link = SidebarLink;

export { Sidebar };
