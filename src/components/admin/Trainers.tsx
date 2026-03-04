import React, { useState } from 'react';
import { Search, Edit2, Mail, BookOpen, Calendar as CalendarIcon, Clock, Plus, Users } from 'lucide-react';

const initialTrainers = [
  { id: 1, name: 'Dr. John Doe', email: 'john.doe@indobismar.com', courses: 3, status: 'Active' },
  { id: 2, name: 'Jane Smith, M.Kom', email: 'jane.smith@indobismar.com', courses: 2, status: 'Active' },
  { id: 3, name: 'Alan Turing', email: 'alan@indobismar.com', courses: 1, status: 'On Leave' },
  { id: 4, name: 'Grace Hopper', email: 'grace@indobismar.com', courses: 4, status: 'Active' },
];

const initialSchedules = [
  { id: 1, trainerId: 1, trainerName: 'Dr. John Doe', course: 'Laravel Basics', date: '2023-10-25', time: '09:00 - 11:00', room: 'Lab A', type: 'Online' },
  { id: 2, trainerId: 1, trainerName: 'Dr. John Doe', course: 'Advanced PHP', date: '2023-10-26', time: '13:00 - 15:00', room: 'Room 302', type: 'Offline' },
  { id: 3, trainerId: 2, trainerName: 'Jane Smith, M.Kom', course: 'UI Design Principles', date: '2023-10-25', time: '10:00 - 12:00', room: 'Design Studio', type: 'Offline' },
  { id: 4, trainerId: 4, trainerName: 'Grace Hopper', course: 'Database Design', date: '2023-10-27', time: '14:00 - 16:00', room: 'Lab B', type: 'Online' },
];

export function Trainers() {
  const [activeTab, setActiveTab] = useState<'list' | 'schedule'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Trainer List
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Schedules
          </button>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={activeTab === 'list' ? "Search trainers..." : "Search schedules..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'schedule' && (
            <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Schedule</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialTrainers.map((trainer) => (
            <div key={trainer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">
                    {trainer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  trainer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {trainer.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{trainer.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{trainer.email}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1 text-indigo-500" />
                  <span>{trainer.courses} Courses</span>
                </div>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                  title="View Schedule"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Location/Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {initialSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-bold text-xs">
                            {schedule.trainerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{schedule.trainerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{schedule.course}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-900">{schedule.room}</span>
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${
                          schedule.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {schedule.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
