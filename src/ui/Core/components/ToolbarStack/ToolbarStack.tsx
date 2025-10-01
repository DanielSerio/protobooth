import { AreaHTMLAttributes } from 'react';
import { Toolbar } from './Toolbar';
import { ToolbarButton } from '../Button';
import { ToolbarArea } from './ToolbarArea';

export type ToolbarStackProps = Omit<AreaHTMLAttributes<HTMLAreaElement>, 'id'>;

function ToolbarStack({ children }: ToolbarStackProps) {
  return (
    <footer id='toolbarStack' className='toolbar-stack'>
      {children}
    </footer>
  );
}

ToolbarStack.Toolbar = Toolbar;
ToolbarStack.Button = ToolbarButton;
ToolbarStack.Area = ToolbarArea;

export { ToolbarStack };
