import React from 'react';

// This file should contain layout components, not page components

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}