import { ToolbarStack } from '@/ui/Core/components';

export function ResolveFooter() {
  return (
    <ToolbarStack>
      <ToolbarStack.Toolbar id='toolMenu'>
        <h1>Tools</h1>
      </ToolbarStack.Toolbar>
      <ToolbarStack.Toolbar id='navMenu'>
        <h1>Navigation</h1>
      </ToolbarStack.Toolbar>
    </ToolbarStack>
  );
}
