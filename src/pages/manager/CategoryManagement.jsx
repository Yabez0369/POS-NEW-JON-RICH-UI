import { useState, useEffect, useCallback } from 'react'
import { Btn, Card, Modal, Badge } from '@/components/ui'
import { notify } from '@/components/shared'
import { fetchCategories, createCategory, updateCategory, deleteCategory, fetchSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, fetchAttributes, createAttribute, saveSubCategoryAttributes, deleteAttribute } from '@/services/categories'

// ─── common chip-tag input ────────────────────────────────────────────────────
function ChipInput({ t, label, values = [], onChange, presets = [], placeholder }) {
  const [draft, setDraft] = useState('')
  const add = (val) => {
    const v = val.trim()
    if (!v || values.includes(v)) return
    onChange([...values, v])
    setDraft('')
  }
  const remove = (v) => onChange(values.filter(x => x !== v))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 15, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</label>
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {presets.map(p => {
            const sel = values.includes(p)
            return (
              <button key={p} type="button"
                onClick={() => sel ? remove(p) : onChange([...values, p])}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  border: `1px solid ${sel ? t.accent : t.border}`,
                  background: sel ? t.accent + '20' : 'transparent',
                  color: sel ? t.accent : t.text3,
                }}>
                {p}
              </button>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(draft) } }}
          placeholder={placeholder || `Type & press Enter…`}
          style={{
            flex: 1, background: t.input, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: '8px 12px', color: t.text, fontSize: 17, outline: 'none'
          }}
        />
        <button type="button" onClick={() => add(draft)}
          style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', fontSize: 17, fontWeight: 700 }}>
          +
        </button>
      </div>
      {values.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {values.map(v => (
            <div key={v} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: t.bg3, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: '3px 10px', fontSize: 15, color: t.text
            }}>
              {v}
              <button type="button" onClick={() => remove(v)}
                style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 17, padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── preset options ────────────────────────────────────────────────────────────
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS', '6', '7', '8', '9', '10', '11', '12']
const COLOR_PRESETS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Navy', 'Purple', 'Orange']
const MATERIAL_PRESETS = ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Denim', 'Leather', 'Fleece', 'Mesh', 'Spandex']

const blank = { category: '', subcategory: '', attribute_config: ['Size', 'Color', 'Material', 'Length'], custom_attributes: {} }

function buildCombinedTree(cats, subs) {
  const roots = (cats || []).map(c => ({ ...c, children: [] }))
  const map = {}
  roots.forEach(r => { map[r.id] = r })
    ; (subs || []).forEach(s => {
      if (map[s.category_id]) map[s.category_id].children.push(s)
    })
  return roots
}

const iStyle = (t) => ({
  width: '100%', boxSizing: 'border-box', background: t.input, border: `1px solid ${t.border}`,
  borderRadius: 9, padding: '10px 14px', color: t.text, fontSize: 17, outline: 'none', fontFamily: 'inherit'
})

const fieldLabel = (txt, t) => (
  <label style={{ fontSize: 15, fontWeight: 800, color: t.text3, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>{txt}</label>
)

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

  // Use only from the table as requested
  const finalPool = (attributes || []).map(a => a.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {fieldLabel('Attribute Options (Select to enable)', t)}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {deletedAttr && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const restored = await createAttribute(deletedAttr.name)
                    setAllAttrs(prev => [...prev, restored])
                    setDeletedAttr(null)
                    notify('Restored!', 'success')
                  } catch (e) { notify('Undo failed: ' + e.message, 'error') }
                }}
                style={{ fontSize: 15, background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}40`, borderRadius: 12, padding: '2px 10px', cursor: 'pointer', fontWeight: 700 }}
              >
                ↩️ Undo Delete "{deletedAttr.name}"
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDeleting(!isDeleting)}
              style={{
                fontSize: 15, background: isDeleting ? t.red : `${t.text3}20`, color: isDeleting ? '#fff' : t.text3,
                border: 'none', borderRadius: 12, padding: '2px 10px', cursor: 'pointer', fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {isDeleting ? 'Done' : '🗑️ Delete Mode'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 14px' }}>
          {finalPool.map(attrName => {
            const attrObj = (attributes || []).find(a => a.name === attrName)
            const isPredefined = !!attrObj
            return (
              <div key={attrName} style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                {isDeleting ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (attrObj) {
                        try {
                          await deleteAttribute(attrObj.id)
                          setDeletedAttr(attrObj)
                          setAllAttrs(prev => prev.filter(a => a.id !== attrObj.id))
                          // Also remove from selection if selected
                          if (f.attribute_config.includes(attrName)) toggleAttr(attrName)
                          notify(`Deleted ${attrName}`, 'warning')
                        } catch (e) { notify('Error deleting: ' + e.message, 'error') }
                      }
                    }}
                    style={{ background: t.red + '20', color: t.red, border: 'none', borderRadius: 4, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                  >
                    ×
                  </button>
                ) : (
                  <input type="checkbox" checked={f.attribute_config.includes(attrName)} onChange={() => toggleAttr(attrName)} />
                )}
                <span
                  onClick={() => !isDeleting && toggleAttr(attrName)}
                  style={{
                    fontSize: 17, cursor: isDeleting ? 'default' : 'pointer', color: isPredefined ? t.text : t.accent,
                    maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                  {attrName}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            value={customAttr}
            onChange={e => setCustomAttr(e.target.value)}
            placeholder="Add custom attribute (e.g. Occasion)"
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
                } catch (e) { notify('Error creating attribute: ' + e.message, 'error') }
              } else {
                toggleAttr(val)
              }
              setCustomAttr('')
            }
          }}>Add</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 10 }}>
        <Btn t={t} variant="ghost" onClick={() => isEdit ? setEditTarget(null) : setShowAdd(false)} style={{ flex: 1 }}>Cancel</Btn>
        <Btn t={t} onClick={() => handleSave(f, target)} disabled={!f.category.trim() || submitting} style={{ flex: 2 }}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : '✅ Add Entry'}
        </Btn>
      </div>
    </div>
  )
}

export const CategoryManagement = ({ t: globalT, addAudit, currentUser }) => {
  const blueT = {
    ...globalT,
    accent: '#3b82f6',
    accent2: '#2563eb',
    accentLight: 'rgba(59, 130, 246, 0.2)',
    accentBorder: '#1e40af'
  }
  const t = blueT // Use blue theme for this component

  const [allCats, setAllCats] = useState([])
  const [allSubs, setAllSubs] = useState([])
  const [allAttrs, setAllAttrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  const tree = buildCombinedTree(allCats, allSubs)

  const handleSave = async (f, target = null) => {
    if (!f.category.trim()) { notify('Category name is required', 'error'); return }

    setSubmitting(true)

    try {
      if (target) {
        // Edit mode
        const isSub = !!target.category_id
        const updates = {
          name: isSub ? f.subcategory.trim() : f.category.trim(),
          attribute_config: f.attribute_config,
        }
        if (isSub) {
          const updated = await updateSubCategory(target.id, updates)
          // Handle normalized attributes
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
        // Add mode
        let parent = allCats.find(c => c.name.toLowerCase() === f.category.trim().toLowerCase())
        if (!parent) {
          parent = await createCategory({
            name: f.category.trim(),
            attribute_config: f.attribute_config,
          })
          setAllCats(prev => [...prev, parent])
        }

        if (f.subcategory.trim()) {
          const sub = await createSubCategory({
            name: f.subcategory.trim(),
            category_id: parent.id,
            attribute_config: f.attribute_config,
          })

          // Handle normalized attributes
          const selectedAttrIds = allAttrs.filter(a => f.attribute_config.includes(a.name)).map(a => a.id)
          await saveSubCategoryAttributes(sub.id, selectedAttrIds)

          setAllSubs(prev => [...prev, sub])
          addAudit?.(currentUser, 'Subcategory Created', 'Categories', `${f.subcategory.trim()} under ${f.category.trim()}`)
        } else {
          // If no subcategory, update parent with selected attributes
          const updated = await updateCategory(parent.id, {
            attribute_config: f.attribute_config,
          })
          setAllCats(prev => prev.map(c => c.id === parent.id ? { ...c, ...updated } : c))
          addAudit?.(currentUser, 'Category Updated', 'Categories', f.category.trim())
        }
        notify('Saved successfully!', 'success')
        // Preserve attribute selection for next addition as requested
        setAddForm(prev => ({ ...blank, attribute_config: prev.attribute_config }))
        setShowAdd(false)
      }
    } catch (e) {
      notify('Error: ' + (e.message || e), 'error')
    } finally {
      setSubmitting(false)
    }
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
      notify('Deleted', 'warning')
      addAudit?.(currentUser, 'Category Deleted', 'Categories', deleteTarget.name)
      setDeleteTarget(null)
    } catch (e) {
      notify('Error: ' + (e.message || e), 'error')
    }
  }

  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #C4E8E7 0%, #FFFFFF 100%)',
      minHeight: '100%', padding: '32px', borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' 
    }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{
            fontSize: 32,
            fontWeight: 950,
            color: t.text,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>🗂️ Category Management</div>
          <div style={{ fontSize: 18, color: t.text2, marginTop: 4, opacity: 0.8 }}>View and manage product categories and their specific attributes</div>
        </div>
      </div>

      <Card t={t} style={{
        padding: 0,
        background: `${t.bg2}BF`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${t.border}40`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${t.border}40`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(to bottom, ${t.accent}10, transparent)`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, background: t.accent, borderRadius: 2 }} />
            <div style={{ fontSize: 19, fontWeight: 850, color: t.text, letterSpacing: 0.3 }}>📋 Existing Categories</div>
          </div>
          <Btn t={t} size="sm" onClick={() => setShowAdd(true)} style={{
            boxShadow: `0 4px 12px ${t.accent}30`,
            transform: 'translateY(-1px)'
          }}>+ Add Category Entry</Btn>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: t.text2, padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 30, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>Loading categories…</div>
          </div>
        ) : allCats.length === 0 && allSubs.length === 0 ? (
          <div style={{ textAlign: 'center', color: t.text3, padding: 60 }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.5 }}>📂</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>No categories found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: `${t.bg3}80`, backdropFilter: 'blur(4px)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 15, fontWeight: 950, color: t.text2, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${t.border}` }}>Categories</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 15, fontWeight: 950, color: t.text2, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${t.border}` }}>Sub category</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 15, fontWeight: 950, color: t.text2, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${t.border}` }}>Attributes</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 15, fontWeight: 950, color: t.text2, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${t.border}` }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = []
                  const tree = buildCombinedTree(allCats, allSubs)
                  tree.forEach(cat => {
                    if (cat.children && cat.children.length > 0) {
                      cat.children.forEach(sub => {
                        rows.push({ id: sub.id, catName: cat.name, subName: sub.name, raw: sub, pName: cat.name })
                      })
                    } else {
                      rows.push({ id: cat.id, catName: cat.name, subName: '—', raw: cat, pName: cat.name })
                    }
                  })

                  const cellInputStyle = {
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 4px',
                    color: t.text,
                    fontSize: 17,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }

                  const formatAttrs = (r) => {
                    const cfg = r.attribute_config || []
                    if (cfg.length === 0) return 'No attributes defined'
                    return cfg.join(' | ')
                  }

                  return rows.map((row, idx) => (
                    <tr key={row.id} style={{
                      borderBottom: `1px solid ${t.border}20`,
                      background: idx % 2 === 0 ? 'transparent' : `${t.bg3}20`,
                      transition: 'background 0.2s'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `${t.bg3}40`}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : `${t.bg3}20`}
                    >
                      <td style={{ padding: '12px 24px', width: '150px' }}>
                        <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{row.catName}</div>
                      </td>
                      <td style={{ padding: '12px 24px', width: '150px' }}>
                        <div style={{ color: row.subName === '—' ? t.text3 : t.text, fontSize: 17, fontWeight: 500 }}>
                          {row.subName}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px' }}>
                        <div style={{
                          padding: '6px 12px',
                          background: `${t.bg3}60`,
                          borderRadius: 8,
                          fontSize: 16,
                          color: t.text2,
                          border: `1px solid ${t.border}40`,
                          display: 'inline-block',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatAttrs(row.raw)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Btn t={t} variant="ghost" size="sm" onClick={() => {
                            const isSub = !!row.raw.category_id
                            setEditTarget(row.raw)
                            setEditForm({
                              category: row.pName,
                              subcategory: isSub ? row.raw.name : '',
                              attribute_config: row.raw.attribute_config || ['Size', 'Color', 'Material', 'Length'],
                              custom_attributes: row.raw.custom_attributes || {}
                            })
                          }} style={{ border: `1px solid ${t.border}`, padding: '6px 8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </Btn>
                          <Btn t={t} variant="danger" size="sm" onClick={() => setDeleteTarget(row.raw)} style={{ padding: '6px 8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showAdd && (
        <Modal t={t} title="Add Category Entry" onClose={() => setShowAdd(false)}>
          <CategoryForm
            f={addForm}
            onChange={setAddForm}
            t={t}
            allCats={allCats}
            attributes={allAttrs}
            setAllAttrs={setAllAttrs}
            submitting={submitting}
            handleSave={handleSave}
            setShowAdd={setShowAdd}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal t={t} title={`Edit ${editTarget.category_id ? 'Subcategory' : 'Category'}`} onClose={() => setEditTarget(null)}>
          <CategoryForm
            f={editForm}
            onChange={setEditForm}
            isEdit
            target={editTarget}
            t={t}
            allCats={allCats}
            attributes={allAttrs}
            setAllAttrs={setAllAttrs}
            submitting={submitting}
            handleSave={handleSave}
            setEditTarget={setEditTarget}
          />
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal t={t} title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div style={{ fontSize: 18, color: t.text, marginBottom: 16 }}>Delete <strong>{deleteTarget.name}</strong>? {!deleteTarget.category_id && "This will delete all subcategories too."}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn t={t} variant="ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn t={t} variant="danger" onClick={confirmDelete} style={{ flex: 1 }}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CategoryManagement
