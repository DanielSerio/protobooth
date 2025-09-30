import { AreaHTMLAttributes } from 'react';
import { Toolbar } from './Toolbar';

export type ToolbarStackProps = Omit<AreaHTMLAttributes<HTMLAreaElement>, 'id'>;

function ToolbarStack({ children }: ToolbarStackProps) {
  return (
    <footer id='toolbarStack' className='toolbar-stack'>
      {children}
    </footer>
  );
}

ToolbarStack.Toolbar = Toolbar;

export { ToolbarStack };
