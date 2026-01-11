
import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowLeft, Users, TrendingUp, Search, Plus, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  category: string;
  avatar: string;
  cover: string;
  followers: string;
  posts: string;
  verified: boolean;
  description: string;
}

interface UsersListProps {
  onBack: () => void;
  onUserSelect?: (name: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onBack, onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'publisher')
          .eq('status', 'Aktif');

        if (error) throw error;

        if (data) {
          const mapped: User[] = data.map(p => ({
            id: p.id,
            name: p.full_name || p.username || 'Anonim Kullanıcı',
            category: p.expertise || 'Gündem',
            avatar: p.avatar_url || `https://picsum.photos/seed/${p.id}/100`,
            cover: `https://picsum.photos/seed/${p.id}cover/800/200`,
            followers: '1.2M',
            posts: '1.4K',
            verified: true,
            description: p.about_me || 'Haber Yazarı'
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden min-h-screen mb-10">
      {/* Header Section */}
      <div className="p-10 border-b border-gray-50 bg-gray-50/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-gray-500 hover:text-blue-600 font-bold transition-all group"
          >
            <div className="p-2.5 bg-white rounded-[5px] border border-gray-200 shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 group-active:scale-95 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="text-sm tracking-tight">Ana Akışa Dön</span>
          </button>

          <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-[5px] shadow-sm w-full max-w-md focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcıları ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 font-semibold placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-[5px] text-[10px] font-black uppercase tracking-widest mb-4">
            <Plus size={12} strokeWidth={3} />
            Keşfet
          </div>
          <h1 className="text-5xl font-[900] text-gray-900 tracking-tight mb-4">Tüm Kullanıcılar</h1>
          <p className="text-gray-500 text-xl font-medium leading-relaxed">
            Haber ekosistemimizin kalbinde yer alan, her biri kendi alanında uzman ve doğrulanmış profilleri keşfedin.
          </p>
        </div>
      </div>

      {/* Grid Section - 3 Column Layout for wider view */}
      <div className="p-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-[5px] h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((pub) => (
              <div
                key={pub.id}
                onClick={() => onUserSelect?.(pub.name)}
                className="group bg-white rounded-[5px] border border-gray-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Card Cover */}
                <div className="relative h-28 overflow-hidden">
                  <img src={pub.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-[5px] text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-xl">
                      {pub.category}
                    </span>
                  </div>
                </div>

                {/* Card Content Header (Fixed spacing to prevent overlap) */}
                <div className="px-6 relative flex flex-col">
                  {/* Avatar (Floating but with enough vertical space) */}
                  <div className="relative -mt-10 mb-4 w-20 h-20 rounded-[5px] border-4 border-white overflow-hidden shadow-2xl bg-gray-100 z-10">
                    <img src={pub.avatar} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{pub.name}</h3>
                    {pub.verified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10 flex-shrink-0" />}
                  </div>

                  <p className="text-xs text-gray-500 font-bold mb-4">@{pub.name.toLowerCase().replace(/\s+/g, '')}</p>

                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 line-clamp-3 min-h-[60px]">
                    {pub.description}
                  </p>

                  {/* Stats Bar */}
                  <div className="flex items-center gap-6 mb-6 py-4 border-y border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900">{pub.followers}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Takipçi
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900">{pub.posts}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        İçerik
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-6 mt-auto">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                      <UserPlus size={14} strokeWidth={3} />
                      Takip Et
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">
                      Profil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Footer Area */}
      <div className="p-12 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[5px] flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-6 transform -rotate-6">
            <Users size={32} />
          </div>
          <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Topluluğumuza Katılın</h4>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Haber ekosistemine katılarak milyonlarca okuyucuya ulaşın. Kendi markanızı yaratın ve doğrulanmış profil rozetiyle güvenilirliğinizi artırın.
          </p>
          <button className="px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-[5px] font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm">
            Hemen Katıl
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
