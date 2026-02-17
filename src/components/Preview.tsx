import React from 'react';
import { transposeText } from '../core/music';

interface PreviewProps {
    text: string;
    transpose: number;
    showChords: boolean;
    fontSize?: number;
}

const LineRenderer: React.FC<{ line: string; showChords: boolean }> = ({ line, showChords }) => {
    if (!line.trim()) return <div className="h-4" />;

    // Re-implementation using split/reduce usually cleaner but regex loop is fine if done right.
    // Let's restart the parsing logic to be more robust.

    const parsings = [];
    const splitRegex = /(\[[^\]]+\])/g;
    const parts = line.split(splitRegex);
    // parts: ["Hello ", "[C]", "World ", "[Am]", "Again"]

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            // Look ahead for text
            let text = '';
            if (i + 1 < parts.length && !parts[i + 1].startsWith('[')) {
                text = parts[i + 1];
                i++; // Consume next part
            }
            parsings.push({ chord, text });
        } else {
            // Just text, no chord (or text before first chord)
            parsings.push({ chord: null, text: part });
        }
    }

    return (
        <div className="flex flex-wrap items-end leading-snug mb-2">
            {parsings.map((segment, idx) => (
                <div key={idx} className="flex flex-col relative mr-0.5">
                    {segment.chord && showChords && (
                        <span className="text-orange-400 font-bold text-sm mb-0.5 whitespace-nowrap px-1 select-none">
                            {segment.chord}
                        </span>
                    )}
                    <span className="whitespace-pre text-gray-200">
                        {/* If chord exists but no text, render a generic placeholder or space? 
                 If text is empty, the div might collapse. Add min width or non-breaking space if needed. 
                 But usually empty text means two chords in a row [C][Am]. */}
                        {segment.text || (segment.chord ? '\u00A0' : '')}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const Preview: React.FC<PreviewProps> = ({ text, transpose, showChords, fontSize = 18 }) => {
    const transposedText = transposeText(text, transpose);
    const lines = transposedText.split('\n');

    return (
        <div
            className="w-full h-full p-8 selection:bg-orange-500/30"
            style={{ fontSize: `${fontSize}px` }}
        >
            <div className="max-w-4xl mx-auto">
                {lines.map((line, i) => (
                    <LineRenderer key={i} line={line} showChords={showChords} />
                ))}
            </div>
            <div className="h-32" /> {/* Bottom padding */}
        </div>
    );
};
