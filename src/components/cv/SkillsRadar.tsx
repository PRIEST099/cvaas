import React, { useState, useEffect } from 'react';
import { X, Sparkles, Github, Linkedin, Globe, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { CV, SkillsRadarData, DetectedSkill, SkillSource } from '../../types/cv';
import { ScanSkillsResponse } from '../../types/api';
import { cvService } from '../../services/cvService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface SkillsRadarProps {
  cv: CV;
  onClose: () => void;
  onSkillsUpdated: (skillsData: SkillsRadarData) => void;
}

export function SkillsRadar({ cv, onClose, onSkillsUpdated }: SkillsRadarProps) {
  const [skillsData, setSkillsData] = useState<SkillsRadarData>(cv.skillsRadar);
  const [isScanning, setIsScanning] = useState(false);
  const [sources, setSources] = useState({
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [newSkill, setNewSkill] = useState({ name: '', category: '', proficiency: 50 });
  const [activeTab, setActiveTab] = useState<'detected' | 'manual' | 'sources'>('detected');

  const handleScanSkills = async () => {
    setIsScanning(true);
    try {
      const result = await cvService.scanSkills({
        sources,
        existingSkills: skillsData.detectedSkills.map(s => s.name)
      });
      
      const updatedSkillsData: SkillsRadarData = {
        ...skillsData,
        detectedSkills: result.detectedSkills,
        skillCategories: result.skillCategories,
        lastScanned: new Date().toISOString(),
        sources: skillsData.sources.map(source => ({
          ...source,
          lastScanned: new Date().toISOString(),
          status: 'connected' as const,
          skillsFound: result.detectedSkills.filter(s => s.source === source.type).length
        }))
      };
      
      setSkillsData(updatedSkillsData);
      onSkillsUpdated(updatedSkillsData);
    } catch (error) {
      console.error('Skills scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const addManualSkill = () => {
    if (!newSkill.name.trim()) return;
    
    const skill = {
      ...newSkill,
      name: newSkill.name.trim()
    };
    
    const updatedSkillsData = {
      ...skillsData,
      manualSkills: [...skillsData.manualSkills, skill]
    };
    
    setSkillsData(updatedSkillsData);
    onSkillsUpdated(updatedSkillsData);
    setNewSkill({ name: '', category: '', proficiency: 50 });
  };

  const removeSkill = (skillName: string, type: 'detected' | 'manual') => {
    const updatedSkillsData = {
      ...skillsData,
      [type === 'detected' ? 'detectedSkills' : 'manualSkills']: 
        skillsData[type === 'detected' ? 'detectedSkills' : 'manualSkills']
          .filter(s => s.name !== skillName)
    };
    
    setSkillsData(updatedSkillsData);
    onSkillsUpdated(updatedSkillsData);
  };

  const updateSkillProficiency = (skillName: string, proficiency: number, type: 'detected' | 'manual') => {
    const updatedSkillsData = {
      ...skillsData,
      [type === 'detected' ? 'detectedSkills' : 'manualSkills']: 
        skillsData[type === 'detected' ? 'detectedSkills' : 'manualSkills']
          .map(s => s.name === skillName ? { ...s, proficiency } : s)
    };
    
    setSkillsData(updatedSkillsData);
    onSkillsUpdated(updatedSkillsData);
  };

  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 80) return 'bg-green-500';
    if (proficiency >= 60) return 'bg-blue-500';
    if (proficiency >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Skills Radar</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex border-b border-gray-200">
          {[
            { id: 'detected', label: 'AI Detected', count: skillsData.detectedSkills.length },
            { id: 'manual', label: 'Manual Skills', count: skillsData.manualSkills.length },
            { id: 'sources', label: 'Data Sources', count: skillsData.sources.length }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">LinkedIn</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="LinkedIn profile URL"
                      value={sources.linkedin}
                      onChange={(e) => setSources(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Github className="h-5 w-5 text-gray-900" />
                      <h3 className="font-medium">GitHub</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="GitHub username"
                      value={sources.github}
                      onChange={(e) => setSources(prev => ({ ...prev, github: e.target.value }))}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">Portfolio</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Portfolio website URL"
                      value={sources.portfolio}
                      onChange={(e) => setSources(prev => ({ ...prev, portfolio: e.target.value }))}
                    />
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleScanSkills}
                isLoading={isScanning}
                className="w-full"
                disabled={!sources.linkedin && !sources.github && !sources.portfolio}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan for Skills
              </Button>

              {skillsData.sources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Connected Sources</h3>
                  {skillsData.sources.map((source, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {source.type === 'linkedin' && <Linkedin className="h-5 w-5 text-blue-600" />}
                            {source.type === 'github' && <Github className="h-5 w-5 text-gray-900" />}
                            {source.type === 'portfolio' && <Globe className="h-5 w-5 text-green-600" />}
                            <div>
                              <p className="font-medium capitalize">{source.type}</p>
                              <p className="text-sm text-gray-600">
                                {source.skillsFound} skills found • Last scanned {new Date(source.lastScanned).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            source.status === 'connected' ? 'bg-green-100 text-green-800' :
                            source.status === 'scanning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {source.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'detected' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {skillsData.detectedSkills.map((skill, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {skill.category}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {skill.source}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Proficiency</span>
                                <span>{skill.proficiency}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getSkillColor(skill.proficiency)}`}
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {Math.round(skill.confidence * 100)}% confidence
                            </div>
                          </div>
                          
                          {skill.evidence.length > 0 && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                Evidence ({skill.evidence.length})
                              </summary>
                              <ul className="mt-2 space-y-1 text-gray-600">
                                {skill.evidence.slice(0, 3).map((evidence, i) => (
                                  <li key={i} className="truncate">• {evidence}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.proficiency}
                            onChange={(e) => updateSkillProficiency(skill.name, parseInt(e.target.value), 'detected')}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.name, 'detected')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Add Manual Skill</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Category"
                      value={newSkill.category}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proficiency: {newSkill.proficiency}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newSkill.proficiency}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <Button onClick={addManualSkill} disabled={!newSkill.name.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {skillsData.manualSkills.map((skill, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {skill.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Proficiency</span>
                                <span>{skill.proficiency}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getSkillColor(skill.proficiency)}`}
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.proficiency}
                            onChange={(e) => updateSkillProficiency(skill.name, parseInt(e.target.value), 'manual')}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.name, 'manual')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}