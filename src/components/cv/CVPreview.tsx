import React from 'react';
import { X, Download, Share2, ExternalLink, MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star } from 'lucide-react';
import { Button } from '../ui/Button';

interface CVPreviewProps {
  cv: any;
  onClose: () => void;
}

export function CVPreview({ cv, onClose }: CVPreviewProps) {
  const handleDownload = () => {
    // Create a simple PDF-like content for demonstration
    const cvContent = generateCVContent(cv);
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title || 'CV'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCVContent = (cv: any) => {
    let content = `${cv.title}\n${'='.repeat(cv.title.length)}\n\n`;
    
    // Add personal info from sections
    const personalSection = cv.sections?.find((s: any) => s.section_type === 'personal_info');
    if (personalSection?.content) {
      content += `${personalSection.content.fullName || 'Name'}\n`;
      if (personalSection.content.title) content += `${personalSection.content.title}\n`;
      if (personalSection.content.email) content += `Email: ${personalSection.content.email}\n`;
      if (personalSection.content.phone) content += `Phone: ${personalSection.content.phone}\n`;
      if (personalSection.content.location) content += `Location: ${personalSection.content.location}\n`;
      content += '\n';
    }

    // Add summary
    const summarySection = cv.sections?.find((s: any) => s.section_type === 'summary');
    if (summarySection?.content?.summary) {
      content += `PROFESSIONAL SUMMARY\n${'-'.repeat(20)}\n${summarySection.content.summary}\n\n`;
    }

    // Add experience
    if (cv.experience && cv.experience.length > 0) {
      content += `EXPERIENCE\n${'-'.repeat(10)}\n`;
      cv.experience.forEach((exp: any) => {
        content += `${exp.position} at ${exp.company}\n`;
        if (exp.location) content += `Location: ${exp.location}\n`;
        if (exp.start_date) {
          content += `Duration: ${exp.start_date}`;
          if (exp.end_date) content += ` - ${exp.end_date}`;
          else if (exp.is_current) content += ` - Present`;
          content += '\n';
        }
        if (exp.description) content += `${exp.description}\n`;
        content += '\n';
      });
    }

    // Add education
    if (cv.education && cv.education.length > 0) {
      content += `EDUCATION\n${'-'.repeat(9)}\n`;
      cv.education.forEach((edu: any) => {
        content += `${edu.degree}`;
        if (edu.field_of_study) content += ` in ${edu.field_of_study}`;
        content += `\n${edu.institution}\n`;
        if (edu.start_date) {
          content += `${edu.start_date}`;
          if (edu.end_date) content += ` - ${edu.end_date}`;
          else if (edu.is_current) content += ` - Present`;
          content += '\n';
        }
        if (edu.gpa) content += `GPA: ${edu.gpa}\n`;
        content += '\n';
      });
    }

    // Add skills
    if (cv.skills && cv.skills.length > 0) {
      content += `SKILLS\n${'-'.repeat(6)}\n`;
      const skillsByCategory = cv.skills.reduce((acc: any, skill: any) => {
        const category = skill.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {});

      Object.entries(skillsByCategory).forEach(([category, skills]: [string, any]) => {
        content += `${category}: ${skills.join(', ')}\n`;
      });
      content += '\n';
    }

    // Add projects
    if (cv.projects && cv.projects.length > 0) {
      content += `PROJECTS\n${'-'.repeat(8)}\n`;
      cv.projects.forEach((project: any) => {
        content += `${project.title}\n`;
        if (project.description) content += `${project.description}\n`;
        if (project.technologies && project.technologies.length > 0) {
          content += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        if (project.project_url) content += `URL: ${project.project_url}\n`;
        if (project.github_url) content += `GitHub: ${project.github_url}\n`;
        content += '\n';
      });
    }

    return content;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: cv.title,
        text: `Check out my CV: ${cv.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderSection = (section: any) => {
    if (!section.is_visible) return null;

    switch (section.section_type) {
      case 'personal_info':
        return (
          <div className="text-center mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {section.content.fullName || 'Your Name'}
            </h1>
            {section.content.title && (
              <h2 className="text-xl text-blue-600 font-medium mb-4">
                {section.content.title}
              </h2>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
              {section.content.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{section.content.email}</span>
                </div>
              )}
              {section.content.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{section.content.phone}</span>
                </div>
              )}
              {section.content.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{section.content.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {section.content.linkedin && (
                <a href={section.content.linkedin} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              )}
              {section.content.website && (
                <a href={section.content.website} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              )}
              {section.content.github && (
                <a href={section.content.github} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {section.content.summary || 'Your professional summary will appear here...'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderExperience = () => {
    if (!cv.experience || cv.experience.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3"></div>
          Professional Experience
        </h2>
        <div className="space-y-6">
          {cv.experience.map((exp: any, index: number) => (
            <div key={index} className="relative pl-6 border-l-2 border-gray-200">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
              
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{exp.position || 'Position Title'}</h3>
                  <div className="flex items-center text-blue-600 font-medium mb-1">
                    <Building className="h-4 w-4 mr-2" />
                    {exp.company || 'Company Name'}
                  </div>
                  {exp.location && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {exp.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-500 text-sm mt-2 md:mt-0">
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
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
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
    if (!cv.education || cv.education.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3"></div>
          Education
        </h2>
        <div className="space-y-4">
          {cv.education.map((edu: any, index: number) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                  </h3>
                  <div className="flex items-center text-blue-600 font-medium mb-2">
                    <Award className="h-4 w-4 mr-2" />
                    {edu.institution}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {edu.gpa && (
                      <span>GPA: {edu.gpa}</span>
                    )}
                    {edu.honors && (
                      <span>{edu.honors}</span>
                    )}
                  </div>
                </div>
                {(edu.start_date || edu.end_date) && (
                  <div className="text-gray-500 text-sm mt-2 md:mt-0">
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
    if (!cv.skills || cv.skills.length === 0) return null;

    const skillsByCategory = cv.skills.reduce((acc: any, skill: any) => {
      const category = skill.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3"></div>
          Skills & Expertise
        </h2>
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill: any, skillIndex: number) => (
                  <div key={skillIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    {skill.proficiency_level && (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                level <= Math.ceil(skill.proficiency_level / 20) ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 min-w-12">
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
    if (!cv.projects || cv.projects.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3"></div>
          Projects
        </h2>
        <div className="space-y-6">
          {cv.projects.map((project: any, index: number) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
              {project.description && (
                <p className="text-gray-700 mb-3">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-4 text-sm">
                {project.project_url && (
                  <a href={project.project_url} className="text-blue-600 hover:text-blue-700">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} className="text-blue-600 hover:text-blue-700">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">CV Preview</h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {cv.public_url && (
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Public
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
          <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
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
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Award className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600">Start adding sections to see your CV preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}