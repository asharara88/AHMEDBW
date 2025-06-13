import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from './useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    // Mock addEventListener and removeEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  it('should add event listener on mount', () => {
    // Arrange
    const callback = vi.fn();
    
    // Act
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Assert
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    // Arrange
    const callback = vi.fn();
    
    // Act
    const { unmount } = renderHook(() => useKeyboardShortcut('a', callback));
    unmount();
    
    // Assert
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should call callback when key is pressed', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Act - simulate keydown event
    const event = new KeyboardEvent('keydown', { key: 'a' });
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    handler(event);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);
  });

  it('should not call callback when different key is pressed', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Act - simulate keydown event with different key
    const event = new KeyboardEvent('keydown', { key: 'b' });
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    handler(event);
    
    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle modifier keys correctly', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback, { ctrl: true, shift: true }));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Act - simulate keydown event with modifiers
    const event = new KeyboardEvent('keydown', { 
      key: 'a',
      ctrlKey: true,
      shiftKey: true
    });
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    handler(event);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Act - simulate keydown event with wrong modifiers
    const wrongEvent = new KeyboardEvent('keydown', { 
      key: 'a',
      ctrlKey: true,
      shiftKey: false
    });
    Object.defineProperty(wrongEvent, 'target', { value: document.createElement('div') });
    handler(wrongEvent);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1); // Still just once
  });

  it('should not trigger on input elements', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Create input element
    const inputElement = document.createElement('input');
    
    // Act - simulate keydown event on input
    const event = new KeyboardEvent('keydown', { key: 'a' });
    Object.defineProperty(event, 'target', { value: inputElement });
    handler(event);
    
    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger on textarea elements', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Create textarea element
    const textareaElement = document.createElement('textarea');
    
    // Act - simulate keydown event on textarea
    const event = new KeyboardEvent('keydown', { key: 'a' });
    Object.defineProperty(event, 'target', { value: textareaElement });
    handler(event);
    
    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it('should be case-insensitive for key matching', () => {
    // Arrange
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('a', callback));
    
    // Get the event handler
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // Act - simulate keydown event with uppercase key
    const event = new KeyboardEvent('keydown', { key: 'A' });
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    handler(event);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
  });
});