import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Btn, Badge, Modal, Input, StatCard } from '@/components/ui'
import { notify } from '@/components/shared'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Building2, Plus, MapPin, LayoutGrid, CheckCircle2, AlertTriangle, Pencil, Trash2, Power } from 'lucide-react'

export const VenueSiteManagement = ({ t: tProp }) => {
  const { t: tCtx } = useTheme()
  const t = tProp || tCtx

  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [viewOutlet, setViewOutlet] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'retail',
    address: '',
    phone: '',
    email: '',
    manager: '',
    notes: ''
  })
  const openAddModal = () => {
    setEditId(null)
    setForm({
      name: '',
      type: 'retail',
      address: '',
      phone: '',
      email: '',
      manager: '',
      notes: ''
    })
    setShowAddModal(true)
  }

  const handleEdit = (outlet) => {
    setEditId(outlet.id)
    setForm({
      name: outlet.name,
      type: outlet.type || 'retail',
      address: outlet.address || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      manager: outlet.manager || '',
      notes: outlet.notes || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this outlet?')) return

    try {
      if (!isSupabaseConfigured()) {
        setOutlets(prev => prev.filter(o => o.id !== id))
        notify('Outlet removed locally', 'success')
        return
      }

      const { error } = await supabase.from('sites').delete().eq('id', id)
      if (error) throw error
      notify('Outlet Deleted', 'success')
      fetchOutlets()
    } catch (err) {
      console.error('Error deleting outlet:', err)
      notify('Failed to delete outlet', 'error')
    }
  }

  const handleToggleStatus = async (outlet) => {
    const newStatus = outlet.status === 'active' ? 'inactive' : 'active'
    try {
      if (!isSupabaseConfigured()) {
        setOutlets(prev => prev.map(o => o.id === outlet.id ? { ...o, status: newStatus } : o))
        notify(`Outlet marked as ${newStatus}`, 'success')
        return
      }

      const { error } = await supabase.from('sites').update({ status: newStatus }).eq('id', outlet.id)
      if (error) throw error
      notify(`Outlet marked as ${newStatus}`, 'success')
      fetchOutlets()
    } catch (err) {
      console.error('Error toggling status:', err)
      notify('Failed to update status', 'error')
    }
  }

  const fetchOutlets = async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        // Fallback rich demo data
        setOutlets([
          {
            id: '1',
            name: 'Downtown Flagship',
            type: 'retail',
            status: 'active',
            manager: 'Arun Kumar',
            address: '124, Cathedral Road, Chennai',
            phone: '044-24567890',
            email: 'downtown@yabezpos.com',
            notes: 'High traffic site. Daily stock settlement at 9 PM. Weekly maintenance on Sundays.'
          },
          {
            id: '2',
            name: 'OMR Warehouse',
            type: 'warehouse',
            status: 'active',
            manager: 'Suresh Raina',
            address: 'Plot 45, SIPCOT Industrial Park, Siruseri',
            phone: '044-67891234',
            email: 'wh-omr@yabezpos.com',
            notes: 'Main distribution hub. Authorized access only. Forklift service due next month.'
          },
          {
            id: '3',
            name: 'Phoenix Marketcity Kiosk',
            type: 'kiosk',
            status: 'active',
            manager: 'Priya Dharshini',
            address: 'Level 2, near food court, Phoenix Mall',
            phone: '044-98765432',
            email: 'kiosk-phoenix@yabezpos.com',
            notes: 'Peak hours: 5 PM - 10 PM. Check credit card terminal battery daily.'
          },
          {
            id: '4',
            name: 'Velachery Express Pop-up',
            type: 'pop-up',
            status: 'inactive',
            manager: 'Vijay Sethupathi',
            address: 'Temporary Zone B, Velachery bypass',
            phone: '044-12345678',
            email: 'popup-vel@yabezpos.com',
            notes: 'Seasonal outlet. Re-opening for Summer fest in May.'
          }
        ])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name')

      if (error) {
        // If error code is related to table not found (42P01), we handle it gracefully
        if (error.code === '42P01') {
          console.warn('sites table does not exist in Supabase yet. Creating demo mock state.')
          setOutlets([])
        } else {
          throw error
        }
      } else {
        setOutlets(data || [])
      }
    } catch (err) {
      console.error('Error fetching outlets:', err)
      notify('Failed to load outlets from database', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOutlets()
  }, [])

  const handleAddOutlet = async () => {
    if (!form.name.trim()) {
      notify('Name is required', 'warning')
      return
    }

    setAdding(true)
    try {
      if (!isSupabaseConfigured()) {
        if (editId) {
          setOutlets(prev => prev.map(o => o.id === editId ? { ...o, ...form } : o))
          notify('Outlet updated locally', 'success')
        } else {
          const newOutlet = { id: String(Date.now()), ...form, status: 'active' }
          setOutlets(prev => [...prev, newOutlet])
          notify('Outlet added locally', 'success')
        }
        setShowAddModal(false)
        setForm({
          name: '',
          type: 'retail',
          address: '',
          phone: '',
          email: '',
          manager: '',
          notes: ''
        })
        setEditId(null)
        return
      }

      let error = null
      if (editId) {
        // Update existing
        const res = await supabase.from('sites').update({
          name: form.name,
          type: form.type,
          address: form.address,
          phone: form.phone,
          email: form.email,
          manager: form.manager,
          notes: form.notes
        }).eq('id', editId)
        error = res.error
      } else {
        // Try inserting
        const res = await supabase.from('sites').insert({
          name: form.name,
          type: form.type,
          address: form.address,
          phone: form.phone,
          email: form.email,
          manager: form.manager,
          notes: form.notes,
          status: 'active'
        }).select()
        error = res.error
      }

      if (error) {
        if (error.code === '42P01') {
          notify('Database schema missing. Need to create sites table.', 'error')
        } else {
          throw error
        }
      } else {
        notify(editId ? 'Outlet Updated Successfully!' : 'New Outlet Added Successfully!', 'success')
        fetchOutlets()
        setShowAddModal(false)
        setForm({
          name: '',
          type: 'retail',
          address: '',
          phone: '',
          email: '',
          manager: '',
          notes: ''
        })
        setEditId(null)
      }
    } catch (err) {
      console.error('Error adding outlet:', err)
      notify('Failed to save outlet', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      background: '#f8fafc',
      margin: '-24px',
      padding: '32px',
      minHeight: 'calc(100vh - 64px)',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        position: 'sticky',
        top: -32,
        zIndex: 50,
        background: '#f8fafc',
        padding: '16px 0',
        margin: '-16px 0 0 0',
        borderBottom: '1px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
            flexShrink: 0
          }}>
            <Building2 size={28} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              Outlet Management
            </h1>
          </div>
        </div>
        <Btn t={t} onClick={openAddModal} style={{
          borderRadius: 12,
          background: '#2563EB',
          color: '#fff',
          padding: '12px 24px',
          fontWeight: 800,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
          border: 'none',
          transition: 'transform 0.2s'
        }}>
          <Plus size={18} strokeWidth={3} /> Add New Outlet
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <StatCard
          title="Total Outlets Registered"
          value={loading ? '-' : outlets.length}
          icon={<LayoutGrid size={24} />}
          type="neutral"
          style={{ borderLeftColor: '#2563EB' }}
        />
        <StatCard
          title="Active Operational Sites"
          value={loading ? '-' : outlets.filter(o => o.status === 'active').length}
          icon={<CheckCircle2 size={24} />}
          type="growth"
        />
        <StatCard
          title="Inactive / Offline Sites"
          value={loading ? '-' : outlets.filter(o => o.status !== 'active').length}
          icon={<AlertTriangle size={24} />}
          type="warning"
        />
      </div>

      {/* List Panel */}
      <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 24px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>Network Directory</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 600 }}>Loading Outlets from Supabase...</div>
        ) : outlets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <Store size={48} color="#94a3b8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>No Outlets Registered</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 }}>Add your first outlet to start managing point-of-sale assignments.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {outlets.map((outlet, idx) => (
              <div key={outlet.id || idx} 
                onClick={() => setViewOutlet(outlet)}
                style={{
                  padding: 24,
                  background: '#f8fafc',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: outlet.status === 'active' ? '#10b981' : '#f59e0b' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>{outlet.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(outlet); }}
                      style={{ border: 'none', background: '#f1f5f9', padding: '6px', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(outlet.id); }}
                      style={{ border: 'none', background: '#fef2f2', padding: '6px', borderRadius: 8, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                  <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} /> {(outlet.type || 'Standard').toUpperCase()} Outlet
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <Btn t={t} onClick={(e) => { e.stopPropagation(); handleToggleStatus(outlet); }} variant="ghost" style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 800, background: outlet.status === 'active' ? '#fff' : '#eef2ff', border: '1px solid #cbd5e1', color: outlet.status === 'active' ? '#64748b' : '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Power size={14} /> {outlet.status === 'active' ? 'Deactivate Outlet' : 'Activate Outlet'}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal 
          isOpen={true} 
          title={editId ? "Update Site Registration" : "Register New Site"} 
          onClose={() => { setShowAddModal(false); setEditId(null); }}
          maxWidth="700px"
        >
          <div style={{ padding: '0px', background: '#FFFFFF' }}>
             {/* Header Section */}
             <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', background: '#f8fafc' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Register New Outlet Hub</h3>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>Enter the configuration and contact mapping for this site.</p>
             </div>

             <div style={{ padding: '32px 40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                   
                   {[
                      { label: "Site Name *", id: "name", type: "text", placeholder: "e.g. Chennai Main Flagship" },
                      { label: "Site Category", id: "type", type: "select", options: [
                         { value: "retail", label: "Retail Hub" },
                         { value: "warehouse", label: "Storage Hub" },
                         { value: "kiosk", label: "Micro Kiosk" },
                         { value: "pop-up", label: "Pop-up Site" }
                      ]},
                      { label: "Site Manager", id: "manager", type: "text", placeholder: "Primary person-in-charge" },
                      { label: "Contact Phone", id: "phone", type: "tel", placeholder: "+91 00000 00000" },
                      { label: "Business Email", id: "email", type: "email", placeholder: "site.lead@yabezpos.com" },
                      { label: "Physical Address", id: "address", type: "textarea", placeholder: "Street address, area, pin code...", rows: 2 },
                      { label: "Site Reminders", id: "notes", type: "textarea", placeholder: "Special instructions or notes...", rows: 3 },
                   ].map((field) => (
                      <div key={field.id} style={{ display: 'flex', alignItems: field.type === 'textarea' ? 'flex-start' : 'center', gap: 32 }}>
                         <label style={{ 
                            width: '180px', 
                            fontSize: 13, 
                            fontWeight: 700, 
                            color: '#475569', 
                            textAlign: 'right',
                            flexShrink: 0,
                            paddingTop: field.type === 'textarea' ? '12px' : '0px'
                         }}>
                            {field.label}
                         </label>
                         <div style={{ flex: 1 }}>
                            {field.type === 'select' ? (
                               <select 
                                 value={form[field.id]} 
                                 onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                                 style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, transition: 'all 0.2s' }}
                               >
                                  {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                               </select>
                            ) : field.type === 'textarea' ? (
                               <textarea 
                                 value={form[field.id]} 
                                 onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))} 
                                 placeholder={field.placeholder}
                                 rows={field.rows}
                                 style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', resize: 'none', background: '#FFFFFF', lineHeight: 1.5, fontWeight: 500, transition: 'all 0.2s' }}
                               />
                            ) : (
                               <input 
                                 type={field.type} 
                                 value={form[field.id]} 
                                 onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))} 
                                 placeholder={field.placeholder}
                                 style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, transition: 'all 0.2s' }}
                               />
                            )}
                         </div>
                      </div>
                   ))}
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 48, justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                   <Btn t={t} variant="ghost" onClick={() => setShowAddModal(false)} style={{ 
                      padding: '12px 28px', 
                      borderRadius: 12, 
                      fontWeight: 800, 
                      color: '#64748B',
                      fontSize: 14,
                      border: '1px solid #E2E8F0'
                   }}>
                      Cancel
                   </Btn>
                   <Btn t={t} onClick={handleAddOutlet} disabled={adding} style={{ 
                      background: '#2563EB', 
                      color: '#FFFFFF', 
                      padding: '12px 36px', 
                      borderRadius: 12, 
                      fontWeight: 900, 
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 15,
                      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.3s'
                   }}>
                      {adding ? (
                         <>
                            <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%' }} />
                            Mapping Site...
                         </>
                      ) : (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={22} strokeWidth={3} /> {editId ? 'Authorize Profile Update' : 'Initialize Site Registration'}
                         </div>
                      )}
                   </Btn>
                </div>
             </div>
             
             <style>{`
                input::placeholder, textarea::placeholder {
                   color: #94A3B8 !important;
                   font-weight: 500;
                }
                input:focus, textarea:focus, select:focus {
                   border-color: #2563EB !important;
                   box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.08);
                   background: #fff !important;
                }
                select {
                   appearance: none;
                   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                   background-repeat: no-repeat;
                   background-position: right 18px center;
                   background-size: 20px;
                }
             `}</style>
          </div>
        </Modal>
      )}
      {viewOutlet && (
        <Modal
          isOpen={true}
          title="Outlet Details"
          onClose={() => setViewOutlet(null)}
          maxWidth="600px"
        >
          <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={32} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>{viewOutlet.name}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Badge t={t} text={viewOutlet.status === 'active' ? 'Live' : 'Hidden'} color={viewOutlet.status === 'active' ? 'green' : 'gray'} />
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>ID: {viewOutlet.id}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { label: 'Category', value: (viewOutlet.type || 'Standard').toUpperCase(), icon: <LayoutGrid size={16} /> },
                { label: 'Manager', value: viewOutlet.manager || 'Not Assigned', icon: <CheckCircle2 size={16} /> },
                { label: 'Phone', value: viewOutlet.phone || 'N/A', icon: <Power size={16} /> },
                { label: 'Email', value: viewOutlet.email || 'N/A', icon: <Power size={16} /> },
              ].map((item, i) => (
                <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Address</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>{viewOutlet.address || 'No address provided.'}</div>
              </div>
              <div style={{ padding: 16, background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Internal Notes</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#92400e', lineHeight: 1.5 }}>{viewOutlet.notes || 'No notes available for this site.'}</div>
              </div>
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <Btn t={t} onClick={() => { setViewOutlet(null); handleEdit(viewOutlet); }} style={{ flex: 1, padding: 12, background: '#2563eb', color: '#fff', borderRadius: 10, fontWeight: 800 }}>Edit Site</Btn>
              <Btn t={t} onClick={() => setViewOutlet(null)} variant="ghost" style={{ flex: 1, padding: 12, border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 800 }}>Close View</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
