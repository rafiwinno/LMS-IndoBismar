import React, { useState } from 'react';
import { Search, Eye, Filter, Mail, Phone, MapPin, BookOpen, TrendingUp } from 'lucide-react';

const initialParticipants = [
  { 
    id: 1, 
    name: 'Budi Santoso', 
    email: 'budi.santoso@example.com', 
    phone: '+62 812-3456-7890',
    school: 'SMKN 1 Surabaya',
    enrolledCourses: 3, 
    progress: 85,
    status: 'Active',
    joinDate: 'Oct 01, 2023'
  },
  { 
    id: 2, 
    name: 'Siti Aminah', 
    email: 'siti.aminah@example.com', 
    phone: '+62 813-4567-8901',
    school: 'SMKN 2 Surabaya',
    enrolledCourses: 2, 
    progress: 60,
    status: 'Active',
    joinDate: 'Oct 05, 2023'
  },
  { 
    id: 3, 
    name: 'Ahmad Faisal', 
    email: 'ahmad.faisal@example.com', 
    phone: '+62 857-5678-9012',
    school: 'SMK Telkom Malang',
    enrolledCourses: 4, 
    progress: 92,
    status: 'Active',
    joinDate: 'Sep 28, 2023'
  },
  { 
    id: 4, 
    name: 'Dewi Lestari', 
    email: 'dewi.lestari@example.com', 
    phone: '+62 819-6789-0123',
    school: 'SMKN 1 Sidoarjo',
    enrolledCourses: 1, 
    progress: 20,
    status: 'Inactive',
    joinDate: 'Nov 02, 2023'
  },
];

export function Participants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search participants by name, email, or school..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Participant Info</th>
                  <th className="px-6 py-4">Contact & School</th>
                  <th className="px-6 py-4">Learning Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {initialParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-bold text-sm">
                            {participant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500">Joined {participant.joinDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {participant.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {participant.school}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2 w-full max-w-[200px]">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-700">{participant.enrolledCourses} Courses</span>
                          <span className="font-medium text-indigo-600">{participant.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${participant.progress >= 80 ? 'bg-green-500' : participant.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${participant.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        participant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing 1 to 4 of 124 participants</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialParticipants.map((participant) => (
            <div key={participant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">
                    {participant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  participant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {participant.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{participant.name}</h3>
              <p className="text-xs text-gray-500 mb-4 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {participant.school}
              </p>
              
              <div className="space-y-2 mb-5">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{participant.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{participant.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" />
                    <span>{participant.enrolledCourses} Courses</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-green-500" />
                    <span className="font-medium">{participant.progress}%</span>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${participant.progress >= 80 ? 'bg-green-500' : participant.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${participant.progress}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full mt-5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>View Full Profile</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
