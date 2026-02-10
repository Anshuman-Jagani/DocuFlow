import React from 'react';
import type { SkillCategory } from '../types/resume';

interface SkillsDisplayProps {
  skills: string[];
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ skills }) => {
  // Categorize skills based on common patterns
  const categorizeSkills = (skillsList: string[]): SkillCategory[] => {
    const categories: SkillCategory[] = [];

    // Technical/Programming skills
    const programmingKeywords = ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', '.net'];
    const programmingSkills = skillsList.filter(skill => 
      programmingKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );
    if (programmingSkills.length > 0) {
      categories.push({ category: 'Programming & Frameworks', skills: programmingSkills });
    }

    // Database skills
    const databaseKeywords = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'database', 'nosql', 'dynamodb', 'cassandra'];
    const databaseSkills = skillsList.filter(skill => 
      databaseKeywords.some(keyword => skill.toLowerCase().includes(keyword)) &&
      !programmingSkills.includes(skill)
    );
    if (databaseSkills.length > 0) {
      categories.push({ category: 'Databases', skills: databaseSkills });
    }

    // Cloud & DevOps
    const cloudKeywords = ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'devops', 'terraform', 'ansible'];
    const cloudSkills = skillsList.filter(skill => 
      cloudKeywords.some(keyword => skill.toLowerCase().includes(keyword)) &&
      !programmingSkills.includes(skill) &&
      !databaseSkills.includes(skill)
    );
    if (cloudSkills.length > 0) {
      categories.push({ category: 'Cloud & DevOps', skills: cloudSkills });
    }

    // Soft skills
    const softKeywords = ['leadership', 'communication', 'teamwork', 'management', 'agile', 'scrum', 'problem solving', 'analytical', 'creative'];
    const softSkills = skillsList.filter(skill => 
      softKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );
    if (softSkills.length > 0) {
      categories.push({ category: 'Soft Skills', skills: softSkills });
    }

    // Other skills
    const categorizedSkills = [
      ...programmingSkills,
      ...databaseSkills,
      ...cloudSkills,
      ...softSkills
    ];
    const otherSkills = skillsList.filter(skill => !categorizedSkills.includes(skill));
    if (otherSkills.length > 0) {
      categories.push({ category: 'Other Skills', skills: otherSkills });
    }

    return categories;
  };

  const categories = categorizeSkills(skills);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Programming & Frameworks':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Databases':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Cloud & DevOps':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Soft Skills':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {categories.map((category, index) => (
        <div key={index}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
            {category.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${getCategoryColor(category.category)}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsDisplay;
