const matchingService = require('../../../src/services/matchingService');

describe('Matching Service', () => {
  describe('calculateMatchScore', () => {
    const mockJob = {
      required_skills: ['JavaScript', 'React', 'Node.js'],
      preferred_skills: ['TypeScript', 'Docker'],
      experience_required: '3 years',
      location: 'San Francisco'
    };

    const mockResume = {
      skills: {
        technical: ['JavaScript', 'React', 'HTML', 'CSS'],
        soft_skills: ['Communication'],
        tools: ['Git']
      },
      total_years_experience: 4,
      location: 'San Francisco'
    };

    it('should calculate a correct matching score', () => {
      const result = matchingService.calculateMatchScore(mockResume, mockJob);
      
      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.matchedSkills).toContain('javascript');
      expect(result.matchedSkills).toContain('react');
      expect(result.missingSkills).toContain('node.js');
    });

    it('should handle perfect match', () => {
      const perfectResume = {
        skills: {
          technical: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker'],
          soft_skills: [],
          tools: []
        },
        total_years_experience: 5,
        location: 'San Francisco'
      };
      const result = matchingService.calculateMatchScore(perfectResume, mockJob);
      expect(result.score).toBe(100);
      expect(result.recommendation).toBe('strong_yes');
    });

    it('should handle no match', () => {
      const poorResume = {
        skills: {
          technical: ['Java', 'Python'],
          soft_skills: [],
          tools: []
        },
        total_years_experience: 0,
        location: 'New York'
      };
      const result = matchingService.calculateMatchScore(poorResume, mockJob);
      expect(result.score).toBeLessThan(30);
      expect(result.recommendation).toMatch(/no/);
    });
  });
});
