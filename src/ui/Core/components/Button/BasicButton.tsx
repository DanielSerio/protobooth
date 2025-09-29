import { ForwardedRef, forwardRef } from 'react';
import { BaseButtonProps } from './button.props';

function BasicButtonComponent(
  { children, ...props }: BaseButtonProps,
  ref?: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
}

export const BasicButton = forwardRef(BasicButtonComponent);
