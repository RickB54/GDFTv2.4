import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log('Routing error:', error, errorInfo);
    // Redirect to home on routing errors
    window.location.href = '/';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <div>Something went wrong. Redirecting...</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;