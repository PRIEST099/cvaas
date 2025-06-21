import React from 'react';
import { CVSection } from '../../types/cv';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface CVSectionEditorProps {
  section: CVSection;
  onUpdate: (updates: Partial<CVSection>) => void;
}

export function CVSectionEditor({ section, onUpdate }: CVSectionEditorProps) {
  const renderSectionContent = () => {
    switch (section.type) {
      case 'personal_info':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={section.content.fullName || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, fullName: e.target.value }
              })}
            />
            <Input
              label="Email"
              type="email"
              value={section.content.email || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, email: e.target.value }
              })}
            />
            <Input
              label="Phone"
              value={section.content.phone || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, phone: e.target.value }
              })}
            />
            <Input
              label="Location"
              value={section.content.location || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, location: e.target.value }
              })}
            />
            <Input
              label="LinkedIn"
              value={section.content.linkedin || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, linkedin: e.target.value }
              })}
            />
            <Input
              label="Website"
              value={section.content.website || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, website: e.target.value }
              })}
            />
          </div>
        );

      case 'summary':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              value={section.content.summary || ''}
              onChange={(e) => onUpdate({
                content: { ...section.content, summary: e.target.value }
              })}
              placeholder="Write a compelling summary of your professional background..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            {(section.content.experiences || []).map((exp: any, index: number) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Job Title"
                      value={exp.position || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, position: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                    />
                    <Input
                      label="Company"
                      value={exp.company || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, company: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                    />
                    <Input
                      label="Start Date"
                      type="month"
                      value={exp.startDate || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, startDate: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                    />
                    <Input
                      label="End Date"
                      type="month"
                      value={exp.endDate || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, endDate: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      disabled={exp.isCurrent}
                    />
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent || false}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, isCurrent: e.target.checked };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">I currently work here</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, description: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      placeholder="Describe your role and achievements..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={() => {
                const experiences = [...(section.content.experiences || []), {
                  position: '',
                  company: '',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  description: ''
                }];
                onUpdate({ content: { ...section.content, experiences } });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Section editor for {section.type} coming soon...
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.aiOptimized && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                AI Optimized
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.isVisible}
                onChange={(e) => onUpdate({ isVisible: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Visible</span>
            </label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderSectionContent()}
      </CardContent>
    </Card>
  );
}