import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

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

const EmbeddableCVRenderer = ({ cv, widgetConfig, className = '' }: EmbeddableCVRendererProps) => {
  const config = widgetConfig || {
    theme: 'light',
    size: 'small',
    sections: ['personal_info', 'summary', 'education', 'experience', 'skills', 'projects'],
    showPhoto: true,
    showContact: true,
    customCSS: '',
    autoUpdate: true
  };

  const themeClasses = {
    light: 'text-black',
    dark: 'text-white',
    auto: 'text-black dark:text-white'
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const renderPersonalInfoSection = (section: any) => {
    if (!section?.content) return null;
    return (
      <div className="text-center mb-4">
        <h1 className="text-lg sm:text-xl font-bold mb-1">{section.content.fullName}</h1>
        {section.content.title && (
          <p className="text-sm text-blue-600 font-medium mb-2">{section.content.title}</p>
        )}
        {config.showContact && (
          <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-1 sm:space-y-0 text-gray-700 text-xs">
            {section.content.email && (
              <div className="flex items-center justify-center sm:justify-start">
                <Mail className="w-3 h-3 mr-1 text-blue-600 flex-shrink-0" />
                <span className="truncate">{section.content.email}</span>
              </div>
            )}
            {section.content.phone && (
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="w-3 h-3 mr-1 text-blue-600 flex-shrink-0" />
                <span>{section.content.phone}</span>
              </div>
            )}
            {section.content.location && (
              <div className="flex items-center justify-center sm:justify-start">
                <MapPin className="w-3 h-3 mr-1 text-blue-600 flex-shrink-0" />
                <span>{section.content.location}</span>
              </div>
            )}
          </div>
        )}
        <hr className="border-t border-blue-600 mt-4" />
      </div>
    );
  };

  const renderSectionHeader = (title: string) => (
    <h2 className="text-lg sm:text-xl font-bold text-blue-600 mb-2">{title}</h2>
  );

  const renderSummarySection = (section: any) => {
    if (!section?.content?.summary) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Professional Summary')}
        <p className="leading-relaxed whitespace-pre-line text-gray-800 text-xs sm:text-sm">{section.content.summary}</p>
        <hr className="border-t border-gray-300 mt-3 mb-4" />
      </div>
    );
  };

  const renderEducationSection = (section: any) => {
    const education = section?.content?.education || cv.education || [];
    if (!education.length) return null;

    return (
      <div className="mb-4">
        {renderSectionHeader('Education')}
        {education.map((edu: any, idx: number) => (
          <div key={idx} className="mb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm space-y-1 sm:space-y-0">
              <span className="font-semibold text-gray-900">{edu.institution}</span>
              <span className="italic text-gray-500 text-xs">
               {edu.isCurrent ? 'Present' : edu.end_date || edu.graduationYear}
              </span>
            </div>
            <div className="text-gray-700 text-xs">{edu.degree} in {edu.field}</div>
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-4" />
      </div>
    );
  };

  const renderExperienceSection = (section: any) => {
    const experiences = section?.content?.experiences || cv.experience || [];
    if (!experiences.length) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Work Experience')}
        {experiences.map((exp: any, idx: number) => (
          <div key={idx} className="mb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-1 text-sm space-y-1 sm:space-y-0">
              <span className="font-semibold text-gray-900">{exp.position}</span>
              <span className="italic text-gray-500 text-xs">
                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-gray-700 text-xs mb-1">{exp.company}</div>
            <ul className="list-disc ml-4 text-gray-800 text-xs space-y-1">
              {exp.description?.split('\n').map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-4" />
      </div>
    );
  };

  const renderSkillsSection = (section: any) => {
    const skills = section?.content?.skillCategories?.flatMap((cat: any) => cat.skills.map((s: any) => s.name)) || cv.skills || [];
    if (!skills.length) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Skills')}
        <p className="text-gray-800 text-xs break-words">{skills.join(', ')}</p>
        <hr className="border-t border-gray-300 mt-2 mb-4" />
      </div>
    );
  };

  const renderProjectsSection = (section: any) => {
    const projects = section?.content?.projects || cv.projects || [];
    if (!projects.length) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Projects')}
        {projects.map((project: any, index: number) => (
          <div key={index} className="mb-2">
            <span className="font-semibold text-gray-900 text-sm">{project.title}</span>
            <ul className="list-disc ml-4 text-gray-800 text-xs mt-1 space-y-1">
              {project.description?.split('\n').map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-1 text-xs text-gray-600">
                <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
              </div>
            )}
            {project.projectUrl && (
              <div className="mt-1 text-xs text-blue-600">
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  View Project
                </a>
              </div>
            )}
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-4" />
      </div>
    );
  };

  const sectionOrder = ['personal_info', 'summary', 'education', 'experience', 'skills', 'projects'];
  const sectionsMap: Record<string, any> = {};
  (cv.sections || []).forEach((sec: any) => { sectionsMap[sec.section_type] = sec; });
  const orderedSections = sectionOrder
    .filter(type => config.sections.includes(type) && sectionsMap[type]?.is_visible)
    .map(type => sectionsMap[type]);

  return (
    <div className={`relative ${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className} p-4 sm:p-6 max-w-2xl mx-auto font-sans`}>
      <div className="absolute inset-0 bg-[url('/paper-texture.png')] bg-cover opacity-20 -z-10" />
      {orderedSections.map((section: any) => {
        switch (section.section_type) {
          case 'personal_info': return <React.Fragment key={section.id}>{renderPersonalInfoSection(section)}</React.Fragment>;
          case 'summary': return <React.Fragment key={section.id}>{renderSummarySection(section)}</React.Fragment>;
          case 'education': return <React.Fragment key={section.id}>{renderEducationSection(section)}</React.Fragment>;
          case 'experience': return <React.Fragment key={section.id}>{renderExperienceSection(section)}</React.Fragment>;
          case 'skills': return <React.Fragment key={section.id}>{renderSkillsSection(section)}</React.Fragment>;
          case 'projects': return <React.Fragment key={section.id}>{renderProjectsSection(section)}</React.Fragment>;
          default: return null;
        }
      })}
    </div>
  );
};

export { EmbeddableCVRenderer };