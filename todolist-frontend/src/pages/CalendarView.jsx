import { useState, useMemo, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useGetTasksQuery } from '../store/api/taskApi'
import TaskForm from '../components/tasks/TaskForm'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import './CalendarView.css'

export default function CalendarView() {
  const calendarRef = useRef(null)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateTitle, setDateTitle] = useState('')

  // Fetch all tasks
  const { data: tasksData, isLoading } = useGetTasksQuery({})
  const tasks = tasksData?.data || []

  // Convert tasks to FullCalendar events
  const events = useMemo(() => {
    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const dueDate = new Date(task.due_date)
        const isAllDay = dueDate.getHours() === 0 && dueDate.getMinutes() === 0
        
        // Determine event color based on priority and status
        let backgroundColor = '#3b82f6' // default blue
        let borderColor = '#2563eb'
        let textColor = '#ffffff'
        
        if (task.status === 'completed') {
          backgroundColor = '#10b981' // green
          borderColor = '#059669'
        } else if (task.status === 'cancelled') {
          backgroundColor = '#9ca3af' // gray
          borderColor = '#6b7280'
        } else {
          switch (task.priority) {
            case 'urgent':
              backgroundColor = '#ef4444' // red
              borderColor = '#dc2626'
              break
            case 'high':
              backgroundColor = '#f97316' // orange
              borderColor = '#ea580c'
              break
            case 'medium':
              backgroundColor = '#eab308' // yellow
              borderColor = '#ca8a04'
              textColor = '#000000'
              break
            case 'low':
              backgroundColor = '#3b82f6' // blue
              borderColor = '#2563eb'
              break
            default:
              backgroundColor = '#3b82f6'
              borderColor = '#2563eb'
          }
        }

        return {
          id: task.id.toString(),
          title: task.title,
          start: dueDate,
          allDay: isAllDay,
          backgroundColor,
          borderColor,
          textColor,
          extendedProps: {
            task,
          },
        }
      })
  }, [tasks])

  const formatDateForInput = (date, setTimeToStartOfDay = false) => {
    const dateToFormat = setTimeToStartOfDay 
      ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0)
      : date
    const year = dateToFormat.getFullYear()
    const month = String(dateToFormat.getMonth() + 1).padStart(2, '0')
    const day = String(dateToFormat.getDate()).padStart(2, '0')
    const hours = String(dateToFormat.getHours()).padStart(2, '0')
    const minutes = String(dateToFormat.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Handle date click
  const handleDateClick = (arg) => {
    setSelectedDate(arg.date)
    // FullCalendar provides the date, ensure we use local time
    // Create a new date object using local time components to avoid timezone issues
    const localDate = new Date(
      arg.date.getFullYear(),
      arg.date.getMonth(),
      arg.date.getDate(),
      0, // hours - set to start of day
      0  // minutes
    )
    const dateStr = formatDateForInput(localDate, false)
    setEditingTask({ due_date: dateStr })
    setShowTaskForm(true)
  }

  // Handle event click
  const handleEventClick = (clickInfo) => {
    setEditingTask(clickInfo.event.extendedProps.task)
    setShowTaskForm(true)
  }

  // Handle view change
  const handleViewChange = (viewType) => {
    setCurrentView(viewType)
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(viewType)
      setTimeout(updateDateTitle, 100)
    }
  }

  // Navigate calendar
  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev()
      setTimeout(updateDateTitle, 100)
    }
  }

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next()
      setTimeout(updateDateTitle, 100)
    }
  }

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today()
      setTimeout(updateDateTitle, 100)
    }
  }

  // Handle create new task
  const handleCreateTask = () => {
    const dateStr = formatDateForInput(selectedDate)
    setEditingTask({ due_date: dateStr })
    setShowTaskForm(true)
  }

  // Handle close form
  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  // Update date title when view changes
  const updateDateTitle = () => {
    if (calendarRef.current) {
      try {
        const calendarApi = calendarRef.current.getApi()
        const view = calendarApi.view
        const start = view.activeStart
        const end = view.activeEnd
        
        if (currentView === 'dayGridMonth') {
          setDateTitle(start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
        } else if (currentView === 'timeGridWeek' || currentView === 'dayGridWeek') {
          const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
          const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
          if (startMonth === endMonth) {
            setDateTitle(`${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`)
          } else {
            setDateTitle(`${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`)
          }
        } else if (currentView === 'timeGridDay') {
          setDateTitle(start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
        } else if (currentView === 'listWeek' || currentView === 'listMonth') {
          setDateTitle(start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
        } else {
          setDateTitle(start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
        }
      } catch (error) {
        setDateTitle(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary-600" />
              Calendar View
            </h1>
            <p className="mt-2 text-gray-600">View and manage your tasks by date</p>
          </div>
          <button
            onClick={handleCreateTask}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>

        {/* Calendar Container */}
        <div className="card p-0 overflow-hidden">
          {/* Custom Navigation Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Next"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Today
              </button>
              <h2 className="text-xl font-semibold text-gray-900 ml-4">
                {dateTitle || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            {/* View Type Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('dayGridMonth')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  currentView === 'dayGridMonth'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleViewChange('timeGridWeek')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  currentView === 'timeGridWeek'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleViewChange('timeGridDay')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  currentView === 'timeGridDay'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => handleViewChange('listWeek')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  currentView === 'listWeek' || currentView === 'listMonth'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* FullCalendar */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short',
                }}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                weekends={true}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayHeaderFormat={{ weekday: 'short' }}
                firstDay={0}
                datesSet={updateDateTitle}
                viewDidMount={updateDateTitle}
                views={{
                  dayGridMonth: {
                    dayMaxEvents: 3,
                    moreLinkClick: 'popover',
                  },
                  timeGridWeek: {
                    slotMinTime: '00:00:00',
                    slotMaxTime: '24:00:00',
                  },
                  timeGridDay: {
                    slotMinTime: '00:00:00',
                    slotMaxTime: '24:00:00',
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm task={editingTask} onClose={handleCloseForm} />
        )}
      </div>
    </div>
  )
}
