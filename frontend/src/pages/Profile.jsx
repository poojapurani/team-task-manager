import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserCircle,
  Mail,
  Shield,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      } catch (err) {
        console.error('Error fetching profile data', err);
      }
    };
    fetchData();
  }, []);

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');
  const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="bg-white lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UserCircle className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium ${
                user?.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
              }`}>
                <Shield className="h-3 w-3" />
                {user?.role}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{myTasks.length}</div>
                <div className="text-xs text-slate-500">Assigned Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                <div className="text-xs text-slate-500">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Projects ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No projects yet.</p>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{p.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.status === 'Active' ? 'bg-green-100 text-green-700' :
                        p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" /> My Pending Tasks ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <p className="text-slate-400 text-center py-4">All caught up! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="font-medium text-slate-700">{t.title}</span>
                          <span className="text-xs text-slate-400 ml-2">{t.project?.name || ''}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.priority === 'High' ? 'bg-red-100 text-red-700' :
                        t.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
