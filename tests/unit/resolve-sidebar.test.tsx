import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveSidebar } from '@/ui/Resolve/components/ResolveSidebar';

describe('ResolveSidebar Component', () => {
  const mockOnScreenshotSelect = vi.fn();

  const mockScreenshots = [
    {
      route: '/home',
      viewport: 'desktop',
      filePath: '/screenshots/home_desktop.png',
      dimensions: { width: 1440, height: 900 },
      timestamp: new Date('2025-10-04T10:00:00Z'),
    },
    {
      route: '/home',
      viewport: 'mobile',
      filePath: '/screenshots/home_mobile.png',
      dimensions: { width: 375, height: 667 },
      timestamp: new Date('2025-10-04T10:00:00Z'),
    },
    {
      route: '/about',
      viewport: 'desktop',
      filePath: '/screenshots/about_desktop.png',
      dimensions: { width: 1440, height: 900 },
      timestamp: new Date('2025-10-04T10:00:00Z'),
    },
  ];

  beforeEach(() => {
    mockOnScreenshotSelect.mockClear();
  });

  it('should render sidebar with title', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    expect(screen.getByTestId('sidebar-title')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('Screenshots');
  });

  it('should render all screenshots from props', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    // Should have 3 screenshot links
    const screenshotLinks = screen.getAllByTestId(/^screenshot-link-/);
    expect(screenshotLinks).toHaveLength(3);
  });

  it('should display viewport information in screenshot links', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    // Check first screenshot link shows viewport
    expect(screen.getByTestId('screenshot-link-0')).toHaveTextContent('desktop');

    // Check second screenshot link shows viewport
    expect(screen.getByTestId('screenshot-link-1')).toHaveTextContent('mobile');

    // Check third screenshot link shows viewport
    expect(screen.getByTestId('screenshot-link-2')).toHaveTextContent('desktop');
  });

  it('should mark active screenshot as active', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={1}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    const activeLink = screen.getByTestId('screenshot-link-1');
    expect(activeLink).toHaveAttribute('data-active', 'true');
  });

  it('should not mark inactive screenshots as active', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={1}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    const inactiveLink1 = screen.getByTestId('screenshot-link-0');
    const inactiveLink2 = screen.getByTestId('screenshot-link-2');

    expect(inactiveLink1).toHaveAttribute('data-active', 'false');
    expect(inactiveLink2).toHaveAttribute('data-active', 'false');
  });

  it('should call onScreenshotSelect when screenshot is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    const secondScreenshot = screen.getByTestId('screenshot-link-1');
    await user.click(secondScreenshot);

    expect(mockOnScreenshotSelect).toHaveBeenCalledOnce();
    expect(mockOnScreenshotSelect).toHaveBeenCalledWith(1);
  });

  it('should render empty state when no screenshots provided', () => {
    render(
      <ResolveSidebar
        screenshots={[]}
        activeScreenshotIndex={null}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    expect(screen.getByTestId('sidebar-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-empty-state')).toHaveTextContent(
      'No screenshots captured yet'
    );
  });

  it('should group screenshots by route', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    // Should have 2 route groups: /home and /about
    const routeGroups = screen.getAllByTestId(/^route-group-/);
    expect(routeGroups).toHaveLength(2);

    // First group should be /home with 2 screenshots
    expect(screen.getByTestId('route-group-0')).toHaveTextContent('/home');

    // Second group should be /about with 1 screenshot
    expect(screen.getByTestId('route-group-1')).toHaveTextContent('/about');
  });

  it('should display viewport dimensions', () => {
    render(
      <ResolveSidebar
        screenshots={mockScreenshots}
        activeScreenshotIndex={0}
        onScreenshotSelect={mockOnScreenshotSelect}
      />
    );

    // First screenshot: desktop 1440x900
    expect(screen.getByTestId('screenshot-link-0')).toHaveTextContent('1440×900');

    // Second screenshot: mobile 375x667
    expect(screen.getByTestId('screenshot-link-1')).toHaveTextContent('375×667');
  });
});
