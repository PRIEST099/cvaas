import React from 'react';
import { MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star, Briefcase, GraduationCap } from 'lucide-react';

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
    if (!section.is_visible || !config.sections.includes(section.section_type)) return null;

    switch (section.section_type) {
      case 'personal_info':
        return (
          <div className="text-center mb-12 pb-8 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {section.content.fullName || 'Your Name'}
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            
            {section.content.title && (
              <h2 className="text-2xl text-gray-600 dark:text-gray-300 font-medium mb-6 tracking-wide">
                {section.content.title}
              </h2>
            )}
            
            {config.showContact && (
              <div className="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-300 mb-6">
                {section.content.email && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">{section.content.email}</span>
                  </div>
                )}
                {section.content.phone && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">{section.content.phone}</span>
                  </div>
                )}
                {section.content.location && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span className="font-medium">{section.content.location}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
              {section.content.linkedin && (
                <a 
                  href={section.content.linkedin} 
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-full font-medium"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              )}
              {section.content.website && (
                <a 
                  href={section.content.website} 
                  className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors bg-purple-50 dark:bg-purple-900 px-4 py-2 rounded-full font-medium"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              )}
              {section.content.github && (
                <a 
                  href={section.content.github} 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full font-medium"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Professional Summary</h2>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-8 rounded-2xl">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-medium">
                {section.content.summary || 'Your professional summary will appear here...'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderExperience = () => {
    if (!cv.experience || cv.experience.length === 0 || !config.sections.includes('experience')) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Briefcase className="h-8 w-8 mr-3 text-blue-600" />
            Professional Experience
          </h2>
        </div>
        <div className="space-y-8">
          {cv.experience.map((exp: any, index: number) => (
            <div key={index} className="relative pl-8 border-l-4 border-gradient-to-b from-blue-400 to-purple-400">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{exp.position || 'Position Title'}</h3>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-2">
                      <Building className="h-5 w-5 mr-2" />
                      {exp.company || 'Company Name'}
                    </div>
                    {exp.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {exp.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!cv.education || cv.education.length === 0 || !config.sections.includes('education')) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <GraduationCap className="h-8 w-8 mr-3 text-green-600" />
            Education
          </h2>
        </div>
        <div className="grid gap-6">
          {cv.education.map((edu: any, index: number) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                  </h3>
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-3">
                    <Award className="h-5 w-5 mr-2" />
                    {edu.institution}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {edu.gpa && (
                      <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full font-medium">
                        GPA: {edu.gpa}
                      </span>
                    )}
                    {edu.honors && (
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium">
                        {edu.honors}
                      </span>
                    )}
                  </div>
                </div>
                {(edu.start_date || edu.end_date) && (
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0 bg-white dark:bg-gray-800 px-3 py-2 rounded-full font-medium">
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
      <div className="mb-12">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Star className="h-8 w-8 mr-3 text-yellow-500" />
            Skills & Expertise
          </h2>
        </div>
        <div className="space-y-8">
          {Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
            <div key={category} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2 text-yellow-500" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill: any, skillIndex: number) => (
                  <div key={skillIndex} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{skill.name}</span>
                    {skill.proficiency_level && (
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full transition-all ${
                                level <= Math.ceil(skill.proficiency_level / 20) 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-sm' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-12">
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
      <div className="mb-12">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Projects</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {cv.projects.map((project: any, index: number) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{project.title}</h3>
              {project.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-4 text-sm">
                {project.project_url && (
                  <a href={project.project_url} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
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

  return (
    <div 
      className={`${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className} p-8`}
      style={config.customCSS ? { cssText: config.customCSS } : undefined}
    >
      {cv.sections
        ?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((section: any) => (
          <div key={section.id}>
            {renderSection(section)}
          </div>
        ))}
      
      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
      {renderProjects()}
      
      {(!cv.sections || cv.sections.length === 0) && 
       (!cv.experience || cv.experience.length === 0) &&
       (!cv.education || cv.education.length === 0) &&
       (!cv.skills || cv.skills.length === 0) &&
       (!cv.projects || cv.projects.length === 0) && (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-600 mb-6">
            <Award className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-medium mb-4">No content yet</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Start adding sections to see your CV preview.</p>
        </div>
      )}
    </div>
  );
}