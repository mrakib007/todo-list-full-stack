import { useState, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import { Edit2, Check, X } from 'lucide-react'

export default function EditableNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || '')
  const inputRef = useRef(null)
  const { setNodes } = useReactFlow()

  useEffect(() => {
    setLabel(data.label || '')
  }, [data.label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (label.trim()) {
      // Update the node using ReactFlow's setNodes
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, label: label.trim() } }
            : node
        )
      )
      setIsEditing(false)
    }
  }

  const handleInputBlur = (e) => {
    // Reset border before saving
    e.target.style.border = '1px solid #d1d5db'
    handleSave()
  }

  const handleCancel = () => {
    setLabel(data.label || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <div
      className="react-flow__node-default group"
      onDoubleClick={handleDoubleClick}
      style={{
        borderColor: isEditing ? '#6366f1' : selected ? '#1a192b' : undefined,
        borderWidth: isEditing ? '2px' : undefined,
        padding: isEditing ? '8px' : undefined,
        minWidth: isEditing ? '180px' : undefined,
        maxWidth: isEditing ? '250px' : undefined,
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      {isEditing ? (
        <div 
          className="flex items-center gap-1" 
          style={{ 
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-xs rounded"
            style={{ 
              textAlign: 'center', 
              fontSize: '12px',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              border: '1px solid #d1d5db',
              outline: 'none',
              boxShadow: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => {
              e.target.style.border = '1px solid #6366f1'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors flex-shrink-0"
            style={{ flexShrink: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
            style={{ flexShrink: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="react-flow__node-label" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {label || 'Untitled'}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all bg-white shadow-sm"
            title="Double-click or click to edit"
            style={{ zIndex: 10 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

