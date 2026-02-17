import React, { useState } from 'react';
import { NOTES, getDiatonicChords } from '../core/music';

interface ChordKeyboardProps {
    onInsert: (chord: string) => void;
    currentKey?: string; // e.g. 'C'
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

export const ChordKeyboard: React.FC<ChordKeyboardProps> = ({ onInsert, currentKey = 'C' }) => {
    const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleRootClick = (root: string) => {
        setSelectedRoot(root);
    };

    const handleQualityClick = (q: string) => {
        if (selectedRoot) {
            onInsert(`[${selectedRoot}${q}]`);
        }
    };

    const diatonicChords = getDiatonicChords(currentKey);

    return (
        <>
            {/* Mobile Toggle Handle */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-gray-800 flex items-center justify-center rounded-t-xl z-50 cursor-pointer border-t border-gray-700"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ bottom: isExpanded ? '16rem' : '0' }}
            >
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            <div className={`
                flex flex-col gap-4 p-4 bg-gray-900 border-t border-gray-800 select-none
                fixed bottom-0 left-0 right-0 z-50 h-64
                md:relative md:h-64 md:z-0
                transition-transform duration-300 ease-in-out
                ${isExpanded ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0
            `}>
                {/* Diatonic Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                    <span className="text-xs text-gray-400 self-center mr-2 whitespace-nowrap">Key of {currentKey}:</span>
                    {diatonicChords.map((chord) => (
                        <button
                            key={chord}
                            onClick={() => onInsert(`[${chord}]`)}
                            className="px-3 py-2 bg-gray-800 hover:bg-orange-600 rounded text-orange-100 font-bold shadow-sm transition-colors min-w-[3rem]"
                        >
                            {chord}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 gap-2 overflow-hidden">
                    {/* Roots Grid */}
                    <div className="flex-1 grid grid-cols-6 gap-1 content-start overflow-y-auto">
                        {NOTES.map((note) => (
                            <button
                                key={note}
                                onClick={() => handleRootClick(note)}
                                className={`p-2 rounded font-bold text-center transition-all text-sm sm:text-base ${selectedRoot === note
                                    ? 'bg-orange-500 text-white shadow-orange-500/50 shadow-lg scale-105'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>

                    {/* Qualities Grid */}
                    <div className="flex-1 grid grid-cols-3 gap-1 content-start overflow-y-auto">
                        {QUALITIES.map((q) => (
                            <button
                                key={q.label}
                                disabled={!selectedRoot}
                                onClick={() => handleQualityClick(q.value)}
                                className={`p-2 rounded text-sm transition-colors ${!selectedRoot
                                    ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-dashed border-gray-800'
                                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {selectedRoot || ''}{q.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Spacer for mobile when keyboard is visible to prevent content hiding is handled in Editor */}
        </>
    );
};
