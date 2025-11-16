import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetMindMapsQuery, useDeleteMindMapMutation } from '../store/api/mindMapApi'
import { Plus, Trash2, Edit, Brain, Search, Loader2, GitBranch, Calendar, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MindMaps() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error } = useGetMindMapsQuery(searchQuery)
  const [deleteMindMap, { isLoading: isDeleting }] = useDeleteMindMapMutation()

  const mindMaps = data?.data || []

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this mind map?')) {
      try {
        await deleteMindMap(id).unwrap()
        toast.success('Mind map deleted successfully')
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete mind map')
      }
    }
  }

  const handleCreate = () => {
    navigate('/mindmaps/new')
  }

  const handleEdit = (id) => {
    navigate(`/mindmaps/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary-600" />
              Mind Maps
            </h1>
            <p className="mt-2 text-gray-600">Visualize and organize your ideas</p>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Mind Map
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mind maps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              {error?.data?.message || 'Failed to load mind maps'}
            </p>
          </div>
        )}

        {/* Mind Maps Grid */}
        {!isLoading && !error && (
          <>
            {mindMaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mindMaps.map((mindMap, index) => {
                  const nodeCount = mindMap.data?.nodes?.length || 0
                  const edgeCount = mindMap.data?.edges?.length || 0
                  const isComplex = nodeCount > 5 || edgeCount > 3
                  
                  // Color gradients for variety
                  const gradients = [
                    'from-blue-500 to-purple-600',
                    'from-pink-500 to-rose-600',
                    'from-green-500 to-emerald-600',
                    'from-orange-500 to-amber-600',
                    'from-indigo-500 to-blue-600',
                    'from-teal-500 to-cyan-600',
                  ]
                  const gradient = gradients[index % gradients.length]
                  
                  // Generate a simple visual preview
                  const previewNodes = mindMap.data?.nodes?.slice(0, 5) || []
                  const previewEdges = mindMap.data?.edges?.slice(0, 4) || []
                  
                  return (
                    <div
                      key={mindMap.id}
                      onClick={() => handleEdit(mindMap.id)}
                      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-primary-300 transform hover:-translate-y-1"
                    >
                      {/* Gradient Header */}
                      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Brain className="h-4 w-4 text-white" />
                            <span className="text-white text-xs font-medium">Mind Map</span>
                          </div>
                          {isComplex && (
                            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Mini Preview Visualization */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 h-16 flex items-center justify-center">
                            {previewNodes.length > 0 ? (
                              <div className="relative w-full h-full">
                                {/* Simple node representation */}
                                {previewNodes.map((node, i) => {
                                  const x = 20 + (i % 3) * 30
                                  const y = 20 + Math.floor(i / 3) * 25
                                  return (
                                    <div
                                      key={i}
                                      className="absolute w-2 h-2 bg-white rounded-full"
                                      style={{ left: `${x}%`, top: `${y}%` }}
                                    />
                                  )
                                })}
                                {/* Simple edge representation */}
                                {previewEdges.slice(0, 2).map((edge, i) => (
                                  <div
                                    key={i}
                                    className="absolute h-0.5 bg-white/50"
                                    style={{
                                      left: '25%',
                                      top: `${30 + i * 20}%`,
                                      width: '30%',
                                      transform: `rotate(${i * 15}deg)`,
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-white/60 text-xs">Empty mind map</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {mindMap.title}
                            </h3>
                            {mindMap.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {mindMap.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">{nodeCount}</span>
                            <span className="text-gray-500">nodes</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <GitBranch className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-medium">{edgeCount}</span>
                            <span className="text-gray-500">connections</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(mindMap.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: new Date(mindMap.updated_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(mindMap.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(mindMap.id, e)}
                              disabled={isDeleting}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/0 transition-all duration-300 pointer-events-none rounded-xl"></div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-lg">
                    <Brain className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No mind maps match your search' : 'No mind maps yet'}
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  {searchQuery ? (
                    <>
                      We couldn't find any mind maps matching <span className="font-medium">"{searchQuery}"</span>
                      <br />
                      Try adjusting your search terms
                    </>
                  ) : (
                    'Get started by creating your first mind map. Visualize your ideas and organize your thoughts!'
                  )}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Mind Map
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

