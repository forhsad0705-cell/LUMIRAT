export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map to normalize note names to indices 0-11
const NOTE_TO_INDEX: Record<string, number> = {};
NOTES.forEach((n, i) => NOTE_TO_INDEX[n] = i);
FLAT_NOTES.forEach((n, i) => NOTE_TO_INDEX[n] = i);
// Add some common aliases
NOTE_TO_INDEX['B#'] = 0;
NOTE_TO_INDEX['E#'] = 5;
NOTE_TO_INDEX['Cb'] = 11;
NOTE_TO_INDEX['Fb'] = 4;

export interface ChordToken {
    original: string;
    root: string;
    quality: string;
    bass?: string;
}

export function parseChord(chordStr: string): ChordToken | null {
    // Regex to capture Root, Quality, and optional /Bass
    // Roots: C, C#, Db, etc.
    // We look for [A-G] followed by optional # or b.
    const match = chordStr.match(/^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/);
    if (!match) return null;

    const root = match[1];
    const quality = match[2] || '';
    const bass = match[4]; // match[4] comes from the nested group in (\/...)

    return {
        original: chordStr,
        root,
        quality,
        bass
    };
}

export function transposeNote(note: string, semitones: number): string {
    let idx = NOTE_TO_INDEX[note];
    if (idx === undefined) return note; // fallback

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;

    // Simple heuristic: use sharps by default, or maybe try to preserve accidentals?
    // For now, let's default to Sharps unless the original was flat?
    // Actually, standardizing to Sharps is easier for V1.
    return NOTES[newIdx];
}

export function transposeChord(chordStr: string, semitones: number): string {
    const token = parseChord(chordStr);
    if (!token) return chordStr;

    const newRoot = transposeNote(token.root, semitones);
    let newBass = token.bass ? transposeNote(token.bass, semitones) : undefined;

    return `${newRoot}${token.quality}${newBass ? '/' + newBass : ''}`;
}

export function transposeText(text: string, semitones: number): string {
    // Regex to find chords in brackets e.g. [C] or [Am7]
    return text.replace(/\[([^\]]+)\]/g, (_, inner) => {
        // Try to parse 'inner' as a chord
        // If it looks like a chord, transpose it
        const t = transposeChord(inner, semitones);
        return `[${t}]`;
    });
}

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];

export function getDiatonicChords(keyRoot: string): string[] {
    const rootIdx = NOTE_TO_INDEX[keyRoot];
    if (rootIdx === undefined) return [];

    return MAJOR_SCALE_INTERVALS.map((interval, i) => {
        const noteIdx = (rootIdx + interval) % 12;
        const noteName = NOTES[noteIdx];
        const quality = DIATONIC_QUALITIES[i];
        return noteName + quality;
    });
}
