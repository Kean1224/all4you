'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminAuthWrapper from '../../../components/AdminAuthWrapper'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  address: string
  city: string
  postalCode: string
  status: 'pending' | 'approved' | 'rejected'
  ficaStatus: 'pending' | 'approved' | 'rejected'
  emailVerified: boolean
  ficaApproved: boolean
  isActive: boolean
  createdAt: string
  documents?: {
    idDocument?: string
    proofOfAddress?: string
    bankStatement?: string
  }
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingDocs, setViewingDocs] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_jwt')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_jwt')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        await fetchUsers(); // Refresh the list
        setSelectedUser(null);
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'pending':
        return !user.ficaApproved && user.emailVerified;
      case 'approved':
        return user.ficaApproved && user.isActive;
      case 'blocked':
        return !user.isActive;
      default:
        return true;
    }
  });

  const getStatusBadge = (user: User) => {
    if (!user.emailVerified) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Email Pending</span>;
    }
    if (!user.ficaApproved) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">FICA Pending</span>;
    }
    if (!user.isActive) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Blocked</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>;
  };

  if (loading) {
    return (
      <AdminAuthWrapper>
        <div className="p-6">
          <div className="text-center">Loading users...</div>
        </div>
      </AdminAuthWrapper>
    );
  }

  return (
    <AdminAuthWrapper>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user registrations, FICA approvals, and account status</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Users', count: users.length },
            { key: 'pending', label: 'FICA Pending', count: users.filter(u => !u.ficaApproved && u.emailVerified).length },
            { key: 'approved', label: 'Approved', count: users.filter(u => u.ficaApproved && u.isActive).length },
            { key: 'blocked', label: 'Blocked', count: users.filter(u => !u.isActive).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Review
                    </button>
                    {user.documents?.idDocument && user.documents?.proofOfAddress && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setViewingDocs(true);
                        }}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                      >
                        View Docs
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No users found for the selected filter.</div>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {viewingDocs ? 'FICA Documents' : 'User Details'}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setViewingDocs(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {viewingDocs ? (
                  <div className="space-y-6">
                    {/* ID Document */}
                    {selectedUser.idDocument && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">ID Document</h3>
                        <div className="border rounded-lg p-4">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/fica/${selectedUser.idDocument}`}
                            alt="ID Document"
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-center py-8 text-gray-500">
                            <p>📄 {selectedUser.idDocument}</p>
                            <p className="text-sm">Click to download if image fails to load</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ID Document */}
                    {selectedUser.documents?.idDocument && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">ID Document</h3>
                        <div className="border rounded-lg p-4">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/fica/${selectedUser.documents.idDocument}`}
                            alt="ID Document"
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="hidden text-center py-8 text-gray-500">
                            <p>📄 {selectedUser.documents.idDocument}</p>
                            <p className="text-sm">Click to download if image fails to load</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Proof of Address */}
                    {selectedUser.documents?.proofOfAddress && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Proof of Address</h3>
                        <div className="border rounded-lg p-4">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/fica/${selectedUser.documents.proofOfAddress}`}
                            alt="Proof of Address"
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="hidden text-center py-8 text-gray-500">
                            <p>📄 {selectedUser.documents.proofOfAddress}</p>
                            <p className="text-sm">Click to download if image fails to load</p>
                          </div>
                        </div>
                      </div>
                    )}
                        <div className="text-sm text-gray-900">{selectedUser.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cell Phone</label>
                        <div className="text-sm text-gray-900">{selectedUser.cell}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${selectedUser.emailVerified ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                          <span className="text-sm">Email Verified</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${selectedUser.ficaApproved ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                          <span className="text-sm">FICA Approved</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${selectedUser.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          <span className="text-sm">Account Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Available */}
                    {(selectedUser.idDocument || selectedUser.proofOfAddress) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">FICA Documents</label>
                        <div className="space-y-1">
                          {selectedUser.idDocument && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>📄</span>
                              <span>ID Document: {selectedUser.idDocument}</span>
                            </div>
                          )}
                          {selectedUser.proofOfAddress && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>🏠</span>
                              <span>Proof of Address: {selectedUser.proofOfAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {!selectedUser.ficaApproved && selectedUser.emailVerified && (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, { ficaApproved: true, isActive: true })}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          ✅ Approve FICA & Activate
                        </button>
                      )}
                      
                      {selectedUser.isActive ? (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, { isActive: false })}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          🚫 Block User
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, { isActive: true })}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          ✅ Unblock User
                        </button>
                      )}
                      
                      {(selectedUser.idDocument || selectedUser.proofOfAddress) && (
                        <button
                          onClick={() => setViewingDocs(true)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          📄 View Documents
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthWrapper>
  );
}
