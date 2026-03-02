// script.js
let todos = []
let currentFilter = 'all'
let searchTerm = ''
let editingId = null

// Pagination
let currentPage = 1
const TASKS_PER_PAGE = 12

function loadTodos() {
    const saved = localStorage.getItem('taskflow_todos')
    todos = saved ? JSON.parse(saved) : [
        { id: '1', text: 'Finish project documentation and prepare slides for Monday meeting', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '2', text: 'Review pull requests from team members', completed: true, date: new Date().toISOString().slice(0,10) },
        { id: '3', text: 'Plan next sprint and backlog grooming', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '4', text: 'Organize team retro', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '5', text: 'Update project roadmap', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '6', text: 'Refactor authentication module', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '7', text: 'Write unit tests for billing', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '8', text: 'Prepare release notes', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '9', text: 'Fix UI bugs reported by QA', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '10', text: 'Migrate database to new cluster', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '11', text: 'Conduct security audit', completed: false, date: new Date().toISOString().slice(0,10) },
        { id: '12', text: 'Finalize vendor contracts', completed: false, date: new Date().toISOString().slice(0,10) },
    ]
}

function saveTodos() {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos))
}

function getFilteredTodos() {
    return todos.filter(t => {
        const matches = t.text.toLowerCase().includes(searchTerm.toLowerCase())
        if (currentFilter === 'pending') return matches && !t.completed
        if (currentFilter === 'completed') return matches && t.completed
        return matches
    })
}

function render() {
    const filtered = getFilteredTodos()

    // Stats (always from full list)
    const total = todos.length
    const done = todos.filter(t => t.completed).length
    const progress = total ? Math.round((done / total) * 100) : 0

    document.getElementById('progress-bar').style.width = `${progress}%`
    document.getElementById('progress-text').textContent = `${progress}%`

    document.getElementById('count-all').textContent = total
    document.getElementById('count-pending').textContent = todos.filter(t => !t.completed).length
    document.getElementById('count-completed').textContent = done
    document.getElementById('total-tasks').textContent = total

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / TASKS_PER_PAGE) || 1
    currentPage = Math.min(currentPage, totalPages)
    currentPage = Math.max(currentPage, 1)

    const start = (currentPage - 1) * TASKS_PER_PAGE
    const end = start + TASKS_PER_PAGE
    const pageItems = filtered.slice(start, end)

    const list = document.getElementById('todo-list')
    const empty = document.getElementById('empty-state')
    const pagination = document.getElementById('pagination')
    const pageInfo = document.getElementById('page-info')

    if (filtered.length === 0) {
        list.innerHTML = ''
        empty.classList.remove('hidden')
        pagination.classList.add('hidden')
        return
    }

    empty.classList.add('hidden')
    pagination.classList.remove('hidden')

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`

    document.querySelector('#pagination button:first-child').disabled = currentPage === 1
    document.querySelector('#pagination button:last-child').disabled = currentPage === totalPages

    let html = ''
    pageItems.forEach(todo => {
        const displayText = todo.text.length > 40 
            ? todo.text.substring(0, 40) + '…' 
            : todo.text

        const formattedDate = todo.date ? new Date(todo.date).toLocaleDateString() : ''

        html += `
            <div class="todo-card bg-zinc-900 rounded-3xl p-2 flex gap-2 group border border-zinc-800" data-id="${todo.id}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''}
                       class="w-4 h-4 mt-0.5 accent-emerald-500 bg-zinc-800 border-zinc-700 rounded cursor-pointer">
                <div class="flex-1 min-w-0">
                    <p class="text-xs leading-tight truncate ${todo.completed ? 'line-through text-zinc-400' : ''}">
                        ${displayText}
                    </p>
                    ${formattedDate ? `<div class="text-zinc-500 text-[11px] mt-1">${formattedDate}</div>` : ''}
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onclick="editTask('${todo.id}');event.stopPropagation()" class="text-base hover:scale-110 transition">✏️</button>
                    <button onclick="deleteTask('${todo.id}');event.stopPropagation()" class="text-base hover:scale-110 transition">🗑</button>
                </div>
            </div>
        `
    })
    list.innerHTML = html

    // Checkbox listeners
    document.querySelectorAll('#todo-list input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = this.closest('.todo-card').dataset.id
            const todo = todos.find(t => t.id === id)
            if (todo) {
                todo.completed = this.checked
                saveTodos()
                render()
            }
        })
    })
}

function changePage(page) {
    currentPage = page
    render()
}

function switchFilter(filter) {
    currentFilter = filter
    currentPage = 1
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
    document.getElementById(`nav-${filter}`).classList.add('active')
    
    const titles = { all: 'Dashboard', pending: 'Pending Tasks', completed: 'Completed Tasks' }
    document.getElementById('view-title').textContent = titles[filter]
    
    render()
}

function openAddModal() {
    editingId = null
    document.getElementById('modal-title').textContent = 'New Task'
    document.getElementById('modal-input').value = ''
    document.getElementById('modal-date').value = ''
    document.getElementById('task-modal').classList.remove('hidden')
    setTimeout(() => document.getElementById('modal-input').focus(), 80)
}

function editTask(id) {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    editingId = id
    document.getElementById('modal-title').textContent = 'Edit Task'
    document.getElementById('modal-input').value = todo.text
    document.getElementById('modal-date').value = todo.date || ''
    document.getElementById('task-modal').classList.remove('hidden')
    setTimeout(() => document.getElementById('modal-input').focus(), 80)
}

function saveTask() {
    const text = document.getElementById('modal-input').value.trim()
    const date = document.getElementById('modal-date').value
    if (!text) {
        alert('Task cannot be empty')
        return
    }

    const duplicate = todos.some(t => t.text.trim().toLowerCase() === text.toLowerCase() && t.id !== editingId)
    if (duplicate) {
        alert('A task with the same text already exists')
        return
    }

    if (editingId) {
        const todo = todos.find(t => t.id === editingId)
        if (todo) {
            todo.text = text
            todo.date = date || null
        }
    } else {
        todos.unshift({ id: Date.now().toString(36), text, completed: false, date: date || null })
    }

    saveTodos()
    closeModal()
    render()
}

function closeModal() {
    document.getElementById('task-modal').classList.add('hidden')
}

function deleteTask(id) {
    if (!confirm('Delete task?')) return
    todos = todos.filter(t => t.id !== id)
    saveTodos()
    render()
}

function setupSearch() {
    document.getElementById('search-input').addEventListener('input', e => {
        searchTerm = e.target.value
        currentPage = 1
        render()
    })
}

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault()
            document.getElementById('search-input').focus()
        }
        if (e.key === 'Escape' && !document.getElementById('task-modal').classList.contains('hidden')) {
            closeModal()
        }
    })
}

function init() {
    loadTodos()
    document.getElementById('nav-all').classList.add('active')
    render()
    setupSearch()
    setupKeyboard()
}

window.onload = init