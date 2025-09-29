import { ForwardedRef, forwardRef, TextareaHTMLAttributes } from 'react';

function TextAreaComponent(
  { ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>,
  ref?: ForwardedRef<HTMLTextAreaElement>
) {
  return <textarea {...props} ref={ref} />;
}

export const TextArea = forwardRef(TextAreaComponent);
