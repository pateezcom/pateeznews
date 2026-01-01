
import React, { useState, useEffect, useMemo } from 'react';
import PostTextItem, { PostItem } from './PostTextItem';
import PostImageItem from './PostImageItem';
import PostSliderImageItem from './PostSliderImageItem';
import PostVideoItem from './PostVideoItem';
import PostAudioItem from './PostAudioItem';
import PostFileItem from './PostFileItem';
import PostSocialItem from './PostSocialItem';
import PostFlipCardItem from './PostFlipCardItem';
import PostBeforeAfterItem from './PostBeforeAfterItem';
import PostPollItem from './PostPollItem';
import PostVSItem from './PostVSItem';
import PostReviewItem from './PostReviewItem';
import PostQuoteItem from './PostQuoteItem';
import PostIframeItem from './PostIframeItem';
import 'react-quill-new/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { NavigationItem } from '../../types';
import {
    X, Upload, ImageIcon, Zap, Languages, Layout, Trash2, CheckCircle2,
    Plus, Image as LucideImage, Type, List,
    Save, FileText, Settings2, Search,
    Globe, Loader2, Share2,
    Calendar, Clock, SortAsc, SortDesc, Hash, Video, ShieldCheck, ListOrdered, Utensils, BarChart2,
    Check, ChevronDown, ChevronRight, Edit3, Images, Film, Mic, Paperclip, RotateCw, ArrowLeftRight, Swords, Award, Quote
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { storageService, MediaItem } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import Popper from '@scaleflex/ui/core/popper';
import { Emoji as EmojiIcon } from '@scaleflex/icons';
import ToolsBarItemButton from 'react-filerobot-image-editor/lib/components/ToolsBar/ToolsBarItemButton';
import useStore from 'react-filerobot-image-editor/lib/hooks/useStore';
import { SET_ANNOTATION } from 'react-filerobot-image-editor/lib/actions';
import { TOOLS_ITEMS as FIE_DEFAULT_TOOLS_ITEMS } from 'react-filerobot-image-editor/lib/components/tools/tools.constants';

const FilerobotEditor: any = FilerobotImageEditor;

const FIE_FEATURED_FONTS = ['Montserrat', 'Playfair Display', 'Oswald', 'Space Grotesk'] as const;
const FIE_FEATURED_FONT_SET = new Set(FIE_FEATURED_FONTS.map((font) => font.toLowerCase()));

const FIE_TEXT_FONTS = [
    ...FIE_FEATURED_FONTS,
    'Bebas Neue',
    'Anton',
    'Archivo Black',
    'Fjalla One',
    'Teko',
    'Inter',
    'Roboto',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway',
    'Open Sans',
    'Lato',
    'Roboto Slab',
    'Merriweather',
    'Libre Baskerville',
    'Cormorant Garamond',
    'Source Serif 4',
    'DM Serif Display',
    'Playfair Display',
    'Cinzel',
    'Ubuntu',
    'Arial'
].filter((font, index, arr) => arr.indexOf(font) === index);

const FIE_TEXT_FONT_OPTIONS = FIE_TEXT_FONTS.map((font) => ({
    label: FIE_FEATURED_FONT_SET.has(font.toLowerCase()) ? `${font} ★` : font,
    value: font.toLowerCase()
}));

const FIE_TEXT_DEFAULT_FONT = 'arial';

const FIE_EMOJI_BASE = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌',
    '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😜', '🤪', '😝',
    '🤨', '🧐', '🤓', '😎', '🥸',
    '🤩', '🥳',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
    '😣', '😖', '😫', '😩', '🥺',
    '😢', '😭',
    '😤', '😠', '😡', '🤬',
    '🤯', '😳',
    '🥵', '🥶',
    '😱', '😨', '😰', '😥', '😓',
    '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄',
    '😯', '😦', '😧', '😮', '😲',
    '🥱', '😴', '🤤', '😪',
    '😵', '😵‍💫', '🤐', '🥴',
    '🤢', '🤮', '🤧',
    '😷', '🤒', '🤕',
    '🤑', '🤠',
    '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '👽', '👾', '🤖',
    '🎃',

    '👍', '👎', '👊', '✊', '🤛', '🤜',
    '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏',
    '👋', '🤚', '✋', '🖐️', '🖖',
    '✍️', '🙏', '🤝',
    '💪', '🦾', '🦵', '🦿',
    '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '🫦',

    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍',
    '💔', '❤️‍🔥', '❤️‍🩹',
    '💖', '💗', '💓', '💞', '💕', '💘', '💝', '💟',

    '🚨', '⚡', '🔥', '💥', '💫', '⭐', '🌟', '✨',
    '✅', '☑️', '✔️', '✖️', '❌', '❎',
    '❗', '❕', '❓', '❔', '‼️', '⁉️',
    '🛑',
    '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪',
    '🔶', '🔷', '🔸', '🔹', '🔺', '🔻',
    '➕', '➖', '➗',
    '⬆️', '⬇️', '⬅️', '➡️', '↗️', '↘️', '↙️', '↖️', '⤴️', '⤵️',
    '🔄', '🔃', '🔁', '🔀',

    '☀️', '🌤️', '⛅', '🌥️', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '🌪️',
    '💧', '🌊', '🌈',

    '📢', '📣', '📰', '🗞️',
    '🎙️', '🎤', '🎧',
    '📸', '🎥', '📽️',
    '🔔', '🔕',
    '💡', '🔦', '🔍', '🔎',
    '🔒', '🔓', '🗝️',
    '📌', '📍', '🧭',
    '🧨', '🎯',
    '🎉', '🎊', '🎈', '🎁',
    '🏆', '🥇', '🥈', '🥉',

    '💰', '💵', '💶', '💷', '💴', '🪙', '💳',
    '📈', '📉',

    '☕', '🍿', '🍔', '🍟', '🍕', '🌭',
    '🍺', '🍷',
] as const;

const FIE_FLAG_COUNTRY_CODES = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
    'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
    'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
    'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
    'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
    'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
    'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
    'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
    'JE', 'JM', 'JO', 'JP',
    'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
    'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
    'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
    'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
    'OM',
    'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
    'QA',
    'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
    'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
    'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
    'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
    'WF', 'WS',
    'YE', 'YT',
    'ZA', 'ZM', 'ZW',
    'XK',
] as const;

const countryCodeToFlagEmoji = (countryCode: string) => {
    const code = countryCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return '';
    const regionalIndicatorA = 0x1F1E6;
    return String.fromCodePoint(
        ...code.split('').map((char) => regionalIndicatorA + (char.charCodeAt(0) - 65))
    );
};

const FIE_FLAG_EMOJIS = Array.from(
    new Set(FIE_FLAG_COUNTRY_CODES.map(countryCodeToFlagEmoji).filter(Boolean))
);

const FIE_EMOJI_LIST = Array.from(new Set([...FIE_EMOJI_BASE, ...FIE_FLAG_EMOJIS]));

const FIE_EMOJI_TOOL_ID = 'Emoji';
const FIE_EMOJI_TOGGLE_EVENT = 'fie:emoji-toggle';

const FIE_EMOJI_STICKER_CACHE = new Map<string, string>();

const createEmojiStickerDataUrl = (emoji: string, sizePx = 128) => {
    if (typeof document === 'undefined') return '';

    const dpr = typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number'
        ? Math.max(1, Math.min(window.devicePixelRatio, 3))
        : 1;

    const cacheKey = `${emoji}|${sizePx}|${dpr}`;
    const cached = FIE_EMOJI_STICKER_CACHE.get(cacheKey);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sizePx * dpr);
    canvas.height = Math.round(sizePx * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.round(sizePx * 0.78);
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.fillText(emoji, sizePx / 2, sizePx / 2);

    const url = canvas.toDataURL('image/png');
    FIE_EMOJI_STICKER_CACHE.set(cacheKey, url);
    return url;
};

const FieEmojiToolButton = ({ selectTool, isSelected }: any) => (
    <ToolsBarItemButton
        className="FIE_emoji-tool-button"
        id={FIE_EMOJI_TOOL_ID}
        label="Emoji"
        Icon={EmojiIcon}
        onClick={(toolId: string) => {
            selectTool(toolId);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event(FIE_EMOJI_TOGGLE_EVENT));
            }
        }}
        isSelected={isSelected}
    />
);

const FieEmojiToolOptions = () => {
    const store: any = useStore();
    const dispatch = store?.dispatch;
    const originalSource = store?.originalSource;
    const shownImageDimensions = store?.shownImageDimensions;
    const crop = store?.adjustments?.crop ?? {};

    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState<'emoji' | 'flags'>('emoji');
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const el = document.querySelector(
            `[data-testid="FIE-tools-bar-item-button-${FIE_EMOJI_TOOL_ID.toLowerCase()}"]`
        ) as HTMLElement | null;
        setAnchorEl(el);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = () => setOpen(true);
        window.addEventListener(FIE_EMOJI_TOGGLE_EVENT, handler);
        return () => window.removeEventListener(FIE_EMOJI_TOGGLE_EVENT, handler);
    }, []);

    const items = tab === 'flags' ? FIE_FLAG_EMOJIS : (FIE_EMOJI_BASE as unknown as string[]);

    const addSticker = React.useCallback((emoji: string) => {
        const dataUrl = createEmojiStickerDataUrl(emoji, 128);
        if (!dataUrl || typeof Image === 'undefined' || typeof dispatch !== 'function') return;

        const img = new Image();
        img.onload = () => {
            const initialScale = shownImageDimensions?.originalSourceInitialScale || 1;
            const baseWidth = (crop?.width ? crop.width / initialScale : undefined) || originalSource?.width || 0;
            const baseHeight = (crop?.height ? crop.height / initialScale : undefined) || originalSource?.height || 0;
            const baseX = (crop?.x ? crop.x / initialScale : undefined) || 0;
            const baseY = (crop?.y ? crop.y / initialScale : undefined) || 0;

            const spacing = 0.15;
            const fitScale = Math.min(
                1,
                baseWidth / (img.width + img.width * spacing),
                baseHeight / (img.height + img.height * spacing)
            );

            dispatch({
                type: SET_ANNOTATION,
                payload: {
                    name: TOOLS.IMAGE,
                    image: img,
                    x: baseX + baseWidth / 2 - (img.width * fitScale) / 2,
                    y: baseY + baseHeight / 2 - (img.height * fitScale) / 2,
                    width: img.width * fitScale,
                    height: img.height * fitScale,
                    opacity: 1,
                    selectOnSet: false,
                },
            });

            setOpen(false);
        };
        img.src = dataUrl;
    }, [dispatch, shownImageDimensions?.originalSourceInitialScale, crop?.width, crop?.height, crop?.x, crop?.y, originalSource?.width, originalSource?.height]);

    return (
        <div className="FIE_emoji-tool-options" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
                type="button"
                onClick={() => { setTab('emoji'); setOpen(true); }}
                style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    padding: '6px 10px',
                    background: tab === 'emoji' ? 'rgba(0,0,0,0.04)' : '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                Emojiler
            </button>
            <button
                type="button"
                onClick={() => { setTab('flags'); setOpen(true); }}
                style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    padding: '6px 10px',
                    background: tab === 'flags' ? 'rgba(0,0,0,0.04)' : '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                Bayraklar
            </button>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    padding: '6px 10px',
                    background: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                {open ? 'Kapat' : 'Aç'}
            </button>

            <Popper
                className="FIE_emoji-picker"
                anchorEl={anchorEl}
                open={open && !!anchorEl}
                position="top"
                overlay
                onClick={() => setOpen(false)}
                wrapperStyles={{ maxWidth: 520 }}
            >
                <div style={{ background: '#fff', borderRadius: 6, padding: 8, maxWidth: 520, maxHeight: 360, overflow: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
                        {items.map((emoji) => (
                            <button
                                key={`${tab}-${emoji}`}
                                type="button"
                                onClick={() => addSticker(emoji)}
                                style={{
                                    width: 34,
                                    height: 34,
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: 6,
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 20,
                                    lineHeight: '32px',
                                    padding: 0,
                                }}
                                aria-label={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </Popper>
        </div>
    );
};

const SC_DOM_PROP_BLOCKLIST = new Set([
    'showTabsDrawer',
    'isPhoneScreen',
    'noMargin',
    'active',
    'showBackButton',
    'hasChildren',
    'fullWidth',
    'isValueExists',
    'hideEllipsis',
    'watermarkTool',
    'maxWidth',
    'icon',
    'isWarning',
    'isError',
    'primary',
    'variant',
    'iconShadow',
    'alignment',
    'align',
    'warning',
]);

// SC v6 filter: only filter DOM props, forward all props to custom components.
const shouldForwardProp = (prop: string, elementToBeRendered: unknown) => {
    if (prop.startsWith('$')) return false; // transient props
    if (typeof elementToBeRendered === 'string') {
        return isPropValid(prop) && !SC_DOM_PROP_BLOCKLIST.has(prop);
    }
    return true;
};

// Premium Quill Overrides
const QUILL_CUSTOM_STYLE = `
  .quill-modern-wrapper .ql-toolbar.ql-snow {
    border: none !important;
    background: #fdfaf5 !important;
    border-bottom: 1px solid #e8e2d9 !important;
    padding: 12px 16px !important;
    border-radius: 3px 3px 0 0 !important;
  }
  .quill-modern-wrapper .ql-container.ql-snow {
    border: none !important;
    font-family: inherit !important;
    font-size: 15px !important;
    color: #4a0404 !important;
    min-height: 200px !important;
  }
  .quill-modern-wrapper.compact-quill .ql-container.ql-snow {
    min-height: 140px !important;
  }
  .quill-modern-wrapper .ql-editor {
    padding: 24px !important;
    line-height: 1.6 !important;
  }
  .quill-modern-wrapper .ql-editor.ql-blank::before {
    color: rgba(140, 120, 100, 0.3) !important;
    font-style: normal !important;
    font-weight: 500 !important;
    left: 24px !important;
  }
  .quill-modern-wrapper .ql-snow .ql-stroke {
    stroke: #8c7864 !important;
  }
  .quill-modern-wrapper .ql-snow .ql-fill {
    fill: #8c7864 !important;
  }
  .quill-modern-wrapper .ql-snow .ql-picker {
    color: #8c7864 !important;
    font-weight: 600 !important;
  }
`;

interface Language {
    code: string;
    name: string;
}

const PostManagement: React.FC = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        summary: '',
        category: 'Gündem',
        thumbnail: '',
        seoTitle: '',
        seoDescription: '',
        keywords: '',
        slug: '',
        factChecked: false,
        schemaType: 'NewsArticle',
        publishAt: '',
        items: [] as PostItem[]
    });

    const [showBlockNumbers, setShowBlockNumbers] = useState(true);
    const [activeSort, setActiveSort] = useState<'asc' | 'desc' | null>('asc');
    const [isUrlMode, setIsUrlMode] = useState(false);
    const [showFileManager, setShowFileManager] = useState(false);
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [isEditorSaving, setIsEditorSaving] = useState(false);
    const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
    const editorSaveInFlightRef = React.useRef(false);
    const [localFiles, setLocalFiles] = useState<any[]>([]);
    const [validatingUrl, setValidatingUrl] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const [activeMediaTarget, setActiveMediaTarget] = useState<string | 'thumbnail' | null>(null);
    const [activeMediaSubTarget, setActiveMediaSubTarget] = useState<string | null>(null);
    const [activeMediaOptionTarget, setActiveMediaOptionTarget] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [activeDetailTab, setActiveDetailTab] = useState<'article' | 'quiz' | 'poll' | 'video' | 'contents' | 'recipe'>('article');
    const [activeMediaType, setActiveMediaType] = useState<'image' | 'video' | 'audio' | 'file'>('image');
    const [categories, setCategories] = useState<NavigationItem[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState('tr');
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [selectedSubId, setSelectedSubId] = useState<string>('');

    useEffect(() => {
        fetchMedia();
        fetchLanguages();
    }, []);

    useEffect(() => {
        if (activeDetailTab === 'article' && formData.items.length === 0) {
            handleAddItem();
        }
    }, [activeDetailTab]);

    const handleEditorSave = React.useCallback(async (editedImageObject: any) => {
        if (editorSaveInFlightRef.current) return;
        editorSaveInFlightRef.current = true;
        setIsEditorSaving(true);

        try {
            // Get original filename to preserve it if possible
            let originalName = `edited-${Date.now()}`;
            // Extract existing "date/filename" path if we are editing an existing image
            let customPath: string | undefined = undefined;

            const currentMediaUrl = activeMediaTarget === 'thumbnail'
                ? formData.thumbnail
                : formData.items.find(i => i.id === activeMediaTarget)?.mediaUrl;

            if (currentMediaUrl) {
                try {
                    // Check if it's a local storage URL
                    if (currentMediaUrl.includes('/api/storage/file/')) {
                        const urlWithoutQuery = currentMediaUrl.split('?')[0];
                        const idx = urlWithoutQuery.indexOf('/api/storage/file/');
                        const rawPath = idx >= 0 ? urlWithoutQuery.slice(idx + '/api/storage/file/'.length) : '';
                        const decodedPath = (() => {
                            try {
                                return decodeURIComponent(rawPath);
                            } catch {
                                return rawPath;
                            }
                        })();

                        const [datePart, ...fileParts] = decodedPath.split('/');
                        const fileWithExt = fileParts.join('/');
                        if (datePart && fileWithExt) {
                            const normalizeLower = (s: string) => s.toLowerCase();
                            let baseName = fileWithExt;
                            if (normalizeLower(baseName).endsWith('_xl.webp')) baseName = baseName.slice(0, -'_xl.webp'.length);
                            if (normalizeLower(baseName).endsWith('_sm.webp')) baseName = baseName.slice(0, -'_sm.webp'.length);
                            if (normalizeLower(baseName).endsWith('.webp')) baseName = baseName.slice(0, -'.webp'.length);

                            customPath = `${datePart}/${baseName}`; // e.g. "2024-12-31/filename"
                            const namePart = baseName.split('/').pop();
                            if (namePart) originalName = namePart;
                        }
                    }
                } catch (e) {
                    console.error('Filename extraction failed:', e);
                }
            }

            let file: File;

            const extRaw = typeof editedImageObject?.extension === 'string' ? editedImageObject.extension : 'webp';
            const extension = extRaw.replace(/^\./, '').toLowerCase() || 'webp';
            const mimeFromExt =
                extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
                    extension === 'png' ? 'image/png' :
                        extension === 'webp' ? 'image/webp' :
                            'application/octet-stream';
            const mimeType = typeof editedImageObject?.mimeType === 'string'
                ? (editedImageObject.mimeType === 'image/jpg' ? 'image/jpeg' : editedImageObject.mimeType)
                : mimeFromExt;

            const normalizeQuality = (q: unknown) => {
                if (typeof q !== 'number' || Number.isNaN(q)) return undefined;
                if (q <= 0) return undefined;
                if (q > 1) return Math.min(q / 100, 1);
                return q;
            };
            const quality = normalizeQuality(editedImageObject?.quality);

            const safeBaseName = originalName.replace(/\.[a-z0-9]+$/i, '') || `edited-${Date.now()}`;

            let blob: Blob | null = null;
            if (editedImageObject?.imageCanvas && typeof editedImageObject.imageCanvas.toBlob === 'function') {
                const canvas: HTMLCanvasElement = editedImageObject.imageCanvas;
                const makeBlob = (type: string, q?: number) =>
                    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, q));

                const withTimeout = <T,>(p: Promise<T>, ms: number, label: string) =>
                    Promise.race([
                        p,
                        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
                    ]);

                blob = await withTimeout(makeBlob(mimeType, quality), 30_000, 'Canvas export');
                if (!blob && mimeType !== 'image/png') {
                    blob = await withTimeout(makeBlob('image/png'), 30_000, 'Canvas export (png fallback)');
                }
                if (!blob) throw new Error('Canvas export failed');
            } else if (editedImageObject?.imageBlob) {
                blob = editedImageObject.imageBlob;
            } else if (editedImageObject?.imageBase64) {
                const base64Str: string = editedImageObject.imageBase64;
                const dataUrl = base64Str.startsWith('data:')
                    ? base64Str
                    : `data:${mimeType};base64,${base64Str}`;
                try {
                    const response = await fetch(dataUrl);
                    blob = await response.blob();
                } catch (fetchErr) {
                    console.error('Base64 conversion failed:', fetchErr);
                    throw fetchErr;
                }
            } else if (editedImageObject?.cloudimageUrl) {
                const response = await fetch(editedImageObject.cloudimageUrl);
                blob = await response.blob();
            } else {
                console.error('No image data received from editor');
                setShowImageEditor(false);
                return;
            }

            if (!blob) {
                console.error('Blob creation failed');
                setShowImageEditor(false);
                return;
            }

            const finalMimeType = blob.type || mimeType;
            const finalExtension =
                finalMimeType === 'image/jpeg' ? 'jpg' :
                    finalMimeType === 'image/png' ? 'png' :
                        finalMimeType === 'image/webp' ? 'webp' :
                            extension;
            file = new File([blob], `${safeBaseName}.${finalExtension}`, { type: finalMimeType });

            const result = await storageService.uploadFile(file, customPath);

            if (result) {
                // Force cache bust
                const newSrc = `${result.src}?v=${Date.now()}`;

                if (activeMediaTarget === 'thumbnail') {
                    setIsThumbnailLoading(true);
                    setFormData(prev => ({ ...prev, thumbnail: newSrc }));
                } else if (activeMediaTarget) {
                    const targetItem = formData.items.find(i => i.id === activeMediaTarget);
                    if (targetItem?.type === 'flipcard' && activeMediaSubTarget) {
                        const currentFlipData = targetItem.flipData || {
                            frontImage: '',
                            backImage: '',
                            frontTitle: '',
                            backTitle: '',
                            backDescription: ''
                        };
                        handleUpdateItem(activeMediaTarget, 'flipData', {
                            ...currentFlipData,
                            [activeMediaSubTarget]: newSrc
                        });
                    } else if (targetItem?.type === 'beforeafter' && activeMediaSubTarget) {
                        const currentData = targetItem.beforeAfterData || {
                            beforeImage: '',
                            afterImage: '',
                            beforeLabel: 'ÖNCE',
                            afterLabel: 'SONRA'
                        };
                        handleUpdateItem(activeMediaTarget, 'beforeAfterData', {
                            ...currentData,
                            [activeMediaSubTarget]: newSrc
                        });
                    } else if (targetItem?.type === 'poll') {
                        if (activeMediaSubTarget === 'options' && activeMediaOptionTarget) {
                            const currentOptions = targetItem.options || [];
                            handleUpdateItem(activeMediaTarget, 'options', currentOptions.map(o =>
                                o.id === activeMediaOptionTarget ? { ...o, image: newSrc } : o
                            ));
                        } else {
                            handleUpdateItem(activeMediaTarget, 'mediaUrl', newSrc);
                        }
                    } else {
                        handleUpdateItem(activeMediaTarget, 'mediaUrl', newSrc);
                    }
                }

                // Update local files list
                setLocalFiles(prev => {
                    // Remove old entry if exists (by ID) to avoid duplicates
                    const filtered = prev.filter(p => p.id !== result.id);
                    return [result, ...filtered];
                });
            } else {
                console.error('Upload failed');
            }
        } catch (err) {
            console.error('Editor save failed:', err);
        } finally {
            // ALWAYS close the editor
            editorSaveInFlightRef.current = false;
            setIsEditorSaving(false);
            setShowImageEditor(false);
        }
    }, [formData.thumbnail, activeMediaTarget, formData.items]);

    const handleEditorClose = React.useCallback((closeReason?: any, haveNotSavedChanges?: any) => {
        editorSaveInFlightRef.current = false;
        setIsEditorSaving(false);
        setShowImageEditor(false);
    }, []);

    const handleEditorBeforeSave = React.useCallback((savedImageData: any) => {
        setIsEditorSaving(true);
        // Skip the default "Save As" modal and trigger save immediately
        // (we overwrite the existing file path on the backend via customPath).
        return false;
    }, []);

    const editorConfig = React.useMemo(() => ({
        annotationsCommon: { fill: '#ff0000' },
        theme: {
            typography: {
                fontFamily: `${FIE_TEXT_FONTS.join(', ')}, sans-serif`
            }
        },
        tools: {
            ...FIE_DEFAULT_TOOLS_ITEMS,
            [FIE_EMOJI_TOOL_ID]: {
                id: FIE_EMOJI_TOOL_ID,
                Item: FieEmojiToolButton,
                ItemOptions: FieEmojiToolOptions,
            },
        },
        Text: {
            text: 'Buzz Haber',
            fontFamily: FIE_TEXT_DEFAULT_FONT,
            fonts: FIE_TEXT_FONT_OPTIONS,
            fontSize: 120,
            onFontChange: (fontFamily: string, reRenderCanvas: () => void) => {
                if (typeof document === 'undefined' || !document.fonts?.load) {
                    reRenderCanvas();
                    return;
                }
                const match = FIE_TEXT_FONTS.find((font) => font.toLowerCase() === fontFamily) || fontFamily;
                document.fonts.load(`16px "${match}"`).finally(reRenderCanvas);
            }
        },
        Rotate: { angle: 90, componentType: 'slider' },
        tabsIds: [TABS.ADJUST, TABS.FILTERS, TABS.FINETUNE, TABS.ANNOTATE, TABS.WATERMARK],
        defaultTabId: TABS.ANNOTATE,
        defaultToolId: TOOLS.TEXT,
        closeAfterSave: true,
        defaultSavedImageType: 'webp',
        defaultSavedImageQuality: 1,
        onBeforeSave: handleEditorBeforeSave,
        savingPixelRatio: 1,
        previewPixelRatio: 1,
        willReadFrequently: true,
        tabsToolsIds: {
            [TABS.ADJUST]: [TOOLS.CROP, TOOLS.ROTATE, TOOLS.FLIP_X, TOOLS.FLIP_Y],
            [TABS.FINETUNE]: [TOOLS.BRIGHTNESS, TOOLS.CONTRAST, TOOLS.HSV, TOOLS.BLUR, TOOLS.WARMTH],
            [TABS.FILTERS]: [TOOLS.FILTERS],
            [TABS.WATERMARK]: [TOOLS.WATERMARK],
            [TABS.ANNOTATE]: [TOOLS.TEXT, TOOLS.IMAGE, TOOLS.RECT, TOOLS.ELLIPSE, TOOLS.POLYGON, TOOLS.PEN, TOOLS.LINE, TOOLS.ARROW, FIE_EMOJI_TOOL_ID],
        },
        [TABS.ADJUST]: {
            hideResize: true,
        },
    }), [handleEditorBeforeSave]);

    useEffect(() => {
        if (selectedLanguage) {
            fetchCategories(selectedLanguage);
            // Dil değiştiğinde kategori seçimlerini sıfırla (eğer manuel değişimse)
            if (formData.id === '') { // Sadece yeni haber eklerken sıfırla, düzenlerken baştan yüklenecek
                setSelectedParentId('');
                setSelectedSubId('');
                setFormData(prev => ({ ...prev, category: '' }));
            }
        }
    }, [selectedLanguage]);

    const fetchLanguages = async () => {
        try {
            const { data } = await supabase.from('languages').select('code, name');
            if (data) setLanguages(data);
        } catch (error) {
            console.error("Error fetching languages:", error);
        }
    };

    const fetchCategories = async (langCode: string) => {
        try {
            const { data: menuData } = await supabase
                .from('navigation_menus')
                .select('id')
                .eq('code', 'sidebar_main')
                .single();

            if (menuData) {
                const { data: itemData } = await supabase
                    .from('navigation_items')
                    .select('*')
                    .eq('menu_id', menuData.id)
                    .eq('language_code', langCode)
                    .order('order_index', { ascending: true });
                setCategories(itemData || []);

                // If editing and category exists, try to pre-populate dropdowns
                if (formData.category && itemData) {
                    const matchedItem = itemData.find(i => i.label === formData.category);
                    if (matchedItem) {
                        if (matchedItem.parent_id) {
                            setSelectedParentId(matchedItem.parent_id);
                            setSelectedSubId(matchedItem.id);
                        } else {
                            setSelectedParentId(matchedItem.id);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleParentCategoryChange = (catId: string) => {
        setSelectedParentId(catId);
        setSelectedSubId('');
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setFormData({ ...formData, category: cat.label });
        } else {
            setFormData({ ...formData, category: '' });
        }
    };

    const handleSubCategoryChange = (catId: string) => {
        setSelectedSubId(catId);
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setFormData({ ...formData, category: cat.label });
        }
    };

    const fetchMedia = async (type: 'image' | 'video' | 'audio' | 'file' = 'image') => {
        const files = await storageService.getFiles(type);
        setLocalFiles(files);
    };

    const validateImageUrl = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 5000);
        });
    };

    const handleUrlSubmit = async () => {
        const trimmedUrl = tempUrl.trim();
        if (!trimmedUrl) {
            setUrlError(t('common.error'));
            return;
        }
        setValidatingUrl(true);
        setUrlError(null);

        // Skip image validation if we are in video or audio mode
        if (activeMediaType === 'video' || activeMediaType === 'audio') {
            if (activeMediaTarget) {
                handleUpdateItem(activeMediaTarget, 'mediaUrl', trimmedUrl);
            }
            setIsUrlMode(false);
            setTempUrl('');
        } else {
            const isValid = await validateImageUrl(trimmedUrl);
            if (isValid) {
                if (activeMediaTarget === 'thumbnail') {
                    setFormData({ ...formData, thumbnail: trimmedUrl });
                } else if (activeMediaTarget) {
                    const targetItem = formData.items.find(i => i.id === activeMediaTarget);
                    if (targetItem?.type === 'flipcard' && activeMediaSubTarget) {
                        const currentFlipData = targetItem.flipData || {
                            frontImage: '',
                            backImage: '',
                            frontTitle: '',
                            backTitle: '',
                            backDescription: ''
                        };
                        handleUpdateItem(activeMediaTarget, 'flipData', {
                            ...currentFlipData,
                            [activeMediaSubTarget]: trimmedUrl
                        });
                    } else if (targetItem?.type === 'beforeafter' && activeMediaSubTarget) {
                        const currentData = targetItem.beforeAfterData || {
                            beforeImage: '',
                            afterImage: '',
                            beforeLabel: 'ÖNCE',
                            afterLabel: 'SONRA'
                        };
                        handleUpdateItem(activeMediaTarget, 'beforeAfterData', {
                            ...currentData,
                            [activeMediaSubTarget]: trimmedUrl
                        });
                    } else if (targetItem?.type === 'poll') {
                        if (activeMediaSubTarget === 'options' && activeMediaOptionTarget) {
                            const currentOptions = targetItem.options || [];
                            handleUpdateItem(activeMediaTarget, 'options', currentOptions.map(o =>
                                o.id === activeMediaOptionTarget ? { ...o, image: trimmedUrl } : o
                            ));
                        } else {
                            handleUpdateItem(activeMediaTarget, 'mediaUrl', trimmedUrl);
                        }
                    } else {
                        handleUpdateItem(activeMediaTarget, 'mediaUrl', trimmedUrl);
                    }
                }
                setIsUrlMode(false);
                setTempUrl('');
            } else {
                setUrlError(t('admin.generic_error').replace('{error}', 'Invalid URL'));
            }
        }
        setValidatingUrl(false);
    };

    const handleAddItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'text',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0 // Will be set by re-sequencing
        };

        let newItems = [...formData.items, newItem];

        // Always re-sequence if activeSort is set, otherwise just give it a number
        if (activeSort) {
            newItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            newItems[newItems.length - 1].orderNumber = nextOrder;
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleAddImageItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0 // Will be set by re-sequencing
        };

        let newItems = [...formData.items, newItem];

        if (activeSort) {
            newItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            newItems[newItems.length - 1].orderNumber = nextOrder;
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleAddSliderItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'slider',
            title: '',
            description: '',
            mediaUrls: [],
            createdAt: Date.now(),
            orderNumber: 0
        };

        let newItems = [...formData.items, newItem];

        if (activeSort) {
            newItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            newItems[newItems.length - 1].orderNumber = nextOrder;
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleAddVideoItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'video',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];

        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }

        setFormData({ ...formData, items: finalItems });
    };

    const handleAddAudioItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'audio',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddFileItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'file',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddSocialItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'social',
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddFlipCardItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'flipcard',
            title: '',
            description: '',
            createdAt: Date.now(),
            orderNumber: 0,
            flipData: {
                frontImage: '',
                backImage: '',
                frontTitle: '',
                backTitle: '',
                frontDescription: '',
                backDescription: '',
                frontLink: '',
                backLink: ''
            }
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddBeforeAfterItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'beforeafter',
            title: '',
            description: '',
            orderNumber: 0,
            beforeAfterData: {
                beforeImage: '',
                afterImage: '',
                beforeLabel: 'ÖNCE',
                afterLabel: 'SONRA'
            }
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddPollItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'poll',
            title: '',
            description: '',
            orderNumber: 0,
            options: [
                { id: Math.random().toString(36).substr(2, 9), text: '', votes: 0, image: '' },
                { id: Math.random().toString(36).substr(2, 9), text: '', votes: 0, image: '' }
            ],
            isImagePoll: true,
            pollColumns: 2
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleUpdateItem = (id: string, field: keyof PostItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleAddVSItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'vs',
            title: '',
            description: '',
            orderNumber: 0,
            options: [
                { id: Math.random().toString(36).substr(2, 9), text: 'Sol Taraf', votes: 0, image: '' },
                { id: Math.random().toString(36).substr(2, 9), text: 'Sağ Taraf', votes: 0, image: '' }
            ],
            isImagePoll: true,
            pollColumns: 2
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddReviewItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'review',
            title: '',
            description: '',
            orderNumber: 0,
            reviewData: {
                productName: '',
                productImage: '',
                score: 85,
                pros: ['Artı özellikleri buraya ekleyin...'],
                cons: ['Eksi özellikleri buraya ekleyin...'],
                breakdown: [
                    { label: 'Tasarım', score: 80 },
                    { label: 'Performans', score: 80 }
                ],
                verdict: 'Nihai kararınızı buraya yazın...'
            }
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddQuoteItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'quote',
            title: '',
            description: '',
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleAddIframeItem = () => {
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'iframe',
            title: '',
            description: '',
            orderNumber: 0
        };

        const newItems = [...formData.items, newItem];
        let finalItems = newItems;
        if (activeSort) {
            finalItems = newItems.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (newItems.length - idx)
            }));
        } else {
            const nextOrder = formData.items.length > 0
                ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
                : 1;
            finalItems[finalItems.length - 1].orderNumber = nextOrder;
        }
        setFormData({ ...formData, items: finalItems });
    };

    const handleRemoveItem = (id: string) => {
        if (activeDetailTab === 'article' && formData.items.length <= 1) return;
        let filtered = formData.items.filter(item => item.id !== id);
        if (activeSort) {
            // Re-sequence remaining items
            filtered = filtered.map((item, idx) => ({
                ...item,
                orderNumber: activeSort === 'asc' ? (idx + 1) : (filtered.length - idx)
            }));
        }
        setFormData({ ...formData, items: filtered });
    };

    const handleSortItems = (order: 'asc' | 'desc') => {
        // Re-sequence based on current visual positions in the array
        const resequenced = formData.items.map((item, idx) => ({
            ...item,
            orderNumber: order === 'asc' ? (idx + 1) : (formData.items.length - idx)
        }));

        setFormData({ ...formData, items: resequenced });
        setShowBlockNumbers(true);
        setActiveSort(order);
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...formData.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        const currentItem = { ...newItems[index] };
        const targetItem = { ...newItems[targetIndex] };

        // Swap positions in the array
        newItems[index] = targetItem;
        newItems[targetIndex] = currentItem;

        if (activeSort) {
            // Re-sequence based on new visual order
            newItems.forEach((item, idx) => {
                if (activeSort === 'asc') {
                    item.orderNumber = idx + 1;
                } else {
                    item.orderNumber = newItems.length - idx;
                }
            });
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleTitleChange = (val: string) => {
        const slug = val.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .slice(0, 50);
        setFormData({
            ...formData,
            title: val,
            slug: slug,
            seoTitle: val.slice(0, 60),
            seoDescription: formData.summary || val.slice(0, 160)
        });
    };

    const handleSummaryChange = (val: string) => {
        setFormData({
            ...formData,
            summary: val,
            seoDescription: val.slice(0, 160)
        });
    };

    return (
        <div className="animate-in fade-in duration-500 admin-font">
            <style dangerouslySetInnerHTML={{ __html: QUILL_CUSTOM_STYLE }} />
            {/* MODERN COMPACT HEADER */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[3px] border border-palette-tan/20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-palette-maroon">
                            {formData.id ? t('admin.post.edit_title') : t('admin.post.new_title')}
                        </h2>
                        <p className="text-[13px] font-bold text-palette-tan/50 tracking-wider">{t('admin.post.panel_desc')}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 space-y-6">
                    {/* JOINED TABS AND CONTENT SECTION */}
                    <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-sm overflow-hidden">
                        {/* PREMIUM TAB NAVIGATION - IMAGE STYLE */}
                        <div className="border-b border-palette-tan/15 bg-white">
                            <div className="flex h-24">
                                {[
                                    { id: 'article', label: 'Article', icon: FileText },
                                    { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
                                    { id: 'poll', label: 'Poll', icon: BarChart2 },
                                    { id: 'video', label: 'Video', icon: Video },
                                    { id: 'contents', label: 'Table of Contents', icon: ListOrdered },
                                    { id: 'recipe', label: 'Recipe', icon: Utensils }
                                ].map((tab, idx, arr) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDetailTab(tab.id as any)}
                                        className={`
                                            flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group
                                            ${idx !== arr.length - 1 ? 'border-r border-palette-tan/10' : ''}
                                            ${activeDetailTab === tab.id
                                                ? 'bg-palette-beige/20 text-palette-maroon'
                                                : 'text-palette-tan/40 hover:bg-palette-beige/5 hover:text-palette-maroon'}
                                        `}
                                    >
                                        <tab.icon
                                            size={28}
                                            strokeWidth={1.5}
                                            className={`${activeDetailTab === tab.id ? 'text-palette-maroon' : 'text-palette-tan/30 group-hover:text-palette-maroon'} transition-colors`}
                                        />
                                        <span className={`text-[12px] uppercase font-black tracking-widest ${activeDetailTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                                            {tab.label}
                                        </span>

                                        {/* ACTIVE TRIANGLE POINTER (Points into content area) */}
                                        {activeDetailTab === tab.id && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white z-20" />
                                        )}
                                        {activeDetailTab === tab.id && (
                                            <div className="absolute top-[calc(100%+0.5px)] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-palette-tan/20 z-10" />
                                        )}

                                        {activeDetailTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-maroon" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BASIC & SEO INTEGRATED INFO */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-palette-tan/15 pb-4">
                                <FileText size={18} className="text-palette-red" />
                                <h3 className="text-base font-bold text-palette-maroon uppercase tracking-widest">{t('admin.post.content_info')}</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-palette-tan ml-1">{t('admin.post.post_title')}</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder={t('nav_settings.form.label') + "..."}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3.5 text-[18px] font-bold text-palette-maroon focus:border-palette-red outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-palette-tan ml-1">{t('admin.post.summary')}</label>
                                    <textarea
                                        rows={2}
                                        value={formData.summary}
                                        onChange={(e) => handleSummaryChange(e.target.value)}
                                        placeholder={t('admin.post.summary_placeholder')}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3.5 text-base font-medium text-palette-maroon focus:border-palette-red outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* AUTOMATED SEO SECTION */}
                            <div className="mt-8 pt-8 border-t border-palette-tan/15 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Settings2 size={18} className="text-palette-tan" />
                                        <h3 className="text-[13px] font-bold text-palette-tan uppercase tracking-tighter">{t('admin.post.seo_ai')}</h3>
                                    </div>
                                    <span className="text-[11px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-[3px] border border-green-100 italic">Google AI Ready</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-palette-tan/60">{t('posts.form.meta_title')}</label>
                                        <input
                                            type="text"
                                            value={formData.seoTitle}
                                            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                            className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-bold text-palette-maroon outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-palette-tan/60">{t('posts.form.slug')}</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-bold text-palette-red outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-palette-tan/60">{t('posts.form.meta_desc')}</label>
                                    <input
                                        type="text"
                                        value={formData.seoDescription}
                                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-medium text-palette-tan outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-palette-tan/60">{t('posts.form.keywords')}</label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] min-h-[38px] transition-all focus-within:border-palette-red/40">
                                        {formData.keywords.split(',').filter(t => t.trim() !== '').map((tag, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-palette-maroon text-white text-[11px] font-bold rounded-[3px] animate-in zoom-in duration-200">
                                                {tag.trim()}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags = formData.keywords.split(',').filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, keywords: newTags.join(',') });
                                                    }}
                                                    className="hover:text-palette-beige transition-colors"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = tagInput.trim().replace(',', '');
                                                    if (val) {
                                                        const currentTags = formData.keywords ? formData.keywords.split(',').map(t => t.trim()) : [];
                                                        if (!currentTags.includes(val)) {
                                                            setFormData({ ...formData, keywords: [...currentTags, val].filter(t => t).join(',') });
                                                        }
                                                        setTagInput('');
                                                    }
                                                } else if (e.key === 'Backspace' && !tagInput && formData.keywords) {
                                                    const currentTags = formData.keywords.split(',');
                                                    currentTags.pop();
                                                    setFormData({ ...formData, keywords: currentTags.join(',') });
                                                }
                                            }}
                                            placeholder={formData.keywords ? "" : t('admin.post.enter_to_add')}
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-palette-tan min-w-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ITEM LIST CONTROLS */}
                    <div className="flex justify-center items-center py-4">
                        <div className="inline-flex bg-white border border-palette-tan/20 rounded-[3px] p-1.5 shadow-sm gap-1">
                            <button
                                onClick={() => handleSortItems('asc')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[12px] font-black transition-all active:scale-95 leading-none group ${activeSort === 'asc'
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <SortAsc size={16} />
                                <span className="leading-none">{t('admin.post.sort.asc')}</span>
                            </button>
                            <button
                                onClick={() => handleSortItems('desc')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[12px] font-black transition-all active:scale-95 leading-none group ${activeSort === 'desc'
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <SortDesc size={16} />
                                <span className="leading-none">{t('admin.post.sort.desc')}</span>
                            </button>
                            <button
                                onClick={() => { setActiveSort(null); setShowBlockNumbers(false); }}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-[3px] text-[12px] font-black transition-all active:scale-95 leading-none group ${activeSort === null
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <Hash size={15} />
                                <span className="leading-none">{t('admin.post.sort.hide')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {formData.items.map((item, index) => (
                            item.type === 'slider' ? (
                                <PostSliderImageItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                />
                            ) : item.type === 'image' ? (
                                <PostImageItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id) => { setActiveMediaTarget(id); setActiveMediaType('image'); setTempUrl(''); setUrlError(null); setIsUrlMode(true); }}
                                    onOpenImageEditor={(id) => {
                                        setActiveMediaTarget(id);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : item.type === 'video' ? (
                                <PostVideoItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaType('video');
                                        fetchMedia('video');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id) => { setActiveMediaTarget(id); setActiveMediaType('video'); setTempUrl(''); setUrlError(null); setIsUrlMode(true); }}
                                />
                            ) : item.type === 'audio' ? (
                                <PostAudioItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaType('audio');
                                        fetchMedia('audio');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id) => { setActiveMediaTarget(id); setActiveMediaType('audio'); setTempUrl(''); setUrlError(null); setIsUrlMode(true); }}
                                />
                            ) : item.type === 'file' ? (
                                <PostFileItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaType('file');
                                        fetchMedia('file');
                                        setShowFileManager(true);
                                    }}
                                />
                            ) : item.type === 'social' ? (
                                <PostSocialItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                />
                            ) : item.type === 'flipcard' ? (
                                <PostFlipCardItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaType('image');
                                        setTempUrl('');
                                        setUrlError(null);
                                        setIsUrlMode(true);
                                    }}
                                    onOpenImageEditor={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : item.type === 'beforeafter' ? (
                                <PostBeforeAfterItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaType('image');
                                        setTempUrl('');
                                        setUrlError(null);
                                        setIsUrlMode(true);
                                    }}
                                    onOpenImageEditor={(id, subField) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : item.type === 'iframe' ? (
                                <PostIframeItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                />
                            ) : item.type === 'quote' ? (
                                <PostQuoteItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                />
                            ) : item.type === 'poll' ? (
                                <PostPollItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        setTempUrl('');
                                        setUrlError(null);
                                        setIsUrlMode(true);
                                    }}
                                    onOpenImageEditor={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : item.type === 'vs' ? (
                                <PostVSItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        setTempUrl('');
                                        setUrlError(null);
                                        setIsUrlMode(true);
                                    }}
                                    onOpenImageEditor={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : item.type === 'review' ? (
                                <PostReviewItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                    onOpenFileManager={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        fetchMedia('image');
                                        setShowFileManager(true);
                                    }}
                                    onOpenUrlMode={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        setActiveMediaType('image');
                                        setTempUrl('');
                                        setUrlError(null);
                                        setIsUrlMode(true);
                                    }}
                                    onOpenImageEditor={(id, subField, optionId) => {
                                        setActiveMediaTarget(id);
                                        setActiveMediaSubTarget(subField || null);
                                        setActiveMediaOptionTarget(optionId || null);
                                        editorSaveInFlightRef.current = false;
                                        setIsEditorSaving(false);
                                        setShowImageEditor(true);
                                    }}
                                />
                            ) : (
                                <PostTextItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    totalItems={formData.items.length}
                                    showBlockNumbers={showBlockNumbers}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    isDeletable={activeDetailTab !== 'article' || formData.items.length > 1}
                                    onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                    onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                                />
                            )
                        ))}

                        <div className="flex flex-wrap pt-4 gap-3">
                            <button
                                onClick={handleAddItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-palette-maroon text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-palette-maroon/10 leading-none"
                            >
                                <Type size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.text')}</span>
                            </button>
                            <button
                                onClick={handleAddImageItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-emerald-600/10 leading-none"
                            >
                                <LucideImage size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.image')}</span>
                            </button>
                            <button
                                onClick={handleAddSliderItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-600/10 leading-none"
                            >
                                <Images size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.slider')}</span>
                            </button>
                            <button
                                onClick={handleAddVideoItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-rose-600/10 leading-none"
                            >
                                <Video size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.video')}</span>
                            </button>
                            <button
                                onClick={handleAddAudioItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-amber-600/10 leading-none"
                            >
                                <Mic size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.audio')}</span>
                            </button>
                            <button
                                onClick={handleAddFileItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-600/10 leading-none"
                            >
                                <Paperclip size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.file')}</span>
                            </button>
                            <button
                                onClick={handleAddSocialItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/10 leading-none"
                            >
                                <Share2 size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">{t('admin.post.add.social')}</span>
                            </button>
                            <button
                                onClick={handleAddFlipCardItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-600/10 leading-none"
                            >
                                <RotateCw size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">Flipcard ekle</span>
                            </button>
                            <button
                                onClick={handleAddBeforeAfterItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-600/10 leading-none"
                            >
                                <ArrowLeftRight size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">Before & After ekle</span>
                            </button>
                            <button
                                onClick={handleAddPollItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-600/10 leading-none"
                            >
                                <BarChart2 size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">Anket ekle</span>
                            </button>
                            <button
                                onClick={handleAddVSItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-rose-600/10 leading-none"
                            >
                                <Swords size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">VS ekle</span>
                            </button>
                            <button
                                onClick={handleAddReviewItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-emerald-600/10 leading-none"
                            >
                                <Award size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">İnceleme ekle</span>
                            </button>
                            <button
                                onClick={handleAddQuoteItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-800/10 leading-none"
                            >
                                <Quote size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">Alıntı ekle</span>
                            </button>
                            <button
                                onClick={handleAddIframeItem}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-[3px] text-[11px] font-black tracking-[0.15em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-700/10 leading-none"
                            >
                                <Globe size={14} className="shrink-0" />
                                <span className="leading-none mt-[1px]">Iframe ekle</span>
                            </button>
                        </div>


                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="w-96 shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-[3px] border border-palette-tan/20 shadow-sm space-y-5">
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest">{t('admin.post.cover')}</h4>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[160px]">
                                {formData.thumbnail ? (
                                    <div className="relative w-full">
                                        <img
                                            src={formData.thumbnail}
                                            onLoad={() => setIsThumbnailLoading(false)}
                                            onError={() => setIsThumbnailLoading(false)}
                                            className="w-full h-auto object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setActiveMediaTarget('thumbnail');
                                                    setActiveMediaType('image');
                                                    fetchMedia('image');
                                                    editorSaveInFlightRef.current = false;
                                                    setIsEditorSaving(false);
                                                    setShowImageEditor(true);
                                                }}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                                title={t('common.edit')}
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        {isThumbnailLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <Loader2 size={22} className="animate-spin text-palette-maroon" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div onClick={() => { setActiveMediaTarget('thumbnail'); setActiveMediaType('image'); fetchMedia('image'); setShowFileManager(true); }} className="flex flex-col items-center cursor-pointer group/pick mb-2">
                                            <Plus size={40} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[13px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image_alt')}</span>
                                        </div>
                                        <button
                                            onClick={() => { setActiveMediaTarget('thumbnail'); setActiveMediaType('image'); setIsUrlMode(true); setTempUrl(''); setUrlError(null); }}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> {t('admin.post.add_with_url')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[3px] border border-palette-tan/20 shadow-sm space-y-5">
                        <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest flex items-center justify-between">
                            {t('admin.post.cat_settings')}
                            <Settings2 size={14} className="text-palette-tan/30" />
                        </h4>

                        <div className="space-y-4">
                            {/* DİL SEÇİMİ */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/60 ml-1 flex items-center gap-1.5">
                                    <Languages size={12} /> {t('admin.post.post_lang')}
                                </label>
                                <div className="relative group">
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none appearance-none cursor-pointer focus:border-palette-red transition-all"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 pointer-events-none group-hover:text-palette-maroon transition-colors" />
                                </div>
                            </div>

                            {/* ANA KATEGORİ SEÇİMİ */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/60 ml-1 flex items-center gap-1.5">
                                    <Layout size={12} /> {t('admin.post.main_cat')}
                                </label>
                                <div className="relative group">
                                    <select
                                        value={selectedParentId}
                                        onChange={(e) => handleParentCategoryChange(e.target.value)}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none appearance-none cursor-pointer focus:border-palette-red transition-all"
                                    >
                                        <option value="">{t('admin.post.select_cat')}</option>
                                        {categories.filter(c => !c.parent_id).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 pointer-events-none group-hover:text-palette-maroon transition-colors" />
                                </div>
                            </div>

                            {/* ALT KATEGORİ SEÇİMİ */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/60 ml-1 flex items-center gap-1.5">
                                    <List size={12} /> {t('admin.post.sub_cat')}
                                </label>
                                <div className="relative group">
                                    <select
                                        value={selectedSubId}
                                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                                        disabled={!selectedParentId}
                                        className={`w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none appearance-none cursor-pointer focus:border-palette-red transition-all ${!selectedParentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">{t('admin.post.select_sub_cat')}</option>
                                        {categories.filter(c => c.parent_id === selectedParentId).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 pointer-events-none group-hover:text-palette-maroon transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="px-3 py-2 bg-palette-red/5 border border-palette-red/10 rounded-[3px]">
                                <p className="text-[10px] font-black text-palette-red uppercase tracking-wider">{t('admin.post.selected_cat')}</p>
                                <p className="text-[12px] font-bold text-palette-maroon">{formData.category || t('common.not_specified')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[3px] border border-palette-tan/20 shadow-sm space-y-5">
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest">{t('admin.post.publishing')}</h4>

                            <div className="flex items-center justify-between p-4 bg-palette-beige/10 rounded-[3px] border border-palette-tan/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className={formData.factChecked ? 'text-green-500' : 'text-palette-tan/30'} />
                                    <span className="text-[13px] font-bold text-palette-maroon">Fact-Check</span>
                                </div>
                                <button onClick={() => setFormData({ ...formData, factChecked: !formData.factChecked })} className={`w-10 h-5 rounded-full relative transition-all ${formData.factChecked ? 'bg-green-500' : 'bg-palette-tan/20'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.factChecked ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-palette-tan/60 ml-1 uppercase">{t('admin.post.publish_future')}</label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishAt}
                                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                                    className="w-full bg-palette-beige/10 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none"
                                />
                            </div>

                            <div className="pt-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-red/10">
                                        {t('admin.post.publish_btn')}
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-palette-maroon text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-maroon/10">
                                        {t('admin.post.draft_btn')}
                                    </button>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-tan/10">
                                    {t('admin.post.schedule_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEDIA MANAGER MODAL */}
            {showFileManager && (
                <MediaManagerModal
                    onClose={() => setShowFileManager(false)}
                    onSelect={(src) => {
                        if (activeMediaTarget === 'thumbnail') {
                            setFormData({ ...formData, thumbnail: src });
                        } else if (activeMediaTarget) {
                            // Find target item to check type
                            const targetItem = formData.items.find(i => i.id === activeMediaTarget);
                            if (targetItem?.type === 'slider') {
                                const currentUrls = targetItem.mediaUrls || [];
                                handleUpdateItem(activeMediaTarget, 'mediaUrls', [...currentUrls, src] as any);
                            } else if (targetItem?.type === 'flipcard' && activeMediaSubTarget) {
                                const currentFlipData = targetItem.flipData || {
                                    frontImage: '',
                                    backImage: '',
                                    frontTitle: '',
                                    backTitle: '',
                                    backDescription: ''
                                };
                                handleUpdateItem(activeMediaTarget, 'flipData', {
                                    ...currentFlipData,
                                    [activeMediaSubTarget]: src
                                } as any);
                            } else if (targetItem?.type === 'beforeafter' && activeMediaSubTarget) {
                                const currentData = targetItem.beforeAfterData || {
                                    beforeImage: '',
                                    afterImage: '',
                                    beforeLabel: 'ÖNCE',
                                    afterLabel: 'SONRA'
                                };
                                handleUpdateItem(activeMediaTarget, 'beforeAfterData', {
                                    ...currentData,
                                    [activeMediaSubTarget]: src
                                } as any);
                            } else if (targetItem?.type === 'poll') {
                                if (activeMediaSubTarget === 'options' && activeMediaOptionTarget) {
                                    const currentOptions = targetItem.options || [];
                                    handleUpdateItem(activeMediaTarget, 'options', currentOptions.map(o =>
                                        o.id === activeMediaOptionTarget ? { ...o, image: src } : o
                                    ) as any);
                                } else {
                                    handleUpdateItem(activeMediaTarget, 'mediaUrl', src);
                                }
                            } else {
                                handleUpdateItem(activeMediaTarget, 'mediaUrl', src);
                            }
                        }
                        setShowFileManager(false);
                        setUrlError(null);
                    }}
                    localFiles={localFiles}
                    setLocalFiles={setLocalFiles}
                    type={activeMediaType}
                />
            )}

            {/* URL MODE MODAL */}
            {isUrlMode && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUrlMode(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[3px] overflow-hidden shadow-2xl relative p-8 animate-in zoom-in duration-300 border border-palette-tan/20">
                        <div className="text-center space-y-5">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-palette-beige/20 rounded-full">
                                    <Globe size={24} className="text-palette-maroon" />
                                </div>
                                <h3 className="text-lg font-black text-palette-maroon tracking-tight uppercase">
                                    {activeMediaType === 'video' ? t('admin.post.url_title_video') : activeMediaType === 'audio' ? t('admin.post.url_title_audio') : t('admin.post.url_title_image')}
                                </h3>
                                <p className="text-[11px] font-bold text-palette-tan/50 leading-relaxed max-w-[250px] mx-auto">
                                    {activeMediaType === 'video'
                                        ? t('admin.post.url_desc_video')
                                        : activeMediaType === 'audio'
                                            ? t('admin.post.url_desc_audio')
                                            : t('admin.post.url_desc_image')
                                    }
                                </p>
                            </div>

                            <div className="space-y-3">
                                <input
                                    autoFocus
                                    type="url"
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder={activeMediaType === 'video' ? "https://youtube.com/watch?v=..." : activeMediaType === 'audio' ? "https://music.youtube.com/..." : "https://example.com/image.jpg"}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-3 py-2.5 text-sm font-bold text-palette-maroon outline-none focus:border-palette-maroon transition-all placeholder:text-palette-tan/20"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                />
                                {urlError && <p className="text-xs font-bold text-red-500 animate-pulse">{urlError}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleUrlSubmit}
                                    disabled={validatingUrl}
                                    className="flex-1 py-2.5 bg-palette-maroon text-white font-black text-[11px] tracking-widest rounded-[3px] hover:bg-palette-red transition-all shadow-md active:scale-95"
                                >
                                    {validatingUrl ? t('admin.post.processing') + '...' : (activeMediaType === 'video' ? t('admin.post.get_video') : activeMediaType === 'audio' ? t('admin.post.get_audio') : t('admin.post.get_image'))}
                                </button>
                                <button onClick={() => setIsUrlMode(false)} className="px-5 py-2.5 bg-palette-beige/20 text-palette-tan font-black text-[11px] tracking-widest rounded-[3px] hover:bg-palette-beige/40 transition-all">
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImageEditor && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div
                        className="absolute inset-0 bg-palette-maroon/80 backdrop-blur-sm"
                        onClick={() => {
                            if (isEditorSaving) return;
                            setShowImageEditor(false);
                        }}
                    />

                    <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[3px] overflow-hidden shadow-2xl relative flex flex-col border border-palette-tan/20 animate-in zoom-in-95 duration-300">
                        {isEditorSaving && (
                            <div className="absolute inset-0 z-[99999] flex items-center justify-center bg-white/60">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-[3px] bg-white shadow-md border border-palette-tan/20">
                                    <Loader2 size={18} className="animate-spin text-palette-maroon" />
                                    <span className="text-[11px] font-black tracking-widest text-palette-maroon uppercase">{t('common.processing')}</span>
                                </div>
                            </div>
                        )}
                        {/* 
                            StyleSheetManager reintroduced with aggressive filtering to fix "Unknown prop" errors.
                            The filter ensures only valid HTML attributes are passed to the DOM.
                        */}
                        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                            <FilerobotEditor
                                {...editorConfig}
                                source={activeMediaTarget === 'thumbnail' ? formData.thumbnail : (() => {
                                    const item = formData.items.find(i => i.id === activeMediaTarget);
                                    if (item?.type === 'flipcard' && activeMediaSubTarget) {
                                        return (item.flipData as any)?.[activeMediaSubTarget] || '';
                                    }
                                    if (item?.type === 'beforeafter' && activeMediaSubTarget) {
                                        return (item.beforeAfterData as any)?.[activeMediaSubTarget] || '';
                                    }
                                    if (item?.type === 'poll') {
                                        if (activeMediaSubTarget === 'options' && activeMediaOptionTarget) {
                                            return item.options?.find(o => o.id === activeMediaOptionTarget)?.image || '';
                                        }
                                        return item.mediaUrl || '';
                                    }
                                    return item?.mediaUrl || '';
                                })()}
                                onSave={handleEditorSave}
                                onClose={handleEditorClose}
                            />
                        </StyleSheetManager>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MEDIA MANAGER MODAL COMPONENT ---
const MediaManagerModal: React.FC<{
    onClose: () => void;
    onSelect: (src: string) => void;
    localFiles: any[];
    setLocalFiles: React.Dispatch<React.SetStateAction<any[]>>;
    type?: 'image' | 'video' | 'audio' | 'file';
}> = ({ onClose, onSelect, localFiles, setLocalFiles, type = 'image' }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setUploading(true);
            setUploadPreview(URL.createObjectURL(file));
            setUploadProgress(20);
            try {
                const timer = setInterval(() => setUploadProgress(p => p < 90 ? p + 10 : p), 200);
                const result = await storageService.uploadFile(file, undefined, type);
                clearInterval(timer);
                setUploadProgress(100);
                if (result) {
                    setLocalFiles(prev => [result, ...prev]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => { setUploading(false); setUploadPreview(null); }, 500);
            }
        },
        accept: type === 'video'
            ? { 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }
            : type === 'audio'
                ? { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac'] }
                : type === 'file'
                    ? { 'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'] }
                    : { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }
    });

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return localFiles;

        const normalize = (str: string) =>
            str.toLocaleLowerCase('tr-TR')
                .replace(/ı/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const term = normalize(searchTerm);

        return localFiles.filter(f =>
            normalize(f.name || '').includes(term) ||
            normalize(f.value || '').includes(term)
        );
    }, [localFiles, searchTerm]);

    const handleDelete = async () => {
        if (!selectedImage) return;
        const fileToDelete = localFiles.find(f => f.src === selectedImage);
        if (!fileToDelete) return;

        try {
            const success = await storageService.deleteFile(fileToDelete.id);
            if (success) {
                const newFiles = localFiles.filter(f => f.src !== selectedImage);
                setLocalFiles(newFiles);
                setSelectedImage(null);
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-palette-maroon/80 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[3px] overflow-hidden shadow-2xl relative flex flex-col border border-palette-tan/20 animate-in zoom-in-95 duration-300">
                {/* HEADER */}
                <div className="px-8 py-5 border-b border-palette-tan/10 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-8 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-palette-red rounded-full" />
                            <h3 className="text-xl font-black text-palette-maroon tracking-tight uppercase">{t('admin.post.media_library')}</h3>
                        </div>
                        <div className="relative flex-1 max-w-lg group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30 group-focus-within:text-palette-maroon transition-colors" />
                            <input
                                type="text"
                                placeholder={t('admin.post.search_storage')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 bg-palette-beige/5 border border-palette-tan/15 rounded-[3px] pl-11 pr-4 text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:bg-white focus:ring-4 focus:ring-palette-maroon/5 transition-all text-sm"
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-[3px] text-palette-tan/30 hover:text-palette-red hover:bg-red-50 transition-all border border-transparent hover:border-red-100"><X size={22} /></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDEBAR: UPLOAD ZONE (Aligned Top) */}
                    <div className="w-80 border-r border-palette-tan/10 p-6 flex flex-col bg-palette-beige/5 shrink-0 relative overflow-hidden">
                        <div
                            {...getRootProps()}
                            className={`flex flex-col items-center justify-start pt-12 border-2 border-dashed rounded-[3px] h-full p-8 text-center transition-all cursor-pointer relative z-10 ${isDragActive ? 'border-palette-maroon bg-white shadow-xl scale-[0.98]' : 'border-palette-tan/15 hover:border-palette-maroon hover:bg-white bg-white/40'
                                }`}
                        >
                            <input {...getInputProps()} />

                            {/* Extensions Tags (Up High) */}
                            <div className="flex flex-wrap justify-center gap-1.5 mb-10">
                                {type === 'video'
                                    ? ['MP4', 'WEBM', 'MOV', 'AVI'].map(ext => (
                                        <span key={ext} className="text-[10px] font-black text-white bg-rose-500 border border-rose-400 px-2.5 py-1 rounded-[3px] shadow-sm tracking-tighter">
                                            {ext}
                                        </span>
                                    ))
                                    : type === 'audio'
                                        ? ['MP3', 'WAV', 'OGG', 'M4A', 'AAC'].map(ext => (
                                            <span key={ext} className="text-[10px] font-black text-white bg-amber-500 border border-amber-400 px-2.5 py-1 rounded-[3px] shadow-sm tracking-tighter">
                                                {ext}
                                            </span>
                                        ))
                                        : type === 'file'
                                            ? ['PDF', 'DOCX', 'XLSX', 'PPTX'].map(ext => (
                                                <span key={ext} className="text-[10px] font-black text-white bg-slate-500 border border-slate-400 px-2.5 py-1 rounded-[3px] shadow-sm tracking-tighter">
                                                    {ext}
                                                </span>
                                            ))
                                            : ['JPG', 'JPEG', 'WEBP', 'PNG', 'GIF'].map(ext => (
                                                <span key={ext} className="text-[10px] font-black text-palette-tan/40 bg-white border border-palette-tan/10 px-2.5 py-1 rounded-[3px] shadow-sm tracking-tighter">
                                                    {ext}
                                                </span>
                                            ))
                                }
                            </div>

                            <div className="mb-6 relative">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isDragActive ? 'bg-palette-maroon scale-110' : 'bg-palette-tan/5'}`}>
                                    <Upload size={28} className={`transition-colors duration-500 ${isDragActive ? 'text-white' : 'text-palette-tan/20'}`} strokeWidth={1.5} />
                                </div>
                                {!isDragActive && (
                                    <div className="absolute inset-0 border-4 border-palette-tan/10 border-t-palette-maroon/20 rounded-full animate-spin-slow opacity-30" />
                                )}
                            </div>

                            <p className="text-[13px] font-bold text-palette-tan/60 mb-8 px-6 leading-relaxed">
                                {isDragActive ? t('admin.post.drop_to_upload') : t('admin.post.drag_drop_files')}
                            </p>

                            <button className="flex items-center justify-center gap-2 w-full h-10 bg-white border border-palette-tan/20 text-palette-maroon text-[11px] font-black tracking-widest rounded-[3px] hover:bg-palette-maroon hover:text-white hover:border-palette-maroon transition-all shadow-sm active:scale-95">
                                <Plus size={14} />
                                {t('admin.post.browse_files')}
                            </button>

                            {/* UPLOADING PREVIEW (Inside Dropzone) */}
                            {uploading && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-10 w-full animate-in zoom-in-95 duration-300 flex flex-col items-center"
                                >
                                    <div className="relative aspect-square w-full max-w-[160px] rounded-[3px] overflow-hidden border border-palette-tan/20 shadow-2xl ring-4 ring-white bg-slate-900">
                                        {type === 'video' ? (
                                            <div className="w-full h-full relative">
                                                <video
                                                    src={uploadPreview || ''}
                                                    className="w-full h-full object-cover opacity-60"
                                                    muted
                                                    playsInline
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Video size={48} className="text-white opacity-20" />
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={uploadPreview || ''} className="w-full h-full object-cover opacity-40 blur-[1px]" />
                                        )}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-palette-maroon/10 backdrop-blur-[1px]">
                                            <div className="relative">
                                                <Loader2 size={32} className="text-palette-maroon animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[8px] font-black text-palette-maroon">{uploadProgress}%</span>
                                                </div>
                                            </div>
                                            <span className="mt-3 text-[9px] font-black text-palette-maroon tracking-[0.2em] uppercase">{t('admin.post.processing')}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full px-4">
                                        <div className="h-1 bg-palette-tan/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-palette-red transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN CONTENT: IMAGES GRID (Refined Typography) */}
                    <div
                        className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar"
                        onClick={() => setSelectedImage(null)}
                    >
                        {filteredFiles.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-palette-tan/10">
                                {type === 'video' ? <Film size={80} strokeWidth={0.5} className="mb-6" /> : type === 'audio' ? <Mic size={80} strokeWidth={0.5} className="mb-6" /> : type === 'file' ? <FileText size={80} strokeWidth={0.5} className="mb-6" /> : <ImageIcon size={80} strokeWidth={0.5} className="mb-6" />}
                                <p className="text-[12px] font-black tracking-[0.3em] uppercase opacity-50">
                                    {t(`admin.post.empty_vault_${type}`)}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 pb-10">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(file.src);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(file.src);
                                        }}
                                        className="group flex flex-col cursor-pointer"
                                    >
                                        <div className={`relative aspect-square rounded-[3px] border-2 transition-all duration-300 overflow-hidden flex items-center justify-center ${selectedImage === file.src
                                            ? 'border-emerald-500 ring-[8px] ring-emerald-500/5 shadow-2xl'
                                            : 'border-palette-tan/10 hover:border-palette-maroon/40 group-hover:shadow-xl bg-palette-beige/5'
                                            }`}>
                                            {type === 'video' ? (
                                                file.thumb ? (
                                                    <img
                                                        src={file.thumb}
                                                        className={`w-full h-full object-cover transition-all duration-700 ${selectedImage === file.src ? 'scale-105' : 'group-hover:scale-105 group-hover:rotate-1'
                                                            }`}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                                                        <Video size={48} className="text-white/20 mb-2" />
                                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{file.value?.split('.').pop()}</span>
                                                    </div>
                                                )
                                            ) : type === 'audio' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50">
                                                    <Mic size={48} className="text-amber-500 mb-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-[8px] font-black text-amber-800/40 uppercase tracking-widest">{file.value?.split('.').pop()}</span>
                                                </div>
                                            ) : type === 'file' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                                                    <Paperclip size={48} className="text-slate-500 mb-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-[8px] font-black text-slate-800/40 uppercase tracking-widest">{file.value?.split('.').pop()}</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={file.thumb || file.src}
                                                    className={`w-full h-full object-contain p-1 transition-all duration-700 ${selectedImage === file.src ? 'scale-105' : 'group-hover:scale-105 group-hover:rotate-1'
                                                        }`}
                                                    loading="lazy"
                                                />
                                            )}

                                            {/* Status Badge */}
                                            {selectedImage === file.src && (
                                                <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center">
                                                    <div className="bg-emerald-500 text-white rounded-full p-2 shadow-2xl animate-in zoom-in-50 duration-300 ring-4 ring-white">
                                                        <Check size={18} strokeWidth={4} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-black text-white bg-palette-maroon/80 px-1.5 py-0.5 rounded-[3px] backdrop-blur-md uppercase tracking-tighter">
                                                    {file.src.split('.').pop()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={`mt-3 text-[10px] font-black tracking-tight truncate px-1 transition-all duration-300 ${selectedImage === file.src ? 'text-emerald-700 font-bold' : 'text-palette-tan/60 group-hover:text-palette-maroon'
                                            }`}>
                                            {file.value || file.name || 'document.bin'}
                                        </p>
                                        <div className="flex items-center justify-between px-1 mt-0.5">
                                            <span className="text-[8px] font-bold text-palette-tan/30 uppercase tracking-widest">{t('admin.post.asset_label')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER: Perfectly Aligned */}
                <div className="px-8 py-4 border-t border-palette-tan/10 flex items-center justify-between bg-palette-beige/5">
                    <button
                        onClick={handleDelete}
                        disabled={!selectedImage}
                        className="flex items-center justify-center gap-2 h-9 px-5 bg-palette-red text-white rounded-[3px] text-[11px] font-black tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-palette-red/10 disabled:opacity-20 disabled:shadow-none active:scale-95"
                    >
                        <Trash2 size={16} />
                        {t('admin.post.delete_permanently')}
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            disabled={!selectedImage || uploading}
                            onClick={() => selectedImage && onSelect(selectedImage)}
                            className="flex items-center justify-center gap-2 h-10 px-8 bg-emerald-600 text-white rounded-[3px] text-[11px] font-black tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-20 disabled:shadow-none active:scale-95"
                        >
                            <CheckCircle2 size={18} />
                            <span>{t('admin.post.use_this').replace('{type}', type.toUpperCase())}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center h-10 px-6 text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon border border-palette-tan/15 rounded-[3px] hover:bg-white transition-all bg-white shadow-sm active:scale-95 uppercase tracking-widest"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </div>
            {/* HIDDEN FONT LOADER - Ensures browser loads fonts before Filerobot needs them */}
            <div className="fie-font-preload" style={{ visibility: 'hidden', position: 'absolute', top: -1000, height: 0, overflow: 'hidden' }}>
                {FIE_TEXT_FONTS.map((font) => (
                    <span key={font} style={{ fontFamily: font }}> {font} </span>
                ))}
            </div>
        </div>
    );
};

export default PostManagement;
