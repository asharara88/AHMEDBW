import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('Tabs', () => {
  it('should render tabs with content', () => {
    // Arrange & Act
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    // Assert
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument(); // Hidden by default
  });

  it('should switch tabs when clicked', () => {
    // Arrange
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    // Act
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Assert
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should apply active styles to selected tab', () => {
    // Arrange
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    // Assert
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    
    expect(tab1).toHaveAttribute('data-state', 'active');
    expect(tab2).toHaveAttribute('data-state', 'inactive');
    
    // Act
    fireEvent.click(tab2);
    
    // Assert after click
    expect(tab1).toHaveAttribute('data-state', 'inactive');
    expect(tab2).toHaveAttribute('data-state', 'active');
  });

  it('should apply custom className to tabs components', () => {
    // Arrange
    const tabsClass = 'tabs-class';
    const tabsListClass = 'tabs-list-class';
    const tabsTriggerClass = 'tabs-trigger-class';
    const tabsContentClass = 'tabs-content-class';
    
    // Act
    render(
      <Tabs defaultValue="tab1" className={tabsClass}>
        <TabsList className={tabsListClass}>
          <TabsTrigger value="tab1" className={tabsTriggerClass}>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className={tabsContentClass}>Content 1</TabsContent>
      </Tabs>
    );
    
    // Assert
    expect(screen.getByRole('tablist')).toHaveClass(tabsListClass);
    expect(screen.getByRole('tab')).toHaveClass(tabsTriggerClass);
    expect(screen.getByRole('tabpanel')).toHaveClass(tabsContentClass);
  });

  it('should handle disabled tabs', () => {
    // Arrange
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    // Assert
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toBeDisabled();
    
    // Act
    fireEvent.click(tab2);
    
    // Assert - content should not change
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });
});