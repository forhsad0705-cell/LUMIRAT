import React from 'react';
import { cn } from '../lib/utils';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, className, inputRef }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Smart Wrap: Ctrl+Space wraps the word before cursor in []
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const text = textarea.value;

            // Find word boundary backwards
            let i = start - 1;
            while (i >= 0 && /[^ \n\t\[\]]/.test(text[i])) {
                i--;
            }
            const wordStart = i + 1;
            const word = text.substring(wordStart, start);

            if (word.length > 0) {
                const newText = text.substring(0, wordStart) + `[${word}]` + text.substring(start);
                onChange(newText);

                // Move cursor after the closing bracket
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2; // +2 for []
                }, 0);
            }
        }
    };

    return (
        <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
                "w-full h-full p-6 bg-transparent text-gray-200 font-mono text-base resize-none focus:outline-none leading-relaxed selection:bg-orange-500/30 placeholder:text-gray-600",
                className
            )}
            placeholder="Type lyrics here... Use [C], [Am] for chords. Ctrl+Space to wrap word in brackets."
            spellCheck={false}
        />
    );
};
