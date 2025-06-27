import { handleSupabaseError } from '../lib/supabase';

interface OptimizationRequest {
  text: string;
  context?: string;
  sectionType?: string;
}

interface OptimizationResponse {
  optimizedText: string;
  suggestions?: string[];
  confidence?: number;
}

interface CVOptimizationRequest {
  cvData: any;
  context?: string; // Job description or target role
}

interface CVOptimizationResponse {
  optimizedCV: any; // Full CV with optimized sections
  optimizedSections: Record<string, any>; // Just the optimized sections
  suggestions?: string[];
  confidence?: number;
  aiDetectionScore?: number;
}

interface CandidateMatchRequest {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  candidates: any[];
}

interface CandidateMatchResponse {
  matches: {
    candidateId: string;
    score: number;
    relevance: number;
    matchedSkills: string[];
    missingSkills: string[];
    notes: string;
  }[];
  suggestions?: string[];
}

class AIService {
  private readonly apiUrl = 'https://api-inference.huggingface.co/models';
  private readonly modelId = import.meta.env.VITE_HF_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.3';
  private readonly apiToken = import.meta.env.VITE_HUGGING_FACE_API_TOKEN;

  constructor() {
    if (!this.apiToken) {
      console.warn('Hugging Face API token not found. AI optimization will not work.');
    }
  }

  async optimizeCVContent(request: CVOptimizationRequest): Promise<CVOptimizationResponse> {
    if (!this.apiToken) {
      throw new Error('Hugging Face API token not configured. Please add VITE_HUGGING_FACE_API_TOKEN to your environment variables.');
    }

    try {
      // Create a deep copy of the CV data
      const fullCV = JSON.parse(JSON.stringify(request.cvData));
      const sectionsToOptimize = this.extractOptimizableSections(fullCV);
      
      // Construct the optimization prompt
      const prompt = this.buildCVOptimizationPrompt({
        ...request,
        cvData: { sections: sectionsToOptimize }
      });

      const response = await fetch(`${this.apiUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 8192,
            temperature: 0.75,
            do_sample: true,
            top_p: 0.85,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      let optimizedText = '';
      if (Array.isArray(result) && result.length > 0) {
        optimizedText = result[0].generated_text || result[0].text || '';
      } else if (result.generated_text) {
        optimizedText = result.generated_text;
      } else if (typeof result === 'string') {
        optimizedText = result;
      }

      if (!optimizedText.trim()) {
        throw new Error('No optimized content received from AI model');
      }

      // Parse the AI response
      const optimizedSections = this.parseOptimizedResponse(optimizedText);
      
      // Merge optimized sections back into full CV
      const mergedCV = this.mergeOptimizedSections(fullCV, optimizedSections);
      
      // Apply humanization techniques to optimized sections
      this.humanizeOptimizedContent(mergedCV);
      
      // Calculate human likeness score
      const contentStr = JSON.stringify(mergedCV);
      const humanLikeness = this.calculateHumanLikeness(contentStr);
      const aiDetectionScore = 1 - humanLikeness;

      return {
        optimizedCV: mergedCV,
        optimizedSections,
        confidence: humanLikeness * 0.9,
        aiDetectionScore,
        suggestions: this.generateGeneralSuggestions()
      };
    } catch (error: any) {
      console.error('AI CV optimization failed:', error);
      throw new Error(`AI CV optimization failed: ${error.message}`);
    }
  }

  async matchCandidatesToJob(request: CandidateMatchRequest): Promise<CandidateMatchResponse> {
    if (!this.apiToken) {
      throw new Error('Hugging Face API token not configured. Please add VITE_HUGGING_FACE_API_TOKEN to your environment variables.');
    }

    try {
      // Construct the matching prompt
      const prompt = this.buildCandidateMatchingPrompt(request);

      const response = await fetch(`${this.apiUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 8192,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      let matchText = '';
      if (Array.isArray(result) && result.length > 0) {
        matchText = result[0].generated_text || result[0].text || '';
      } else if (result.generated_text) {
        matchText = result.generated_text;
      } else if (typeof result === 'string') {
        matchText = result;
      }

      if (!matchText.trim()) {
        throw new Error('No matching results received from AI model');
      }

      // Parse the AI response
      const matchResults = this.parseCandidateMatchResponse(matchText);
      
      return {
        matches: matchResults.matches,
        suggestions: matchResults.suggestions || []
      };
    } catch (error: any) {
      console.error('AI candidate matching failed:', error);
      throw new Error(`AI candidate matching failed: ${error.message}`);
    }
  }

  private buildCandidateMatchingPrompt(request: CandidateMatchRequest): string {
    const { jobTitle, jobDescription, requiredSkills, candidates } = request;
    
    // Sanitize inputs
    const sanitizedJobTitle = jobTitle.replace(/[{}<>\[\]]/g, "").substring(0, 200);
    const sanitizedJobDescription = jobDescription.replace(/[{}<>\[\]]/g, "").substring(0, 2000);
    const sanitizedSkills = requiredSkills.map(skill => skill.replace(/[{}<>\[\]]/g, "").substring(0, 100));
    
    // Prepare candidate data for the prompt
    const candidateProfiles = candidates.map(candidate => {
      // Create a simplified version of each candidate profile
      return {
        id: candidate.cv_id,
        title: candidate.cv_title,
        skills: candidate.skills_summary,
        experience: candidate.positions_summary,
        education: candidate.education_summary
      };
    });
    
    let prompt = `[INST] You are an expert AI recruiter assistant. Your task is to analyze candidate profiles and match them to a job description based on skills, experience, and qualifications.

JOB DETAILS:
Title: ${sanitizedJobTitle}
Description: ${sanitizedJobDescription}
Required Skills: ${sanitizedSkills.join(', ')}

CANDIDATE PROFILES:
${JSON.stringify(candidateProfiles, null, 2)}

TASK:
1. Analyze each candidate profile against the job requirements
2. Evaluate skill match, experience relevance, and overall fit
3. Rank candidates from most to least suitable
4. For each candidate, provide:
   - Match score (0-100)
   - Relevance score (0-100)
   - List of matched skills
   - List of missing skills
   - Brief notes explaining the match

MATCHING CRITERIA:
- Skills match: Weight skills mentioned in the job description heavily
- Experience relevance: Consider roles, responsibilities, and years of experience
- Education fit: Consider relevant degrees and certifications
- Overall profile: Holistic assessment of candidate suitability

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "matches": [
    {
      "candidateId": "candidate-id",
      "score": 85,
      "relevance": 90,
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3"],
      "notes": "Brief explanation of match"
    }
  ],
  "suggestions": [
    "Suggestion 1 for improving the search",
    "Suggestion 2 for improving the search"
  ]
}

IMPORTANT:
- Return ONLY the JSON object with matches and suggestions
- Rank candidates from highest to lowest score
- Include ALL candidates in the results, even low-scoring ones
- Ensure the JSON is valid and properly formatted
- Do not include any explanatory text outside the JSON structure [/INST]`;

    return prompt;
  }

  private parseCandidateMatchResponse(responseText: string): CandidateMatchResponse {
    try {
      let cleanedText = responseText.trim();
      
      // Remove common wrapper artifacts
      cleanedText = cleanedText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, ''); // Remove prefix only

      // Find the JSON object boundaries
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON object found in response');
      }
      
      // Extract just the JSON object
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);

      // Parse the JSON
      const parsedResponse = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!Array.isArray(parsedResponse.matches)) {
        throw new Error('Invalid response format: matches array is missing');
      }
      
      // Ensure each match has the required fields
      const validatedMatches = parsedResponse.matches.map((match: any) => ({
        candidateId: match.candidateId,
        score: typeof match.score === 'number' ? match.score : 0,
        relevance: typeof match.relevance === 'number' ? match.relevance : 0,
        matchedSkills: Array.isArray(match.matchedSkills) ? match.matchedSkills : [],
        missingSkills: Array.isArray(match.missingSkills) ? match.missingSkills : [],
        notes: typeof match.notes === 'string' ? match.notes : ''
      }));
      
      // Sort matches by score (highest first)
      validatedMatches.sort((a, b) => b.score - a.score);
      
      return {
        matches: validatedMatches,
        suggestions: Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : []
      };
    } catch (error) {
      console.error('Failed to parse AI candidate match response:', error);
      // Return a fallback empty response
      return {
        matches: [],
        suggestions: ['Failed to parse AI response. Please try again with more specific job details.']
      };
    }
  }

  private buildCVOptimizationPrompt(request: CVOptimizationRequest): string {
    const { cvData, context } = request;
    
    // Sanitize context
    const sanitizedContext = context 
      ? context.replace(/[{}<>\[\]]/g, "").substring(0, 1000) 
      : undefined;
    
    let prompt = `[INST] You are a professional CV optimization expert. Your task is to improve specific sections of the provided CV content to make it more compelling, professional, and human-like.

INPUT CV SECTIONS TO OPTIMIZE:
${JSON.stringify(cvData.sections, null, 2)}`;

    if (sanitizedContext) {
      prompt += `

TARGET JOB CONTEXT:
${sanitizedContext}

Please optimize specifically for this role.`;
    }

    prompt += `

OPTIMIZATION REQUIREMENTS:
1. Improve professional summary to be results-focused and compelling
2. Enhance experience descriptions with strong action verbs and quantifiable achievements
3. For bullet points in experience descriptions and achievements:
   - Generate appropriate number of points (quality over quantity)
   - Ensure each point highlights specific achievements
   - Maintain factual accuracy while improving impact
   - IMPORTANT: Format each bullet point on a new line - each new line will be displayed as a separate bullet point
   - Start each bullet point with a strong action verb
   - Include metrics and quantifiable results whenever possible
4. Optimize professional titles for impact
5. Preserve ALL original factual information
6. Use industry-standard keywords naturally
7. Make content concise but impactful
8. Improve project descriptions to align with experience and highlight technical skills
9. For project descriptions, also format bullet points on separate lines

HUMAN-LIKE WRITING GUIDELINES:
10. Vary sentence structure (mix short/long sentences)
11. Use 10-15% first-person pronouns where appropriate
12. Include natural language variations:
    - Varied punctuation (dashes, semicolons)
    - Occasional contractions (e.g., "I've", "Let's")
13. Avoid overused buzzwords and AI patterns
14. Maintain 70/30 formal-to-conversational ratio

OUTPUT FORMAT:
Return ONLY valid JSON with optimized sections in this structure:
{
  "personal_info": {
    "title": "optimized title",
    "fullName": "keep original",
    "email": "keep original",
    "phone": "keep original",
    "location": "keep original"
  },
  "summary": {
    "summary": "optimized text"
  },
  "experience": {
    "experiences": [
      {
        "position": "keep original",
        "company": "keep original",
        "location": "keep original",
        "startDate": "keep original",
        "endDate": "keep original",
        "isCurrent": "keep original",
        "description": "optimized text with each bullet point on a new line"
      }
    ]
  },
  "projects": {
    "projects": [
      {
        "title": "keep original",
        "description": "optimized text with each bullet point on a new line",
        "technologies": "keep original"
      }
    ]
  }
}

CRITICAL: 
1. Return ONLY the JSON object with optimized sections
2. Do NOT include sections that weren't in the input
3. Preserve all original factual information exactly as provided
4. Ensure all JSON strings are properly closed and escaped
5. Make sure the JSON is complete and valid - do not truncate the response [/INST]`;

    return prompt;
  }

  private sanitizeCVData(cvData: any): any {
    // Remove sensitive fields
    const sensitiveFields = [
      'ssn', 'dob', 'passport', 'securityClearance',
      'driverLicense', 'nationalId', 'ipAddress', 'creditCard'
    ];
    
    const sanitized = JSON.parse(JSON.stringify(cvData));
    
    const removeSensitive = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.includes(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitive(obj[key]);
        }
      }
    };
    
    removeSensitive(sanitized);
    return sanitized;
  }

  private extractOptimizableSections(cvData: any): any {
    const optimizable = {};
    const optimizableSectionTypes = ['personal_info', 'summary', 'experience', 'projects'];
    
    if (cvData.sections) {
      cvData.sections.forEach((section: any) => {
        if (optimizableSectionTypes.includes(section.section_type)) {
          optimizable[section.section_type] = section.content || {};
        }
      });
    }
    
    return optimizable;
  }

  private parseOptimizedResponse(responseText: string): Record<string, any> {
    try {
      let cleanedText = responseText.trim();
      
      // Remove common wrapper artifacts
      cleanedText = cleanedText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, ''); // Remove prefix only

      // Find the JSON object boundaries
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON object found in response');
      }
      
      // Extract just the JSON object
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);

      // Enhanced JSON fixing for truncated responses
      let fixedJson = cleanedText
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix keys
        .replace(/'/g, '"')     // Convert to double quotes
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
        .replace(/undefined/g, 'null');

      // Handle truncated strings more robustly
      fixedJson = fixedJson.replace(/:\s*"[^"]*$/g, (match) => {
        if (match.endsWith('"')) {
          return match;
        }
        // If string is truncated, close it properly
        return match + '"';
      });

      // Handle incomplete key-value pairs at the end
      fixedJson = fixedJson.replace(/:\s*[^",}\]]*$/, '');
      
      // Remove trailing commas at the very end
      fixedJson = fixedJson.replace(/,\s*$/, '');

      // Handle truncated objects/arrays by counting and balancing brackets
      let openBraces = 0;
      let openBrackets = 0;
      let inString = false;
      let escaped = false;
      
      for (let i = 0; i < fixedJson.length; i++) {
        const char = fixedJson[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') openBraces++;
          else if (char === '}') openBraces--;
          else if (char === '[') openBrackets++;
          else if (char === ']') openBrackets--;
        }
      }
      
      // Close any unclosed structures
      while (openBrackets > 0) {
        fixedJson += ']';
        openBrackets--;
      }
      while (openBraces > 0) {
        fixedJson += '}';
        openBraces--;
      }

      // Try to parse the JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(fixedJson);
      } catch (parseError) {
        // If parsing still fails, try to extract partial data
        console.warn('JSON parsing failed, attempting partial extraction:', parseError);
        
        // Try to extract at least some sections that might be complete
        const partialSections = this.extractPartialSections(cleanedText);
        if (Object.keys(partialSections).length > 0) {
          return partialSections;
        }
        
        throw parseError;
      }
      
      // Ensure we have at least one optimized section
      if (!parsedResponse.personal_info && 
          !parsedResponse.summary && 
          !parsedResponse.experience && 
          !parsedResponse.projects) {
        throw new Error('AI returned no optimizable sections');
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse AI response. The AI may have returned invalid JSON.');
    }
  }

  private extractPartialSections(text: string): Record<string, any> {
    const sections: Record<string, any> = {};
    
    // Try to extract complete sections using regex patterns
    const sectionPatterns = [
      {
        name: 'personal_info',
        pattern: /"personal_info"\s*:\s*\{[^}]*\}/g
      },
      {
        name: 'summary',
        pattern: /"summary"\s*:\s*\{[^}]*\}/g
      },
      {
        name: 'experience',
        pattern: /"experience"\s*:\s*\{[^}]*\}/g
      },
      {
        name: 'projects',
        pattern: /"projects"\s*:\s*\{[^}]*\}/g
      }
    ];
    
    for (const { name, pattern } of sectionPatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const sectionJson = `{${match[0]}}`;
          const parsed = JSON.parse(sectionJson);
          if (parsed[name]) {
            sections[name] = parsed[name];
          }
        } catch (e) {
          // Skip this section if it can't be parsed
          continue;
        }
      }
    }
    
    return sections;
  }

  private mergeOptimizedSections(fullCV: any, optimizedSections: Record<string, any>): any {
    // Create a deep copy to avoid mutation
    const mergedCV = JSON.parse(JSON.stringify(fullCV));
    
    if (!mergedCV.sections) return mergedCV;
    
    // Map through sections and merge optimized content
    mergedCV.sections = mergedCV.sections.map((section: any) => {
      const sectionType = section.section_type;
      
      if (optimizedSections[sectionType]) {
        return {
          ...section,
          content: optimizedSections[sectionType],
          ai_optimized: true
        };
      }
      
      return section;
    });
    
    return mergedCV;
  }

  private humanizeOptimizedContent(cvData: any): void {
    if (!cvData.sections) return;
    
    const humanizeText = (text: string): string => {
      if (!text) return text;
      
      return text
        // Vary spacing after periods (10% chance of double space)
        .replace(/\.\s+/g, (match) => Math.random() > 0.9 ? '.  ' : '. ')
        // Ensure proper spacing after periods
        .replace(/(\w)\.(\w)/g, '$1. $2')
        // Use contractions naturally
        .replace(/\bdo not\b/gi, () => Math.random() > 0.7 ? "don't" : "do not")
        .replace(/\bcannot\b/gi, () => Math.random() > 0.7 ? "can't" : "cannot")
        .replace(/\bI am\b/gi, () => Math.random() > 0.7 ? "I'm" : "I am")
        // Vary list punctuation
        .replace(/;\s/g, () => Math.random() > 0.8 ? '; ' : ', ');
    };

    // Process only optimized sections
    const optimizableSectionTypes = ['personal_info', 'summary', 'experience', 'projects'];
    
    cvData.sections.forEach((section: any) => {
      if (optimizableSectionTypes.includes(section.section_type)) {
        const processObject = (obj: any) => {
          if (!obj) return;
          
          for (const key in obj) {
            if (typeof obj[key] === 'string' && 
                !['email', 'phone', 'fullName'].includes(key)) {
              obj[key] = humanizeText(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              processObject(obj[key]);
            }
          }
        };
        
        processObject(section.content);
      }
    });
  }

  private calculateHumanLikeness(text: string): number {
    // Calculate human-like score (0-1)
    const aiPatterns = [
      /as an ai model/gi, 
      /in the realm of/gi,
      /synerg(?:y|istic)/gi,
      /paradigm shift/gi,
      /unleash.{1,5}potential/gi,
      /in today's fast-paced world/gi
    ];
    
    let aiScore = 0;
    aiPatterns.forEach(regex => {
      aiScore += (text.match(regex) || []).length * 2;
    });
    
    const humanPatterns = [
      /I\s/g, /we\s/g, /our\s/g, 
      /\, but\s/g, /however\s/g, /actually\s/g,
      /I've/g, /I'm/g, /let's/g
    ];
    
    let humanScore = 0;
    humanPatterns.forEach(regex => {
      humanScore += (text.match(regex) || []).length * 3;
    });
    
    // Add bonus for natural variations
    const variationScore = (text.match(/(\.  |; |don't|can't|I'm)/g) || []).length;
    
    const totalScore = aiScore + humanScore + variationScore;
    const humanLikeness = totalScore > 0 
      ? Math.min(0.95, (humanScore + variationScore) / totalScore) 
      : 0.85;
      
    // Normalize by text length
    return Math.min(0.95, humanLikeness * (1 + text.length / 10000));
  }

  private generateGeneralSuggestions(): string[] {
    return [
      'Quantify achievements with specific numbers and metrics',
      'Start bullet points with strong action verbs',
      'Include relevant keywords from your target industry',
      'Keep descriptions concise but impactful',
      'Focus on results and outcomes rather than just responsibilities',
      'Consider using 3-5 bullet points per role for optimal readability',
      'Highlight transferable skills relevant to your target position',
      'Use occasional contractions to sound more natural'
    ];
  }

  isConfigured(): boolean {
    return !!this.apiToken;
  }

  getConfigurationStatus(): { configured: boolean; message: string; model?: string } {
    if (!this.apiToken) {
      return {
        configured: false,
        message: 'Hugging Face API token not configured. Add VITE_HUGGING_FACE_API_TOKEN to your environment variables.'
      };
    }
    
    return {
      configured: true,
      message: 'AI optimization is ready to use.',
      model: this.modelId
    };
  }

  async optimizeText(request: OptimizationRequest): Promise<OptimizationResponse> {
    if (!this.apiToken) {
      throw new Error('Hugging Face API token not configured. Please add VITE_HUGGING_FACE_API_TOKEN to your environment variables.');
    }

    try {
      // For single section optimization, create a minimal CV structure
      const sectionType = request.sectionType || 'summary';
      let cvData: any = { sections: [] };
      
      if (sectionType === 'summary') {
        cvData.sections.push({
          section_type: 'summary',
          content: { summary: request.text }
        });
      } 
      else if (sectionType === 'personal_info') {
        cvData.sections.push({
          section_type: 'personal_info',
          content: { title: request.text }
        });
      }
      else if (sectionType === 'experience') {
        cvData.sections.push({
          section_type: 'experience',
          content: { 
            experiences: [{
              position: "Current Position",
              company: "Current Company",
              description: request.text
            }]
          }
        });
      }
      else if (sectionType === 'projects') {
        cvData.sections.push({
          section_type: 'projects',
          content: { 
            projects: [{
              title: "Project Title",
              description: request.text,
              technologies: ["Technology 1", "Technology 2"]
            }]
          }
        });
      }
      else {
        // Generic section handling
        cvData.sections.push({
          section_type: sectionType,
          content: { content: request.text }
        });
      }

      // Use the CV optimization method
      const result = await this.optimizeCVContent({
        cvData,
        context: request.context
      });

      // Extract the relevant optimized text for the specific section
      let optimizedText = '';
      const optimizedSection = result.optimizedCV.sections.find(
        (s: any) => s.section_type === sectionType
      );
      
      if (optimizedSection) {
        if (sectionType === 'summary') {
          optimizedText = optimizedSection.content.summary || '';
        } 
        else if (sectionType === 'personal_info') {
          optimizedText = optimizedSection.content.title || '';
        } 
        else if (sectionType === 'experience') {
          optimizedText = optimizedSection.content.experiences?.[0]?.description || '';
        } 
        else if (sectionType === 'projects') {
          optimizedText = optimizedSection.content.projects?.[0]?.description || '';
        }
        else {
          optimizedText = optimizedSection.content.content || '';
        }
      }
      
      if (!optimizedText) {
        optimizedText = request.text;
      }

      return {
        optimizedText,
        suggestions: result.suggestions,
        confidence: result.confidence
      };
    } catch (error: any) {
      console.error('AI optimization failed:', error);
      throw new Error(`AI optimization failed: ${error.message}`);
    }
  }
}

export const aiService = new AIService();