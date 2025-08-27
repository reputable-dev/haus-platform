import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: Date.now().toString() 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Store error info for debugging
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to crash reporting service in production
    if (!__DEV__) {
      // TODO: Add crash reporting service like Sentry
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (if enabled)
    if (this.props.resetOnPropsChange && 
        this.state.hasError && 
        prevProps.children !== this.props.children) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: Date.now().toString()
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: Date.now().toString()
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertCircle size={48} color="#EF476F" />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.errorDetails}>
                  Error: {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.stackTrace}>
                    {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                  </Text>
                )}
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.componentStack}>
                    Component: {this.state.errorInfo.componentStack.split('\n')[1]?.trim()}
                  </Text>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#073B4C",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#073B4C",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  debugContainer: {
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: 300,
  },
  errorDetails: {
    fontSize: 12,
    color: "#EF476F",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stackTrace: {
    fontSize: 10,
    color: "#666",
    textAlign: "left",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  componentStack: {
    fontSize: 10,
    color: "#888",
    textAlign: "left",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3366FF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});