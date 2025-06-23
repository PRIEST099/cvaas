import React from 'react';
import { MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star, Briefcase, GraduationCap, Code2 } from 'lucide-react';

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
          <div className="text-center mb-12 pb-8 relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 rounded-3xl opacity-30"></div>
            <div className="relative z-10">
              <div className="relative inline-block mb-8">
                <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  {section.content.fullName || 'Your Name'}
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
              </div>
              
              {section.content.title && (
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 font-medium tracking-wide bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                    {section.content.title}
                  </h2>
                </div>
              )}
              
              {config.showContact && (
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {section.content.email && (
                    <div className="flex items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                      <Mail className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{section.content.email}</span>
                    </div>
                  )}
                  {section.content.phone && (
                    <div className="flex items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                      <Phone className="h-5 w-5 mr-3 text-green-500" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{section.content.phone}</span>
                    </div>
                  )}
                  {section.content.location && (
                    <div className="flex items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-red-500" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{section.content.location}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-4">
                {section.content.linkedin && (
                  <a 
                    href={section.content.linkedin} 
                    className="flex items-center text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Linkedin className="h-5 w-5 mr-2" />
                    LinkedIn
                  </a>
                )}
                {section.content.website && (
                  <a 
                    href={section.content.website} 
                    className="flex items-center text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Website
                  </a>
                )}
                {section.content.github && (
                  <a 
                    href={section.content.github} 
                    className="flex items-center text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all duration-300 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Github className="h-5 w-5 mr-2" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full mr-4 shadow-lg"></div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Professional Summary
              </h2>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-medium">
                  {section.content.summary || 'Your professional summary will appear here...'}
                </p>
              </div>
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
          <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full mr-4 shadow-lg"></div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent flex items-center">
            <Briefcase className="h-8 w-8 mr-3 text-blue-600" />
            Professional Experience
          </h2>
        </div>
        <div className="space-y-8">
          {cv.experience.map((exp: any, index: number) => (
            <div key={index} className="relative pl-10">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-sm"></div>
              {/* Timeline dot */}
              <div className="absolute -left-3 top-6 w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg border-4 border-white dark:border-gray-800"></div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {exp.position || 'Position Title'}
                    </h3>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-3 text-lg">
                      <Building className="h-6 w-6 mr-3" />
                      {exp.company || 'Company Name'}
                    </div>
                    {exp.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="font-medium">{exp.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mt-4 lg:mt-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-full shadow-sm">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-semibold">
                      {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {exp.is_current ? 'Present' : 
                       (exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
                      }
                    </span>
                  </div>
                </div>
                
                {exp.description && (
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
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
          <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full mr-4 shadow-lg"></div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent flex items-center">
            <GraduationCap className="h-8 w-8 mr-3 text-green-600" />
            Education
          </h2>
        </div>
        <div className="grid gap-8">
          {cv.education.map((edu: any, index: number) => (
            <div key={index} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 dark:from-green-900 dark:via-blue-900 dark:to-teal-900 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                    </h3>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-4 text-lg">
                      <Award className="h-6 w-6 mr-3" />
                      {edu.institution}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {edu.gpa && (
                        <span className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full font-semibold shadow-sm">
                          GPA: {edu.gpa}
                        </span>
                      )}
                      {edu.honors && (
                        <span className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full font-semibold shadow-sm">
                          {edu.honors}
                        </span>
                      )}
                    </div>
                  </div>
                  {(edu.start_date || edu.end_date) && (
                    <div className="text-gray-500 dark:text-gray-400 mt-4 lg:mt-0 bg-white dark:bg-gray-700 px-4 py-3 rounded-full font-semibold shadow-sm border border-gray-200 dark:border-gray-600">
                      {edu.start_date && new Date(edu.start_date).getFullYear()}
                      {edu.end_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                      {edu.is_current && ' - Present'}
                    </div>
                  )}
                </div>
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
          <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full mr-4 shadow-lg"></div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent flex items-center">
            <Star className="h-8 w-8 mr-3 text-yellow-500" />
            Skills & Expertise
          </h2>
        </div>
        <div className="space-y-8">
          {Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
            <div key={category} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900 dark:via-orange-900 dark:to-red-900 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <Star className="h-7 w-7 mr-3 text-yellow-500" />
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill: any, skillIndex: number) => (
                    <div key={skillIndex} className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{skill.name}</span>
                      {skill.proficiency_level && (
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                  level <= Math.ceil(skill.proficiency_level / 20) 
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg transform scale-110' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 min-w-12 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                            {skill.proficiency_level}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
          <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full mr-4 shadow-lg"></div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent flex items-center">
            <Code2 className="h-8 w-8 mr-3 text-purple-600" />
            Projects
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {cv.projects.map((project: any, index: number) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-purple-200 dark:group-hover:border-purple-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{project.title}</h3>
                {project.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech: string, techIndex: number) => (
                      <span
                        key={techIndex}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex space-x-4">
                  {project.project_url && (
                    <a 
                      href={project.project_url} 
                      className="flex items-center text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a 
                      href={project.github_url} 
                      className="flex items-center text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className} relative`}
      style={config.customCSS ? { cssText: config.customCSS } : undefined}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
      </div>
      
      <div className="relative z-10 p-8 lg:p-12">
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
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-600 mb-8">
              <Award className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-3xl font-medium mb-6 bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
              No content yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xl">Start adding sections to see your CV preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}