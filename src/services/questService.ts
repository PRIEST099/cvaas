import { supabase, handleSupabaseError, getCurrentUser, checkUserRole } from '../lib/supabase';
import { Database } from '../types/database';
import { FeedbackItem, StructuredFeedback } from '../types';

type Quest = Database['public']['Tables']['quests']['Row'];
type QuestInsert = Database['public']['Tables']['quests']['Insert'];
type QuestUpdate = Database['public']['Tables']['quests']['Update'];
type QuestSubmission = Database['public']['Tables']['quest_submissions']['Row'];
type QuestSubmissionInsert = Database['public']['Tables']['quest_submissions']['Insert'];
type Badge = Database['public']['Tables']['badges']['Row'];

class QuestService {
  // Quest Management (Recruiters)
  async getQuests(createdBy?: string): Promise<Quest[]> {
    try {
      let query = supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (createdBy) {
        query = query.eq('created_by', createdBy);
      } else {
        // If no specific creator, show active quests for candidates
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async getQuest(questId: string): Promise<Quest> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Quest not found');

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async createQuest(questData: Omit<QuestInsert, 'created_by'>): Promise<Quest> {
    try {
      // Ensure user is a recruiter
      const user = await checkUserRole('recruiter');

      const { data, error } = await supabase
        .from('quests')
        .insert({
          ...questData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateQuest(questId: string, updates: QuestUpdate): Promise<Quest> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update(updates)
        .eq('id', questId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteQuest(questId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Quest Submissions - Updated to support recruiter filtering and prevent multiple active submissions
  async getSubmissions(options?: {
    questId?: string;
    userId?: string;
    forRecruiter?: boolean;
  }): Promise<QuestSubmission[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      let query = supabase
        .from('quest_submissions')
        .select(`
          *,
          quests (title, category, difficulty, created_by)
        `)
        .order('submitted_at', { ascending: false });

      if (options?.forRecruiter) {
        // For recruiters: get submissions to quests they created
        query = query.eq('quests.created_by', user.id);
      } else if (options?.userId) {
        // For specific user submissions
        query = query.eq('user_id', options.userId);
      } else {
        // Default: get submissions by current user (for candidates)
        query = query.eq('user_id', user.id);
      }

      if (options?.questId) {
        query = query.eq('quest_id', options.questId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // Get user's submission status for a specific quest
  async getUserQuestSubmissionStatus(questId: string, userId?: string): Promise<{
    hasSubmission: boolean;
    latestSubmission?: QuestSubmission;
    canSubmit: boolean;
  }> {
    try {
      const user = await getCurrentUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('quest_submissions')
        .select('*')
        .eq('quest_id', questId)
        .eq('user_id', targetUserId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      const latestSubmission = data?.[0];
      const hasSubmission = !!latestSubmission;
      
      // User can submit if:
      // 1. No previous submission, OR
      // 2. Latest submission was failed or needs revision
      const canSubmit = !hasSubmission || 
        (latestSubmission.status === 'failed' || latestSubmission.status === 'needs_revision');

      return {
        hasSubmission,
        latestSubmission,
        canSubmit
      };
    } catch (error) {
      handleSupabaseError(error);
      return { hasSubmission: false, canSubmit: true };
    }
  }

  async submitQuest(submission: Omit<QuestSubmissionInsert, 'user_id'>): Promise<QuestSubmission> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      // Check if user already has an active submission for this quest
      const submissionStatus = await this.getUserQuestSubmissionStatus(submission.quest_id, user.id);
      
      if (!submissionStatus.canSubmit) {
        const latestStatus = submissionStatus.latestSubmission?.status;
        if (latestStatus === 'submitted' || latestStatus === 'under_review') {
          throw new Error('You already have a pending submission for this quest. Please wait for review before submitting again.');
        } else if (latestStatus === 'passed') {
          throw new Error('You have already passed this quest.');
        }
      }

      // Determine attempt number
      const { data: existingSubmissions } = await supabase
        .from('quest_submissions')
        .select('attempt_number')
        .eq('quest_id', submission.quest_id)
        .eq('user_id', user.id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = existingSubmissions?.[0]?.attempt_number ? 
        existingSubmissions[0].attempt_number + 1 : 1;

      const { data, error } = await supabase
        .from('quest_submissions')
        .insert({
          ...submission,
          user_id: user.id,
          attempt_number: attemptNumber
        })
        .select()
        .single();

      if (error) throw error;

      // Update quest statistics
      await this.updateQuestStats(submission.quest_id);

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async reviewSubmission(
    submissionId: string, 
    review: {
      status: 'passed' | 'failed' | 'needs_revision';
      score?: number;
      feedback?: StructuredFeedback;
    }
  ): Promise<QuestSubmission> {
    try {
      const user = await checkUserRole('recruiter');

      const { data, error } = await supabase
        .from('quest_submissions')
        .update({
          status: review.status,
          score: review.score,
          feedback: review.feedback,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      // If passed, award badge
      if (review.status === 'passed' && review.score && review.score >= 80) {
        await this.awardBadge(data.user_id, data.quest_id, review.score);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // Badge Management
  async getUserBadges(userId?: string): Promise<Badge[]> {
    try {
      const user = await getCurrentUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async awardBadge(userId: string, questId: string, score: number): Promise<Badge> {
    try {
      // Get quest details for badge metadata
      const quest = await this.getQuest(questId);

      const badgeLevel = this.calculateBadgeLevel(score);
      const badgeRarity = this.calculateBadgeRarity(quest.difficulty, score);

      const { data, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          quest_id: questId,
          name: `${quest.title} ${badgeLevel}`,
          description: `Earned by completing ${quest.title} with a score of ${score}%`,
          skill: quest.skills_assessed?.[0] || 'General',
          level: badgeLevel,
          rarity: badgeRarity,
          blockchain_data: {
            score,
            quest_difficulty: quest.difficulty,
            earned_date: new Date().toISOString()
          },
          is_verified: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // Leaderboard functionality
  async getLeaderboard(timeframe: string = 'all-time', category: string = 'overall'): Promise<any[]> {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would create a Supabase view or RPC function
      // to aggregate user performance data
      
      const { data: submissions, error } = await supabase
        .from('quest_submissions')
        .select(`
          user_id,
          score,
          status,
          submitted_at,
          quests (category, difficulty)
        `)
        .eq('status', 'passed')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Get badges data
      const { data: badges } = await supabase
        .from('badges')
        .select('user_id, level, rarity');

      // Aggregate user performance
      const userStats = submissions?.reduce((acc: any, submission: any) => {
        const userId = submission.user_id;
        
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            displayName: `User ${userId.slice(-8)}`, // Anonymized display name
            totalQuestsPassed: 0,
            totalScore: 0,
            averageScore: 0,
            totalBadges: 0,
            submissions: []
          };
        }
        
        acc[userId].totalQuestsPassed += 1;
        acc[userId].totalScore += submission.score || 0;
        acc[userId].submissions.push(submission);
        
        return acc;
      }, {});

      // Add badge counts
      badges?.forEach((badge: any) => {
        if (userStats[badge.user_id]) {
          userStats[badge.user_id].totalBadges += 1;
        }
      });

      // Calculate averages and sort
      const leaderboard = Object.values(userStats || {}).map((user: any) => ({
        ...user,
        averageScore: user.totalQuestsPassed > 0 ? user.totalScore / user.totalQuestsPassed : 0,
        totalScore: user.totalScore // Use total score for ranking
      })).sort((a: any, b: any) => b.totalScore - a.totalScore);

      return leaderboard;
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // Helper methods
  private async updateQuestStats(questId: string): Promise<void> {
    try {
      // Get all submissions for this quest
      const { data: submissions } = await supabase
        .from('quest_submissions')
        .select('status')
        .eq('quest_id', questId);

      if (!submissions) return;

      const totalAttempts = submissions.length;
      const passedSubmissions = submissions.filter(s => s.status === 'passed').length;
      const successRate = totalAttempts > 0 ? passedSubmissions / totalAttempts : 0;

      await supabase
        .from('quests')
        .update({
          total_attempts: totalAttempts,
          success_rate: successRate
        })
        .eq('id', questId);
    } catch (error) {
      console.error('Error updating quest stats:', error);
    }
  }

  private calculateBadgeLevel(score: number): string {
    if (score >= 95) return 'diamond';
    if (score >= 90) return 'platinum';
    if (score >= 85) return 'gold';
    if (score >= 80) return 'silver';
    return 'bronze';
  }

  private calculateBadgeRarity(difficulty: string, score: number): string {
    if (difficulty === 'expert' && score >= 95) return 'legendary';
    if (difficulty === 'expert' && score >= 90) return 'epic';
    if (difficulty === 'advanced' && score >= 95) return 'epic';
    if (difficulty === 'advanced' && score >= 90) return 'rare';
    if (score >= 95) return 'rare';
    if (score >= 90) return 'uncommon';
    return 'common';
  }

  // Search and filtering
  async searchQuests(filters: {
    category?: string;
    difficulty?: string;
    skills?: string[];
    search?: string;
  }): Promise<Quest[]> {
    try {
      let query = supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills_assessed', filters.skills);
      }

      if (filters.search) {
        query = query.textSearch('title', filters.search);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }
}

export const questService = new QuestService();