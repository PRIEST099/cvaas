import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  Reply, 
  MoreVertical,
  Tag,
  AlertCircle,
  Lightbulb,
  Heart,
  HelpCircle
} from 'lucide-react';
import { CVComment, CommentType, CommentPriority } from '../../types/collaboration';
import { collaborationService } from '../../services/collaborationService';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';

interface CommentSystemProps {
  cvId: string;
  sectionId: string;
  isEditable: boolean;
  onCommentsChange?: (comments: CVComment[]) => void;
}

export function CommentSystem({ cvId, sectionId, isEditable, onCommentsChange }: CommentSystemProps) {
  const [comments, setComments] = useState<CVComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddComment, setShowAddComment] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; range: any } | null>(null);
  const [newComment, setNewComment] = useState({
    content: '',
    type: 'suggestion' as CommentType,
    priority: 'medium' as CommentPriority,
    tags: [] as string[]
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const commentOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [cvId, sectionId]);

  useEffect(() => {
    if (isEditable) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => document.removeEventListener('mouseup', handleTextSelection);
    }
  }, [isEditable]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const allComments = await collaborationService.getComments(cvId);
      const sectionComments = allComments.filter(comment => comment.sectionId === sectionId);
      setComments(sectionComments);
      onCommentsChange?.(sectionComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText({
        text: selection.toString(),
        range: {
          start: range.startOffset,
          end: range.endOffset,
          rect: rect
        }
      });
      setShowAddComment(true);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.content.trim() || !selectedText) return;

    try {
      const commentData = {
        cvId,
        sectionId,
        authorId: 'current_user', // Would come from auth context
        authorType: 'peer' as const,
        targetElement: {
          type: 'text' as const,
          elementId: sectionId,
          textRange: {
            start: selectedText.range.start,
            end: selectedText.range.end,
            selectedText: selectedText.text
          }
        },
        position: {
          x: selectedText.range.rect.left,
          y: selectedText.range.rect.top,
          anchor: 'right' as const
        },
        content: newComment.content,
        type: newComment.type,
        priority: newComment.priority,
        tags: newComment.tags
      };

      const comment = await collaborationService.addComment(commentData);
      setComments(prev => [...prev, comment]);
      
      // Reset form
      setNewComment({
        content: '',
        type: 'suggestion',
        priority: 'medium',
        tags: []
      });
      setShowAddComment(false);
      setSelectedText(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      const updatedComment = await collaborationService.voteOnComment(commentId, 'current_user', voteType);
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    } catch (error) {
      console.error('Failed to vote on comment:', error);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      const updatedComment = await collaborationService.resolveComment(commentId, 'current_user');
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      // In a real implementation, this would add a reply to the comment
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.replies.push({
          id: `reply_${Date.now()}`,
          commentId,
          authorId: 'current_user',
          content: replyContent,
          createdAt: new Date().toISOString(),
          isFromOwner: true // Would be determined by auth context
        });
        setComments([...comments]);
      }
      
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const getCommentIcon = (type: CommentType) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'question': return <HelpCircle className="h-4 w-4 text-purple-500" />;
      case 'praise': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'concern': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: CommentPriority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Modal */}
      {showAddComment && selectedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Add Comment</h3>
              
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Selected text:</p>
                <p className="text-sm font-medium">"{selectedText.text}"</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newComment.type}
                    onChange={(e) => setNewComment(prev => ({ ...prev, type: e.target.value as CommentType }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="question">Question</option>
                    <option value="praise">Praise</option>
                    <option value="concern">Concern</option>
                    <option value="grammar">Grammar</option>
                  </select>
                  
                  <select
                    value={newComment.priority}
                    onChange={(e) => setNewComment(prev => ({ ...prev, priority: e.target.value as CommentPriority }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <textarea
                  value={newComment.content}
                  onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your comment..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="flex items-center space-x-2">
                  <Button onClick={handleAddComment} disabled={!newComment.content.trim()}>
                    Add Comment
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddComment(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className={`border-l-4 ${getPriorityColor(comment.priority)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCommentIcon(comment.type)}
                  <span className="font-medium text-sm">
                    {comment.authorType === 'peer' ? 'Peer Reviewer' : 
                     comment.authorType === 'employer' ? 'Employer' : 'Mentor'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {comment.isResolved && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Resolved
                    </span>
                  )}
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected text context */}
              {comment.targetElement.textRange && (
                <div className="mb-3 p-2 bg-blue-50 border-l-2 border-blue-200 rounded">
                  <p className="text-xs text-blue-600 mb-1">Commenting on:</p>
                  <p className="text-sm italic">"{comment.targetElement.textRange.selectedText}"</p>
                </div>
              )}

              <p className="text-gray-700 mb-3">{comment.content}</p>

              {/* Tags */}
              {comment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {comment.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleVote(comment.id, 'up')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.upvotes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote(comment.id, 'down')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{comment.downvotes}</span>
                  </button>
                  
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </div>

                {!comment.isResolved && isEditable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(comment.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">
                          {reply.isFromOwner ? 'CV Owner' : 'Reviewer'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-4 border-l-2 border-blue-200">
                  <div className="flex space-x-2">
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-600 mb-4">
            {isEditable 
              ? 'Select text to add the first comment and start collaborating!'
              : 'Comments will appear here when reviewers provide feedback.'
            }
          </p>
        </div>
      )}
    </div>
  );
}