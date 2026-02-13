import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full p-6 bg-card border border-destructive/20 rounded-lg shadow-lg">
                        <div className="flex items-center gap-3 text-destructive mb-4">
                            <AlertTriangle className="h-6 w-6" />
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            The application encountered an unexpected error.
                        </p>
                        {this.state.error && (
                            <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-40 mb-4">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
