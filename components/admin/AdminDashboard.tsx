
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { NEWS_FEED } from '../../constants';
import type { SiteSettings } from '../../types';
const LanguageSettings = React.lazy(() => import('./LanguageSettings'));
const RoleSettings = React.lazy(() => import('./RoleSettings'));
const UserManagement = React.lazy(() => import('./UserManagement'));
const UserProfileSettings = React.lazy(() => import('./UserProfileSettings'));
const NavigationSettings = React.lazy(() => import('./NavigationSettings'));
const StoryManagement = React.lazy(() => import('./StoryManagement'));
const PostManagement = React.lazy(() => import('./PostManagement'));
const PostList = React.lazy(() => import('./PostList'));
const PublisherManagement = React.lazy(() => import('./PublisherManagement'));
const PublisherProfileSettings = React.lazy(() => import('./PublisherProfileSettings'));
const Settings = React.lazy(() => import('./Settings'));
const CommentManagement = React.lazy(() => import('./CommentManagement'));
import { useLanguage } from '../../context/LanguageContext';

interface AdminDashboardProps {
  onLogout: () => void;
  initialTab?: string;
  initialUserId?: string;
  onTabChange?: (tab: string, userId?: string) => void;
  siteSettings?: SiteSettings | null;
  onNewsSelect?: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, initialTab = 'overview', initialUserId = null, onTabChange, siteSettings, onNewsSelect }) => {
  const { t, currentLang, setLanguage, availableLanguages } = useLanguage();
  const [stats, setStats] = useState({
    posts: 0,
    profiles: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingUserId, setEditingUserId] = useState<string | null>(initialUserId);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userRole, setUserRole] = useState<string>('member');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ tab: string, userId?: string } | null>(null);
  const [postsKey, setPostsKey] = useState(0);

  const brandName = (siteSettings?.site_name || '').trim();
  const [brandFirst, brandRest] = useMemo(() => {
    if (!brandName) return ['Admin', 'Panel'];
    const parts = brandName.split(' ').filter(Boolean);
    if (parts.length <= 1) return [brandName, ''];
    return [parts[0], parts.slice(1).join(' ')];
  }, [brandName]);

  const menuItems = useMemo(() => [
    { id: 'overview', label: t('admin.sidebar.overview'), icon: 'dashboard', perm: 'view_overview', group: t('admin.management') },
    { id: 'posts', label: t('admin.sidebar.posts'), icon: 'add_circle', perm: 'manage_content', group: t('admin.management') },
    { id: 'news_list', label: t('admin.sidebar.news_list'), icon: 'description', perm: 'manage_content', group: t('admin.management') },
    { id: 'stories', label: t('admin.sidebar.stories'), icon: 'bolt', perm: 'manage_content', group: t('admin.management') },
    { id: 'comments', label: 'Yorumlar', icon: 'comment', perm: 'manage_content', group: t('admin.management') },
    { id: 'users', label: t('admin.sidebar.users'), icon: 'group', perm: 'manage_users', group: t('admin.management') },
    // { id: 'publishers', label: t('admin.sidebar.publishers'), icon: 'business_center', perm: 'manage_users', group: t('admin.management') },
    { id: 'navigation', label: t('admin.sidebar.navigation'), icon: 'account_tree', perm: 'manage_navigation', group: t('admin.system') },
    { id: 'roles', label: t('admin.sidebar.roles'), icon: 'verified_user', perm: 'view_roles', group: t('admin.system') },
    { id: 'settings', label: t('admin.sidebar.settings'), icon: 'settings', perm: 'view_settings', group: t('admin.system') },
    { id: 'languages', label: t('admin.sidebar.languages'), icon: 'language', perm: 'view_languages', group: t('admin.system') },
  ], [t]);

  useEffect(() => {
    fetchUserPermissions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab);
    if (initialUserId !== editingUserId) setEditingUserId(initialUserId);
  }, [initialTab, initialUserId]);

  const handleTabChange = (tab: string, userId?: string) => {
    if (isDirty) {
      setPendingNavigation({ tab, userId });
      setShowUnsavedModal(true);
      return;
    }

    if (tab === 'posts' && activeTab === 'posts') {
      setPostsKey(prev => prev + 1);
    }

    setActiveTab(tab);
    if (userId !== undefined) setEditingUserId(userId || null);

    if (onTabChange) onTabChange(tab, userId);
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      const { tab, userId } = pendingNavigation;

      // Doğrudan state güncellemelerini yap (dirty kontrolünü atlayarak)
      if (tab === 'posts' && activeTab === 'posts') {
        setPostsKey(prev => prev + 1);
      }

      setActiveTab(tab);
      if (userId !== undefined) setEditingUserId(userId || null);
      if (onTabChange) onTabChange(tab, userId);

      // Modal ve dirty state'i temizle
      setIsDirty(false);
      setShowUnsavedModal(false);
      setPendingNavigation(null);
    }
  };

  const fetchUserPermissions = async () => {
    setPermissionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const isDemoUser = user.email?.toLowerCase() === 'demo.user@gmail.com';
      const { data: profile } = await supabase.from('profiles').select('role, avatar_url').eq('id', user.id).single();
      const roleName = isDemoUser ? 'admin' : (profile?.role || 'member');
      setUserRole(roleName);
      setCurrentUserAvatar(profile?.avatar_url || null);
      if (roleName === 'admin') {
        setPermissions(['view_overview', 'view_settings', 'view_languages', 'view_roles', 'manage_content', 'manage_users', 'manage_navigation']);
      } else {
        const { data: roleData } = await supabase.from('roles').select('id').eq('name', roleName).single();
        if (roleData) {
          const { data: permData } = await supabase.from('role_permissions').select('permission_key').eq('role_id', roleData.id);
          if (permData) setPermissions(permData.map(p => p.permission_key));
        } else {
          setPermissions(['view_overview']);
        }
      }
    } catch (err) {
      setPermissions(['view_overview', 'view_settings', 'view_languages', 'view_roles']);
    } finally {
      setPermissionLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [postRes, profileRes] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        posts: postRes.count || 0,
        profiles: profileRes.count || 0,
        views: (postRes.count || 0) * 1250
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const hasPermission = (key: string) => {
    if (userRole === 'admin') return true;
    return permissions.includes(key);
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const formattedPosts = NEWS_FEED.map(news => ({
        publisher_id: user.id,
        title: news.title,
        summary: news.summary,
        category: news.category,
        type: news.type,
        thumbnail_url: news.thumbnail,
        media_url: news.mediaUrl,
        card_data: { ...news }
      }));
      await supabase.from('posts').insert(formattedPosts);
      setStatusModal({ show: true, type: 'success', message: t('admin.seed_success') });
      fetchStats();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSeeding(false);
    }
  };

  const handleEditUser = (userId: string) => {
    handleTabChange('users', userId);
  };

  const handleEditPublisher = (publisherId: string) => {
    handleTabChange('edit_publisher', publisherId);
  };

  const handleEditPost = (postId: string) => {
    handleTabChange('edit_post', postId);
  };

  const renderContent = () => {
    if (activeTab === 'users' && !hasPermission('manage_users')) return <AccessDenied />;
    if (activeTab === 'posts' && !hasPermission('manage_content')) return <AccessDenied />;
    if (activeTab === 'edit_post' && !hasPermission('manage_content')) return <AccessDenied />;
    if (activeTab === 'stories' && !hasPermission('manage_content')) return <AccessDenied />;
    if (activeTab === 'comments' && !hasPermission('manage_content')) return <AccessDenied />;
    if (activeTab === 'navigation' && !hasPermission('manage_navigation')) return <AccessDenied />;
    if (activeTab === 'settings' && !hasPermission('view_settings')) return <AccessDenied />;
    if (activeTab === 'languages' && !hasPermission('view_languages')) return <AccessDenied />;
    if (activeTab === 'roles' && !hasPermission('view_roles')) return <AccessDenied />;

    return (
      <React.Suspense fallback={
        <div className="h-full flex items-center justify-center p-20">
          <span className="material-symbols-rounded animate-spin text-palette-tan" style={{ fontSize: '40px' }}>progress_activity</span>
        </div>
      }>
        {(() => {
          switch (activeTab) {
            case 'users': return <UserManagement onEditUser={handleEditUser} initialSearchTerm={editingUserId || undefined} />;
            case 'posts': return <PostManagement key={`posts-${postsKey}`} onDirtyChange={setIsDirty} onBack={() => handleTabChange('news_list')} />;
            case 'news_list': return <PostList onEditPost={handleEditPost} onAddPost={() => handleTabChange('posts')} />;
            case 'edit_post': return <PostManagement key={`edit-${editingUserId}`} postId={editingUserId || undefined} onDirtyChange={setIsDirty} onBack={() => handleTabChange('news_list')} />;
            case 'stories': return <StoryManagement onEditStory={(id) => handleTabChange('hikaye-editor', id)} />;
            case 'comments': return <CommentManagement onNewsSelect={onNewsSelect} />;
            case 'navigation': return <NavigationSettings />;
            case 'languages': return <LanguageSettings />;
            case 'roles': return <RoleSettings />;
            case 'edit_user': return (
              <UserProfileSettings
                userId={editingUserId || undefined}
                onBack={() => {
                  handleTabChange('users', '');
                }}
                onSuccess={() => {
                  handleTabChange('users', '');
                }}
              />
            );
            case 'my_profile': return (
              <UserProfileSettings
                onBack={() => handleTabChange('overview')}
                onSuccess={() => handleTabChange('overview')}
              />
            );
            case 'publishers': return <PublisherManagement onEditPublisher={handleEditPublisher} onEditUser={handleEditUser} />;
            case 'edit_publisher': return (
              <PublisherProfileSettings
                publisherId={editingUserId || undefined}
                onBack={() => handleTabChange('publishers')}
                onSuccess={() => handleTabChange('publishers')}
              />
            );
            case 'settings': return <Settings />;
            default: return null;
          }
        })()}
      </React.Suspense>
    );
  };

  const AccessDenied = () => (
    <div className="h-full flex flex-col items-center justify-center p-20 bg-white rounded-[5px] border border-palette-tan/20 shadow-sm">
      <div className="w-20 h-20 bg-palette-beige/20 rounded-[5px] flex items-center justify-center mb-6 text-palette-red shadow-inner">
        <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>lock</span>
      </div>
      <h2 className="text-[26px] font-bold text-palette-maroon mb-2 tracking-tight font-display">{t('common.error')}</h2>
      <p className="text-palette-tan font-medium max-w-md text-center leading-relaxed">
        {t('admin.error.fetch_failed')}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-palette-beige flex admin-font text-palette-tan" dir={currentLang.direction}>

      <aside className={`bg-white border-r border-palette-tan/20 fixed h-full z-40 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-[260px]' : 'w-[88px]'} shadow-[10px_0_60px_rgba(24,37,64,0.03)]`}>
        <div className="h-20 flex items-center px-6 border-b border-palette-tan/20">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <div
              className={`w-10 h-10 rounded-[5px] flex-shrink-0 flex items-center justify-center ${siteSettings?.favicon_url ? '' : 'bg-palette-red text-white shadow-lg shadow-palette-red/20'}`}
            >
              {siteSettings?.favicon_url ? (
                <img
                  src={siteSettings.favicon_url}
                  alt={brandName || 'Logo'}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="material-symbols-rounded text-[22px] font-bold">bolt</span>
              )}
            </div>
            <span className={`text-[22px] font-bold text-palette-maroon tracking-tight transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              {brandFirst}
              {brandRest ? <span className="text-palette-tan font-medium"> {brandRest}</span> : null}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 no-scrollbar">
          {permissionLoading ? (
            <div className="flex justify-center p-10"><span className="material-symbols-rounded animate-spin text-palette-tan" style={{ fontSize: '24px' }}>progress_activity</span></div>
          ) : (
            <nav className="px-4 space-y-9">
              {Array.from(new Set(menuItems.map(i => i.group))).map(group => {
                const itemsInGroup = menuItems.filter(i => i.group === group && hasPermission(i.perm));
                if (itemsInGroup.length === 0) return null;

                return (
                  <div key={group} className="space-y-1.5">
                    <p className={`px-4 text-[11px] font-bold text-palette-tan/60 mb-4 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{group}</p>
                    {itemsInGroup.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleTabChange(item.id);
                        }}
                        className={`w-full group flex items-center gap-4 px-4 py-3 rounded-[5px] transition-all duration-300 ${(activeTab === item.id || (item.id === 'news_list' && activeTab === 'edit_post') || (item.id === 'users' && (activeTab === 'edit_user' || activeTab === 'my_profile')))
                          ? 'bg-palette-maroon text-white shadow-xl shadow-palette-maroon/20'
                          : 'text-palette-tan hover:bg-palette-beige hover:text-palette-maroon'
                          }`}
                      >
                        <span className={`material-symbols-rounded flex-shrink-0 transition-transform ${(activeTab === item.id || (item.id === 'news_list' && activeTab === 'edit_post') || (item.id === 'users' && (activeTab === 'edit_user' || activeTab === 'my_profile'))) ? 'scale-110' : 'group-hover:scale-110'}`} style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span className={`text-base font-semibold tracking-tight whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{item.label}</span>
                        {(activeTab === item.id || (item.id === 'news_list' && activeTab === 'edit_post') || (item.id === 'users' && (activeTab === 'edit_user' || activeTab === 'my_profile'))) && isSidebarOpen && <div className="ml-auto w-1 h-3 rounded-[5px] bg-white/40" />}
                      </button>
                    ))}
                  </div>
                );
              })}
            </nav>
          )}
        </div>
      </aside>

      <main className={`flex-1 min-h-screen transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ltr:ml-[260px] rtl:mr-[260px]' : 'ltr:ml-[88px] rtl:mr-[88px]'}`}>
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-palette-tan/20 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-palette-maroon tracking-tight">
              {activeTab === 'edit_user' ? t('users.role_modal.title') :
                activeTab === 'edit_publisher' ? "Yayıncıyı Düzenle" :
                  activeTab === 'edit_post' ? (t('admin.post.edit_title') || "Haberi Düzenle") :
                    (menuItems.find(i => i.id === activeTab)?.label || t('admin.sidebar.overview'))}
            </h1>
            <p className="text-[13px] text-palette-tan font-bold mt-0.5">
              {new Date().toLocaleDateString(t('admin.date_format'), { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-0">
            <div className="hidden lg:flex items-center gap-2 px-2 py-2 bg-palette-beige/30 rounded-[5px] border border-palette-tan/20 focus-within:bg-white focus-within:border-palette-tan transition-all group">
              <span className="material-symbols-rounded text-palette-tan/40 group-focus-within:text-palette-tan" style={{ fontSize: '18px' }}>search</span>
              <input type="text" placeholder={t('admin.header.search')} className="bg-transparent border-none outline-none text-sm font-semibold w-40 placeholder:text-palette-tan/30 text-palette-maroon" />
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 flex items-center justify-center rounded-[5px] text-palette-tan hover:text-palette-maroon hover:bg-palette-beige transition-all group"
              title={t('nav.home')}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>visibility</span>
            </a>

            <div className="h-6 w-px bg-palette-tan/10 mx-1 text-transparent">|</div>

            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 px-1.5 py-2 rounded-[5px] hover:bg-palette-beige transition-all text-palette-tan font-bold text-[13px]">
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>public</span>
                <span>{currentLang.code}</span>
                <span className={`material-symbols-rounded transition-transform ${showLangMenu ? 'rotate-180' : ''}`} style={{ fontSize: '16px' }}>expand_more</span>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                  <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-44 bg-white rounded-[5px] shadow-2xl border border-palette-tan/20 py-2 z-50 animate-in">
                    {availableLanguages.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-[14px] font-bold transition-all ${currentLang.code === lang.code ? 'text-palette-red bg-palette-red/5' : 'text-palette-tan hover:bg-palette-beige'}`}
                      >
                        <span>{lang.name}</span>
                        {currentLang.code === lang.code && <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check_circle</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button className="relative w-9 h-9 flex items-center justify-center rounded-[5px] text-palette-tan hover:text-palette-maroon hover:bg-palette-beige transition-all">
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-palette-red rounded-[5px]"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-1 pr-1 rounded-[5px] hover:bg-palette-beige transition-all group"
              >
                <div className="w-9 h-9 rounded-[5px] border border-palette-tan/20 group-hover:border-palette-tan transition-all overflow-hidden flex items-center justify-center bg-palette-beige/50">
                  {currentUserAvatar ? (
                    <img src={currentUserAvatar} className="w-full h-full object-cover rounded-[5px]" alt={t('admin.header.my_account')} />
                  ) : (
                    <span className="material-symbols-rounded text-palette-tan/40" style={{ fontSize: '20px' }}>person</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-palette-maroon leading-none">{t('admin.user.super_admin')}</span>
                  <span className="text-[12px] text-palette-tan font-bold mt-0.5">{userRole}</span>
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute top-full ltr:right-0 rtl:left-0 mt-3 w-72 bg-white rounded-[5px] shadow-[0_30px_90px_rgba(24,37,64,0.15)] z-50 animate-in border border-palette-tan/20 overflow-hidden">
                    <div className="p-6 pb-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[5px] border border-palette-tan/20 p-1 flex items-center justify-center bg-palette-beige/30">
                        {currentUserAvatar ? (
                          <img src={currentUserAvatar} className="w-full h-full object-cover rounded-[5px] shadow-md" alt="Admin" />
                        ) : (
                          <span className="material-symbols-rounded text-palette-tan/40" style={{ fontSize: '32px' }}>person</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-palette-maroon">{brandName ? `${brandName} Admin` : 'Admin'}</h4>
                        <p className="text-[13px] text-palette-tan font-bold">{userRole}</p>
                      </div>
                    </div>

                    <div className="px-3 pb-3 space-y-1">
                      <div className="px-4 py-2 text-[13px] font-bold text-palette-tan/40 border-t border-palette-tan/15 mt-2 pt-4">{t('admin.account.settings')}</div>
                      <button
                        onClick={() => { handleTabChange('my_profile'); setShowProfileMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-palette-tan hover:bg-palette-beige hover:text-palette-maroon rounded-[5px] text-sm font-semibold transition-all"
                      >
                        <div className="flex items-center gap-3"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person</span> {t('users.actions.edit')}</div>
                        <span className="material-symbols-rounded opacity-40 -rotate-90" style={{ fontSize: '16px' }}>expand_more</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-palette-tan hover:bg-palette-beige hover:text-palette-maroon rounded-[5px] text-sm font-semibold transition-all">
                        <div className="flex items-center gap-3"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>credit_card</span> {t('admin.management')}</div>
                        <span className="material-symbols-rounded opacity-40 -rotate-90" style={{ fontSize: '16px' }}>expand_more</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-palette-tan hover:bg-palette-beige hover:text-palette-maroon rounded-[5px] text-sm font-semibold transition-all">
                        <div className="flex items-center gap-3"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>history</span> {t('admin.recent_activity')}</div>
                        <span className="material-symbols-rounded opacity-40 -rotate-90" style={{ fontSize: '16px' }}>expand_more</span>
                      </button>

                      <div className="h-px bg-palette-tan/10 mx-4 my-2"></div>

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-palette-red hover:bg-palette-red/5 rounded-[5px] text-xs font-bold transition-all">
                        <div className="w-8 h-8 rounded-[5px] bg-palette-red/10 flex items-center justify-center">
                          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>logout</span>
                        </div>
                        {t('admin.logout')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto">
          {activeTab === 'overview' ? (
            <div className="space-y-10 animate-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: t('admin.stats.posts'), val: stats.posts, icon: 'description', change: '+12%' },
                  { label: t('admin.stats.views'), val: stats.views.toLocaleString(), icon: 'trending_up', change: '+24%' },
                  { label: t('admin.stats.profiles'), val: stats.profiles, icon: 'group', change: '+2' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[5px] border border-palette-tan/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-palette-beige/20 border border-palette-tan/20 rounded-[5px] flex items-center justify-center text-palette-tan group-hover:bg-palette-red group-hover:text-white group-hover:border-palette-red transition-all">
                          <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>{stat.icon}</span>
                        </div>
                        <span className="px-3 py-1 rounded-[5px] text-[13px] font-bold bg-palette-beige text-palette-maroon border border-palette-tan/25">
                          {stat.change} {t('admin.stats.acceleration')}
                        </span>
                      </div>
                      <h3 className="text-[32px] font-bold text-palette-tan mb-1 tracking-tight">
                        {loading ? <div className="h-9 w-24 bg-palette-beige/5 animate-pulse rounded-[5px]" /> : stat.val}
                      </h3>
                      <p className="text-[13px] font-bold text-palette-tan/60 leading-none">{stat.label}</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-[5px] bg-palette-beige opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl"></div>
                  </div>
                ))}
              </div>

              {!loading && stats.posts === 0 && (
                <div className="bg-palette-maroon rounded-[5px] p-24 text-center text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-palette-maroon to-palette-tan/80"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>

                  <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-[5px] flex items-center justify-center mb-10 shadow-2xl transition-transform hover:rotate-6 duration-500">
                      <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>database</span>
                    </div>
                    <h2 className="text-[38px] font-bold mb-5 tracking-tight">{t('admin.stats.setup_title')}</h2>
                    <p className="text-palette-beige/70 mb-12 text-xl font-medium leading-relaxed">
                      {t('admin.stats.setup_desc')}
                    </p>

                    <button
                      onClick={handleSeedData}
                      disabled={seeding}
                      className="group flex items-center gap-4 px-10 py-5 bg-palette-red text-white rounded-[5px] font-bold text-base tracking-widest hover:bg-white hover:text-palette-red transition-all shadow-2xl shadow-palette-red/30 active:scale-95"
                    >
                      {seeding ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>bolt</span>}
                      <span>{t('admin.stats.seed_btn')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : renderContent()}
        </div>
      </main>
      {statusModal.show && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/20 p-8 text-center">
            <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal({ ...statusModal, show: false })}
              className="w-full py-4 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowUnsavedModal(false)} />
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center" style={{ direction: currentLang.direction }}>
            <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>warning</span>
            </div>
            <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">{t('common.confirm_title')}</h3>
            <p className="text-[14px] font-bold text-palette-tan/60 leading-relaxed mb-8 px-4">
              Yaptığınız değişiklikler kaydedilmedi. Sayfadan çıkmak istediğinize emin misiniz?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowUnsavedModal(false); setPendingNavigation(null); }}
                className="flex-1 h-12 bg-palette-beige/30 text-palette-tan rounded-[5px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmNavigation(); }}
                className="flex-1 h-12 bg-palette-red text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>logout</span>
                <span className="mt-0.5">ÇIK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
