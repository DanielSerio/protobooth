import { ToolbarStack } from '@/ui/Core/components';
import ResolveTools from './ResolveTools';
import { ResolveNavigation } from './ResolveNavigation';

export function ResolveFooter() {
  return (
    <ToolbarStack>
      <ResolveTools />

      <ResolveNavigation />
    </ToolbarStack>
  );
}
