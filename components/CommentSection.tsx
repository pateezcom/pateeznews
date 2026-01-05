
import React, { useState } from 'react';
import { Heart, Reply, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    user: 'Burak Yılmaz',
    avatar: 'https://picsum.photos/seed/u1/100',
    text: 'İnceleme gerçekten çok detaylı olmuş, özellikle kamera performansındaki gece modu karşılaştırması kafamdaki soru işaretlerini giderdi. Emeğinize sağlık! 👏',
    time: '2 saat önce',
    likes: 24,
    isLiked: true,
    replies: [
      {
        id: 'c1_r1',
        user: 'Tekno Editör',
        avatar: 'https://picsum.photos/seed/editor/100',
        text: 'Teşekkürler Burak Bey! Önümüzdeki hafta video testlerini de kanala yükleyeceğiz, takipte kalın.',
        time: '1 saat önce',
        likes: 5,
        isLiked: false,
      },
      {
        id: 'c1_r2',
        user: 'Selin Demir',
        avatar: 'https://picsum.photos/seed/u3/100',
        text: 'Ben de aynı fikirdeyim, zoom performansı beklediğimden çok daha iyi görünüyor.',
        time: '45 dk önce',
        likes: 2,
        isLiked: false,
      }
    ]
  },
  {
    id: 'c2',
    user: 'Mert S.',
    avatar: 'https://picsum.photos/seed/user1/100',
    text: 'Fiyat konusunda katılıyorum, vergilerle birlikte ulaşılması güç bir cihaz haline geldi maalesef. Alternatiflere yönelmek mantıklı olabilir.',
    time: '3 saat önce',
    likes: 12,
    isLiked: false,
  },
  {
    id: 'c3',
    user: 'Ayşe Kaya',
    avatar: 'https://picsum.photos/seed/u5/100',
    text: 'Tasarım her sene aynı diyenlere katılmıyorum, titanyum kasa elde tutuş hissini tamamen değiştirmiş.',
    time: '5 saat önce',
    likes: 8,
    isLiked: false,
  }
];

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  maxReplies?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isReply = false, maxReplies }) => {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const repliesToShow = maxReplies !== undefined && comment.replies
    ? comment.replies.slice(0, maxReplies)
    : comment.replies;

  return (
    <div className={`flex flex-col ${isReply ? 'mt-3' : 'mt-4'}`}>
      <div className={`flex gap-3 ${isReply ? 'ml-11 relative' : ''}`}>
        {isReply && (
          <div className="absolute -left-5 top-0 w-4 h-4 border-b-2 border-l-2 border-palette-beige rounded-bl-lg"></div>
        )}

        <div className="flex-shrink-0">
          <div className={`rounded-full overflow-hidden border border-palette-beige ${isReply ? 'w-7 h-7' : 'w-9 h-9'}`}>
            <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-palette-beige/30 rounded-lg rounded-tl-none p-3 px-3.5 border border-palette-beige/50">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <h6 className="text-xs font-bold text-palette-maroon">{comment.user}</h6>
                <span className="text-[10px] text-palette-tan/40 font-medium">• {comment.time}</span>
              </div>
              <button className="text-palette-tan/20 hover:text-palette-red transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
            <p className="text-[12px] text-palette-tan/80 leading-relaxed font-medium">
              {comment.text}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1 ml-1">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors group ${liked ? 'text-palette-red' : 'text-palette-tan/40 hover:text-palette-red'}`}
            >
              <Heart size={12} className={`transition-transform group-active:scale-125 ${liked ? 'fill-palette-red' : ''}`} />
              <span>{likeCount > 0 ? likeCount : 'Beğen'}</span>
            </button>

            <button className="flex items-center gap-1.5 text-[10px] font-bold text-palette-tan/40 hover:text-palette-red transition-colors">
              <Reply size={12} className="scale-x-[-1]" />
              <span>Yanıtla</span>
            </button>
          </div>
        </div>
      </div>

      {repliesToShow && repliesToShow.length > 0 && (
        <div>
          {repliesToShow.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleTopLevelComments = isExpanded ? MOCK_COMMENTS : MOCK_COMMENTS.slice(0, 1);
  const replyLimit = isExpanded ? undefined : 1;
  const hiddenCount = 24 - 2;

  return (
    <div className="bg-white/50 px-5 pt-0 pb-4">
      <div className="space-y-1">
        {visibleTopLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            maxReplies={replyLimit}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center mt-5 mb-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-palette-beige/50"></div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative flex items-center gap-1.5 bg-white border border-palette-beige text-[10px] font-bold text-palette-tan/50 px-4 py-2 rounded-full shadow-sm hover:bg-palette-beige/20 hover:text-palette-red hover:border-palette-red/20 transition-all group z-10"
        >
          {isExpanded ? (
            <>
              <span>Daha Az</span>
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

      <div className="flex gap-3 mt-4 items-center">
        <div className="w-9 h-9 rounded-xl bg-palette-beige overflow-hidden flex-shrink-0 border border-palette-beige shadow-sm">
          <img src="https://picsum.photos/seed/user1/100" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Bir yorum yaz..."
            className="w-full h-10 pl-4 pr-11 rounded-xl bg-white border border-palette-beige/60 focus:border-palette-red/40 text-[13px] font-medium text-palette-maroon placeholder:text-palette-tan/30 focus:outline-none focus:ring-4 focus:ring-palette-red/5 transition-all shadow-sm"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-palette-beige text-palette-tan/40 rounded-lg hover:bg-palette-red hover:text-white transition-all shadow-sm group-focus-within:bg-palette-red group-focus-within:text-white">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
