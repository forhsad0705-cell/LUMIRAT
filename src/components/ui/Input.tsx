import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    className={cn(
                        "flex h-10 w-full rounded-lg border bg-gray-900/50 px-3 py-2 text-sm ring-offset-gray-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-gray-800 focus-visible:ring-orange-500 hover:border-gray-700",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
