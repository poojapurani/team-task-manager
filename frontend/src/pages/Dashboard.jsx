import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ListTodo,
  FolderKanban,
  BarChart3,
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setRecentTasks(Array.isArray(tasksRes.data) ? tasksRes.data.slice(0, 5) : []);
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };
    fetchDashboardData();
  }, []);

  const isAdmin = user?.role === 'Admin';

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name} 👋</h2>
          <p className="text-slate-500">
            {isAdmin ? "Here's an overview of all projects and tasks." : "Here's what's happening with your assigned work."}
          </p>
        </div>
        {isAdmin && (
          <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => setLocation('/projects')}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Total Tasks
              <ListTodo className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              In Progress
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {stats?.statusBreakdown?.find((s) => s.status === 'In Progress')?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Completed
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {stats?.statusBreakdown?.find((s) => s.status === 'Completed')?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Overdue
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats?.overdue || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card className="bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" /> Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{project.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        project.status === 'Active' ? 'bg-green-100 text-green-700' :
                        project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{project.status}</span>
                      <span className="text-xs text-slate-500">{project.progress || 0}%</span>
                    </div>
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
                  <p className="text-[11px] text-slate-400">{project.completedTasks || 0}/{project.totalTasks || 0} tasks completed</p>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => setLocation('/projects')}>View All Projects</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No tasks yet. Create a project and start adding tasks!</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {task.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{task.title}</h4>
                      <p className="text-sm text-slate-500">
                        {task.project?.name || 'No Project'}
                        {task.assignees && task.assignees.length > 0 ? ` · ${task.assignees.map(a => a.name).join(', ')}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">{task.dueDate || '—'}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentTasks.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setLocation('/tasks')}>View All Tasks</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
