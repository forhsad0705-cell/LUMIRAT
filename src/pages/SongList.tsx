import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, LogOut, FileText, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Song {
    id: string;
    title: string;
    updated_at: string;
    lyrics?: string;
}

export const SongList: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSongs();

        const subscription = supabase
            .channel('public:songs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, fetchSongs)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchSongs = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch songs for this user
        const { data } = await supabase
            .from('songs')
            .select('id, title, updated_at, lyrics')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (data) setSongs(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('songs')
            .insert([
                {
                    user_id: user.id,
                    title: 'New Song',
                    lyrics: '',
                    chords: '',
                    content: ''
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating song:', error);
            alert('Failed to create song');
        } else if (data) {
            navigate(`/songs/${data.id}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Loading library...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-orange-500/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
                            <Music className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-orange-500">
                            LUMIRAT
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white/90">Library</h2>
                        <p className="text-gray-500 mt-1">Manage your chord charts and lyrics.</p>
                    </div>
                    <Button onClick={handleCreate} className="w-full sm:w-auto shadow-orange-500/10">
                        <Plus className="w-5 h-5 mr-2" />
                        New Song
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {songs.map(song => (
                        <Card
                            key={song.id}
                            onClick={() => navigate(`/songs/${song.id}`)}
                            className="group cursor-pointer border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/10 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-2.5 bg-gray-800/50 rounded-xl group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                                        <FileText className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg truncate pr-2 text-gray-100 group-hover:text-white">{song.title}</h3>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="w-3 h-3 mr-1.5" />
                                        {new Date(song.updated_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                {song.lyrics && (
                                    <p className="text-xs text-gray-600 line-clamp-2 font-mono h-8">
                                        {song.lyrics.slice(0, 100)}...
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}

                    {songs.length === 0 && (
                        <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/20">
                            <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                <Music className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">No songs yet</h3>
                            <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">Create your first song to start building your repertoire.</p>
                            <Button variant="outline" onClick={handleCreate}>
                                Create First Song
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
