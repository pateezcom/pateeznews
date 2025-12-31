
import React, { useEffect, useMemo } from 'react';
import {
    StoryEditor,
    InterfaceSkeleton
} from '@googleforcreators/story-editor';
import { elementTypes } from '@googleforcreators/element-library';
import { registerElementType } from '@googleforcreators/elements';
import { DATA_VERSION } from '@googleforcreators/migration';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StoryItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WebStoryEditorProps {
    story: StoryItem;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

const WebStoryEditor: React.FC<WebStoryEditorProps> = ({ story, onClose, onSaveSuccess }) => {
    const { t } = useLanguage();

    // Element tiplerini bir kez kaydet
    useEffect(() => {
        elementTypes.forEach(registerElementType);
    }, []);

    const config = useMemo(() => ({
        apiCallbacks: {
            saveStoryById: async ({ pages, globalStoryStyles, currentStoryStyles, content, title }: any) => {
                try {
                    const storyData = {
                        version: DATA_VERSION,
                        pages,
                        currentStoryStyles,
                        stylePresets: globalStoryStyles,
                        title: title || story.title
                    };

                    const { error } = await supabase
                        .from('stories')
                        .update({
                            story_data: storyData,
                            story_markup: content,
                            title: title || story.title // Başlık güncellendiyse onu da kaydet
                        })
                        .eq('id', story.id);

                    if (error) throw error;

                    if (onSaveSuccess) onSaveSuccess();
                    return Promise.resolve(storyData);
                } catch (err) {
                    console.error("Save error:", err);
                    return Promise.reject(err);
                }
            },
            // Medya kütüphanesi için basit bir fetch (Gelecekte Supabase Storage ile bağlanabilir)
            getMedia: async () => {
                return [];
            }
        },
        capabilities: {
            hasUploadMediaAction: true,
            canManageSettings: true,
        },
        flags: {
            UPLOADING_INDICATOR: true
        }
    }), [story, onSaveSuccess]);

    const initialEdits = useMemo(() => ({
        story: story.storyData || {
            title: story.title,
            storyData: {
                version: DATA_VERSION,
                pages: []
            }
        }
    }), [story]);

    return (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in fade-in duration-300 admin-font">
            {/* Custom Header with Close Button */}
            <div className="h-16 border-b border-palette-tan/15 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-palette-red text-white rounded-[3px] shadow-lg">
                        <Save size={20} />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-black text-palette-maroon leading-none">Buzz <span className="text-palette-red">Creative</span></h2>
                        <p className="text-[12px] font-bold text-palette-tan/50 tracking-widest">Gelişmiş Story Editörü</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 bg-palette-beige/30 hover:bg-palette-red hover:text-white text-palette-tan rounded-[3px] transition-all font-black text-[13px] tracking-widest group"
                >
                    <X size={16} className="group-hover:rotate-90 transition-transform" />
                    Kapat
                </button>
            </div>

            {/* Google Web Stories Editor Core */}
            <div className="grow overflow-hidden relative">
                <StoryEditor config={config} initialEdits={initialEdits}>
                    <InterfaceSkeleton />
                </StoryEditor>
            </div>
        </div>
    );
};

export default WebStoryEditor;
