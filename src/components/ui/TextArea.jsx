import { THEMES } from '@/lib/theme'

export const TextArea = ({ label, value, onChange, placeholder, t, required, note, readOnly, rows = 3, ...props }) => {
  const theme = t || THEMES.light
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ 
          fontSize: 11, 
          color: theme.text3, 
          fontWeight: 800, 
          textTransform: "uppercase", 
          letterSpacing: 0.7 
        }}>
          {label}{required && <span style={{ color: theme.red }}> *</span>}
        </label>
      )}
      <textarea 
        value={value} 
        onChange={onChange ? e => onChange(e.target.value) : undefined} 
        placeholder={placeholder} 
        readOnly={readOnly}
        rows={rows}
        {...props}
        style={{ 
          background: readOnly ? theme.bg4 : theme.input, 
          border: `1px solid ${theme.border}`, 
          borderRadius: 9, 
          padding: "12px 14px", 
          color: theme.text, 
          fontSize: 13, 
          outline: "none", 
          width: "100%", 
          boxSizing: "border-box", 
          fontFamily: "inherit",
          resize: "vertical",
          minHeight: 80
        }} 
      />
      {note && <span style={{ fontSize: 11, color: theme.text4 }}>{note}</span>}
    </div>
  )
}
