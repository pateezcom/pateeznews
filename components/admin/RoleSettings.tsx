
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Role, Permission } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const RoleSettings: React.FC = () => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [rolePermissionsSummary, setRolePermissionsSummary] = useState<Record<string, string[]>>({});

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showRoleFormModal, setShowRoleFormModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '' });
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');
      if (rolesError) throw rolesError;

      const { data: permData, error: permError } = await supabase.from('permissions').select('*').order('group_name');
      if (permError) throw permError;

      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('role');
      if (!profilesError && profiles) {
        const counts: Record<string, number> = {};
        profiles.forEach(p => {
          const r = p.role || 'member';
          counts[r] = (counts[r] || 0) + 1;
        });
        setMemberCounts(counts);
      }

      const { data: allMappings, error: mapError } = await supabase.from('role_permissions').select('role_id, permission_key');
      if (!mapError && allMappings) {
        const summary: Record<string, string[]> = {};
        allMappings.forEach(m => {
          if (!summary[m.role_id]) summary[m.role_id] = [];
          const pName = permData.find(pd => pd.key === m.permission_key)?.label;
          if (pName) summary[m.role_id].push(pName);
        });
        setRolePermissionsSummary(summary);
      }

      const sortedRoles = (rolesData || []).sort((a, b) => {
        if (a.name === 'admin') return -1;
        if (b.name === 'admin') return 1;
        return a.label.localeCompare(b.label);
      });

      setRoles(sortedRoles);
      setPermissions(permData || []);
    } catch (err: any) {
      setError(t('admin.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  const openPermissionModal = async (role: Role) => {
    setSelectedRole(role);
    try {
      const { data, error } = await supabase.from('role_permissions').select('permission_key').eq('role_id', role.id);
      if (error) throw error;
      setRolePermissions(data.map(p => p.permission_key));
      setShowPermModal(true);
    } catch (err) { console.error(err); }
  };

  const togglePermission = (permKey: string) => {
    if (selectedRole?.name === 'admin') return;
    setRolePermissions(prev => prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.name === 'admin') return;
    setSaving(true);
    try {
      await supabase.from('role_permissions').delete().eq('role_id', selectedRole.id);
      if (rolePermissions.length > 0) {
        await supabase.from('role_permissions').insert(rolePermissions.map(key => ({ role_id: selectedRole.id, permission_key: key })));
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowPermModal(false); }, 1500);
      fetchData();
    } catch (err: any) { setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) }); } finally { setSaving(false); }
  };

  const handleAddRole = async () => {
    if (!roleForm.name || !roleForm.label) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('roles').insert([{
        name: roleForm.name.toLowerCase().replace(' ', '_'),
        label: roleForm.label,
        description: roleForm.description
      }]);
      if (error) throw error;
      setShowRoleFormModal(false);
      setRoleForm({ name: '', label: '', description: '' });
      fetchData();
    } catch (err: any) { setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) }); } finally { setSaving(false); }
  };

  const groupedPermissions = {
    sidebar: permissions.filter(p => p.group_name === 'sidebar'),
    content: permissions.filter(p => p.group_name === 'content'),
    system: permissions.filter(p => p.group_name === 'system'),
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'sidebar': return <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>dashboard</span>;
      case 'content': return <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>public</span>;
      case 'system': return <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>settings</span>;
      default: return <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>shield</span>;
    }
  };

  const inputClasses = "w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="w-12 h-12 border-4 border-palette-tan/15 border-t-palette-red rounded-[3px] animate-spin"></div>
        <p className="text-[13px] font-black text-palette-tan/40 tracking-widest">{t('users.status.syncing')}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 admin-font pb-20 text-palette-tan mx-auto">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
        <div>
          <h2 className="text-[32px] font-black text-palette-maroon tracking-tighter leading-none mb-2">{t('roles.page_title')}</h2>
          <p className="text-[13px] font-bold text-palette-tan/50 tracking-wider">{t('roles.page_desc')}</p>
        </div>

        <button
          onClick={() => setShowRoleFormModal(true)}
          className="h-10 px-8 bg-palette-red text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>
          <span>{t('roles.add_new')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => openPermissionModal(role)}
            className="group relative bg-white rounded-[3px] border border-palette-tan/20 p-7 shadow-sm hover:shadow-2xl hover:shadow-palette-tan/5 transition-all duration-500 cursor-pointer overflow-hidden border-b-4 border-b-palette-tan/25 hover:border-b-palette-red"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-[3px] flex items-center justify-center transition-all duration-500 shadow-inner ${role.name === 'admin' ? 'bg-palette-red text-white' : 'bg-palette-beige text-palette-tan group-hover:bg-palette-tan group-hover:text-white'}`}>
                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>fingerprint</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-palette-beige/50 border border-palette-tan/20 px-2.5 py-1 rounded-[3px] flex items-center gap-2">
                  <span className="material-symbols-rounded text-palette-tan/40" style={{ fontSize: '12px' }}>group</span>
                  <span className="text-sm font-black text-palette-tan leading-none">
                    {memberCounts[role.name] || 0}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-palette-tan/30 mt-1">{t('roles.active_members')}</span>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-[20px] font-black text-palette-maroon group-hover:text-palette-red transition-colors leading-none">{role.label}</h3>
              <p className="text-[12px] text-palette-tan/40 font-bold tracking-widest">@{role.name}</p>
              <p className="text-[13px] text-palette-tan font-medium leading-relaxed mt-1 line-clamp-2 italic">
                {role.description || t('roles.no_desc')}
              </p>
            </div>

            <div className="space-y-2 mb-8 bg-palette-beige/20 p-4 rounded-[3px] border border-palette-tan/20">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '12px' }}>fact_check</span>
                <span className="text-[13px] font-black text-palette-tan/60 tracking-widest">{t('roles.perm_summary')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(rolePermissionsSummary[role.id] || []).length > 0 ? (
                  rolePermissionsSummary[role.id].slice(0, 3).map((pLabel, idx) => (
                    <span key={idx} className="text-[12px] font-bold bg-white text-palette-maroon border border-palette-tan/20 px-1.5 py-0.5 rounded-[3px] px-1.5 py-0.5">
                      {pLabel}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] font-bold text-palette-tan/30 italic">{t('roles.no_perms')}</span>
                )}
                {(rolePermissionsSummary[role.id] || []).length > 3 && (
                  <span className="text-[12px] font-black text-palette-red">+{(rolePermissionsSummary[role.id].length - 3)} {t('roles.more')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-palette-tan/20">
              {role.name !== 'admin' ? (
                <button
                  onClick={() => openPermissionModal(role)}
                  className="h-9 px-4 bg-palette-beige/20 text-palette-tan hover:bg-palette-maroon hover:text-white rounded-[3px] text-[12px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>settings</span>
                  {t('roles.manage')}
                </button>
              ) : (
                <div className="h-9 px-4 bg-red-50 text-palette-red/50 rounded-[3px] text-[12px] font-black uppercase tracking-wider flex items-center gap-2 border border-red-100/50">
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>lock</span>
                  {t('roles.locked')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showPermModal && selectedRole && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowPermModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 border border-palette-tan/20 flex flex-col">

            <div className="px-10 py-7 border-b border-palette-tan/20 flex items-center justify-between bg-palette-beige/10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-palette-tan rounded-[3px] flex items-center justify-center text-white shadow-xl shadow-palette-tan/20">
                  <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>verified_user</span>
                </div>
                <div>
                  <h3 className="text-[22px] font-black text-palette-maroon leading-none mb-1">{selectedRole.label} {t('roles.perms_for')}</h3>
                  <p className="text-[13px] font-bold text-palette-tan/40 tracking-widest">{t('roles.perms_desc')}</p>
                </div>
              </div>
              <button onClick={() => setShowPermModal(false)} className="w-10 h-10 flex items-center justify-center bg-palette-beige/50 rounded-[3px] hover:bg-palette-red hover:text-white transition-all"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-10">
              {selectedRole.name === 'admin' && (
                <div className="bg-palette-red/5 border border-palette-red/10 p-5 rounded-[3px] flex items-start gap-4">
                  <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '20px' }}>report</span>
                  <div>
                    <h4 className="text-[14px] font-black text-palette-maroon mb-1 tracking-wider">{t('common.error')}</h4>
                    <p className="text-palette-red/80 text-[13px] font-bold leading-relaxed">{t('roles.admin_notice')}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                {Object.entries(groupedPermissions).map(([key, groupPerms]) => (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="p-1.5 bg-palette-beige rounded-[3px] text-palette-tan">{getGroupIcon(key)}</div>
                      <h4 className="text-[13px] font-black text-palette-maroon tracking-wider">{key === 'sidebar' ? t('roles.group.sidebar') : key === 'content' ? t('roles.group.content') : t('roles.group.system')}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupPerms.map((perm) => {
                        const isActive = rolePermissions.includes(perm.key);
                        const isLocked = selectedRole.name === 'admin';
                        return (
                          <div
                            key={perm.id}
                            onClick={() => !isLocked && togglePermission(perm.key)}
                            className={`group p-4 rounded-[3px] border transition-all ${isActive ? 'bg-palette-tan/5 border-palette-tan/25' : 'bg-white border-palette-tan/20 hover:border-palette-tan/30'
                              } ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <h5 className={`text-[15px] font-black mb-1 ${isActive ? 'text-palette-maroon' : 'text-palette-tan/40 group-hover:text-palette-tan'}`}>{perm.label}</h5>
                                <p className="text-[12px] text-palette-tan/50 font-bold leading-tight">{perm.description}</p>
                              </div>
                              <div className={`relative w-10 h-5 rounded-[3px] transition-all duration-500 p-0.5 flex items-center ${isActive ? 'bg-palette-tan' : 'bg-palette-beige'}`}>
                                <div className={`w-3.5 h-3.5 bg-white rounded-[3px] shadow-lg transition-all transform ${isActive ? 'translate-x-5' : 'translate-x-0'} flex items-center justify-center`}>
                                  {isActive && <span className="material-symbols-rounded text-palette-tan" style={{ fontSize: '8px', fontWeight: '900' }}>check</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-7 border-t border-palette-tan/20 bg-palette-beige/10 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-palette-beige/10 px-4 py-2 rounded-[3px] border border-palette-tan/10">
                <span className="text-[13px] font-black text-palette-maroon tracking-tight">
                  {rolePermissions.length} {t('roles.perms_active')}
                </span>
              </div>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="h-11 px-8 bg-palette-maroon text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-red transition-all shadow-lg shadow-palette-maroon/20 flex items-center justify-center gap-2"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>}
                {saving ? t('common.processing') : t('roles.apply_changes')}
              </button>
            </div>

          </div>
        </div>
      )}

      {showRoleFormModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowRoleFormModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/20 flex flex-col">
            <div className="px-8 py-7 border-b border-palette-tan/20 bg-palette-beige/10 flex items-center justify-between">
              <h3 className="text-[20px] font-black text-palette-maroon tracking-tight flex items-center gap-3">
                <div className="w-9 h-9 bg-palette-red rounded-[3px] flex items-center justify-center text-white shadow-lg shadow-palette-red/20">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>add</span>
                </div>
                {t('roles.form.title_new')}
              </h3>
              <button onClick={() => setShowRoleFormModal(false)} className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('roles.form.label')}</label>
                <input
                  type="text"
                  value={roleForm.label}
                  onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                  placeholder={t('roles.form.label_placeholder')}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('roles.form.name')}</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder={t('roles.form.name_placeholder')}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('roles.form.desc')}</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder={t('roles.form.desc_placeholder')}
                  rows={4}
                  className={`${inputClasses} h-auto py-3 resize-none leading-relaxed font-medium`}
                />
              </div>
            </div>

            <div className="px-8 py-7 border-t border-palette-tan/20 bg-palette-beige/10 flex items-center justify-end gap-3">
              <button onClick={() => setShowRoleFormModal(false)} className="px-5 py-2.5 font-black text-[13px] text-palette-tan/40 hover:text-palette-maroon tracking-widest">{t('common.cancel')}</button>
              <button
                onClick={handleAddRole}
                disabled={saving || !roleForm.name || !roleForm.label}
                className="flex items-center gap-2 px-8 py-3 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40"
              >
                {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-[3px] animate-spin" /> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check_circle</span>}
                <span>{saving ? t('common.processing') : t('roles.form.submit')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL (Success/Error) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/20 p-8 text-center">
            <div className={`w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal({ ...statusModal, show: false })}
              className="w-full py-4 bg-palette-tan text-white rounded-[3px] font-black text-[14px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleSettings;
