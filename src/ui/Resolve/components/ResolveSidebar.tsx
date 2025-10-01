import { Sidebar } from '@/ui/Core/components';

export function ResolveSidebar() {
  return (
    <Sidebar>
      <Sidebar.Section id='title'>
        <h1>Screenshots</h1>
      </Sidebar.Section>

      <Sidebar.Section id='nav'>
        <Sidebar.Link type='screenshot' isActive>
          Screenshot 1
        </Sidebar.Link>
        <Sidebar.Link type='screenshot'>Screenshot 2</Sidebar.Link>
        <Sidebar.Link type='screenshot'>Screenshot 3</Sidebar.Link>
      </Sidebar.Section>
    </Sidebar>
  );
}
