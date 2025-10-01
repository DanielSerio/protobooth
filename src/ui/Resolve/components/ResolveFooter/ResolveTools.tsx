import { ToolbarStack } from '@/ui/Core/components';

export default function ResolveTools() {
  const classNames = 'flex justify-between';

  return (
    <ToolbarStack.Toolbar className={classNames} id='toolMenu'>
      <ToolbarStack.Area>
        <ToolbarStack.Button>&</ToolbarStack.Button>
        <ToolbarStack.Button>&</ToolbarStack.Button>
        <ToolbarStack.Button>&</ToolbarStack.Button>
        <ToolbarStack.Button>&</ToolbarStack.Button>
      </ToolbarStack.Area>
    </ToolbarStack.Toolbar>
  );
}
