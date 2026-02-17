import React from 'react';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, className, inputRef }) => {
    const handleSelect = () => {
        // Optional: propagate cursor position if needed
    };

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
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
            className={`w-full h-full p-4 md:pb-4 pb-80 bg-gray-900 text-white font-mono text-lg resize-none focus:outline-none ${className}`}
            placeholder="Type lyrics... Ctrl+Space to wrap chord (e.g. C -> [C])"
            spellCheck={false}
        />
    );
};
