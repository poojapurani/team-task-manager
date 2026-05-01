import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  CheckCircle2,
  Clock,
  ListTodo,
  Trash2,
  Edit,
  X,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({ status: '', projectId: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', projectId: '', assigneeIds: []
  });
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.projectId) params.append('projectId', filter.projectId);
      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/active');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  useEffect(() => { fetchTasks(); fetchProjects(); fetchUsers(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...formData };
      if (!data.projectId) delete data.projectId;
      if (!data.dueDate) delete data.dueDate;
      if (data.assigneeIds.length === 0) delete data.assigneeIds;

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
      } else {
        await api.post('/tasks', data);
      }
      setShowForm(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', projectId: '', assigneeIds: [] });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      projectId: task.projectId || '',
      assigneeIds: (task.assignees || []).map(a => String(a.id)),
    });
    setShowForm(true);
  };

  const toggleAssignee = (userId) => {
    const id = String(userId);
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(id)
        ? prev.assigneeIds.filter(aid => aid !== id)
        : [...prev.assigneeIds, id]
    }));
  };

  const isAdmin = user?.role === 'Admin';
  const statusColors = {
    'Todo': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
  };
  const statusIcons = {
    'Todo': <ListTodo className="h-4 w-4" />,
    'In Progress': <Clock className="h-4 w-4" />,
    'Completed': <CheckCircle2 className="h-4 w-4" />,
    'Overdue': <AlertCircle className="h-4 w-4" />,
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
          <p className="text-slate-500">
            {isAdmin ? 'Create, assign and track all tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-accent text-primary hover:bg-accent/90"
            onClick={() => { setShowForm(!showForm); setEditingTask(null); setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', projectId: '', assigneeIds: [] }); }}
          >
            {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Task</>}
          </Button>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={filter.projectId}
          onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Create/Edit Form */}
      {showForm && isAdmin && (
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Task title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <select id="project" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select Project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select id="priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskStatus">Status</Label>
                  <select id="taskStatus" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Multi-select Assignees */}
              <div className="space-y-2">
                <Label>Assign To (select multiple members)</Label>
                <div className="border border-input rounded-md p-3 bg-white max-h-40 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-sm text-slate-400">No users available</p>
                  ) : (
                    <div className="space-y-1">
                      {users.map((u) => (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            formData.assigneeIds.includes(String(u.id))
                              ? 'bg-accent/10 border border-accent/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assigneeIds.includes(String(u.id))}
                            onChange={() => toggleAssignee(u.id)}
                            className="rounded border-slate-300 text-accent focus:ring-accent"
                          />
                          <span className="text-sm font-medium text-slate-700">{u.name}</span>
                          <span className="text-xs text-slate-400">({u.role})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.assigneeIds.length > 0 && (
                  <p className="text-xs text-slate-500">{formData.assigneeIds.length} member(s) selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Task description..." />
              </div>
              <Button type="submit" className="bg-primary">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <ListTodo className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-500">No tasks found</h3>
          <p className="text-slate-400">
            {isAdmin ? 'Create tasks to start tracking your work.' : 'No tasks have been assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                      task.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {statusIcons[task.status] || <Clock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-800 truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                        <span>{task.project?.name || 'No project'}</span>
                        {task.assignees && task.assignees.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.assignees.map(a => a.name).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status] || 'bg-slate-100'}`}>{task.status}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>{task.priority}</span>
                    {task.dueDate && <span className="text-xs text-slate-500">{task.dueDate}</span>}

                    {/* Quick status change */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="h-7 text-xs rounded border border-slate-200 bg-white px-1 focus:outline-none"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(task)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(task.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
