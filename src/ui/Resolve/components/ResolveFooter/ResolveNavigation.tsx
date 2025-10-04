import { ToolbarStack } from '@/ui/Core/components';
import clsx from 'clsx';

export function ResolveNavigation() {
  const classNames = clsx('flex', 'items-center', 'justify-sp-between');

  return (
    <ToolbarStack.Toolbar className={classNames} id='navMenu'>
      <ToolbarStack.Button>Prev</ToolbarStack.Button>

      <span>1/100</span>

      <ToolbarStack.Button>Next</ToolbarStack.Button>
    </ToolbarStack.Toolbar>
  );
}
