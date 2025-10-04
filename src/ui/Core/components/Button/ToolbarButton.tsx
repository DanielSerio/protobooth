import { ForwardedRef, forwardRef } from 'react';
import { clsx } from 'clsx';
import { BaseButtonProps } from './button.props';

export interface ButtonProps extends BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}

function ToolbarButtonComponent(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
  }: ButtonProps,
  ref?: ForwardedRef<HTMLButtonElement>
) {
  const buttonClassName = clsx(
    'btn',
    'btn-toolbar',
    `btn-${variant}`,
    `btn-${size}`,
    className
  );

  return (
    <button ref={ref} className={buttonClassName} {...props}>
      {children}
    </button>
  );
}

export const ToolbarButton = forwardRef(ToolbarButtonComponent);
