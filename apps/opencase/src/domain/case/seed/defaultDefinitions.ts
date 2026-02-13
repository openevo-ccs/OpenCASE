/**
 * Default (opinionated) seed definitions for every tenant.
 *
 * These provide a baseline set of CFConcepts, CFSubjects, CFItemTypes,
 * and CFAssociationGroupings so that:
 *   1. The CASE CTS (Conformance Test System) has valid UUIDs to test against.
 *   2. The Editor has sensible defaults to choose from when authoring frameworks.
 *
 * Each record has a stable UUID so that references remain consistent
 * across tenants and over time.  The UUID scheme uses a recognisable
 * prefix per category:
 *   - CFConcepts:              d1d1d1d1-0001-…
 *   - CFSubjects:              d2d2d2d2-0001-…
 *   - CFItemTypes:             d3d3d3d3-0001-…
 *   - CFAssociationGroupings:  d4d4d4d4-0001-…
 */

const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z'

/* ================================================================
 *  Helper to build seed entries with minimal boilerplate
 * ================================================================ */

function seedEntry<T extends { identifier: string }> (
  prefix: string,
  seq: number,
  fields: Omit<T, 'identifier' | 'uri' | 'lastChangeDateTime'> & { identifier?: never; uri?: never; lastChangeDateTime?: never }
): T {
  const padded = String(seq).padStart(12, '0')
  const identifier = `${prefix}-${padded}`
  return {
    ...fields,
    identifier,
    uri: `/ims/case/v1p1/${prefix.startsWith('d1') ? 'CFConcepts' : prefix.startsWith('d2') ? 'CFSubjects' : prefix.startsWith('d3') ? 'CFItemTypes' : 'CFAssociationGroupings'}/${identifier}`,
    lastChangeDateTime: SEED_TIMESTAMP,
  } as unknown as T
}

// ── CFConcepts ───────────────────────────────────────────────────

export interface SeedCFConcept {
  identifier: string
  uri: string
  title: string
  description: string
  hierarchyCode: string
  lastChangeDateTime: string
}

const concept = (seq: number, title: string, description: string, hierarchyCode: string) =>
  seedEntry<SeedCFConcept>('d1d1d1d1-0001-4000-a000', seq, { title, description, hierarchyCode })

export const DEFAULT_CONCEPTS: SeedCFConcept[] = [
  // ── Cognitive Domain (Bloom's Taxonomy) ──────────────────────
  concept(1, 'Knowledge', 'Factual, conceptual, and procedural knowledge.', '1.01'),
  concept(2, 'Comprehension', 'Understanding and interpreting information.', '1.02'),
  concept(3, 'Application', 'Applying knowledge to new situations.', '1.03'),
  concept(4, 'Analysis', 'Breaking information into parts to explore relationships.', '1.04'),
  concept(5, 'Synthesis', 'Combining elements to form a coherent whole.', '1.05'),
  concept(6, 'Evaluation', 'Making judgements based on criteria and evidence.', '1.06'),
  concept(7, 'Creation', 'Producing new or original work.', '1.07'),

  // ── Skills & Abilities ──────────────────────────────────────
  concept(10, 'Skill', 'The ability to apply knowledge to complete tasks and solve problems.', '2.01'),
  concept(11, 'Technical Skill', 'Domain-specific skills requiring specialised tools or techniques.', '2.02'),
  concept(12, 'Transferable Skill', 'Skills applicable across multiple domains and contexts.', '2.03'),
  concept(13, 'Digital Literacy', 'The ability to use digital tools and technologies effectively.', '2.04'),
  concept(14, 'Critical Thinking', 'Systematic analysis, evaluation, and reasoning.', '2.05'),
  concept(15, 'Problem Solving', 'Identifying solutions to complex or novel problems.', '2.06'),
  concept(16, 'Communication', 'Effective expression and exchange of ideas.', '2.07'),
  concept(17, 'Collaboration', 'Working effectively with others toward shared goals.', '2.08'),
  concept(18, 'Creativity', 'Generating original ideas and innovative approaches.', '2.09'),

  // ── Affective Domain ────────────────────────────────────────
  concept(20, 'Disposition', 'Attitudes, values, and mindsets that influence learning and behaviour.', '3.01'),
  concept(21, 'Self-Regulation', 'Managing one\'s own learning, emotions, and behaviour.', '3.02'),
  concept(22, 'Motivation', 'Internal drive and engagement with learning.', '3.03'),
  concept(23, 'Growth Mindset', 'Belief that abilities can be developed through effort and learning.', '3.04'),
  concept(24, 'Cultural Competence', 'Ability to interact effectively with people of different backgrounds.', '3.05'),
  concept(25, 'Ethical Reasoning', 'Applying ethical principles to decision-making.', '3.06'),
  concept(26, 'Social-Emotional Awareness', 'Recognising and managing emotions in self and others.', '3.07'),

  // ── Psychomotor Domain ──────────────────────────────────────
  concept(30, 'Psychomotor Skill', 'Physical skills involving coordination, dexterity, and movement.', '4.01'),
  concept(31, 'Fine Motor Skill', 'Small muscle movements requiring precision and control.', '4.02'),
  concept(32, 'Gross Motor Skill', 'Large muscle movements involving balance and coordination.', '4.03'),

  // ── Meta-cognitive ──────────────────────────────────────────
  concept(35, 'Metacognition', 'Awareness and regulation of one\'s own thinking processes.', '5.01'),
  concept(36, 'Reflection', 'Deliberate review of experiences to improve future performance.', '5.02'),
  concept(37, 'Learning Strategies', 'Approaches and techniques for effective learning.', '5.03'),

  // ── Workforce / Professional ────────────────────────────────
  concept(40, 'Professional Practice', 'Application of professional standards and ethics in the workplace.', '6.01'),
  concept(41, 'Leadership', 'Ability to guide, inspire, and influence others.', '6.02'),
  concept(42, 'Entrepreneurship', 'Innovation, initiative, and business acumen.', '6.03'),
  concept(43, 'Adaptability', 'Flexibility and resilience in changing environments.', '6.04'),
  concept(44, 'Systems Thinking', 'Understanding interconnected components within complex systems.', '6.05'),
]

// ── CFSubjects ───────────────────────────────────────────────────

export interface SeedCFSubject {
  identifier: string
  uri: string
  title: string
  hierarchyCode: string
  description: string
  lastChangeDateTime: string
}

const subject = (seq: number, title: string, description: string, hierarchyCode: string) =>
  seedEntry<SeedCFSubject>('d2d2d2d2-0001-4000-a000', seq, { title, description, hierarchyCode })

export const DEFAULT_SUBJECTS: SeedCFSubject[] = [
  // ── Core K-12 Academic ──────────────────────────────────────
  subject(1, 'Mathematics', 'Mathematics and quantitative reasoning.', '1.01'),
  subject(2, 'English Language Arts', 'Reading, writing, speaking, and listening.', '1.02'),
  subject(3, 'Science', 'Natural sciences including physical, life, and earth sciences.', '1.03'),
  subject(4, 'Social Studies', 'History, geography, civics, and economics.', '1.04'),
  subject(5, 'World Languages', 'Foreign and heritage language study.', '1.05'),
  subject(6, 'Physical Education', 'Physical fitness, movement, and health.', '1.06'),
  subject(7, 'Health Education', 'Personal health, wellness, and safety.', '1.07'),
  subject(8, 'Visual Arts', 'Drawing, painting, sculpture, and visual media.', '1.08'),
  subject(9, 'Music', 'Vocal and instrumental music performance and theory.', '1.09'),
  subject(10, 'Performing Arts', 'Theatre, dance, and performance disciplines.', '1.10'),
  subject(11, 'Library & Media', 'Information literacy and media skills.', '1.11'),

  // ── STEM / Technology ───────────────────────────────────────
  subject(15, 'Computer Science', 'Computing, programming, and computational thinking.', '2.01'),
  subject(16, 'Information Technology', 'IT systems, networking, and digital infrastructure.', '2.02'),
  subject(17, 'Engineering', 'Engineering design, principles, and applied problem solving.', '2.03'),
  subject(18, 'Data Science', 'Data analysis, statistics, and data-driven decision making.', '2.04'),
  subject(19, 'Cybersecurity', 'Information security, risk management, and digital protection.', '2.05'),
  subject(20, 'Artificial Intelligence', 'AI, machine learning, and intelligent systems.', '2.06'),
  subject(21, 'Robotics', 'Design, construction, and programming of robotic systems.', '2.07'),

  // ── Career & Technical Education (CTE) ──────────────────────
  subject(25, 'Agriculture', 'Agricultural science, food systems, and natural resources.', '3.01'),
  subject(26, 'Architecture & Construction', 'Building design, construction, and trades.', '3.02'),
  subject(27, 'Manufacturing', 'Manufacturing processes, production, and quality management.', '3.03'),
  subject(28, 'Transportation', 'Transportation systems, logistics, and distribution.', '3.04'),
  subject(29, 'Hospitality & Tourism', 'Hospitality, food service, and tourism management.', '3.05'),
  subject(30, 'Marketing', 'Marketing principles, sales, and business development.', '3.06'),
  subject(31, 'Finance', 'Financial literacy, accounting, and financial management.', '3.07'),
  subject(32, 'Business Management', 'Business administration, management, and entrepreneurship.', '3.08'),
  subject(33, 'Law & Public Safety', 'Legal studies, law enforcement, and public safety.', '3.09'),
  subject(34, 'Education & Training', 'Teaching, training, and educational support services.', '3.10'),
  subject(35, 'Government & Public Administration', 'Public policy, governance, and civil service.', '3.11'),
  subject(36, 'Human Services', 'Counselling, social work, and human development.', '3.12'),

  // ── Healthcare & Life Sciences ──────────────────────────────
  subject(40, 'Health Science', 'Health science foundations and health professions.', '4.01'),
  subject(41, 'Nursing', 'Nursing practice, patient care, and clinical skills.', '4.02'),
  subject(42, 'Allied Health', 'Allied health professions (therapy, diagnostics, etc.).', '4.03'),
  subject(43, 'Public Health', 'Community health, epidemiology, and health promotion.', '4.04'),
  subject(44, 'Pharmacy', 'Pharmaceutical science and pharmacy practice.', '4.05'),
  subject(45, 'Biomedical Science', 'Biomedical research, biotechnology, and laboratory science.', '4.06'),

  // ── Higher Education General ────────────────────────────────
  subject(50, 'General Education', 'Interdisciplinary foundational coursework.', '5.01'),
  subject(51, 'Philosophy', 'Critical thinking, logic, and ethical philosophy.', '5.02'),
  subject(52, 'Psychology', 'Human behaviour, cognition, and mental processes.', '5.03'),
  subject(53, 'Sociology', 'Social behaviour, institutions, and group dynamics.', '5.04'),
  subject(54, 'Communications', 'Media, journalism, and communication studies.', '5.05'),
  subject(55, 'Economics', 'Economic theory, policy, and applied economics.', '5.06'),
  subject(56, 'Political Science', 'Government, political systems, and public policy.', '5.07'),
  subject(57, 'Environmental Science', 'Ecology, sustainability, and environmental systems.', '5.08'),

  // ── Early Childhood ─────────────────────────────────────────
  subject(60, 'Early Childhood Development', 'Child growth, development, and early learning.', '6.01'),
  subject(61, 'Pre-Literacy', 'Emergent literacy, phonological awareness, and print concepts.', '6.02'),
  subject(62, 'Pre-Numeracy', 'Number sense, counting, and early mathematical concepts.', '6.03'),
  subject(63, 'Social-Emotional Learning', 'Self-awareness, relationship skills, and responsible decision-making.', '6.04'),

  // ── Workforce / Professional Development ────────────────────
  subject(70, 'Workplace Readiness', 'Employability skills and workplace professionalism.', '7.01'),
  subject(71, 'Project Management', 'Planning, executing, and managing projects.', '7.02'),
  subject(72, 'Leadership Development', 'Leadership principles, team building, and management.', '7.03'),
  subject(73, 'Professional Ethics', 'Ethical standards and professional conduct.', '7.04'),
  subject(74, 'Diversity, Equity & Inclusion', 'DEI principles, cultural competence, and inclusive practice.', '7.05'),

  // ── Military & Government Training ──────────────────────────
  subject(80, 'Military Science', 'Military strategy, tactics, and defence studies.', '8.01'),
  subject(81, 'Emergency Management', 'Disaster preparedness, response, and recovery.', '8.02'),
  subject(82, 'Intelligence & Security', 'Intelligence analysis and national security.', '8.03'),
]

// ── CFItemTypes ──────────────────────────────────────────────────

export interface SeedCFItemType {
  identifier: string
  uri: string
  title: string
  description: string
  hierarchyCode: string
  lastChangeDateTime: string
}

const itemType = (seq: number, title: string, description: string, hierarchyCode: string) =>
  seedEntry<SeedCFItemType>('d3d3d3d3-0001-4000-a000', seq, { title, description, hierarchyCode })

export const DEFAULT_ITEM_TYPES: SeedCFItemType[] = [
  // ── K-12 / Curriculum ──────────────────────────────────────────
  itemType(1, 'Standard', 'A competency or learning standard statement.', '1.01'),
  itemType(2, 'Strand', 'A thematic strand or domain grouping related items.', '1.02'),
  itemType(3, 'Domain', 'A broad area or domain within a subject.', '1.03'),
  itemType(4, 'Cluster', 'A group of related standards within a domain.', '1.04'),
  itemType(5, 'Benchmark', 'A benchmark or performance indicator within a standard.', '1.05'),
  itemType(6, 'Indicator', 'A specific, measurable indicator of performance.', '1.06'),
  itemType(7, 'Grade Level Expectation', 'What students should know and be able to do at a grade level.', '1.07'),
  itemType(8, 'Learning Target', 'A specific, student-facing goal derived from a standard.', '1.08'),
  itemType(9, 'Content Standard', 'A statement of what students should know in a content area.', '1.09'),
  itemType(10, 'Performance Standard', 'A statement describing the level of performance expected.', '1.10'),
  itemType(11, 'Anchor Standard', 'A broad, overarching standard that spans all grade levels.', '1.11'),
  itemType(12, 'Practice Standard', 'A standard describing processes and practices (e.g. mathematical practices).', '1.12'),
  itemType(13, 'Core Idea', 'A fundamental concept or principle in a discipline (e.g. NGSS disciplinary core idea).', '1.13'),
  itemType(14, 'Crosscutting Concept', 'A concept that bridges disciplinary boundaries (e.g. NGSS crosscutting concepts).', '1.14'),
  itemType(15, 'Performance Expectation', 'An integrated statement of what students should demonstrate (e.g. NGSS PE).', '1.15'),

  // ── Higher Ed / Competency ─────────────────────────────────────
  itemType(20, 'Competency', 'An integrated set of knowledge, skills, and dispositions.', '2.01'),
  itemType(21, 'Sub-Competency', 'A component of a broader competency.', '2.02'),
  itemType(22, 'Learning Outcome', 'A measurable statement of what a learner will achieve.', '2.03'),
  itemType(23, 'Program Outcome', 'A high-level outcome expected of a program graduate.', '2.04'),
  itemType(24, 'Course Outcome', 'A specific outcome expected at the end of a course.', '2.05'),
  itemType(25, 'Institutional Competency', 'An institution-wide competency expected of all graduates.', '2.06'),
  itemType(26, 'General Education Outcome', 'A broad learning outcome for general education requirements.', '2.07'),
  itemType(27, 'Graduate Attribute', 'A characteristic or quality expected of graduates.', '2.08'),
  itemType(28, 'Degree Qualification', 'A qualification descriptor for a degree level (e.g. bachelor, master).', '2.09'),
  itemType(29, 'Accreditation Standard', 'A standard required by an accrediting body.', '2.10'),

  // ── Skills / Workforce ─────────────────────────────────────────
  itemType(30, 'Skill', 'A discrete, demonstrable ability acquired through training or experience.', '3.01'),
  itemType(31, 'Skill Category', 'A grouping of related skills (e.g. technical, interpersonal).', '3.02'),
  itemType(32, 'Task', 'A unit of work or activity performed in a job role.', '3.03'),
  itemType(33, 'Knowledge Statement', 'A discrete body of knowledge required for a role or task.', '3.04'),
  itemType(34, 'Work Activity', 'A broad work activity performed within an occupation.', '3.05'),
  itemType(35, 'Occupation', 'A named job role or occupation category.', '3.06'),
  itemType(36, 'Job Function', 'A major function or responsibility area within a job.', '3.07'),
  itemType(37, 'Job Zone', 'A category of jobs based on preparation level (e.g. O*NET job zones).', '3.08'),
  itemType(38, 'Work Context', 'Environmental or contextual conditions of work.', '3.09'),
  itemType(39, 'Work Style', 'Personal characteristics important for job performance.', '3.10'),
  itemType(40, 'Technical Competency', 'A competency specific to a technical domain or trade.', '3.11'),
  itemType(41, 'Soft Skill', 'An interpersonal or behavioural skill (e.g. teamwork, communication).', '3.12'),
  itemType(42, 'Employability Skill', 'A foundational skill necessary for employment readiness.', '3.13'),
  itemType(43, 'Industry Sector', 'An industry classification or sector grouping.', '3.14'),
  itemType(44, 'Duty', 'A major area of responsibility within an occupation (e.g. DACUM duty).', '3.15'),

  // ── Career & Technical Education (CTE) ─────────────────────────
  itemType(50, 'Career Cluster', 'A broad grouping of occupations and industries (US CTE career clusters).', '4.01'),
  itemType(51, 'Career Pathway', 'A sequence of courses/experiences leading to an occupation.', '4.02'),
  itemType(52, 'CTE Standard', 'A competency standard for career and technical education.', '4.03'),
  itemType(53, 'Industry Certification', 'A certification recognised by an industry body.', '4.04'),
  itemType(54, 'Apprenticeship Outcome', 'A skill or knowledge outcome within an apprenticeship program.', '4.05'),
  itemType(55, 'Work-Based Learning Outcome', 'A learning outcome achieved through workplace experience.', '4.06'),

  // ── Learning Pathways ──────────────────────────────────────────
  itemType(60, 'Pathway', 'A structured sequence of learning leading to a credential or outcome.', '5.01'),
  itemType(61, 'Milestone', 'A key checkpoint within a learning pathway.', '5.02'),
  itemType(62, 'Module', 'A self-contained unit of instruction or learning.', '5.03'),
  itemType(63, 'Unit', 'A coherent section within a course or module.', '5.04'),
  itemType(64, 'Lesson', 'A single instructional session or activity.', '5.05'),
  itemType(65, 'Assessment Criterion', 'A criterion used to assess attainment of a standard or competency.', '5.06'),
  itemType(66, 'Learning Activity', 'A specific activity designed to support learning.', '5.07'),
  itemType(67, 'Course', 'A structured educational offering on a specific topic.', '5.08'),
  itemType(68, 'Program', 'A complete program of study leading to a credential.', '5.09'),
  itemType(69, 'Credential', 'A formal recognition of achievement (degree, certificate, badge).', '5.10'),
  itemType(70, 'Micro-credential', 'A focused credential for a specific, demonstrated competency.', '5.11'),
  itemType(71, 'Digital Badge', 'A verifiable digital representation of a skill or achievement.', '5.12'),

  // ── Early Childhood ────────────────────────────────────────────
  itemType(75, 'Developmental Indicator', 'An observable behaviour indicating developmental progress.', '6.01'),
  itemType(76, 'Developmental Domain', 'A broad area of child development (cognitive, physical, social-emotional).', '6.02'),
  itemType(77, 'Early Learning Standard', 'A standard for what young children should know and do.', '6.03'),
  itemType(78, 'Readiness Indicator', 'An indicator of school or learning readiness.', '6.04'),

  // ── Social-Emotional Learning (SEL) ────────────────────────────
  itemType(80, 'SEL Competency', 'A social-emotional learning competency (e.g. CASEL framework).', '7.01'),
  itemType(81, 'SEL Indicator', 'A measurable indicator of social-emotional development.', '7.02'),
  itemType(82, 'Character Trait', 'A personal quality or character strength.', '7.03'),
  itemType(83, 'Mindset', 'A belief or attitude that shapes learning and behaviour.', '7.04'),

  // ── Healthcare / Clinical ──────────────────────────────────────
  itemType(85, 'Clinical Competency', 'A competency required for clinical practice.', '8.01'),
  itemType(86, 'Clinical Skill', 'A specific skill performed in a clinical setting.', '8.02'),
  itemType(87, 'Patient Care Standard', 'A standard for patient care quality and safety.', '8.03'),
  itemType(88, 'Entrustable Professional Activity', 'A unit of professional practice that can be entrusted to a learner (EPA).', '8.04'),
  itemType(89, 'Nursing Competency', 'A competency specific to nursing practice.', '8.05'),
  itemType(90, 'Medical Knowledge Area', 'A defined area of medical knowledge.', '8.06'),

  // ── Military & Government ──────────────────────────────────────
  itemType(92, 'Military Occupational Specialty', 'A specific military job classification (MOS, AFSC, NEC, etc.).', '9.01'),
  itemType(93, 'Training Objective', 'A measurable objective within a military or government training program.', '9.02'),
  itemType(94, 'Readiness Standard', 'A standard for operational or mission readiness.', '9.03'),

  // ── Assessment & Rubrics ───────────────────────────────────────
  itemType(95, 'Measure', 'A measurable criterion or metric.', '10.01'),
  itemType(96, 'Rubric Criterion', 'A criterion row within a rubric.', '10.02'),
  itemType(97, 'Performance Level', 'A labelled level of performance (e.g. Proficient, Advanced).', '10.03'),
  itemType(98, 'Assessment Item', 'A specific question or task within an assessment.', '10.04'),
  itemType(99, 'Scoring Guide', 'Guidance for scoring or evaluating performance.', '10.05'),

  // ── General / Cross-Sector ─────────────────────────────────────
  itemType(100, 'Topic', 'A topic or theme within a framework.', '11.01'),
  itemType(101, 'Objective', 'A general learning or performance objective.', '11.02'),
  itemType(102, 'Goal', 'A broad goal or aspiration.', '11.03'),
  itemType(103, 'Principle', 'A foundational principle or rule.', '11.04'),
  itemType(104, 'Concept', 'A key concept or idea.', '11.05'),
  itemType(105, 'Prerequisite', 'A required prior competency or condition.', '11.06'),
  itemType(106, 'Elective', 'An optional component within a program or framework.', '11.07'),
  itemType(107, 'Concentration', 'A focused area of study within a broader program.', '11.08'),
  itemType(108, 'Specialisation', 'A specialised track or emphasis area.', '11.09'),
  itemType(109, 'Endorsement', 'An additional designation or specialisation recognition.', '11.10'),

  // ── Certification & Licensing ──────────────────────────────────
  itemType(110, 'Certification Requirement', 'A requirement for professional certification.', '12.01'),
  itemType(111, 'Licensure Standard', 'A standard for professional licensure.', '12.02'),
  itemType(112, 'Continuing Education Requirement', 'A requirement for maintaining certification or licensure.', '12.03'),
  itemType(113, 'Professional Standard', 'A standard of practice for a profession.', '12.04'),

  // ── Digital & Information Literacy ─────────────────────────────
  itemType(115, 'Digital Literacy Standard', 'A standard for digital skills and competencies.', '13.01'),
  itemType(116, 'Information Literacy Standard', 'A standard for finding, evaluating, and using information.', '13.02'),
  itemType(117, 'Media Literacy Standard', 'A standard for critically analysing and creating media.', '13.03'),
  itemType(118, 'Technology Standard', 'A standard for the use and application of technology.', '13.04'),

  // ── Equity, Diversity & Inclusion ──────────────────────────────
  itemType(120, 'Equity Standard', 'A standard for equitable educational practices.', '14.01'),
  itemType(121, 'Inclusion Criterion', 'A criterion for inclusive practice and universal design.', '14.02'),
  itemType(122, 'Accessibility Standard', 'A standard for ensuring accessibility of learning.', '14.03'),

  // ── Quality Assurance ──────────────────────────────────────────
  itemType(125, 'Quality Indicator', 'An indicator of quality in education or training.', '15.01'),
  itemType(126, 'Compliance Requirement', 'A regulatory or policy compliance requirement.', '15.02'),
  itemType(127, 'Audit Criterion', 'A criterion used in quality audit or review.', '15.03'),
]

// ── CFAssociationGroupings ───────────────────────────────────────

export interface SeedCFAssociationGrouping {
  identifier: string
  uri: string
  title: string
  description: string
  lastChangeDateTime: string
}

const grouping = (seq: number, title: string, description: string) =>
  seedEntry<SeedCFAssociationGrouping>('d4d4d4d4-0001-4000-a000', seq, { title, description })

export const DEFAULT_ASSOCIATION_GROUPINGS: SeedCFAssociationGrouping[] = [
  // ── Structural ──────────────────────────────────────────────
  grouping(1, 'Curriculum Alignment', 'Groups associations that represent curriculum alignment relationships.'),
  grouping(2, 'Progression', 'Groups associations that represent learning progression relationships.'),
  grouping(3, 'Cross-Curricular', 'Groups associations that connect items across different subject areas.'),
  grouping(4, 'Vertical Alignment', 'Groups associations showing grade-to-grade or level-to-level progression.'),
  grouping(5, 'Horizontal Alignment', 'Groups associations connecting items at the same grade or level.'),

  // ── Dependency & Prerequisite ───────────────────────────────
  grouping(10, 'Prerequisite Chain', 'Groups prerequisite-to-target relationships.'),
  grouping(11, 'Co-requisite', 'Groups co-requisite or concurrent requirement relationships.'),
  grouping(12, 'Dependency', 'Groups general dependency relationships between items.'),

  // ── Mapping & Crosswalk ─────────────────────────────────────
  grouping(15, 'Standards Crosswalk', 'Maps items between different standards frameworks.'),
  grouping(16, 'Skill-to-Standard Mapping', 'Maps workforce skills to academic standards.'),
  grouping(17, 'Credential-to-Competency', 'Maps credentials to the competencies they certify.'),
  grouping(18, 'Job-to-Skill Mapping', 'Maps job roles or occupations to required skills.'),
  grouping(19, 'Course-to-Outcome Mapping', 'Maps courses to the learning outcomes they address.'),

  // ── Assessment ──────────────────────────────────────────────
  grouping(20, 'Assessment Alignment', 'Groups associations linking assessments to standards or competencies.'),
  grouping(21, 'Rubric Alignment', 'Groups associations linking rubric criteria to standards or competencies.'),

  // ── Pathway & Sequencing ────────────────────────────────────
  grouping(25, 'Learning Pathway', 'Groups associations forming a structured learning pathway.'),
  grouping(26, 'Career Pathway', 'Groups associations forming a career progression pathway.'),
  grouping(27, 'Instructional Sequence', 'Groups associations defining an instructional sequence.'),

  // ── Equivalence & Replacement ───────────────────────────────
  grouping(30, 'Equivalence', 'Groups items considered equivalent or interchangeable.'),
  grouping(31, 'Replacement', 'Groups relationships where newer items replace older ones.'),
  grouping(32, 'Prior Learning', 'Groups relationships recognising prior learning or experience.'),

  // ── Sector-Specific ─────────────────────────────────────────
  grouping(35, 'Clinical Rotation', 'Groups clinical training associations in healthcare education.'),
  grouping(36, 'Work-Based Learning', 'Groups associations related to workplace learning experiences.'),
  grouping(37, 'Military Training Alignment', 'Groups associations in military training and education contexts.'),
  grouping(38, 'Industry Partnership', 'Groups associations between educational and industry frameworks.'),
]
