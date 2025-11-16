import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useGetMindMapByIdQuery, useCreateMindMapMutation, useUpdateMindMapMutation } from '../store/api/mindMapApi'
import { Save, X, Plus, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import EditableNode from '../components/mindmap/EditableNode'

// Register custom node type
const nodeTypes = {
  editable: EditableNode,
}

const initialNodes = [
  {
    id: '1',
    type: 'editable',
    data: { label: 'Start Here' },
    position: { x: 250, y: 100 },
  },
]

const initialEdges = []

export default function MindMapEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  
  const { data: mindMapData, isLoading: isLoadingExisting } = useGetMindMapByIdQuery(id, {
    skip: isNew,
  })
  
  const [createMindMap, { isLoading: isCreating }] = useCreateMindMapMutation()
  const [updateMindMap, { isLoading: isUpdating }] = useUpdateMindMapMutation()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Load existing mind map data
  useEffect(() => {
    if (!isNew && mindMapData?.data) {
      const mindMap = mindMapData.data
      setTitle(mindMap.title || '')
      setDescription(mindMap.description || '')
      
      if (mindMap.data?.nodes && mindMap.data.nodes.length > 0) {
        // Ensure all nodes have the editable type
        const nodesWithType = mindMap.data.nodes.map((node) => ({
          ...node,
          type: 'editable', // Force all nodes to be editable
        }))
        setNodes(nodesWithType)
      } else {
        // If no nodes exist, use initial node
        setNodes(initialNodes)
      }
      if (mindMap.data?.edges && mindMap.data.edges.length > 0) {
        setEdges(mindMap.data.edges)
      } else {
        setEdges(initialEdges)
      }
    }
  }, [mindMapData, isNew, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'editable',
      data: { label: 'New Node' },
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 500 + 100,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleDeleteSelected = () => {
    const selectedNodes = nodes.filter((node) => node.selected)
    const selectedNodeIds = selectedNodes.map((node) => node.id)
    
    if (selectedNodeIds.length === 0) {
      toast.error('Please select nodes to delete')
      return
    }

    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)))
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      )
    )
    toast.success('Selected nodes deleted')
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    const mindMapData = {
      title: title.trim(),
      description: description.trim() || null,
      data: {
        nodes: nodes.map(({ id, data, position, type }) => ({
          id,
          data,
          position,
          type,
        })),
        edges: edges.map(({ id, source, target, type, animated, style }) => ({
          id,
          source,
          target,
          type,
          animated,
          style,
        })),
      },
    }

    try {
      if (isNew) {
        await createMindMap(mindMapData).unwrap()
        toast.success('Mind map created successfully')
        navigate('/mindmaps')
      } else {
        await updateMindMap({ id, ...mindMapData }).unwrap()
        toast.success('Mind map saved successfully')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save mind map')
    }
  }

  if (!isNew && isLoadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const isLoading = isCreating || isUpdating

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <button
                onClick={() => navigate('/mindmaps')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mind Map Title"
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNode}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Node
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg">
            <div className="text-xs text-gray-600">
              <div>Nodes: {nodes.length}</div>
              <div>Connections: {edges.length}</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}

