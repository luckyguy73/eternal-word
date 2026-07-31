"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaRotateRight } from "react-icons/fa6";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/20 rounded-3xl border border-gray-800/50 my-4">
                    <div className="w-16 h-16 rounded-full bg-orange-400/10 flex items-center justify-center mb-6">
                        <FaExclamationTriangle className="text-orange-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                        We encountered an error while loading this section.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors font-bold text-sm"
                    >
                        <FaRotateRight size={14} />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
