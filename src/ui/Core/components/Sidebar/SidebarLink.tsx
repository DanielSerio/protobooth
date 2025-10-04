import clsx from 'clsx';
import { PropsWithChildren, HTMLAttributes } from 'react';

/**
 * This not a true link, but rather a tab that represents a particular
 * screenshot/annotation.
 */
export interface SidebarLinkProps
  extends PropsWithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'type'> {
  type: 'screenshot' | 'annotation';
  isActive?: boolean;
}

/**
 * SidebarLink component. used as a tab for the annotation/screenshot navigation.
 */
export function SidebarLink({
  children,
  type,
  isActive,
  ...props
}: SidebarLinkProps) {
  const classNames = clsx(
    isActive ? 'active' : null,
    `sidebar-link ${type}-link`
  );

  if (type === 'annotation') {
    return (
      <div className={classNames} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
