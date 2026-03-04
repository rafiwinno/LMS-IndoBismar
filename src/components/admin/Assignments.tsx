import React, { useState } from 'react';
import { Search, Eye, CheckCircle, Clock } from 'lucide-react';

const initialAssignments = [
  { id: 1, title: 'Build a REST API', course: 'Laravel Basics', dueDate: 'Oct 20, 2023', submissions: 42, total: 45, status: 'Active' },
  { id: 2, title: 'Wireframe Landing Page', course: 'UI Design Principles', dueDate: 'Oct 22, 2023', submissions: 28, total: 30, status: 'Active' },
  { id: 3, title: 'SEO Audit Report', course: 'Digital Marketing 101', dueDate: 'Oct 15, 2023', submissions: 25, total: 25, status: 'Completed' },
  { id: 4, title: 'React Hooks Exercise', course: 'Advanced React', dueDate: 'Oct 25, 2023', submissions: 10, total: 25, status: 'Active' },
];

export function Assignments() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search assignments..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Assignment Title</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Submissions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{assignment.title}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{assignment.course}</td>
                  <td className="px-6 py-4 text-gray-600">{assignment.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{assignment.submissions}/{assignment.total}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600" 
                          style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {assignment.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{assignment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
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
