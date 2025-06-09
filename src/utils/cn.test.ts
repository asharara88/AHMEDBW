import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names into a single string', () => {
    const result = cn('text-base', 'font-bold');
    expect(result).toBe('text-base font-bold');
  });

  it('handles conditional class names', () => {
    const isActive = true;
    const result = cn('btn', { 'btn-active': isActive });
    expect(result).toBe('btn btn-active');
  });
});
