import { asyncHandler } from '../utils/asyncHandler.js';
import Subject from '../models/Subject.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import mongoose from 'mongoose';

// --- helpers ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// very simple CSV parser supporting quoted fields and commas inside quotes
function parseCSV(content) {
  const lines = content.toString('utf8').replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim().length > 0);
  const rows = lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { // escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map(v => v.trim());
  });
  return rows;
}

// --- Subjects ---
export const listSubjects = asyncHandler(async (req, res) => {
  const { level, department } = req.query;
  const filter = {};
  if (level) filter.level = level;
  if (department) filter.department = department;
  const subjects = await Subject.find(filter).sort({ level: 1, code: 1 });
  res.json(subjects);
});

export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, level, department, description } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'name and code are required' });
  const exists = await Subject.findOne({ code: code.toUpperCase() });
  if (exists) return res.status(409).json({ message: 'Subject code already exists' });
  const subject = await Subject.create({ name, code: code.toUpperCase(), level, department, description, createdBy: req.user?._id });
  res.status(201).json(subject);
});

// --- Quizzes ---
export const listQuizzes = asyncHandler(async (req, res) => {
  const { subject, active, q, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = {};
  if (subject) {
    if (!mongoose.isValidObjectId(subject)) {
      return res.status(400).json({ message: 'Invalid subject id in query' });
    }
    filter.subject = subject;
  }
  if (typeof active !== 'undefined') filter.isActive = String(active) === 'true';
  if (q) {
    const s = String(q).trim();
    filter.$or = [{ title: new RegExp(s, 'i') }, { description: new RegExp(s, 'i') }];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [total, quizzes] = await Promise.all([
    Quiz.countDocuments(filter),
    Quiz.find(filter).populate('subject', 'name code level department').sort(sort).skip(skip).limit(limitNum),
  ]);
  res.json({ data: quizzes, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, subject, description, timeLimitSec, shuffleQuestions, shuffleOptions, attemptLimit, sections, tags } = req.body;
  if (!title || !subject) return res.status(400).json({ message: 'title and subject are required' });
  // subject can be an ObjectId or a subject code (e.g., "01", "MTH101")
  let subjectId = null;
  if (mongoose.isValidObjectId(subject)) {
    // ensure subject exists
    const exists = await Subject.exists({ _id: subject });
    if (!exists) return res.status(400).json({ message: 'Subject not found' });
    subjectId = subject;
  } else {
    // try resolve by code
    const subjDoc = await Subject.findOne({ code: String(subject).toUpperCase() });
    if (!subjDoc) return res.status(400).json({ message: 'Invalid subject: use a valid Subject ID or existing subject code' });
    subjectId = subjDoc._id;
  }

  const quiz = await Quiz.create({ title, subject: subjectId, description, timeLimitSec, shuffleQuestions, shuffleOptions, attemptLimit, sections, tags, createdBy: req.user?._id });
  res.status(201).json(quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
});

export const toggleQuizActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body || {};
  const quiz = await Quiz.findById(id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  quiz.isActive = Boolean(isActive);
  await quiz.save();
  res.json({ id: quiz._id, isActive: quiz.isActive });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  // Optionally, could also delete related questions and attempts (dangerous); keep as-is for safety.
  res.json({ message: 'Quiz deleted' });
});

// --- CSV Upload Questions ---
// CSV columns: question,text,optionA,optionB,optionC,optionD,optionE(optional),correct(A-E),points,explanation,tags(comma),difficulty,section
export const uploadQuestionsCSV = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const { dryRun } = req.query; // 'true' to validate only
  if (!req.file) return res.status(400).json({ message: 'CSV file is required' });
  const quiz = await Quiz.findById(id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const rows = parseCSV(req.file.buffer);
  if (rows.length < 2) return res.status(400).json({ message: 'CSV has no data' });
  const header = rows[0].map(h => h.toLowerCase());
  const required = ['question','text','optiona','optionb','correct','points'];
  for (const col of required) {
    if (!header.includes(col)) return res.status(400).json({ message: `Missing required column: ${col}` });
  }

  const errors = [];
  const toCreate = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (name) => row[header.indexOf(name)] || '';
    const text = get('text') || get('question');
    const optionA = get('optiona');
    const optionB = get('optionb');
    const optionC = get('optionc');
    const optionD = get('optiond');
    const optionE = get('optione');
    const correct = (get('correct') || '').trim().toUpperCase();
    const points = Number(get('points') || 1);
    const explanation = get('explanation') || '';
    const tags = (get('tags') || '').split(',').map(s => s.trim()).filter(Boolean);
    const difficulty = (get('difficulty') || 'medium').toLowerCase();
    const section = get('section') || '';

    const options = [optionA, optionB, optionC, optionD, optionE].filter(v => v && v.length > 0);
    const correctIndex = ['A','B','C','D','E'].indexOf(correct);

    if (!text || options.length < 2) {
      errors.push({ row: r + 1, message: 'Invalid text/options' });
      continue;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      errors.push({ row: r + 1, message: 'Invalid correct answer letter' });
      continue;
    }
    if (!['easy','medium','hard'].includes(difficulty)) {
      errors.push({ row: r + 1, message: 'Invalid difficulty' });
      continue;
    }

    toCreate.push({ quiz: id, section, difficulty, tags, text, options, correctIndex, explanation, points });
  }

  if (dryRun === 'true') {
    return res.json({ ok: errors.length === 0, errors, rows: toCreate.length });
  }

  if (errors.length) return res.status(400).json({ message: 'Validation errors', errors });

  const created = await Question.insertMany(toCreate);
  // update quiz totalPoints
  const agg = await Question.aggregate([
    { $match: { quiz: quiz._id } },
    { $group: { _id: '$quiz', total: { $sum: '$points' } } },
  ]);
  const total = agg[0]?.total || 0;
  quiz.totalPoints = total;
  await quiz.save();

  res.status(201).json({ created: created.length });
});

// --- Quiz Taking ---
export const startQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const { questionCount } = req.body; // optional: user-selected
  const quiz = await Quiz.findById(id);
  if (!quiz || !quiz.isActive) return res.status(404).json({ message: 'Quiz not found or inactive' });

  const allQ = await Question.find({ quiz: id });
  if (!allQ.length) return res.status(400).json({ message: 'No questions in this quiz yet' });

  let pool = quiz.shuffleQuestions ? shuffle(allQ) : allQ;
  const count = Math.min(Math.max(Number(questionCount) || allQ.length, 1), allQ.length);
  pool = pool.slice(0, count);

  const questionOrder = pool.map(q => q._id);
  const maxScore = pool.reduce((s, q) => s + (q.points || 1), 0);

  // options shuffling per question if enabled
  const questionsPayload = pool.map(q => {
    let opts = [...q.options];
    let correctIndex = q.correctIndex;
    if (quiz.shuffleOptions) {
      const original = opts.map((v, idx) => ({ v, idx }));
      const shuffled = shuffle(original);
      opts = shuffled.map(x => x.v);
      correctIndex = shuffled.findIndex(x => x.idx === q.correctIndex);
    }
    return {
      id: q._id,
      text: q.text,
      options: opts,
      points: q.points,
      difficulty: q.difficulty,
      section: q.section,
      correctIndexClient: correctIndex, // not for scoring, just to map back on submit
    };
  });

  const startedAt = new Date();
  const attempt = await Attempt.create({
    user: req.user._id,
    quiz: id,
    score: 0,
    maxScore,
    startedAt,
    questionOrder,
    answers: [],
    questionCount: count,
  });

  const deadline = quiz.timeLimitSec ? new Date(startedAt.getTime() + quiz.timeLimitSec * 1000) : null;

  res.status(201).json({
    attemptId: attempt._id,
    timeLimitSec: quiz.timeLimitSec,
    startedAt,
    deadline,
    questions: questionsPayload,
  });
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body; // [{question, selectedIndex}]
  const attempt = await Attempt.findById(attemptId).populate('quiz');
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (attempt.submittedAt) return res.status(400).json({ message: 'Attempt already submitted' });
  if (String(attempt.user) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

  const quiz = attempt.quiz;
  const questions = await Question.find({ _id: { $in: attempt.questionOrder } });
  const qMap = new Map(questions.map(q => [String(q._id), q]));

  const now = new Date();
  const durationSec = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

  let score = 0;
  const answerDocs = [];
  for (const ans of answers || []) {
    const q = qMap.get(String(ans.question));
    if (!q) continue;
    const isCorrect = Number(ans.selectedIndex) === q.correctIndex;
    let earnedPoints = isCorrect ? (q.points || 1) : 0;
    score += earnedPoints;
    answerDocs.push({ question: q._id, selectedIndex: ans.selectedIndex, isCorrect, earnedPoints });
  }

  attempt.submittedAt = now;
  attempt.durationSec = durationSec;
  attempt.answers = answerDocs;
  attempt.score = score;
  await attempt.save();

  res.json({ attemptId: attempt._id, score, maxScore: attempt.maxScore, durationSec });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId).populate('quiz user', 'title timeLimitSec name profileImage');
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (String(attempt.user._id) !== String(req.user._id) && !['exec','admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });

  const qIds = attempt.answers.map(a => a.question);
  const questions = await Question.find({ _id: { $in: qIds } });
  const qMap = new Map(questions.map(q => [String(q._id), q]));
  const review = attempt.answers.map(a => {
    const q = qMap.get(String(a.question));
    return {
      questionId: a.question,
      text: q?.text,
      options: q?.options,
      correctIndex: q?.correctIndex,
      selectedIndex: a.selectedIndex,
      isCorrect: a.isCorrect,
      earnedPoints: a.earnedPoints,
      explanation: q?.explanation,
    };
  });

  res.json({
    attemptId: attempt._id,
    quiz: attempt.quiz,
    user: attempt.user,
    score: attempt.score,
    maxScore: attempt.maxScore,
    durationSec: attempt.durationSec,
    review,
  });
});

// --- Leaderboards ---
export const quizLeaderboard = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const top = await Attempt.find({ quiz: id, submittedAt: { $ne: null } })
    .sort({ score: -1, durationSec: 1 })
    .limit(limit)
    .populate('user', 'name username profileImage.url');
  res.json(top.map(a => ({
    user: { id: a.user._id, name: a.user.name, username: a.user.username, avatar: a.user.profileImage?.url || '' },
    score: a.score,
    maxScore: a.maxScore,
    durationSec: a.durationSec,
    attemptId: a._id,
  })));
});

export const globalLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const agg = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null } } },
    { $group: { _id: '$user', totalPoints: { $sum: '$score' }, attempts: { $sum: 1 } } },
    { $sort: { totalPoints: -1 } },
    { $limit: limit },
  ]);
  // enrich with user and most scored subject
  const result = [];
  for (const row of agg) {
    const userId = row._id;
    // most scored subject
    const subjAgg = await Attempt.aggregate([
      { $match: { submittedAt: { $ne: null }, user: userId } },
      { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' } },
      { $unwind: '$quiz' },
      { $group: { _id: '$quiz.subject', points: { $sum: '$score' } } },
      { $sort: { points: -1 } },
      { $limit: 1 },
    ]);
    const mostSubjectId = subjAgg[0]?._id || null;
    result.push({ userId, totalPoints: row.totalPoints, attempts: row.attempts, mostSubjectId });
  }
  // fetch users and subjects
  const usersMap = new Map((await (await import('../models/User.js')).User.find({ _id: { $in: result.map(r => r.userId) } }).select('name username profileImage'))
    .map(u => [String(u._id), u]));
  const subjectIds = result.map(r => r.mostSubjectId).filter(Boolean);
  const subjects = await Subject.find({ _id: { $in: subjectIds } });
  const subjMap = new Map(subjects.map(s => [String(s._id), s]));

  res.json(result.map(r => ({
    user: {
      id: r.userId,
      name: usersMap.get(String(r.userId))?.name,
      username: usersMap.get(String(r.userId))?.username,
      avatar: usersMap.get(String(r.userId))?.profileImage?.url || '',
    },
    totalPoints: r.totalPoints,
    attempts: r.attempts,
    mostSubject: r.mostSubjectId ? { id: r.mostSubjectId, name: subjMap.get(String(r.mostSubjectId))?.name, code: subjMap.get(String(r.mostSubjectId))?.code } : null,
  })));
});

export const userLeaderboardDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await (await import('../models/User.js')).User.findById(userId).select('name username profileImage');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const totals = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null }, user: user._id } },
    { $group: { _id: '$user', totalPoints: { $sum: '$score' }, attempts: { $sum: 1 } } },
  ]);
  const perSubject = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null }, user: user._id } },
    { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' } },
    { $unwind: '$quiz' },
    { $group: { _id: '$quiz.subject', points: { $sum: '$score' }, attempts: { $sum: 1 } } },
    { $sort: { points: -1 } },
  ]);
  const subjectDocs = await Subject.find({ _id: { $in: perSubject.map(p => p._id) } });
  const subjMap = new Map(subjectDocs.map(s => [String(s._id), s]));

  res.json({
    user: { id: user._id, name: user.name, username: user.username, avatar: user.profileImage?.url || '' },
    totalPoints: totals[0]?.totalPoints || 0,
    attempts: totals[0]?.attempts || 0,
    subjects: perSubject.map(p => ({ id: p._id, name: subjMap.get(String(p._id))?.name, code: subjMap.get(String(p._id))?.code, points: p.points, attempts: p.attempts })),
  });
});

// --- Export Attempts CSV (admin) ---
export const exportAttemptsCSV = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const attempts = await Attempt.find({ quiz: id, submittedAt: { $ne: null } })
    .populate('user', 'name username profileImage.url')
    .sort({ createdAt: -1 });

  const header = ['attemptId','userId','name','username','score','maxScore','durationSec','submittedAt'];
  const rows = attempts.map(a => [a._id, a.user?._id, a.user?.name, a.user?.username, a.score, a.maxScore, a.durationSec, a.submittedAt?.toISOString() || '']);

  const csv = [header.join(','), ...rows.map(r => r.map(v => {
    const str = String(v ?? '');
    return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
  }).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attempts.csv"');
  res.send(csv);
});

// --- Admin Cleanup: Remove legacy negativeMarking field from DB ---
export const removeNegativeMarkingField = asyncHandler(async (req, res) => {
  const result = await Quiz.updateMany(
    { negativeMarking: { $exists: true } },
    { $unset: { negativeMarking: '' } }
  );
  res.json({ matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified });
});
