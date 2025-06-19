import React from 'react';

export type CartErrorBoundaryProps = { children: React.ReactNode };
export type CartErrorBoundaryState = { hasError: boolean; error: Error | null };

export class CartErrorBoundary extends React.Component<CartErrorBoundaryProps, CartErrorBoundaryState> {
  constructor(props: CartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Oops! Something went wrong in the cart.</div>;
    }
    return this.props.children;
  }
}

export default CartErrorBoundary;
