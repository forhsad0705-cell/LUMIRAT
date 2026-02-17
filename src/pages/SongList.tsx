import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, LogOut, FileText } from 'lucide-react';

interface Song {
    id: string;
    title: string;
    updated_at: string;
}

export const SongList: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch songs for this user
        const { data } = await supabase
            .from('songs')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (data) setSongs(data);
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
                    lyrics: '', // We can use 'content' or 'lyrics' column. Let's use 'lyrics' as per request.
                    chords: '', // And 'chords'.
                    content: '' // Keeping content for compatibility if needed, or just map appropriately.
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

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Music className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-orange-500">
                        LUMIRAT
                    </h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">My Songs</h2>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold shadow-lg shadow-orange-900/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Song
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {songs.map(song => (
                        <div
                            key={song.id}
                            onClick={() => navigate(`/songs/${song.id}`)}
                            className="group bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 hover:bg-gray-800 cursor-pointer transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                                    <FileText className="w-6 h-6 text-orange-400" />
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 truncate">{song.title}</h3>
                            <p className="text-xs text-gray-500">
                                Updated {new Date(song.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}

                    {songs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                            <p>No songs yet. Create your first one!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
