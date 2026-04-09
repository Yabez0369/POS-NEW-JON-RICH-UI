import { useState, useEffect, useCallback, useMemo } from 'react'
import { Btn, Card, Modal } from '@/components/ui'
import { notify } from '@/components/shared'
import { 
  fetchCategories, createCategory, updateCategory, deleteCategory, 
  fetchSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, 
  fetchAttributes, createAttribute, saveSubCategoryAttributes, deleteAttribute 
} from '@/services/categories'

// ─── Constants & Helpers ───────────────────────────────────────────────────────
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS', '6', '7', '8', '9', '10', '11', '12']
const COLOR_PRESETS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Navy', 'Purple', 'Orange']
const MATERIAL_PRESETS = ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Denim', 'Leather', 'Fleece', 'Mesh', 'Spandex']

const blank = { category: '', subcategory: '', attribute_config: ['Size', 'Color', 'Material', 'Length'], custom_attributes: {} }

const getCategoryStyles = (name) => {
  const n = name.toLowerCase()
  if (n.includes('cup') || n.includes('mug')) return { icon: '☕', color: '#3b82f6', bg: '#eff6ff' }
  if (n.includes('dress') || n.includes('cloth')) return { icon: '👗', color: '#ec4899', bg: '#fdf2f8' }
  if (n.includes('shoe') || n.includes('foot')) return { icon: '👟', color: '#10b981', bg: '#ecfdf5' }
  if (n.includes('jersey') || n.includes('sport')) return { icon: '👕', color: '#8b5cf6', bg: '#f5f3ff' }
  if (n.includes('access')) return { icon: '👑', color: '#f59e0b', bg: '#fffbeb' }
  return { icon: '📦', color: '#6366f1', bg: '#f1f2ff' }
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const fieldLabel = (txt, t) => (
  <label style={{ fontSize: 13, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{txt}</label>
)

const iStyle = (t) => ({
  width: '100%', boxSizing: 'border-box', background: t.input, border: `1px solid ${t.border}`,
  borderRadius: 12, padding: '12px 16px', color: t.text, fontSize: 16, outline: 'none', transition: 'all 0.2s'
})

const CategoryForm = ({ f, onChange, isEdit = false, target = null, t, allCats, attributes, setAllAttrs, submitting, handleSave, setShowAdd, setEditTarget }) => {
  const styles = iStyle(t)
  const [customAttr, setCustomAttr] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletedAttr, setDeletedAttr] = useState(null)

  const toggleAttr = (attrName) => {
    const next = f.attribute_config.includes(attrName)
      ? f.attribute_config.filter(a => a !== attrName)
      : [...f.attribute_config, attrName]
    onChange({ ...f, attribute_config: next })
  }

  const finalPool = (attributes || []).map(a => a.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {fieldLabel('Category *', t)}
          <input
            value={f.category}
            onChange={e => onChange({ ...f, category: e.target.value })}
            placeholder="e.g. Dress"
            style={styles}
            list="cat-datalist"
            disabled={isEdit && target?.category_id}
          />
          <datalist id="cat-datalist">
            {allCats.filter(c => !c.category_id).map(c => <option key={c.id} value={c.name} />)}
          </datalist>
        </div>
        <div>
          {fieldLabel('Subcategory', t)}
          <input
            value={f.subcategory}
            onChange={e => onChange({ ...f, subcategory: e.target.value })}
            placeholder="e.g. Scarf"
            style={styles}
            disabled={isEdit && !target?.category_id}
          />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {fieldLabel('Attribute Options', t)}
          <button
            type="button"
            onClick={() => setIsDeleting(!isDeleting)}
            style={{ fontSize: 12, background: isDeleting ? '#ef4444' : `${t.text3}20`, color: isDeleting ? '#fff' : t.text3, border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
          >
            {isDeleting ? 'Done' : '🗑️ Delete Mode'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {finalPool.map(attrName => {
            const attrObj = (attributes || []).find(a => a.name === attrName)
            const isSelected = f.attribute_config.includes(attrName)
            return (
              <div 
                key={attrName} 
                onClick={() => !isDeleting && toggleAttr(attrName)}
                style={{ 
                  padding: '6px 14px', 
                  borderRadius: 20, 
                  fontSize: 14, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isSelected ? `${t.accent}15` : t.bg3,
                  border: `1px solid ${isSelected ? t.accent : t.border}`,
                  color: isSelected ? t.accent : t.text2,
                  transition: 'all 0.2s'
                }}
              >
                {attrName}
                {isDeleting && (
                  <span 
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (attrObj) {
                        try {
                          await deleteAttribute(attrObj.id)
                          setAllAttrs(prev => prev.filter(a => a.id !== attrObj.id))
                          if (isSelected) toggleAttr(attrName)
                          notify(`Deleted ${attrName}`, 'warning')
                        } catch (err) { notify('Error: ' + err.message, 'error') }
                      }
                    }}
                    style={{ color: '#ef4444', marginLeft: 4 }}
                  >×</span>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customAttr}
            onChange={e => setCustomAttr(e.target.value)}
            placeholder="Add custom attribute..."
            style={{ ...styles, flex: 1 }}
          />
          <Btn t={t} onClick={async () => {
            if (customAttr.trim()) {
              const val = customAttr.trim()
              if (!finalPool.includes(val)) {
                try {
                  const created = await createAttribute(val)
                  setAllAttrs(p => [...p, created])
                  toggleAttr(val)
                } catch (err) { notify('Error: ' + err.message, 'error') }
              } else { toggleAttr(val) }
              setCustomAttr('')
            }
          }}>Add</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <Btn t={t} variant="ghost" onClick={() => isEdit ? setEditTarget(null) : setShowAdd(false)} style={{ flex: 1 }}>Cancel</Btn>
        <Btn t={t} onClick={() => handleSave(f, target)} disabled={!f.category.trim() || submitting} style={{ flex: 1.5 }}>
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
        </Btn>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon, color, bg, t }) => (
  <div style={{ 
    padding: '24px', 
    background: bg || `${t.bg2}BF`, 
    borderRadius: 24, 
    border: `1px solid ${color}20`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: t.text }}>{value}</div>
    </div>
    <div style={{ 
      width: 48, height: 48, borderRadius: 16, background: `${color}15`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
    }}>
      {icon}
    </div>
  </div>
)

const CatCard = ({ catName, subName, attrs, products, t, onEdit, onDelete }) => {
  const styles = getCategoryStyles(catName)
  const [hovered, setHovered] = useState(false)

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.bg2,
        borderRadius: 24,
        border: `1px solid ${hovered ? styles.color : t.border + '40'}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
        transform: hovered ? 'translateY(-4px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: 18, background: styles.bg, color: styles.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 8px 16px ${styles.color}15`
          }}>
            {styles.icon}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{catName}</div>
            <div style={{ fontSize: 15, color: t.text3, fontWeight: 500 }}>{subName || 'Main Category'}</div>
          </div>
        </div>
        
        {hovered && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text3, padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Attributes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(attrs || []).slice(0, 4).map(a => (
            <div key={a} style={{ padding: '4px 12px', borderRadius: 20, background: t.bg3, border: `1px solid ${t.border}40`, fontSize: 13, color: t.text2, fontWeight: 600 }}>{a}</div>
          ))}
          {(attrs || []).length > 4 && (
            <div style={{ padding: '4px 12px', borderRadius: 20, background: t.bg3, border: `1px solid ${t.border}40`, fontSize: 13, color: t.text3, fontWeight: 600 }}>+{(attrs || []).length - 4} more</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${t.border}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: t.text3, fontWeight: 600 }}>
          <span style={{ fontSize: 16 }}>📦</span> {products || 0} products
        </div>
        <div style={{ fontSize: 14, color: styles.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          View Details <span style={{ fontSize: 18 }}>›</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const CategoryManagement = ({ t: globalT, addAudit, currentUser }) => {
  const t = useMemo(() => ({
    ...globalT,
    accent: '#6366f1',
    bg2: '#ffffff',
    bg3: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    text2: '#475569',
    text3: '#94a3b8'
  }), [globalT])

  const [allCats, setAllCats] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [allAttrs, setAllAttrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  // Modals
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Forms
  const [addForm, setAddForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, subs, attrs] = await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchAttributes()
      ])
      setAllCats(cats || [])
      setAllSubs(subs || [])
      setAllAttrs(attrs || [])
    } catch (e) {
      notify('Failed to load: ' + (e.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const rows = useMemo(() => {
    const list = []
    allCats.forEach(cat => {
      const children = allSubs.filter(s => s.category_id === cat.id)
      if (children.length > 0) {
        children.forEach(sub => {
          list.push({ id: sub.id, catName: cat.name, subName: sub.name, raw: sub, attrs: sub.attribute_config || cat.attribute_config || [] })
        })
      } else {
        list.push({ id: cat.id, catName: cat.name, subName: '', raw: cat, attrs: cat.attribute_config || [] })
      }
    })
    return list
  }, [allCats, allSubs])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = r.catName.toLowerCase().includes(search.toLowerCase()) || r.subName.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'All' || r.catName === filter
      return matchesSearch && matchesFilter
    })
  }, [rows, search, filter])

  const stats = useMemo(() => ({
    cats: allCats.length,
    subs: allSubs.length,
    attrs: allAttrs.length,
    products: 113 // Mocked as per image requirement since product service isn't local
  }), [allCats, allSubs, allAttrs])

  const handleSave = async (f, target = null) => {
    if (!f.category.trim()) { notify('Category name is required', 'error'); return }
    setSubmitting(true)
    try {
      if (target) {
        const isSub = !!target.category_id
        const updates = { name: isSub ? f.subcategory.trim() : f.category.trim(), attribute_config: f.attribute_config }
        if (isSub) {
          const updated = await updateSubCategory(target.id, updates)
          const selectedAttrIds = allAttrs.filter(a => f.attribute_config.includes(a.name)).map(a => a.id)
          await saveSubCategoryAttributes(target.id, selectedAttrIds)
          setAllSubs(prev => prev.map(s => s.id === target.id ? { ...s, ...updated } : s))
        } else {
          const updated = await updateCategory(target.id, updates)
          setAllCats(prev => prev.map(c => c.id === target.id ? { ...c, ...updated } : c))
        }
        notify('Updated!', 'success')
        addAudit?.(currentUser, 'Category Updated', 'Categories', updates.name)
        setEditTarget(null)
      } else {
        let parent = allCats.find(c => c.name.toLowerCase() === f.category.trim().toLowerCase())
        if (!parent) {
          parent = await createCategory({ name: f.category.trim(), attribute_config: f.attribute_config })
          setAllCats(prev => [...prev, parent])
        }
        if (f.subcategory.trim()) {
          const sub = await createSubCategory({ name: f.subcategory.trim(), category_id: parent.id, attribute_config: f.attribute_config })
          const selectedAttrIds = allAttrs.filter(a => f.attribute_config.includes(a.name)).map(a => a.id)
          await saveSubCategoryAttributes(sub.id, selectedAttrIds)
          setAllSubs(prev => [...prev, sub])
        } else {
          const updated = await updateCategory(parent.id, { attribute_config: f.attribute_config })
          setAllCats(prev => prev.map(c => c.id === parent.id ? { ...c, ...updated } : c))
        }
        notify('Saved successfully!', 'success')
        setAddForm(prev => ({ ...blank, attribute_config: prev.attribute_config }))
        setShowAdd(false)
      }
    } catch (e) { notify('Error: ' + (e.message || e), 'error') } finally { setSubmitting(false) }
  }

  const confirmDelete = async () => {
    try {
      const isSub = !!deleteTarget.category_id
      if (isSub) {
        await deleteSubCategory(deleteTarget.id)
        setAllSubs(prev => prev.filter(s => s.id !== deleteTarget.id))
      } else {
        await deleteCategory(deleteTarget.id)
        setAllCats(prev => prev.filter(c => c.id !== deleteTarget.id))
        setAllSubs(prev => prev.filter(s => s.category_id !== deleteTarget.id))
      }
      notify('Deleted', 'warning'); setDeleteTarget(null)
    } catch (e) { notify('Error: ' + (e.message || e), 'error') }
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 14, color: t.text3, fontWeight: 600, marginBottom: 8 }}>Home › Categories</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: t.text, letterSpacing: '-0.02em' }}>Category Management</div>
              <div style={{ fontSize: 16, color: t.text3, marginTop: 4 }}>Organize and manage your product categories with attributes</div>
            </div>
          </div>
        </div>
        <Btn t={t} onClick={() => setShowAdd(true)} style={{ padding: '12px 28px', fontSize: 16, borderRadius: 16, boxShadow: `0 8px 16px ${t.accent}20` }}>+ Add Category</Btn>
      </div>

      {/* Stats Bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <StatCard label="Total Categories" value={stats.cats} icon="🗂️" color="#6366f1" t={t} />
        <StatCard label="Sub Categories" value={stats.subs} icon="📚" color="#10b981" t={t} />
        <StatCard label="Total Attributes" value={stats.attrs} icon="🏷️" color="#f59e0b" t={t} />
        <StatCard label="Active Products" value={stats.products} icon="✨" color="#ec4899" t={t} />
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, background: t.bg3, padding: 6, borderRadius: 16, border: `1px solid ${t.border}40` }}>
          {['All', ...allCats.map(c => c.name)].slice(0, 6).map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: '8px 20px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                border: 'none',
                background: filter === c ? t.bg2 : 'transparent',
                color: filter === c ? t.accent : t.text3,
                boxShadow: filter === c ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: t.text3 }}>🔍</span>
          <input 
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px 12px 48px', borderRadius: 16, border: `1px solid ${t.border}40`,
              background: t.bg2, fontSize: 16, outline: 'none', transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filteredRows.map(row => (
            <CatCard 
              key={row.id}
              catName={row.catName}
              subName={row.subName}
              attrs={row.attrs}
              products={Math.floor(Math.random() * 50) + 5} // Mock products
              t={t}
              onEdit={() => {
                const isSub = !!row.raw.category_id
                setEditTarget(row.raw)
                setEditForm({
                  category: row.catName,
                  subcategory: isSub ? row.raw.name : '',
                  attribute_config: row.raw.attribute_config || row.attrs || [],
                  custom_attributes: row.raw.custom_attributes || {}
                })
              }}
              onDelete={() => setDeleteTarget(row.raw)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <Modal t={t} title="Add New Category" onClose={() => setShowAdd(false)}>
          <CategoryForm f={addForm} onChange={setAddForm} t={t} allCats={allCats} attributes={allAttrs} setAllAttrs={setAllAttrs} submitting={submitting} handleSave={handleSave} setShowAdd={setShowAdd} />
        </Modal>
      )}

      {editTarget && (
        <Modal t={t} title={`Edit ${editTarget.category_id ? 'Subcategory' : 'Category'}`} onClose={() => setEditTarget(null)}>
          <CategoryForm f={editForm} onChange={setEditForm} isEdit target={editTarget} t={t} allCats={allCats} attributes={allAttrs} setAllAttrs={setAllAttrs} submitting={submitting} handleSave={handleSave} setEditTarget={setEditTarget} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal t={t} title="Delete Confirmation" onClose={() => setDeleteTarget(null)}>
          <div style={{ fontSize: 18, color: t.text, marginBottom: 24, textAlign: 'center' }}>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?<br/>
            {!deleteTarget.category_id && <span style={{ color: '#ef4444', fontSize: 14 }}>This will also delete all subcategories.</span>}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn t={t} variant="ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Keep it</Btn>
            <Btn t={t} variant="danger" onClick={confirmDelete} style={{ flex: 1 }}>Delete</Btn>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default CategoryManagement
