const { Resume, JobPosting } = require('../models');
const logger = require('../utils/logger');

/**
 * Calculate match score between a resume and a job posting
 * @param {Object} resume - Resume model instance
 * @param {Object} jobPosting - JobPosting model instance
 * @returns {Object} Match details and score
 */
const calculateMatchScore = (resume, jobPosting) => {
  const breakdown = {
    skillsMatch: 0,
    experienceMatch: 0,
    locationMatch: 0
  };

  const weights = {
    skills: 0.6,
    experience: 0.3,
    location: 0.1
  };

  // 1. Skills Matching
  const jobRequiredSkills = (jobPosting.required_skills || []).map(s => s.toLowerCase());
  const jobPreferredSkills = (jobPosting.preferred_skills || []).map(s => s.toLowerCase());
  
  const resumeTechnicalSkills = (resume.skills?.technical || []).map(s => s.toLowerCase());
  const resumeSoftSkills = (resume.skills?.soft_skills || []).map(s => s.toLowerCase());
  const resumeTools = (resume.skills?.tools || []).map(s => s.toLowerCase());
  const allResumeSkills = [...resumeTechnicalSkills, ...resumeSoftSkills, ...resumeTools];

  const matchedSkills = jobRequiredSkills.filter(skill => allResumeSkills.includes(skill));
  const missingSkills = jobRequiredSkills.filter(skill => !allResumeSkills.includes(skill));
  const matchedPreferredSkills = jobPreferredSkills.filter(skill => allResumeSkills.includes(skill));

  // Calculate skill score: (matched_required / total_required) * 80 + (matched_preferred / total_preferred) * 20
  let requiredScore = jobRequiredSkills.length > 0 ? (matchedSkills.length / jobRequiredSkills.length) * 100 : 100;
  let preferredScore = jobPreferredSkills.length > 0 ? (matchedPreferredSkills.length / jobPreferredSkills.length) * 100 : 100;
  
  breakdown.skillsMatch = Math.round((requiredScore * 0.8) + (preferredScore * 0.2));

  // 2. Experience Matching
  // Parse required experience (e.g., "3-5 years" or "3+ years")
  const reqExpMatch = jobPosting.experience_required?.match(/(\d+)/);
  const minRequiredYears = reqExpMatch ? parseInt(reqExpMatch[1]) : 0;
  const resumeYears = parseFloat(resume.total_years_experience) || 0;

  if (minRequiredYears === 0) {
    breakdown.experienceMatch = 100;
  } else {
    // Score based on ratio, capped at 100
    breakdown.experienceMatch = Math.min(100, Math.round((resumeYears / minRequiredYears) * 100));
  }

  // 3. Location Matching
  if (!jobPosting.location || !resume.location) {
    breakdown.locationMatch = 100; // No preference
  } else {
    const jobLoc = jobPosting.location.toLowerCase();
    const resLoc = resume.location.toLowerCase();
    breakdown.locationMatch = jobLoc.includes(resLoc) || resLoc.includes(jobLoc) ? 100 : 0;
  }

  // Final weighted score
  const totalScore = Math.round(
    (breakdown.skillsMatch * weights.skills) +
    (breakdown.experienceMatch * weights.experience) +
    (breakdown.locationMatch * weights.location)
  );

  return {
    score: totalScore,
    breakdown,
    matchedSkills,
    missingSkills,
    recommendation: getRecommendation(totalScore)
  };
};

/**
 * Determine recommendation based on score
 * @param {number} score 
 * @returns {string} Recommendation enum
 */
const getRecommendation = (score) => {
  if (score >= 90) return 'strong_yes';
  if (score >= 75) return 'yes';
  if (score >= 50) return 'maybe';
  if (score >= 25) return 'no';
  return 'strong_no';
};

/**
 * Match a specific resume to a job posting
 * @param {string} resumeId 
 * @param {string} jobId 
 */
const matchResumeToJob = async (resumeId, jobId) => {
  try {
    const resume = await Resume.findByPk(resumeId);
    const jobPosting = await JobPosting.findByPk(jobId);

    if (!resume || !jobPosting) {
      throw new Error('Resume or Job Posting not found');
    }

    const matchData = calculateMatchScore(resume, jobPosting);

    await resume.update({
      job_id: jobId,
      match_score: matchData.score,
      match_breakdown: matchData.breakdown,
      matched_skills: matchData.matchedSkills,
      missing_skills: matchData.missingSkills,
      recommendation: matchData.recommendation
    });

    logger.info(`Resume ${resumeId} matched to Job ${jobId} with score ${matchData.score}`);
    return matchData;
  } catch (error) {
    logger.error(`Error matching resume ${resumeId} to job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Batch match all resumes to a job posting
 * @param {string} jobId 
 */
const batchMatch = async (jobId) => {
  try {
    const jobPosting = await JobPosting.findByPk(jobId);
    if (!jobPosting) throw new Error('Job Posting not found');

    const resumes = await Resume.findAll();
    
    const results = [];
    for (const resume of resumes) {
      const matchData = await matchResumeToJob(resume.id, jobId);
      results.push({
        resumeId: resume.id,
        candidateName: resume.candidate_name,
        score: matchData.score
      });
    }

    return results;
  } catch (error) {
    logger.error(`Error in batch matching for job ${jobId}:`, error);
    throw error;
  }
};

module.exports = {
  calculateMatchScore,
  matchResumeToJob,
  batchMatch
};
