'use client';

import { fetchAPI } from '@/lib/api';
import { Search, Shield, Store, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GlobalUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchAPI('/super-admin/users');
        if (data.users) setUsers(data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Global User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all {users.length} users across the entire platform.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Store</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No users found.</td>
                </tr>
              ) : filteredUsers.map((user: any) => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white capitalize">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'super_admin' ? (
                        <Shield className="w-4 h-4 text-rose-500" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`text-xs font-bold uppercase ${user.role === 'super_admin' ? 'text-rose-500' :
                        user.role === 'admin' ? 'text-indigo-500' : 'text-slate-500'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.tenantId ? (
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
                        <Store className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{user.tenantId.storeName}</span>
                        <span className="text-xs text-slate-500">({user.tenantId.subdomain})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Platform Level</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase">
                      {user.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
