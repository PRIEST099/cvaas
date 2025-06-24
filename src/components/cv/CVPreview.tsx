import React from 'react';
import { X, Download, Share2, ExternalLink } from 'lucide-react';
import { EmbeddableCVRenderer } from './EmbeddableCVRenderer';
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
            <EmbeddableCVRenderer cv={cv} />
          </div>
        </div>
      </div>
    </div>
  );
}