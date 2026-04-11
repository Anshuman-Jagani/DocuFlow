import React from 'react';
import type { SkillCategory } from '../types/resume';

interface SkillsDisplayProps {
  skills: string[];
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ skills }) => {
  const categorizeSkills = (skillsList: string[]): SkillCategory[] => {
    const categories: SkillCategory[] = [];

    const programmingKeywords = [
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift',
      'kotlin', 'go', 'rust', 'typescript', 'react', 'angular', 'vue',
      'node', 'django', 'flask', 'spring', '.net',
    ];
    const programmingSkills = skillsList.filter((s) =>
      programmingKeywords.some((kw) => s.toLowerCase().includes(kw))
    );
    if (programmingSkills.length > 0)
      categories.push({ category: 'Programming & Frameworks', skills: programmingSkills });

    const databaseKeywords = [
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle',
      'database', 'nosql', 'dynamodb', 'cassandra',
    ];
    const databaseSkills = skillsList.filter(
      (s) =>
        databaseKeywords.some((kw) => s.toLowerCase().includes(kw)) &&
        !programmingSkills.includes(s)
    );
    if (databaseSkills.length > 0)
      categories.push({ category: 'Databases', skills: databaseSkills });

    const cloudKeywords = [
      'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
      'jenkins', 'ci/cd', 'devops', 'terraform', 'ansible',
    ];
    const cloudSkills = skillsList.filter(
      (s) =>
        cloudKeywords.some((kw) => s.toLowerCase().includes(kw)) &&
        !programmingSkills.includes(s) &&
        !databaseSkills.includes(s)
    );
    if (cloudSkills.length > 0)
      categories.push({ category: 'Cloud & DevOps', skills: cloudSkills });

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'management',
      'agile', 'scrum', 'problem solving', 'analytical', 'creative',
    ];
    const softSkills = skillsList.filter((s) =>
      softKeywords.some((kw) => s.toLowerCase().includes(kw))
    );
    if (softSkills.length > 0)
      categories.push({ category: 'Soft Skills', skills: softSkills });

    const categorized = [...programmingSkills, ...databaseSkills, ...cloudSkills, ...softSkills];
    const other = skillsList.filter((s) => !categorized.includes(s));
    if (other.length > 0) categories.push({ category: 'Other', skills: other });

    return categories;
  };

  const categories = categorizeSkills(skills);

  type ColorSet = { badge: string; dot: string };

  const getCategoryColors = (category: string): ColorSet => {
    switch (category) {
      case 'Programming & Frameworks':
        return { badge: 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20', dot: 'bg-[#22D3EE]' };
      case 'Databases':
        return { badge: 'bg-green-400/10 text-green-400 border-green-400/20', dot: 'bg-green-400' };
      case 'Cloud & DevOps':
        return { badge: 'bg-purple-400/10 text-purple-400 border-purple-400/20', dot: 'bg-purple-400' };
      case 'Soft Skills':
        return { badge: 'bg-pink-400/10 text-pink-400 border-pink-400/20', dot: 'bg-pink-400' };
      default:
        return { badge: 'bg-[#111111] text-[#888888] border-[#1A1A1A]', dot: 'bg-[#444444]' };
    }
  };

  return (
    <div className="space-y-6">
      {categories.map((cat, i) => {
        const colors = getCategoryColors(cat.category);
        return (
          <div key={i}>
            <h3 className="flex items-center gap-2 text-[9px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {cat.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, si) => (
                <span
                  key={si}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${colors.badge}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillsDisplay;
