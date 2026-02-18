import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', loading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 border border-orange-500/50',
            secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700',
            ghost: 'hover:bg-gray-800/50 text-gray-400 hover:text-white',
            danger: 'bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50',
        };

        return (
            <button
                ref={ref}
                disabled={loading || disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50',
                    variants[variant],
                    className
                )}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
