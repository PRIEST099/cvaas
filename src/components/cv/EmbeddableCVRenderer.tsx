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
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">{section.content.fullName}</h1>
        {section.content.title && (
          <p className="text-xl text-blue-600 font-medium mb-4">{section.content.title}</p>
        )}
        {config.showContact && (
          <div className="flex justify-center space-x-6 text-gray-700 text-sm">
            {section.content.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1 text-blue-600" />{section.content.email}
              </div>
            )}
            {section.content.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1 text-blue-600" />{section.content.phone}
              </div>
            )}
            {section.content.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-600" />{section.content.location}
              </div>
            )}
          </div>
        )}
        <hr className="border-t-2 border-blue-600 mt-6" />
      </div>
    );
  };

  const renderSectionHeader = (title: string) => (
    <h2 className="text-2xl font-bold text-blue-600 mb-2">{title}</h2>
  );

  const renderSummarySection = (section: any) => {
    if (!section?.content?.summary) return null;
    return (
      <div className="mb-6">
        {renderSectionHeader('Professional Summary')}
        <p className="leading-relaxed whitespace-pre-line text-gray-800">{section.content.summary}</p>
        <hr className="border-t border-gray-300 mt-4 mb-6" />
      </div>
    );
  };

  const renderExperienceSection = (section: any) => {
    const experiences = section?.content?.experiences || cv.experience || [];
    if (!experiences.length) return null;
    return (
      <div className="mb-6">
        {renderSectionHeader('Work Experience')}
        {experiences.map((exp: any, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-gray-900">{exp.position}</span>
              <span className="italic text-gray-500 text-sm">
                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-gray-700 text-sm mb-2">{exp.company}</div>
            <ul className="list-disc ml-6 text-gray-800 text-sm">
              {exp.description?.split('\n').map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-6" />
      </div>
    );
  };

  const renderEducationSection = (section: any) => {
    const education = section?.content?.education || cv.education || [];
    if (!education.length) return null;
    return (
      <div className="mb-6">
        {renderSectionHeader('Education')}
        {education.map((edu: any, index: number) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">{edu.institution}</span>
              <span className="italic text-gray-500 text-sm">
                {edu.start_date} - {edu.isCurrent ? 'Present' : edu.end_date || edu.graduationYear}
              </span>
            </div>
            <div className="text-gray-700 text-sm">{edu.degree} in {edu.field_of_study}</div>
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-6" />
      </div>
    );
  };

  const renderSkillsSection = (section: any) => {
    const skills = section?.content?.skillCategories?.flatMap((cat: any) => cat.skills.map((s: any) => s.name)) || cv.skills || [];
    if (!skills.length) return null;
    return (
      <div className="mb-6">
        {renderSectionHeader('Skills')}
        <p className="text-gray-800 text-sm">{skills.join(', ')}</p>
        <hr className="border-t border-gray-300 mt-2 mb-6" />
      </div>
    );
  };

  const renderProjectsSection = (section: any) => {
    const projects = section?.content?.projects || cv.projects || [];
    if (!projects.length) return null;
    return (
      <div className="mb-6">
        {renderSectionHeader('Projects')}
        {projects.map((project: any, index: number) => (
          <div key={index} className="mb-3">
            <span className="font-semibold text-gray-900">{project.title}</span>
            <ul className="list-disc ml-6 text-gray-800 text-sm mt-1">
              {project.description?.split('\n').map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="border-t border-gray-300 mt-2 mb-6" />
      </div>
    );
  };

  const allSections = cv.sections || [];

  return (
    <div
      className={`relative ${themeClasses[config.theme]} ${sizeClasses[config.size]} ${className} p-8 max-w-3xl mx-auto font-sans`}>
      {/* Paper-like background */}
      <div className="absolute inset-0 bg-[url('/paper-texture.png')] bg-cover opacity-20 -z-10" />
      {/* CV content */}
      {allSections.map((section: any) => {
        if (!section.is_visible || !config.sections.includes(section.section_type)) return null;
        switch (section.section_type) {
          case 'personal_info':
            return <React.Fragment key={section.id}>{renderPersonalInfoSection(section)}</React.Fragment>;
          case 'summary':
            return <React.Fragment key={section.id}>{renderSummarySection(section)}</React.Fragment>;
          case 'experience':
            return <React.Fragment key={section.id}>{renderExperienceSection(section)}</React.Fragment>;
          case 'education':
            return <React.Fragment key={section.id}>{renderEducationSection(section)}</React.Fragment>;
          case 'skills':
            return <React.Fragment key={section.id}>{renderSkillsSection(section)}</React.Fragment>;
          case 'projects':
            return <React.Fragment key={section.id}>{renderProjectsSection(section)}</React.Fragment>;
          default:
            return null;
        }
      })}
    </div>
  );
}
