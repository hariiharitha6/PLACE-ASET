import { expect } from 'chai';
import { APTITUDE_QUESTIONS } from '../data/questions_aptitude';
import { PROGRAMMING_QUESTIONS } from '../data/questions_programming';
import { DSA_QUESTIONS } from '../data/questions_dsa';
import { DBMS_SQL_QUESTIONS } from '../data/questions_dbms_sql';
import { OOP_QUESTIONS } from '../data/questions_oop';
import { OS_NETWORKS_QUESTIONS } from '../data/questions_os_networks';
import { INTERVIEW_QUESTIONS } from '../data/questions_interview';
import { SEED_RESOURCES } from '../data/personal_resources';

describe('Personal Content & Question Bank Integrity Tests', () => {
  const allQuestionSets = [
    { name: 'Aptitude', questions: APTITUDE_QUESTIONS },
    { name: 'Programming Fundamentals', questions: PROGRAMMING_QUESTIONS },
    { name: 'DSA', questions: DSA_QUESTIONS },
    { name: 'DBMS & SQL', questions: DBMS_SQL_QUESTIONS },
    { name: 'OOP Concepts', questions: OOP_QUESTIONS },
    { name: 'OS & Computer Networks', questions: OS_NETWORKS_QUESTIONS },
    { name: 'Technical Interview', questions: INTERVIEW_QUESTIONS }
  ];

  const validDifficulties = new Set(['easy', 'medium', 'hard']);
  const totalQuestions = allQuestionSets.reduce((sum, set) => sum + set.questions.length, 0);

  it(`should contain at least 300 curated starter questions (found: ${totalQuestions})`, () => {
    expect(totalQuestions).to.be.greaterThanOrEqual(300);
  });

  allQuestionSets.forEach(({ name, questions }) => {
    describe(`Question Set: ${name} (${questions.length} questions)`, () => {
      it('all questions should be well-formed with valid fields, options, and explanations', () => {
        questions.forEach((q, idx) => {
          expect(q.statement, `[${name} #${idx}] Statement missing or empty`).to.be.a('string');
          expect(q.statement.trim().length, `[${name} #${idx}] Statement too short`).to.be.greaterThan(5);

          expect(q.explanation, `[${name} #${idx}] Explanation missing or empty`).to.be.a('string');
          expect(q.explanation.trim().length, `[${name} #${idx}] Explanation too short`).to.be.greaterThan(5);

          expect(validDifficulties.has(q.difficulty), `[${name} #${idx}] Invalid difficulty "${q.difficulty}"`).to.be.true;

          expect(q.category_slug, `[${name} #${idx}] Missing category_slug`).to.be.a('string');
          expect(q.category_slug.trim().length).to.be.greaterThan(1);

          expect(q.options, `[${name} #${idx}] Options must be an array`).to.be.an('array');
          expect(q.options.length, `[${name} #${idx}] Options must have at least 2 entries`).to.be.greaterThanOrEqual(2);

          const correctOptions = q.options.filter(o => o.is_correct);
          expect(correctOptions.length, `[${name} #${idx} - "${q.statement.substring(0, 30)}..."] Expected exactly 1 correct answer, found ${correctOptions.length}`).to.equal(1);

          q.options.forEach((opt, optIdx) => {
            expect(opt.label, `[${name} #${idx} opt #${optIdx}] Label missing`).to.be.a('string');
            expect(opt.content, `[${name} #${idx} opt #${optIdx}] Content missing`).to.be.a('string');
            expect(opt.content.trim().length, `[${name} #${idx} opt #${optIdx}] Content empty`).to.be.greaterThan(0);
          });
        });
      });
    });
  });

  it('should have zero duplicate question statements across the entire repository', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];

    allQuestionSets.forEach(({ name, questions }) => {
      questions.forEach((q) => {
        const normalized = q.statement.trim().toLowerCase();
        if (seen.has(normalized)) {
          duplicates.push(`Duplicate: "${q.statement.substring(0, 50)}..." in ${name} (previously in ${seen.get(normalized)})`);
        } else {
          seen.set(normalized, name);
        }
      });
    });

    expect(duplicates, `Found duplicates:\n${duplicates.join('\n')}`).to.be.empty;
  });

  describe('Personal Resources Integrity', () => {
    it('should have curated starter learning resources with valid fields', () => {
      expect(SEED_RESOURCES.length).to.be.greaterThanOrEqual(10);
      SEED_RESOURCES.forEach((r, idx) => {
        expect(r.title, `Resource #${idx} title missing`).to.be.a('string');
        expect(r.title.trim().length).to.be.greaterThan(5);
        expect(r.description, `Resource #${idx} description missing`).to.be.a('string');
        expect(r.file_url, `Resource #${idx} file_url missing`).to.be.a('string');
        expect(r.category_slug, `Resource #${idx} category_slug missing`).to.be.a('string');
        expect(r.tags, `Resource #${idx} tags missing`).to.be.an('array').that.is.not.empty;
      });
    });
  });
});
