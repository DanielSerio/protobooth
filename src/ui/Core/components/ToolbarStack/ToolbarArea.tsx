import { ElementType, ComponentPropsWithoutRef } from 'react';

type ToolbarAreaOwnProps<E extends ElementType = ElementType> = {
  as?: E;
  children?: React.ReactNode;
};

export type ToolbarAreaProps<E extends ElementType> = ToolbarAreaOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ToolbarAreaOwnProps>;

const defaultElement = 'section';

export function ToolbarArea<E extends ElementType = typeof defaultElement>({
  as,
  children,
  ...restProps
}: ToolbarAreaProps<E>) {
  const Component = as || defaultElement;

  return <Component {...restProps}>{children}</Component>;
}
