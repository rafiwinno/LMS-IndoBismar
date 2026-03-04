import React, { useState } from 'react';
import { Plus, Search, FileText, Video, File, Download, Trash2 } from 'lucide-react';

const initialMaterials = [
  { id: 1, title: 'Introduction to Laravel', type: 'PDF', course: 'Laravel Basics', size: '2.4 MB', date: 'Oct 12, 2023' },
  { id: 2, title: 'Routing & Controllers', type: 'Video', course: 'Laravel Basics', size: '145 MB', date: 'Oct 14, 2023' },
  { id: 3, title: 'Figma Auto Layout', type: 'Document', course: 'UI Design Principles', size: '1.2 MB', date: 'Oct 15, 2023' },
  { id: 4, title: 'React Hooks Guide', type: 'PDF', course: 'Advanced React', size: '3.1 MB', date: 'Oct 18, 2023' },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
    case 'Video': return <Video className="w-5 h-5 text-blue-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
};

export function Materials() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          <span>Upload Material</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIconForType(material.type)}
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-gray-400 hover:text-indigo-600 p-1">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={material.title}>{material.title}</h3>
            <p className="text-sm text-indigo-600 mb-3 line-clamp-1">{material.course}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
              <span>{material.size}</span>
              <span>{material.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
