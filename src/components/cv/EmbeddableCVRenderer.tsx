import React from 'react';
import { MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star, Briefcase, GraduationCap, Code2, FileText, User } from 'lucide-react';

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
    sections: ['personal_info', 'summary', 'experience', 'education', 'skills', 'projects'],
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

  const renderPersonalInfoSection = (section: any) => {
    if (!section?.content) return null;

    return (
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {section.content.fullName || 'Your Name'}
        </h1>
        
        {section.content.title && (
          <h2 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-4">
            {section.content.title}
          </h2>
        )}
        
        {config.showContact && (
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            {section.content.email && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>{section.content.email}</span>
              </div>
            )}
            {section.content.phone && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>{section.content.phone}</span>
              </div>
            )}
            {section.content.location && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{section.content.location}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {section.content.linkedin && (
            <a 
              href={section.content.linkedin} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </a>
          )}
          {section.content.website && (
            <a 
              href={section.content.website} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Globe className="h-4 w-4 mr-1" />
              Website
            </a>
          )}
          {section.content.github && (
            <a 
              href={section.content.github} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </a>
          )}
        </div>
      </div>
    );
  };

  const renderSummarySection = (section: any) => {
    if (!section?.content?.summary) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200">
          Professional Summary
        </h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {section.content.summary}
          </p>
        </div>
      </div>
    );
  };

  const renderExperienceSection = (section: any) => {
    const experiences = section?.content?.experiences || cv.experience || [];
    if (!experiences || experiences.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 flex items-center">
          <Briefcase className="h-6 w-6 mr-2" />
          Professional Experience
        </h2>
        <div className="space-y-6">
          {experiences.map((exp: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {exp.position || 'Position Title'}
                  </h3>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    <Building className="h-5 w-5 mr-2" />
                    {exp.company || 'Company Name'}
                  </div>
                  {exp.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 lg:mt-0 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {' - '}
                    {exp.isCurrent || exp.is_current ? 'Present' : 
                     ((exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })) ||
                      (exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })))
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

  const renderEducationSection = (section: any) => {
    const education = section?.content?.education || cv.education || [];
    if (!education || education.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2" />
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {edu.degree} {(edu.field_of_study || edu.field) && `in ${edu.field_of_study || edu.field}`}
                  </h3>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-3">
                    <Award className="h-5 w-5 mr-2" />
                    {edu.institution}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {edu.gpa && (
                      <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded text-sm font-medium">
                        GPA: {edu.gpa}
                      </span>
                    )}
                    {edu.honors && (
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded text-sm font-medium">
                        {edu.honors}
                      </span>
                    )}
                  </div>
                </div>
                {(edu.start_date || edu.end_date || edu.graduationYear) && (
                  <div className="text-gray-500 dark:text-gray-400 mt-2 lg:mt-0 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-medium">
                    {edu.graduationYear || 
                     (edu.start_date && new Date(edu.start_date).getFullYear()) ||
                     (edu.end_date && new Date(edu.end_date).getFullYear())}
                    {edu.end_date && edu.start_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                    {(edu.is_current || edu.isCurrent) && ' - Present'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (section: any) => {
    // Handle both section-based skills and direct CV skills
    let skills = [];
    
    if (section?.content?.skillCategories) {
      // Skills from section content (new format)
      section.content.skillCategories.forEach((category: any) => {
        if (category.skills) {
          category.skills.forEach((skill: any) => {
            skills.push({
              name: skill.name,
              category: category.name,
              proficiency_level: skill.level ? skill.level * 20 : null // Convert 1-5 scale to percentage
            });
          });
        }
      });
    } else if (cv.skills) {
      // Skills from CV direct property (old format)
      skills = cv.skills;
    }

    if (!skills || skills.length === 0) return null;

    const skillsByCategory = skills.reduce((acc: any, skill: any) => {
      const category = skill.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 flex items-center">
          <Star className="h-6 w-6 mr-2" />
          Skills & Expertise
        </h2>
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, categorySkills]: [string, any]) => (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorySkills.map((skill: any, skillIndex: number) => (
                  <div key={skillIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</span>
                    {skill.proficiency_level && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${skill.proficiency_level}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-8">
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

  const renderProjectsSection = (section: any) => {
    const projects = section?.content?.projects || cv.projects || [];
    if (!projects || projects.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 flex items-center">
          <Code2 className="h-6 w-6 mr-2" />
          Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{project.title}</h3>
              {project.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-3">
                {project.project_url && (
                  <a 
                    href={project.project_url} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a 
                    href={project.github_url} 
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                  >
                    <Github className="h-4 w-4 mr-1" />
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

  const renderGenericSection = (section: any) => {
    if (!section?.content || !section.is_visible) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          {section.title}
        </h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)}
          </div>
        </div>
      </div>
    );
  };

  // Get all sections and sort them by display order
  const allSections = cv.sections ? [...cv.sections].sort((a: any, b: any) => a.display_order - b.display_order) : [];

  // Track which sections we've rendered to avoid duplicates
  const renderedSections = new Set();

  return (
    <div 
      className={`${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className}`}
      style={config.customCSS ? { cssText: config.customCSS } : undefined}
    >
      <div className="p-8 lg:p-12 max-w-4xl mx-auto">
        {/* Render sections from cv.sections array */}
        {allSections.map((section: any) => {
          if (!section.is_visible || !config.sections.includes(section.section_type)) return null;
          
          renderedSections.add(section.section_type);
          
          switch (section.section_type) {
            case 'personal_info':
              return <div key={section.id}>{renderPersonalInfoSection(section)}</div>;
            case 'summary':
              return <div key={section.id}>{renderSummarySection(section)}</div>;
            case 'experience':
              return <div key={section.id}>{renderExperienceSection(section)}</div>;
            case 'education':
              return <div key={section.id}>{renderEducationSection(section)}</div>;
            case 'skills':
              return <div key={section.id}>{renderSkillsSection(section)}</div>;
            case 'projects':
              return <div key={section.id}>{renderProjectsSection(section)}</div>;
            default:
              return <div key={section.id}>{renderGenericSection(section)}</div>;
          }
        })}
        
        {/* Render additional sections from CV direct properties if not already rendered */}
        {!renderedSections.has('experience') && config.sections.includes('experience') && renderExperienceSection(null)}
        {!renderedSections.has('education') && config.sections.includes('education') && renderEducationSection(null)}
        {!renderedSections.has('skills') && config.sections.includes('skills') && renderSkillsSection(null)}
        {!renderedSections.has('projects') && config.sections.includes('projects') && renderProjectsSection(null)}
        
        {/* Empty state */}
        {allSections.length === 0 && 
         (!cv.experience || cv.experience.length === 0) &&
         (!cv.education || cv.education.length === 0) &&
         (!cv.skills || cv.skills.length === 0) &&
         (!cv.projects || cv.projects.length === 0) && (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-600 mb-6">
              <Award className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-gray-600 dark:text-gray-400">
              No content yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">Start adding sections to see your CV preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}