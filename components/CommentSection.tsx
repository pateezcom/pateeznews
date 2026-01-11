
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Reply, Trash2, Send, ChevronDown, ChevronUp, Flag, UserMinus, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';

interface Comment {
  id: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  parent_id?: string;
  content: string;
  created_at: string;
  likes_count: number;
  status: string;
  is_pinned?: boolean;
  user_name?: string;
  user_avatar?: string;
  replies?: Comment[];
  userLiked?: boolean;
}

interface CommentSectionProps {
  postId: string | number;
  publisherId?: string;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onReport: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onBlock: (comment: Comment) => void;
  isPublisher: boolean;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isReply = false,
  onReply,
  onLike,
  onReport,
  onDelete,
  onBlock,
  isPublisher,
  currentUserId
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Format relative time (Basit versiyon)
  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const displayName = comment.user_name || comment.guest_name || 'Misafir';
  const displayAvatar = comment.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f3f4f6&color=94a3b8`;

  return (
    <div className={`flex flex-col ${isReply ? 'mt-3' : 'mt-4 animate-in fade-in slide-in-from-top-1'}`}>
      <div className={`flex gap-3 ${isReply ? 'ml-11 relative' : ''}`}>
        {isReply && (
          <div className="absolute -left-5 top-0 w-4 h-4 border-b-2 border-l-2 border-palette-beige rounded-bl-[5px]"></div>
        )}

        <div className="flex-shrink-0">
          <div className={`rounded-[5px] overflow-hidden border border-palette-beige ${isReply ? 'w-7 h-7' : 'w-9 h-9'} shadow-sm`}>
            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-palette-beige/30 rounded-[5px] rounded-tl-none p-3 px-3.5 border border-palette-beige/50 group relative">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <h6 className="text-xs font-bold text-palette-maroon flex items-center gap-1">
                  {displayName}
                  {comment.is_pinned && <span className="material-symbols-rounded text-[14px] text-amber-500 fill-current">push_pin</span>}
                </h6>
                <span className="text-[10px] text-palette-tan/40 font-medium">• {formatTime(comment.created_at)}</span>
              </div>

              <div className="flex items-center gap-1">
                {(currentUserId === comment.user_id || isPublisher) && (
                  <button
                    onClick={() => onDelete(comment)}
                    className="text-palette-tan/20 hover:text-palette-red transition-colors p-1"
                    title="Sil"
                  >
                    <Trash2 size={11} />
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-palette-tan/20 hover:text-palette-maroon transition-colors p-1"
                  >
                    <ShieldAlert size={11} />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-palette-beige shadow-xl rounded-[5px] z-50 py-1 min-w-[120px] animate-in zoom-in-95">
                      <button
                        onClick={() => { onReport(comment); setShowOptions(false); }}
                        className="w-full px-3 py-1.5 text-left text-[10px] font-bold text-palette-tan hover:bg-palette-beige/30 flex items-center gap-2"
                      >
                        <Flag size={10} /> Şikayet Et
                      </button>
                      {isPublisher && comment.user_id && (
                        <button
                          onClick={() => { onBlock(comment); setShowOptions(false); }}
                          className="w-full px-3 py-1.5 text-left text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <UserMinus size={10} /> Kullanıcıyı Engelle
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[12px] text-palette-tan/80 leading-relaxed font-medium">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1 ml-1">
            <button
              onClick={() => onLike(comment)}
              className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors group ${comment.userLiked ? 'text-palette-red' : 'text-palette-tan/40 hover:text-palette-red'}`}
            >
              <Heart size={12} className={`transition-transform group-active:scale-125 ${comment.userLiked ? 'fill-palette-red' : ''}`} />
              <span>{comment.likes_count > 0 ? comment.likes_count : 'Beğen'}</span>
            </button>

            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-palette-tan/40 hover:text-palette-red transition-colors"
            >
              <Reply size={12} className="scale-x-[-1]" />
              <span>Yanıtla</span>
            </button>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
              onDelete={onDelete}
              onBlock={onBlock}
              isPublisher={isPublisher}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, publisherId }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    fetchComments();
  }, [postId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user && publisherId) {
      const { data: block } = await supabase
        .from('publisher_blocks')
        .select('id')
        .eq('publisher_id', publisherId)
        .eq('blocked_user_id', user.id)
        .maybeSingle();

      if (block) setIsBlocked(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment(prev => prev + emojiData.emoji);
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      // Fetch all approved comments for this post
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Check likes if user is logged in
      let likedIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
        likedIds = likes?.map(l => String(l.comment_id)) || [];
      }

      // Format and nest comments
      const formattedComments = data.map((c: any) => ({
        ...c,
        id: String(c.id),
        user_name: c.profiles?.username,
        user_avatar: c.profiles?.avatar_url,
        userLiked: likedIds.includes(String(c.id)),
        replies: []
      }));

      // Create hierarchy
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      formattedComments.forEach(c => commentMap.set(c.id, c));
      formattedComments.forEach(c => {
        if (c.parent_id && commentMap.has(String(c.parent_id))) {
          commentMap.get(String(c.parent_id)).replies.push(c);
        } else {
          rootComments.push(c);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (isBlocked) {
      showToast('Bu haber kaynağı tarafından engellendiğiniz için yorum yapamazsınız.', 'error');
      return;
    }

    if (!newComment.trim()) return;

    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      showToast('Lütfen adınızı ve e-posta adresinizi giriniz.', 'info');
      return;
    }

    try {
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;

      if (isNaN(numericPostId as number)) {
        throw new Error("Geçerli bir haber ID'si bulunamadı.");
      }

      const commentData = {
        post_id: numericPostId,
        content: newComment.trim(),
        parent_id: replyTo?.id ? parseInt(replyTo.id, 10) : null,
        user_id: user?.id || null,
        guest_name: user ? null : guestName.trim(),
        guest_email: user ? null : guestEmail.trim(),
        status: 'pending'
      };

      const { error } = await supabase.from('comments').insert([commentData]);
      if (error) throw error;

      showToast('Yorumunuz gönderildi, onaylandıktan sonra yayınlanacaktır.', 'success');
      setNewComment('');
      setReplyTo(null);
      if (!user) {
        setGuestName('');
        setGuestEmail('');
      }
    } catch (err: any) {
      showToast('Yorum gönderilirken hata oluştu: ' + err.message, 'error');
    }
  };

  const handleLike = async (comment: Comment) => {
    if (!user) {
      showToast('Beğenmek için giriş yapmalısınız.', 'info');
      return;
    }

    try {
      if (comment.userLiked) {
        await supabase.from('comment_likes').delete().eq('comment_id', comment.id).eq('user_id', user.id);
        await supabase.rpc('decrement_comment_likes', { comment_id: comment.id });
      } else {
        await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: user.id });
        await supabase.rpc('increment_comment_likes', { comment_id: comment.id });
      }
      fetchComments(); // Refresh to update counts
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleReport = async (comment: Comment) => {
    const reason = prompt('Şikayet sebebinizi kısaca belirtin:');
    if (!reason) return;

    try {
      const { error } = await supabase.from('comment_reports').insert({
        comment_id: comment.id,
        user_id: user?.id || null,
        guest_email: user ? null : guestEmail,
        reason
      });
      if (error) throw error;
      showToast('Şikayetiniz alındı, incelenecektir.', 'success');
    } catch (err) {
      showToast('İşlem başarısız.', 'error');
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', comment.id);
      if (error) throw error;
      showToast('Yorum silindi.', 'success');
      fetchComments();
    } catch (err) {
      showToast('Silme işlemi başarısız.', 'error');
    }
  };

  const handleBlock = async (comment: Comment) => {
    if (!comment.user_id || !publisherId) return;
    if (!window.confirm('Bu kullanıcıyı engellemek istediğinize emin misiniz? Bu kullanıcı artık haberlerinize yorum yapamayacak.')) return;

    try {
      const { error } = await supabase.from('publisher_blocks').insert({
        publisher_id: publisherId,
        blocked_user_id: comment.user_id
      });
      if (error) throw error;
      showToast('Kullanıcı engellendi.', 'success');
    } catch (err) {
      showToast('İngelleme işlemi başarısız.', 'error');
    }
  };

  const isPublisher = user && publisherId === user.id;
  const visibleComments = isExpanded ? comments : comments.slice(0, 2);
  const hiddenCount = Math.max(0, comments.length - 2);

  return (
    <div className={`bg-white/50 px-5 pt-0 pb-4 ${showEmojiPicker ? 'relative z-[245]' : ''}`}>
      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="py-10 text-center text-palette-tan/20 text-xs font-bold uppercase tracking-widest animate-pulse">
            Yorumlar Yükleniyor...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-palette-tan/20 text-xs font-bold uppercase tracking-widest">
            Henüz yorum yapılmamış. İlk yorumu sen yap!
          </div>
        ) : (
          visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onLike={handleLike}
              onReport={handleReport}
              onDelete={handleDelete}
              onBlock={handleBlock}
              isPublisher={isPublisher}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>

      {comments.length > 2 && (
        <div className="relative flex items-center justify-center mt-5 mb-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-palette-beige/50"></div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative flex items-center gap-1.5 bg-white border border-palette-beige text-[10px] font-bold text-palette-tan/50 px-4 py-2 rounded-[5px] shadow-sm hover:bg-palette-beige/20 hover:text-palette-red hover:border-palette-red/20 transition-all group z-10"
          >
            {isExpanded ? (
              <>
                <span>Daha Az Göster</span>
                <ChevronUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>Tümünü Göster ({hiddenCount})</span>
                <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Reply To Indicator */}
      {replyTo && (
        <div className="mt-4 flex items-center justify-between bg-palette-beige/20 px-3 py-1.5 rounded-[5px] border border-palette-beige animate-in slide-in-from-bottom-2">
          <span className="text-[10px] font-bold text-palette-tan flex items-center gap-1.5">
            <Reply size={10} className="scale-x-[-1]" />
            <span className="text-palette-maroon">{replyTo.user_name || replyTo.guest_name}</span> adlı kullanıcıya yanıt veriyorsunuz
          </span>
          <button onClick={() => setReplyTo(null)} className="text-palette-tan/40 hover:text-palette-red transition-colors">
            <ChevronDown size={14} className="rotate-45" />
          </button>
        </div>
      )}

      {/* Post Comment Input */}
      <div className="flex flex-col gap-3 mt-4">
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
            <input
              type="text"
              placeholder="Adınız Soyadınız"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full h-10 px-4 rounded-[5px] bg-white border border-palette-beige/60 focus:border-palette-red/40 text-[13px] font-medium text-palette-maroon placeholder:text-palette-tan/30 focus:outline-none focus:ring-4 focus:ring-palette-red/5 transition-all shadow-sm"
            />
            <input
              type="email"
              placeholder="E-posta Adresiniz"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full h-10 px-4 rounded-[5px] bg-white border border-palette-beige/60 focus:border-palette-red/40 text-[13px] font-medium text-palette-maroon placeholder:text-palette-tan/30 focus:outline-none focus:ring-4 focus:ring-palette-red/5 transition-all shadow-sm"
            />
          </div>
        )}

        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-[5px] bg-palette-beige overflow-hidden flex-shrink-0 border border-palette-beige shadow-sm">
            <img
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user ? 'User' : 'Guest'}&background=f3f4f6&color=94a3b8`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 relative group">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
              placeholder={isBlocked ? "Yorum yapma yetkiniz yok" : "Bir yorum yaz..."}
              disabled={isBlocked}
              className="w-full h-10 pl-4 pr-20 rounded-[5px] bg-white border border-palette-beige/60 focus:border-palette-red/40 text-[13px] font-medium text-palette-maroon placeholder:text-palette-tan/30 focus:outline-none focus:ring-4 focus:ring-palette-red/5 transition-all shadow-sm"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isBlocked}
                  className="w-7 h-7 flex items-center justify-center text-palette-tan/40 hover:text-palette-maroon transition-all"
                  title="Emoji Ekle"
                >
                  <Smile size={18} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-[240] shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme={Theme.LIGHT}
                      searchPlaceholder="Emoji ara..."
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={handlePostComment}
                disabled={isBlocked}
                className="w-7 h-7 flex items-center justify-center bg-palette-beige text-palette-tan/40 rounded-[5px] hover:bg-palette-red hover:text-white transition-all shadow-sm group-focus-within:bg-palette-red group-focus-within:text-white disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
