import React, { useState } from 'react';
import { Search, Eye, Award } from 'lucide-react';

const initialExams = [
  { id: 1, title: 'Laravel Midterm Exam', course: 'Laravel Basics', date: 'Oct 10, 2023', participants: 45, avgScore: 82.5 },
  { id: 2, title: 'UI Design Final', course: 'UI Design Principles', date: 'Oct 12, 2023', participants: 30, avgScore: 78.0 },
  { id: 3, title: 'React Fundamentals Quiz', course: 'Advanced React', date: 'Oct 18, 2023', participants: 25, avgScore: 88.4 },
];

export function Exams() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search exams..." 
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
                <th className="px-6 py-4">Exam Title</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Participants</th>
                <th className="px-6 py-4">Avg. Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-indigo-500" />
                      <span>{exam.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{exam.course}</td>
                  <td className="px-6 py-4 text-gray-600">{exam.date}</td>
                  <td className="px-6 py-4 text-gray-600">{exam.participants}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.avgScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exam.avgScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Results</span>
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
