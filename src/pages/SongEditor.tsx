import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { ChordKeyboard } from '../components/ChordKeyboard';
import { supabase } from '../lib/supabaseClient';
import { Save, ArrowLeft } from 'lucide-react';
import { exportToPDF } from '../utils/export';

// Debounce helper
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const SongEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [text, setText] = useState<string>('');
    const [title, setTitle] = useState('Untitled Song');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [transpose, setTranspose] = useState(0);
    const [showChords] = useState(true);
    const [isEditorVisible, setEditorVisible] = useState(true);

    const [isLiveMode, setLiveMode] = useState(false);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
    const scrollInterval = useRef<number | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (autoScrollSpeed > 0) {
            scrollInterval.current = window.setInterval(() => {
                const previewEl = document.getElementById('preview-container');
                if (previewEl) previewEl.scrollTop += 1;
            }, 50 - autoScrollSpeed * 8);
        } else {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        }
        return () => {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        };
    }, [autoScrollSpeed]);

    // Fetch song data
    useEffect(() => {
        if (!id) return;

        const fetchSong = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching song:', error);
                alert('Song not found');
                navigate('/songs');
            } else if (data) {
                // Use 'lyrics' or 'content' column? 
                // Based on SongList creation, we used 'lyrics'. 
                // Let's check which one has data.
                const content = data.lyrics || data.content || '';
                setText(content);
                setTitle(data.title);
            }
            setLoading(false);
        };

        fetchSong();

        // Realtime subscription
        const subscription = supabase
            .channel(`song:${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'songs',
                filter: `id=eq.${id}`
            }, (payload) => {
                const newData = payload.new;
                // Avoid overwriting local state if we are the ones editing?
                // Simple "last write wins" for now. 
                // To improve, we could check if updated_at is newer than our last edit time.
                // For this demo, we'll just update if remote content is different.
                if (newData.lyrics !== text) {
                    // Ideally we'd show a "Remote update available" toast, but for "Realtime" request:
                    // We'll update only if we aren't actively typing? 
                    // Or just update title.
                    setTitle(newData.title);
                    // setText(newData.lyrics); // This breaks local editing flow badly if concurrent.
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [id, navigate]);

    // Save logic
    const saveSong = useCallback(async (newText: string, newTitle: string) => {
        if (!id) return;
        setIsSaving(true);
        await supabase
            .from('songs')
            .update({
                lyrics: newText,
                title: newTitle,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        setIsSaving(false);
    }, [id]);

    // Debounced save
    const debouncedSave = useCallback(debounce((t: string, ti: string) => saveSong(t, ti), 1000), [saveSong]);

    const handleTextChange = (val: string) => {
        setText(val);
        debouncedSave(val, title);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        debouncedSave(text, e.target.value);
    };

    const insertChord = (chord: string) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = text.substring(0, start) + chord + text.substring(end);

        handleTextChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + chord.length, start + chord.length);
        }, 0);
    };

    const handleExport = () => {
        exportToPDF('preview-content', `${title}.pdf`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>;

    return (
        <div className="flex flex-col h-screen text-white overflow-hidden bg-gray-950">
            {/* Header */}
            {!isLiveMode && (
                <header className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/songs')} className="hover:bg-gray-800 p-2 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>

                        <input
                            value={title}
                            onChange={handleTitleChange}
                            className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-orange-500 w-64"
                        />

                        {isSaving && <span className="text-xs text-gray-500 flex items-center gap-1"><Save className="w-3 h-3" /> Saving...</span>}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLiveMode(true)}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded text-sm font-bold shadow-lg shadow-orange-900/20"
                        >
                            Live Mode
                        </button>

                        <button
                            onClick={() => setEditorVisible(!isEditorVisible)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span>{isEditorVisible ? 'Hide' : 'Edit'}</span>
                        </button>

                        <div className="flex items-center bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setTranspose(t => t - 1)}
                                className="px-3 py-1 hover:bg-gray-700 rounded"
                                title="Transpose Down"
                            >
                            </button>
                            <span className="px-2 w-8 text-center text-sm font-mono">
                                {transpose > 0 ? `+${transpose}` : transpose}
                            </span>
                            <button
                                onClick={() => setTranspose(t => t + 1)}
                                className="px-3 py-1 hover:bg-gray-700 rounded"
                                title="Transpose Up"
                            >
                            </button>
                        </div>

                        <button onClick={handleExport} className="p-2 hover:bg-gray-800 rounded-full" title="Export PDF">
                        </button>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {isLiveMode && (
                    <div className="absolute top-4 right-6 z-50 flex gap-2 opacity-0 hover:opacity-100 transition-opacity p-2 bg-black/50 rounded-lg backdrop-blur">
                        <button
                            onClick={() => setAutoScrollSpeed(s => (s + 1) % 6)}
                            className={`px-3 py-1 rounded font-bold ${autoScrollSpeed > 0 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {autoScrollSpeed === 0 ? 'Scroll Off' : `Scroll ${autoScrollSpeed}`}
                        </button>
                        <button
                            onClick={() => setLiveMode(false)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                        >
                            Exit Live
                        </button>
                    </div>
                )}

                {isEditorVisible && !isLiveMode && (
                    <div className="flex-1 flex flex-col border-r border-gray-800 w-full md:min-w-[300px] md:max-w-[50%]">
                        <div className="flex-1 relative">
                            <Editor
                                value={text}
                                onChange={handleTextChange}
                                inputRef={editorRef}
                            />
                        </div>
                        <ChordKeyboard onInsert={insertChord} />
                    </div>
                )}

                <div id="preview-container" className="flex-1 bg-gray-900 relative overflow-y-auto scroll-smooth">
                    <div id="preview-content" className="min-h-full">
                        <Preview
                            text={text}
                            transpose={transpose}
                            showChords={showChords}
                            fontSize={isLiveMode ? 24 : 18}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
