import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { ChordKeyboard } from '../components/ChordKeyboard';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Play, Download, Minus, Plus } from 'lucide-react';
import { exportToPDF } from '../utils/export';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

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
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const [isLiveMode, setLiveMode] = useState(false);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
    const scrollInterval = useRef<number | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (autoScrollSpeed > 0 && isLiveMode) {
            scrollInterval.current = window.setInterval(() => {
                const container = document.getElementById('live-preview-container');
                if (container) {
                    container.scrollTop += 1;
                }
            }, 50 - autoScrollSpeed * 8);
        } else {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        }
        return () => {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        };
    }, [autoScrollSpeed, isLiveMode]);

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
                navigate('/songs');
            } else if (data) {
                const content = data.lyrics || data.content || '';
                setText(content);
                setTitle(data.title);
            }
            setLoading(false);
        };

        fetchSong();

        const subscription = supabase
            .channel(`song:${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'songs',
                filter: `id=eq.${id}`
            }, (payload) => {
                const newData = payload.new;
                if (newData.lyrics !== text) {
                    setTitle(newData.title);
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
        if (!textarea) {
            if (activeTab === 'preview') setActiveTab('edit');
            return;
        }

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

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-500">Loading song...</div>;

    if (isLiveMode) {
        return (
            <div className="fixed inset-0 bg-black text-white z-50 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-b from-black/80 to-transparent z-50">
                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setLiveMode(false)}>
                        Exit Live Mode
                    </Button>

                    <div className="flex gap-2 bg-gray-900/80 backdrop-blur rounded-lg p-1 border border-gray-800">
                        <Button
                            variant="ghost"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAutoScrollSpeed(Math.max(0, autoScrollSpeed - 1))}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-20 text-center font-mono text-sm self-center">
                            {autoScrollSpeed === 0 ? 'Manual' : `Speed ${autoScrollSpeed}`}
                        </span>
                        <Button
                            variant="ghost"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAutoScrollSpeed(Math.min(5, autoScrollSpeed + 1))}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div id="live-preview-container" className="flex-1 overflow-y-auto scroll-smooth px-4 md:px-20 py-20">
                    <div id="preview-content">
                        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">{title}</h1>
                        <Preview
                            text={text}
                            transpose={transpose}
                            showChords={true}
                            fontSize={24}
                            className="p-0"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden selection:bg-orange-500/30">
            {/* Header / Toolbar */}
            <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-4 shrink-0 gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Button variant="ghost" className="h-10 w-10 p-2" onClick={() => navigate('/songs')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-full min-w-[200px]">
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            className="bg-transparent border-transparent hover:border-gray-800 focus:border-orange-500 font-bold text-lg h-9 px-2 text-white placeholder-gray-600"
                            placeholder="Song Title"
                        />
                    </div>
                    {isSaving ? (
                        <span className="text-xs text-gray-500 animate-pulse hidden sm:inline-block">Saving...</span>
                    ) : (
                        <span className="text-xs text-gray-600 hidden sm:inline-block">Saved</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Transpose Control */}
                    <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 border border-gray-700/50 hidden sm:flex">
                        <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => setTranspose(t => t - 1)}>
                            <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-orange-400">
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => setTranspose(t => t + 1)}>
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-gray-800 hidden sm:block mx-1" />

                    <Button variant="ghost" className="h-10 w-10 p-2" onClick={handleExport} title="Export PDF">
                        <Download className="w-4 h-4" />
                    </Button>

                    <Button variant="primary" className="h-8 px-3 text-xs hidden sm:flex" onClick={() => setLiveMode(true)}>
                        <Play className="w-4 h-4 mr-2" />
                        Live Mode
                    </Button>
                    <Button variant="primary" className="h-10 w-10 p-2 sm:hidden" onClick={() => setLiveMode(true)}>
                        <Play className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden relative">

                {/* Editor Pane */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-300 absolute inset-0 md:relative z-10 bg-gray-950 md:z-auto",
                    activeTab === 'preview' ? "translate-x-[-100%] md:translate-x-0" : "translate-x-0"
                )}>
                    <Editor
                        value={text}
                        onChange={handleTextChange}
                        inputRef={editorRef}
                        className="flex-1"
                    />

                    {/* Chord Keyboard */}
                    <ChordKeyboard onInsert={insertChord} currentKey="C" className="shrink-0" />
                </div>

                {/* Preview Pane */}
                <div className={cn(
                    "flex-1 bg-gray-900 border-l border-gray-800 flex flex-col min-w-0 transition-all duration-300 absolute inset-0 md:relative z-10 md:z-auto",
                    activeTab === 'edit' ? "translate-x-[100%] md:translate-x-0" : "translate-x-0"
                )}>
                    <div id="preview-container" className="flex-1 overflow-y-auto w-full">
                        <div id="preview-content" className="min-h-full">
                            <Preview
                                text={text}
                                transpose={transpose}
                                showChords={showChords}
                                fontSize={18}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="md:hidden absolute bottom-20 right-4 z-50 flex gap-2">
                    <Button
                        variant="secondary"
                        className={cn("shadow-xl rounded-full px-6 h-10", activeTab === 'edit' ? "bg-orange-600 text-white border-orange-500" : "opacity-80")}
                        onClick={() => setActiveTab('edit')}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="secondary"
                        className={cn("shadow-xl rounded-full px-6 h-10", activeTab === 'preview' ? "bg-orange-600 text-white border-orange-500" : "opacity-80")}
                        onClick={() => setActiveTab('preview')}
                    >
                        Preview
                    </Button>
                </div>
            </main>
        </div>
    );
};
