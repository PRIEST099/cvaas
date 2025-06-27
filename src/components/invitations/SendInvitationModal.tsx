import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Calendar, 
  Target, 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { talentService } from '../../services/talentService';
import { questService } from '../../services/questService';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  cvId: string;
  candidateName?: string;
  cvTitle?: string;
}

export function SendInvitationModal({
  isOpen,
  onClose,
  candidateId,
  cvId,
  candidateName = 'Candidate',
  cvTitle = 'CV'
}: SendInvitationModalProps) {
  const [message, setMessage] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState<string | undefined>(undefined);
  const [expirationDays, setExpirationDays] = useState(7);
  const [quests, setQuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQuests();
      // Set default message
      setMessage(`Hello,\n\nI came across your profile and I'm impressed with your skills and experience. I'd like to discuss a potential opportunity with you.\n\nPlease let me know if you're interested in connecting.\n\nBest regards,`);
    }
  }, [isOpen]);

  const loadQuests = async () => {
    try {
      setIsLoading(true);
      const questsData = await questService.getQuests();
      // Filter to only active quests
      const activeQuests = questsData.filter(q => q.is_active);
      setQuests(activeQuests);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!message.trim()) {
      setError('Please provide a message for the candidate');
      return;
    }

    try {
      setIsSending(true);
      setError('');

      await talentService.sendInvitation({
        candidateId,
        cvId,
        questId: selectedQuestId,
        message: message.trim(),
        expiresInDays: expirationDays
      });

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form state
        setMessage('');
        setSelectedQuestId(undefined);
        setExpirationDays(7);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Send Invitation</h2>
              <p className="text-blue-100 text-sm">
                Invite candidate to connect or complete a quest
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Invitation Sent!</h3>
              <p className="text-gray-600">
                Your invitation has been sent successfully. You'll be notified when the candidate responds.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Candidate Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {candidateName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{candidateName}</h3>
                      <p className="text-sm text-gray-600">{cvTitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invitation Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a personalized message to the candidate..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Quest (Optional)
                  </label>
                  <select
                    value={selectedQuestId || ''}
                    onChange={(e) => setSelectedQuestId(e.target.value || undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No quest (invitation only)</option>
                    {isLoading ? (
                      <option disabled>Loading quests...</option>
                    ) : (
                      quests.map(quest => (
                        <option key={quest.id} value={quest.id}>
                          {quest.title} ({quest.difficulty})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Including a quest will allow the candidate to complete it as part of their response.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Expires In
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 text-sm">What happens next?</h4>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• The candidate will receive an email notification</li>
                      <li>• They can view your message and accept or decline</li>
                      <li>• If you included a quest, they can complete it as part of their response</li>
                      <li>• You'll be notified when they respond</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvitation}
                  className="flex-1"
                  isLoading={isSending}
                  disabled={!message.trim() || isSending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}