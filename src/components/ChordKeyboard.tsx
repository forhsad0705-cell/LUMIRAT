import React, { useState } from 'react';
import { NOTES, getDiatonicChords } from '../core/music';
import { cn } from '../lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ChordKeyboardProps {
    onInsert: (chord: string) => void;
    currentKey?: string;
    className?: string;
}

const QUALITIES = [
    { label: 'maj', value: '' },
    { label: 'm', value: 'm' },
    { label: '7', value: '7' },
    { label: 'm7', value: 'm7' },
    { label: 'maj7', value: 'maj7' },
    { label: 'sus4', value: 'sus4' },
    { label: 'dim', value: 'dim' },
    { label: 'aug', value: 'aug' },
    { label: 'add9', value: 'add9' },
];

export const ChordKeyboard: React.FC<ChordKeyboardProps> = ({ onInsert, currentKey = 'C', className }) => {
    const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleRootClick = (root: string) => {
        if (selectedRoot === root) {
            onInsert(`[${root}]`); // Quick insert major if clicking same root again? Or just deselect?
            // Let's keep it simple: just select. 
            // Actually user might want to double click to insert major.
        }
        setSelectedRoot(root);
    };

    const handleQualityClick = (q: string) => {
        if (selectedRoot) {
            onInsert(`[${selectedRoot}${q}]`);
            // Optional: Deselect root after insert? 
            // setSelectedRoot(null); 
            // Better to keep it selected for rapid entry of variants
        }
    };

    const diatonicChords = getDiatonicChords(currentKey);

    return (
        <div className={cn("flex flex-col border-t border-gray-800 bg-gray-900/95 backdrop-blur shadow-2xl z-40 transition-all duration-300", className)}>

            {/* Mobile Toggle */}
            <div
                className="md:hidden flex justify-center py-2 border-t border-white/5 bg-gray-900 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-gray-500" />}
            </div>

            <div className={cn(
                "flex flex-col gap-3 p-3 overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 md:max-h-screen md:opacity-100"
            )}>
                {/* Diatonic Row */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center px-2 py-1 bg-gray-800/50 rounded-lg mr-2 shrink-0 border border-gray-700">
                        <span className="text-xs text-gray-400 font-mono">key:{currentKey}</span>
                    </div>
                    {diatonicChords.map((chord) => (
                        <button
                            key={chord}
                            onClick={() => onInsert(`[${chord}]`)}
                            className="shrink-0 px-4 py-3 bg-gray-800 hover:bg-orange-600 rounded-lg text-orange-100 font-bold shadow-sm border border-gray-700 hover:border-orange-500 transition-all active:scale-95"
                        >
                            {chord}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 gap-2 min-h-0">
                    {/* Roots */}
                    <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-1.5 overflow-y-auto content-start pr-1">
                        {NOTES.map((note) => (
                            <button
                                key={note}
                                onClick={() => handleRootClick(note)}
                                className={cn(
                                    "p-3 rounded-lg font-bold text-base transition-all active:scale-95",
                                    selectedRoot === note
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/50"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                                )}
                            >
                                {note}
                            </button>
                        ))}
                    </div>

                    {/* Qualities */}
                    <div className="w-1/3 grid grid-cols-2 gap-1.5 overflow-y-auto content-start pl-1 border-l border-gray-800">
                        {QUALITIES.map((q) => (
                            <button
                                key={q.label}
                                disabled={!selectedRoot}
                                onClick={() => handleQualityClick(q.value)}
                                className={cn(
                                    "p-2 rounded-lg text-sm font-medium transition-all active:scale-95",
                                    !selectedRoot
                                        ? "bg-gray-900/50 text-gray-700 cursor-not-allowed border border-dashed border-gray-800"
                                        : "bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-gray-700"
                                )}
                            >
                                <span className="text-xs opacity-50 block sm:inline mr-1">{selectedRoot}</span>
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
