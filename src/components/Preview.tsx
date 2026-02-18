import React from 'react';
import { transposeText } from '../core/music';
import { cn } from '../lib/utils';

interface PreviewProps {
    text: string;
    transpose: number;
    showChords: boolean;
    fontSize?: number;
    className?: string;
}

const LineRenderer: React.FC<{ line: string; showChords: boolean }> = ({ line, showChords }) => {
    if (!line.trim()) return <div className="h-6" />;

    const parsings = [];
    const splitRegex = /(\[[^\]]+\])/g;
    const parts = line.split(splitRegex);

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            let text = '';
            // Look ahead for text
            if (i + 1 < parts.length && !parts[i + 1].startsWith('[')) {
                text = parts[i + 1];
                i++; // Consume next part
            }
            parsings.push({ chord, text });
        } else {
            parsings.push({ chord: null, text: part });
        }
    }

    return (
        <div className="flex flex-wrap items-end leading-relaxed mb-4">
            {parsings.map((segment, idx) => (
                <div key={idx} className="flex flex-col relative mr-0.5 group">
                    {segment.chord && showChords && (
                        <span className="text-orange-400 font-bold text-sm mb-1 whitespace-nowrap px-1 rounded hover:bg-orange-500/10 transition-colors select-none">
                            {segment.chord}
                        </span>
                    )}
                    <span className="whitespace-pre text-gray-100 font-medium">
                        {segment.text || (segment.chord ? '\u00A0' : '')}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const Preview: React.FC<PreviewProps> = ({ text, transpose, showChords, fontSize = 18, className }) => {
    const transposedText = transposeText(text, transpose);
    const lines = transposedText.split('\n');

    return (
        <div
            className={cn("w-full h-full p-8 md:p-12 overflow-y-auto selection:bg-orange-500/30 scroll-smooth", className)}
            style={{ fontSize: `${fontSize}px` }}
        >
            <div className="max-w-3xl mx-auto font-sans">
                {lines.map((line, i) => (
                    <LineRenderer key={i} line={line} showChords={showChords} />
                ))}
            </div>
            <div className="h-40" />
        </div>
    );
};
