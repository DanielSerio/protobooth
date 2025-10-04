import { Sidebar } from '@/ui/Core/components';

export interface Screenshot {
  route: string;
  viewport: string;
  filePath: string;
  dimensions: { width: number; height: number };
  timestamp: Date;
}

export interface ResolveSidebarProps {
  screenshots?: Screenshot[];
  activeScreenshotIndex?: number | null;
  onScreenshotSelect?: (index: number) => void;
}

interface RouteGroup {
  route: string;
  screenshots: { screenshot: Screenshot; index: number }[];
}

export function ResolveSidebar({
  screenshots = [],
  activeScreenshotIndex = null,
  onScreenshotSelect = () => {},
}: ResolveSidebarProps) {
  // Group screenshots by route
  const groupedScreenshots: RouteGroup[] = screenshots.reduce(
    (groups: RouteGroup[], screenshot, index) => {
      const existingGroup = groups.find((g) => g.route === screenshot.route);
      if (existingGroup) {
        existingGroup.screenshots.push({ screenshot, index });
      } else {
        groups.push({
          route: screenshot.route,
          screenshots: [{ screenshot, index }],
        });
      }
      return groups;
    },
    []
  );

  return (
    <Sidebar>
      <Sidebar.Section id='title'>
        <h1 data-testid='sidebar-title'>Screenshots</h1>
      </Sidebar.Section>

      <Sidebar.Section id='nav'>
        {screenshots.length === 0 ? (
          <div data-testid='sidebar-empty-state' className='sidebar-empty'>
            <p>No screenshots captured yet</p>
          </div>
        ) : (
          groupedScreenshots.map((group, groupIndex) => (
            <div
              key={group.route}
              data-testid={`route-group-${groupIndex}`}
              className='route-group'>
              <h3 className='route-group-title'>{group.route}</h3>
              {group.screenshots.map(({ screenshot, index }) => {
                const isActive = index === activeScreenshotIndex;
                return (
                  <Sidebar.Link
                    key={index}
                    type='screenshot'
                    isActive={isActive}
                    onClick={() => onScreenshotSelect(index)}
                    data-testid={`screenshot-link-${index}`}
                    data-active={isActive}>
                    <div className='screenshot-info'>
                      <span className='viewport-name'>{screenshot.viewport}</span>
                      <span className='viewport-dimensions'>
                        {screenshot.dimensions.width}×{screenshot.dimensions.height}
                      </span>
                    </div>
                  </Sidebar.Link>
                );
              })}
            </div>
          ))
        )}
      </Sidebar.Section>
    </Sidebar>
  );
}
