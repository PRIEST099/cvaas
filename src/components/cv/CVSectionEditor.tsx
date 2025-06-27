import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cvService } from '../../services/cvService';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Sparkles, 
  Star, 
  Award, 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CVSectionEditorProps {
  section: any;
  sections: any[];
  currentSectionIndex: number;
  onUpdate: (updates: any) => void;
  onNavigateToSection: (sectionId: string) => void;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
}

export function CVSectionEditor({ 
  section, 
  sections, 
  currentSectionIndex, 
  onUpdate, 
  onNavigateToSection, 
  onNavigateNext, 
  onNavigatePrevious 
}: CVSectionEditorProps) {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [optimizationError, setOptimizationError] = useState('');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        // Allow Tab navigation within forms
        if (event.key === 'Tab') {
          return; // Let default tab behavior work
        }
        return;
      }

      // Ctrl/Cmd + Arrow keys for section navigation
      if ((event.ctrlKey || event.metaKey)) {
        if (event.key === 'ArrowLeft' && currentSectionIndex > 0) {
          event.preventDefault();
          onNavigatePrevious();
        } else if (event.key === 'ArrowRight' && currentSectionIndex < sections.length - 1) {
          event.preventDefault();
          onNavigateNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSectionIndex, sections.length, onNavigateNext, onNavigatePrevious]);

  if (!section) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-gray-400 mb-4">
            <User className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a section to edit</h3>
          <p className="text-gray-600">Choose a section from the sidebar to start editing your CV.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRollbackSection = async () => {
    try {
      setIsRollingBack(true);
      setOptimizationError('');
      
      // Call the rollback service
      const rolledBackSection = await cvService.rollbackCVSection(section.id);
      
      // Update the local state with rolled back content
      onUpdate({
        content: rolledBackSection.content,
        ai_optimized: false,
        original_content: null
      });
    } catch (error: any) {
      setOptimizationError(error.message || 'Failed to rollback section');
    } finally {
      setIsRollingBack(false);
    }
  };

  const renderSectionContent = () => {
    switch (section.section_type) {
      case 'personal_info':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={section.content.fullName || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, fullName: e.target.value }
                  })}
                  placeholder="John Doe"
                />
                <Input
                  label="Professional Title"
                  value={section.content.title || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, title: e.target.value }
                  })}
                  placeholder="Senior Software Engineer"
                />
                <Input
                  label="Email"
                  type="email"
                  value={section.content.email || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, email: e.target.value }
                  })}
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone"
                  value={section.content.phone || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, phone: e.target.value }
                  })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Location"
                  value={section.content.location || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, location: e.target.value }
                  })}
                  placeholder="San Francisco, CA"
                />
                <Input
                  label="LinkedIn"
                  value={section.content.linkedin || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/johndoe"
                />
                <Input
                  label="Website"
                  value={section.content.website || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, website: e.target.value }
                  })}
                  placeholder="https://johndoe.com"
                />
                <Input
                  label="GitHub"
                  value={section.content.github || ''}
                  onChange={(e) => onUpdate({
                    content: { ...section.content, github: e.target.value }
                  })}
                  placeholder="https://github.com/johndoe"
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary
              </label>
              <textarea
                value={section.content.summary || ''}
                onChange={(e) => onUpdate({
                  content: { ...section.content, summary: e.target.value }
                })}
                placeholder="Write a compelling summary of your professional background, key achievements, and career objectives. Highlight your unique value proposition and what makes you stand out..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed"
              />
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                <span>Tip: Keep it concise but impactful (2-3 sentences)</span>
                <span>{(section.content.summary || '').length} characters</span>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            {(section.content.experiences || []).map((exp: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <h4 className="font-medium">Experience {index + 1}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-1">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences.splice(index, 1);
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      className="p-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      label="Job Title"
                      value={exp.position || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, position: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      placeholder="Senior Software Engineer"
                    />
                    <Input
                      label="Company"
                      value={exp.company || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, company: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      placeholder="Tech Company Inc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Location"
                      value={exp.location || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, location: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      placeholder="San Francisco, CA"
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
                        experiences[index] = { 
                          ...exp, 
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? '' : exp.endDate
                        };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">I currently work here</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description & Achievements
                    </label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => {
                        const experiences = [...(section.content.experiences || [])];
                        experiences[index] = { ...exp, description: e.target.value };
                        onUpdate({ content: { ...section.content, experiences } });
                      }}
                      placeholder="• Led a team of 5 engineers to deliver critical features ahead of schedule&#10;• Improved application performance by 40% through code optimization&#10;• Implemented new CI/CD pipeline reducing deployment time by 60%"
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Use bullet points to highlight your key achievements and responsibilities
                    </div>
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
                  location: '',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  description: ''
                }];
                onUpdate({ content: { ...section.content, experiences } });
              }}
              className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            {(section.content.education || []).map((edu: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <h4 className="font-medium">Education {index + 1}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-1">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const education = [...(section.content.education || [])];
                        education.splice(index, 1);
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      className="p-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      label="Degree"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, degree: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="Bachelor of Science"
                    />
                    <Input
                      label="Field of Study"
                      value={edu.field || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, field: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="Computer Science"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      label="Institution"
                      value={edu.institution || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, institution: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="University of Technology"
                    />
                    <Input
                      label="Graduation Year"
                      type="number"
                      value={edu.graduationYear || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, graduationYear: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="2023"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      label="GPA (Optional)"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, gpa: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="3.8"
                    />
                    <Input
                      label="Honors (Optional)"
                      value={edu.honors || ''}
                      onChange={(e) => {
                        const education = [...(section.content.education || [])];
                        education[index] = { ...edu, honors: e.target.value };
                        onUpdate({ content: { ...section.content, education } });
                      }}
                      placeholder="Magna Cum Laude, Dean's List"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={() => {
                const education = [...(section.content.education || []), {
                  degree: '',
                  field: '',
                  institution: '',
                  graduationYear: '',
                  gpa: '',
                  honors: ''
                }];
                onUpdate({ content: { ...section.content, education } });
              }}
              className="w-full border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="grid gap-6">
              {(section.content.skillCategories || []).map((category: any, categoryIndex: number) => (
                <Card key={categoryIndex} className="border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 flex-1">
                      <Star className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <Input
                        value={category.name || ''}
                        onChange={(e) => {
                          const skillCategories = [...(section.content.skillCategories || [])];
                          skillCategories[categoryIndex] = { ...category, name: e.target.value };
                          onUpdate({ content: { ...section.content, skillCategories } });
                        }}
                        placeholder="Category Name (e.g., Programming Languages)"
                        className="font-medium"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const skillCategories = [...(section.content.skillCategories || [])];
                        skillCategories.splice(categoryIndex, 1);
                        onUpdate({ content: { ...section.content, skillCategories } });
                      }}
                      className="p-1 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(category.skills || []).map((skill: any, skillIndex: number) => (
                        <div key={skillIndex} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Input
                            value={skill.name || ''}
                            onChange={(e) => {
                              const skillCategories = [...(section.content.skillCategories || [])];
                              const skills = [...(skillCategories[categoryIndex].skills || [])];
                              skills[skillIndex] = { ...skill, name: e.target.value };
                              skillCategories[categoryIndex] = { ...category, skills };
                              onUpdate({ content: { ...section.content, skillCategories } });
                            }}
                            placeholder="Skill name"
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2 w-full sm:w-auto sm:min-w-32">
                            <span className="text-xs text-gray-600 flex-shrink-0">Proficiency:</span>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={skill.level || 3}
                              onChange={(e) => {
                                const skillCategories = [...(section.content.skillCategories || [])];
                                const skills = [...(skillCategories[categoryIndex].skills || [])];
                                skills[skillIndex] = { ...skill, level: parseInt(e.target.value) };
                                skillCategories[categoryIndex] = { ...category, skills };
                                onUpdate({ content: { ...section.content, skillCategories } });
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs font-medium w-12 text-center">
                              {['', 'Basic', 'Good', 'Strong', 'Expert', 'Master'][skill.level || 3]}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const skillCategories = [...(section.content.skillCategories || [])];
                              const skills = [...(skillCategories[categoryIndex].skills || [])];
                              skills.splice(skillIndex, 1);
                              skillCategories[categoryIndex] = { ...category, skills };
                              onUpdate({ content: { ...section.content, skillCategories } });
                            }}
                            className="p-1 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const skillCategories = [...(section.content.skillCategories || [])];
                          const skills = [...(skillCategories[categoryIndex].skills || []), { name: '', level: 3 }];
                          skillCategories[categoryIndex] = { ...category, skills };
                          onUpdate({ content: { ...section.content, skillCategories } });
                        }}
                        className="w-full border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                const skillCategories = [...(section.content.skillCategories || []), {
                  name: '',
                  skills: []
                }];
                onUpdate({ content: { ...section.content, skillCategories } });
              }}
              className="w-full border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill Category
            </Button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            {(section.content.projects || []).map((project: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <h4 className="font-medium">Project {index + 1}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-1">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const projects = [...(section.content.projects || [])];
                        projects.splice(index, 1);
                        onUpdate({ content: { ...section.content, projects } });
                      }}
                      className="p-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Project Title"
                    value={project.title || ''}
                    onChange={(e) => {
                      const projects = [...(section.content.projects || [])];
                      projects[index] = { ...project, title: e.target.value };
                      onUpdate({ content: { ...section.content, projects } });
                    }}
                    placeholder="E-commerce Platform"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => {
                        const projects = [...(section.content.projects || [])];
                        projects[index] = { ...project, description: e.target.value };
                        onUpdate({ content: { ...section.content, projects } });
                      }}
                      placeholder="Describe the project, your role, and key achievements..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Technologies Used"
                      value={project.technologies ? project.technologies.join(', ') : ''}
                      onChange={(e) => {
                        const technologies = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        const projects = [...(section.content.projects || [])];
                        projects[index] = { ...project, technologies };
                        onUpdate({ content: { ...section.content, projects } });
                      }}
                      placeholder="React, Node.js, MongoDB"
                    />
                    <Input
                      label="Project URL"
                      value={project.projectUrl || ''}
                      onChange={(e) => {
                        const projects = [...(section.content.projects || [])];
                        projects[index] = { ...project, projectUrl: e.target.value };
                        onUpdate({ content: { ...section.content, projects } });
                      }}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={() => {
                const projects = [...(section.content.projects || []), {
                  title: '',
                  description: '',
                  technologies: [],
                  projectUrl: ''
                }];
                onUpdate({ content: { ...section.content, projects } });
              }}
              className="w-full border-dashed border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section editor coming soon</h3>
            <p className="text-gray-600">
              The editor for {section.section_type} sections is being developed.
            </p>
          </div>
        );
    }
  };

  // Determine if we can navigate to previous/next sections
  const hasPreviousSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex < sections.length - 1;

  return (
    <Card className="min-h-96">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              {section.section_type === 'personal_info' && <User className="h-5 w-5 text-blue-600" />}
              {section.section_type === 'summary' && <Award className="h-5 w-5 text-blue-600" />}
              {section.section_type === 'experience' && <Building className="h-5 w-5 text-blue-600" />}
              {section.section_type === 'education' && <Award className="h-5 w-5 text-blue-600" />}
              {section.section_type === 'skills' && <Star className="h-5 w-5 text-blue-600" />}
              {section.section_type === 'projects' && <Star className="h-5 w-5 text-blue-600" />}
              {!['personal_info', 'summary', 'experience', 'education', 'skills', 'projects'].includes(section.section_type) && 
                <Sparkles className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{section.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {section.section_type === 'personal_info' && 'Your contact information and professional identity'}
                {section.section_type === 'summary' && 'A compelling overview of your professional background'}
                {section.section_type === 'experience' && 'Your work history and professional achievements'}
                {section.section_type === 'education' && 'Your academic background and qualifications'}
                {section.section_type === 'skills' && 'Your technical and professional competencies'}
                {section.section_type === 'projects' && 'Your portfolio of projects and accomplishments'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            {section.ai_optimized && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Optimized
              </span>
            )}
            
            {/* Rollback Button - Renamed to "Back to original" */}
            {section.ai_optimized && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRollbackSection}
                isLoading={isRollingBack}
                className="text-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Back to original
              </Button>
            )}
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={section.is_visible}
                onChange={(e) => onUpdate({ is_visible: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Visible</span>
            </label>
          </div>
        </div>
        
        {/* Optimization Error */}
        {optimizationError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {optimizationError}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {renderSectionContent()}

        {/* Section Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onNavigatePrevious}
            disabled={!hasPreviousSection}
            className={!hasPreviousSection ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Section
          </Button>

          <div className="hidden sm:flex items-center space-x-2">
            {sections.map((s, index) => (
              <button
                key={s.id}
                onClick={() => onNavigateToSection(s.id)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  currentSectionIndex === index 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to ${s.title}`}
              />
            ))}
          </div>

          <Button
            variant={hasNextSection ? 'outline' : 'primary'}
            onClick={hasNextSection ? onNavigateNext : () => {}}
            disabled={!hasNextSection}
            className={!hasNextSection ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {hasNextSection ? (
              <>
                Next Section
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Finish
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd> Previous | <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd> Next</p>
        </div>
      </CardContent>
    </Card>
  );
}