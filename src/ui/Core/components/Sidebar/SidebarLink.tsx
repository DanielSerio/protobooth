import clsx from 'clsx';
import { PropsWithChildren } from 'react';

/**
 * This not a true link, but rather a tab that represents a particular
 * screenshot/annotation.
 */
export interface SidebarLinkProps extends PropsWithChildren {
  type: 'screenshot' | 'annotation';
  isActive?: boolean;
}

/**
 * SidebarLink component. used as a tab for the annotation/screenshot navigation.
 */
export function SidebarLink({ children, type, isActive }: SidebarLinkProps) {
  const classNames = clsx(
    isActive ? 'active' : null,
    `sidebar-link ${type}-link`
  );

  if (type === 'annotation') {
    return <div className={classNames}>{children}</div>;
  }

  return <div className={classNames}>{children}</div>;
}
