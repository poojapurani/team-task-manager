import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  FolderKanban,
  Trash2,
  Edit,
  X,
  Users,
  UserPlus,
  UserMinus,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
  const [error, setError] = useState('');
  const [managingMembers, setManagingMembers] = useState(null); // project id
  const [addMemberId, setAddMemberId] = useState('');
  const [memberError, setMemberError] = useState('');

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
      setAllUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', status: 'Active' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project', err);
    }
  };

  const startEdit = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status });
    setShowForm(true);
  };

  const handleAddMember = async (projectId) => {
    if (!addMemberId) return;
    setMemberError('');
    try {
      await api.post(`/projects/${projectId}/members`, { userId: parseInt(addMemberId) });
      setAddMemberId('');
      fetchProjects();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchProjects();
    } catch (err) {
      console.error('Error removing member', err);
    }
  };

  const isAdmin = user?.role === 'Admin';
  const statusColors = {
    'Active': 'bg-green-100 text-green-700',
    'Completed': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-yellow-100 text-yellow-700',
  };

  const getAvailableUsers = (project) => {
    const memberIds = (project.members || []).map(m => m.id);
    return allUsers.filter(u => !memberIds.includes(u.id));
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-500">
            {isAdmin ? 'Manage projects and team members' : 'Your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-accent text-primary hover:bg-accent/90"
            onClick={() => { setShowForm(!showForm); setEditingProject(null); setFormData({ name: '', description: '', status: 'Active' }); }}
          >
            {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Project</>}
          </Button>
        )}
      </header>

      {/* Create/Edit Form */}
      {showForm && isAdmin && (
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="My Project" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe this project..." />
              </div>
              <Button type="submit" className="bg-primary">{editingProject ? 'Save Changes' : 'Create Project'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-500">No projects yet</h3>
          <p className="text-slate-400">{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any project yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.createdBy?.name ? `Created by: ${project.createdBy.name}` : ''}</CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || 'bg-slate-100'}`}>{project.status}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'No description provided.'}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Progress</span>
                    <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks • {project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress || 0}%`,
                        background: project.progress === 100 ? '#22c55e' : project.progress > 50 ? '#4EDBD0' : '#004B5F',
                      }}
                    />
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Members ({(project.members || []).length})
                    </span>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => setManagingMembers(managingMembers === project.id ? null : project.id)}
                      >
                        {managingMembers === project.id ? 'Done' : 'Manage'}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(project.members || []).map((member) => (
                      <span key={member.id} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                        {member.name}
                        <span className="text-[10px] text-slate-400">({member.role})</span>
                        {isAdmin && managingMembers === project.id && (
                          <button
                            onClick={() => handleRemoveMember(project.id, member.id)}
                            className="ml-1 text-red-400 hover:text-red-600"
                            title="Remove member"
                          >
                            <UserMinus className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Member (Admin only) */}
                  {isAdmin && managingMembers === project.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={addMemberId}
                        onChange={(e) => setAddMemberId(e.target.value)}
                        className="flex-1 h-8 text-xs rounded-md border border-input bg-white px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select user to add...</option>
                        {getAvailableUsers(project).map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                      <Button size="sm" className="h-8 bg-accent text-primary hover:bg-accent/90" onClick={() => handleAddMember(project.id)}>
                        <UserPlus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  )}
                  {memberError && managingMembers === project.id && (
                    <p className="text-xs text-red-500">{memberError}</p>
                  )}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button variant="outline" size="sm" onClick={() => startEdit(project)}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
