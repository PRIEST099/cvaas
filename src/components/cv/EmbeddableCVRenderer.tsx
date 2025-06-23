import React from 'react';
import { MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star } from 'lucide-react';

interface WidgetConfig {
  theme: 'light' | 'dark' | 'auto';
  size: 'small' | 'medium' | 'large';
  sections: string[];
  showPhoto: boolean;
  showContact: boolean;
  customCSS: string;
  autoUpdate: boolean;
}

interface EmbeddableCVRendererProps {
  cv: any;
  widgetConfig?: WidgetConfig;
  className?: string;
}

export function EmbeddableCVRenderer({ cv, widgetConfig, className = '' }: EmbeddableCVRendererProps) {
  const config = widgetConfig || {
    theme: 'light',
    size: 'medium',
    sections: ['personal_info', 'summary', 'experience', 'education', 'skills'],
    showPhoto: true,
    showContact: true,
    customCSS: '',
    autoUpdate: true
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    auto: 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const renderSection = (section: any) => {
    if (!section || !section.is_visible || !config.sections.includes(section.section_type)) return null;

    switch (section.section_type) {
      case 'personal_info':
        return (
          <div className="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl font-bold mb-2">
              {section.content?.fullName || 'Your Name'}
            </h1>
            {section.content?.title && (
              <h2 className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                {section.content.title}
              </h2>
            )}
            
            {config.showContact && (
              <div className="flex flex-wrap justify-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                {section.content?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{section.content.email}</span>
                  </div>
                )}
                {section.content?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{section.content.phone}</span>
                  </div>
                )}
                {section.content?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{section.content.location}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
              {section.content?.linkedin && (
                <a href={section.content.linkedin} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              )}
              {section.content?.website && (
                <a href={section.content.website} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              )}
              {section.content?.github && (
                <a href={section.content.github} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 mr-3"></div>
              Professional Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {section.content?.summary || 'Your professional summary will appear here...'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderExperience = () => {
    if (!cv.experience || cv.experience.length === 0 || !config.sections.includes('experience')) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 mr-3"></div>
          Professional Experience
        </h2>
        <div className="space-y-6">
          {cv.experience.map((exp: any, index: number) => (
            <div key={index} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{exp.position || 'Position Title'}</h3>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-1">
                    <Building className="h-4 w-4 mr-2" />
                    {exp.company || 'Company Name'}
                  </div>
                  {exp.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {exp.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {' - '}
                    {exp.is_current ? 'Present' : 
                     (exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
                    }
                  </span>
                </div>
              </div>
              
              {exp.description && (
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!cv.education || cv.education.length === 0 || !config.sections.includes('education')) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 mr-3"></div>
          Education
        </h2>
        <div className="space-y-4">
          {cv.education.map((edu: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                  </h3>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-2">
                    <Award className="h-4 w-4 mr-2" />
                    {edu.institution}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    {edu.gpa && (
                      <span>GPA: {edu.gpa}</span>
                    )}
                    {edu.honors && (
                      <span>{edu.honors}</span>
                    )}
                  </div>
                </div>
                {(edu.start_date || edu.end_date) && (
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0">
                    {edu.start_date && new Date(edu.start_date).getFullYear()}
                    {edu.end_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                    {edu.is_current && ' - Present'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0 || !config.sections.includes('skills')) return null;

    const skillsByCategory = cv.skills.reduce((acc: any, skill: any) => {
      const category = skill.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 mr-3"></div>
          Skills & Expertise
        </h2>
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill: any, skillIndex: number) => (
                  <div key={skillIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="font-medium">{skill.name}</span>
                    {skill.proficiency_level && (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                level <= Math.ceil(skill.proficiency_level / 20) ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-12">
                          {skill.proficiency_level}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!cv.projects || cv.projects.length === 0 || !config.sections.includes('projects')) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 mr-3"></div>
          Projects
        </h2>
        <div className="space-y-6">
          {cv.projects.map((project: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
              {project.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-4 text-sm">
                {project.project_url && (
                  <a href={project.project_url} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Github className="h-4 w-4 inline mr-1" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render sections from CV sections data
  const renderSectionsFromData = () => {
    if (!cv.sections || cv.sections.length === 0) return null;

    return cv.sections
      .filter((section: any) => section.is_visible && config.sections.includes(section.section_type))
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((section: any) => (
        <div key={section.id}>
          {renderSection(section)}
        </div>
      ));
  };

  return (
    <div 
      className={`${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className} p-6`}
      style={config.customCSS ? { cssText: config.customCSS } : undefined}
    >
      {/* Render sections from CV sections data */}
      {renderSectionsFromData()}
      
      {/* Render additional content from separate tables */}
      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
      {renderProjects()}
      
      {/* Empty state */}
      {(!cv.sections || cv.sections.length === 0) && 
       (!cv.experience || cv.experience.length === 0) &&
       (!cv.education || cv.education.length === 0) &&
       (!cv.skills || cv.skills.length === 0) &&
       (!cv.projects || cv.projects.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Award className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No content yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Start adding sections to see your CV preview.</p>
        </div>
      )}
    </div>
  );
}