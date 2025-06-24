import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye,
  Settings,
  Target,
  Clock,
  Award,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { questService } from '../../services/questService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader } from '../ui/Card';

export function QuestBuilder() {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    category: 'coding' as const,
    difficulty: 'intermediate' as const,
    estimated_time: 60,
    instructions: {
      overview: '',
      requirements: [],
      deliverables: [],
      evaluation_criteria: []
    },
    resources: {
      documentation: [],
      tools: [],
      examples: []
    },
    skills_assessed: [] as string[],
    verification_criteria: {
      automated_tests: false,
      manual_review: true,
      peer_review: false,
      criteria: []
    },
    passing_score: 80,
    badge_metadata: {
      name: '',
      description: '',
      level: 'bronze',
      rarity: 'common'
    },
    is_active: true
  });

  useEffect(() => {
    if (questId) {
      loadQuest();
    }
  }, [questId]);

  const loadQuest = async () => {
    try {
      setIsLoading(true);
      const quest = await questService.getQuest(questId!);
      setQuestData({
        title: quest.title,
        description: quest.description,
        category: quest.category,
        difficulty: quest.difficulty,
        estimated_time: quest.estimated_time || 60,
        instructions: quest.instructions || { overview: '', requirements: [], deliverables: [], evaluation_criteria: [] },
        resources: quest.resources || { documentation: [], tools: [], examples: [] },
        skills_assessed: quest.skills_assessed || [],
        verification_criteria: quest.verification_criteria || { automated_tests: false, manual_review: true, peer_review: false, criteria: [] },
        passing_score: quest.passing_score,
        badge_metadata: quest.badge_metadata || { name: '', description: '', level: 'bronze', rarity: 'common' },
        is_active: quest.is_active
      });
    } catch (error) {
      console.error('Failed to load quest:', error);
      setError('Failed to load quest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!questData.title.trim() || !questData.description.trim()) {
        setError('Title and description are required');
        return;
      }

      const questPayload = {
        title: questData.title,
        description: questData.description,
        category: questData.category,
        difficulty: questData.difficulty,
        estimated_time: questData.estimated_time,
        instructions: questData.instructions,
        resources: questData.resources,
        skills_assessed: questData.skills_assessed,
        verification_criteria: questData.verification_criteria,
        passing_score: questData.passing_score,
        badge_metadata: questData.badge_metadata,
        is_active: questData.is_active
      };

      if (questId) {
        await questService.updateQuest(questId, questPayload);
      } else {
        await questService.createQuest(questPayload);
      }

      navigate('/recruiter/quests');
    } catch (error: any) {
      setError(error.message || 'Failed to save quest');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    setQuestData(prev => ({
      ...prev,
      skills_assessed: [...prev.skills_assessed, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setQuestData(prev => ({
      ...prev,
      skills_assessed: prev.skills_assessed.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index: number) => {
    setQuestData(prev => ({
      ...prev,
      skills_assessed: prev.skills_assessed.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setQuestData(prev => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        requirements: [...prev.instructions.requirements, '']
      }
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setQuestData(prev => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        requirements: prev.instructions.requirements.map((req, i) => i === index ? value : req)
      }
    }));
  };

  const removeRequirement = (index: number) => {
    setQuestData(prev => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        requirements: prev.instructions.requirements.filter((_, i) => i !== index)
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Target },
    { id: 'instructions', label: 'Instructions', icon: BookOpen },
    { id: 'assessment', label: 'Assessment', icon: CheckCircle },
    { id: 'badge', label: 'Badge', icon: Award }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/recruiter/quests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quests
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {questId ? 'Edit Quest' : 'Create New Quest'}
            </h1>
            <p className="text-gray-600 mt-2">
              Design skill-based challenges to evaluate candidates
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {questId ? 'Update Quest' : 'Create Quest'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Quest Details</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Quest Title"
                    value={questData.title}
                    onChange={(e) => setQuestData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., React Component Challenge"
                    required
                  />

                  <Textarea
                    label="Description"
                    value={questData.description}
                    onChange={(e) => setQuestData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what candidates will be doing in this quest..."
                    rows={4}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={questData.category}
                        onChange={(e) => setQuestData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="coding">Coding</option>
                        <option value="design">Design</option>
                        <option value="writing">Writing</option>
                        <option value="analysis">Analysis</option>
                        <option value="leadership">Leadership</option>
                        <option value="communication">Communication</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={questData.difficulty}
                        onChange={(e) => setQuestData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Estimated Time (minutes)"
                    type="number"
                    value={questData.estimated_time}
                    onChange={(e) => setQuestData(prev => ({ ...prev, estimated_time: parseInt(e.target.value) }))}
                    min="15"
                    max="480"
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={questData.is_active}
                      onChange={(e) => setQuestData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Quest is active and visible to candidates
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Skills Assessed</h3>
                    <Button size="sm" onClick={addSkill}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questData.skills_assessed.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          placeholder="e.g., React, JavaScript, Problem Solving"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    {questData.skills_assessed.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No skills added yet. Click "Add Skill" to get started.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Quest Overview</h3>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Overview"
                  value={questData.instructions.overview}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    instructions: { ...prev.instructions, overview: e.target.value }
                  }))}
                  placeholder="Provide a detailed overview of what candidates need to accomplish..."
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Requirements</h3>
                  <Button size="sm" onClick={addRequirement}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Requirement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questData.instructions.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Textarea
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="Describe a specific requirement..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        className="mt-1"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {questData.instructions.requirements.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No requirements added yet. Click "Add Requirement" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Verification Method</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={questData.verification_criteria.manual_review}
                      onChange={(e) => setQuestData(prev => ({
                        ...prev,
                        verification_criteria: {
                          ...prev.verification_criteria,
                          manual_review: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manual review by recruiter</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={questData.verification_criteria.automated_tests}
                      onChange={(e) => setQuestData(prev => ({
                        ...prev,
                        verification_criteria: {
                          ...prev.verification_criteria,
                          automated_tests: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Automated testing (coming soon)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={questData.verification_criteria.peer_review}
                      onChange={(e) => setQuestData(prev => ({
                        ...prev,
                        verification_criteria: {
                          ...prev.verification_criteria,
                          peer_review: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Peer review (coming soon)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Scoring</h3>
              </CardHeader>
              <CardContent>
                <Input
                  label="Passing Score (%)"
                  type="number"
                  value={questData.passing_score}
                  onChange={(e) => setQuestData(prev => ({ ...prev, passing_score: parseInt(e.target.value) }))}
                  min="0"
                  max="100"
                  helperText="Minimum score required to pass this quest and earn a badge"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badge Tab */}
        {activeTab === 'badge' && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Badge Configuration</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Badge Name"
                  value={questData.badge_metadata.name}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    badge_metadata: { ...prev.badge_metadata, name: e.target.value }
                  }))}
                  placeholder="e.g., React Master"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Level
                  </label>
                  <select
                    value={questData.badge_metadata.level}
                    onChange={(e) => setQuestData(prev => ({
                      ...prev,
                      badge_metadata: { ...prev.badge_metadata, level: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="Badge Description"
                value={questData.badge_metadata.description}
                onChange={(e) => setQuestData(prev => ({
                  ...prev,
                  badge_metadata: { ...prev.badge_metadata, description: e.target.value }
                }))}
                placeholder="Describe what this badge represents..."
                rows={3}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}