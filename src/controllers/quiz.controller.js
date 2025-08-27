import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import mongoose from "mongoose";

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
  const lines = content
    .toString("utf8")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  const rows = lines.map((line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((v) => v.trim());
  });
  return rows;
}

// --- Courses ---
export const listCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ name: 1 });
  res.json(courses);
});

export const createCourse = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: "Name and code are required" });
  }
  
  const exists = await Course.findOne({ code: code.toUpperCase() });
  if (exists) {
    return res.status(409).json({ message: "Course code already exists" });
  }
  
  const course = await Course.create({
    name,
    code: code.toUpperCase(),
    description,
    createdBy: req.user?._id,
  });
  
  res.status(201).json(course);
});

// --- Quizzes ---
export const listQuizzes = asyncHandler(async (req, res) => {
  const {
    course,
    active,
    q,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;
  const filter = {};
  if (course) {
    if (!mongoose.isValidObjectId(course)) {
      return res.status(400).json({ message: "Invalid course id in query" });
    }
    filter.course = course;
  }
  if (typeof active !== "undefined")
    filter.isActive = String(active) === "true";
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { title: new RegExp(s, "i") },
      { description: new RegExp(s, "i") },
    ];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [total, quizzes] = await Promise.all([
    Quiz.countDocuments(filter),
    Quiz.find(filter)
      .populate("course", "name code description")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);
  res.json({
    data: quizzes,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    course,
    description,
    timeLimitSec,
    shuffleQuestions,
    shuffleOptions,
    attemptLimit,
    sections,
    tags,
  } = req.body;
  
  if (!title || !course) {
    return res.status(400).json({ message: "title and course are required" });
  }
  
  // Ensure course exists
  const courseExists = await Course.exists({ _id: course });
  if (!courseExists) {
    return res.status(400).json({ message: "Course not found" });
  }

  const quiz = await Quiz.create({
    title,
    course,
    description,
    timeLimitSec,
    shuffleQuestions,
    shuffleOptions,
    attemptLimit,
    sections,
    tags,
    createdBy: req.user?._id,
  });
  res.status(201).json(quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json(quiz);
});

export const toggleQuizActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body || {};
  const quiz = await Quiz.findById(id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  quiz.isActive = Boolean(isActive);
  await quiz.save();
  res.json({ id: quiz._id, isActive: quiz.isActive });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  // Optionally, could also delete related questions and attempts (dangerous); keep as-is for safety.
  res.json({ message: "Quiz deleted" });
});

// --- CSV Upload Questions ---
// CSV columns: question,text,optionA,optionB,optionC,optionD,optionE(optional),correct(A-E),points,explanation,tags(comma),difficulty,section
export const uploadQuestionsCSV = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const { dryRun } = req.query; // 'true' to validate only
  if (!req.file)
    return res.status(400).json({ message: "CSV file is required" });
  const quiz = await Quiz.findById(id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const rows = parseCSV(req.file.buffer);
  if (rows.length < 2)
    return res.status(400).json({ message: "CSV has no data" });
  const header = rows[0].map((h) => h.toLowerCase());
  const required = [
    "question",
    "text",
    "optiona",
    "optionb",
    "correct",
    "points",
  ];
  for (const col of required) {
    if (!header.includes(col))
      return res
        .status(400)
        .json({ message: `Missing required column: ${col}` });
  }

  const errors = [];
  const toCreate = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (name) => row[header.indexOf(name)] || "";
    const text = get("text") || get("question");
    const optionA = get("optiona");
    const optionB = get("optionb");
    const optionC = get("optionc");
    const optionD = get("optiond");
    const optionE = get("optione");
    const correct = (get("correct") || "").trim().toUpperCase();
    const points = Number(get("points") || 1);
    const explanation = get("explanation") || "";
    const tags = (get("tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const difficulty = (get("difficulty") || "medium").toLowerCase();
    const section = get("section") || "";

    const options = [optionA, optionB, optionC, optionD, optionE].filter(
      (v) => v && v.length > 0
    );
    const correctIndex = ["A", "B", "C", "D", "E"].indexOf(correct);

    if (!text || options.length < 2) {
      errors.push({ row: r + 1, message: "Invalid text/options" });
      continue;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      errors.push({ row: r + 1, message: "Invalid correct answer letter" });
      continue;
    }
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      errors.push({ row: r + 1, message: "Invalid difficulty" });
      continue;
    }

    toCreate.push({
      quiz: id,
      section,
      difficulty,
      tags,
      text,
      options,
      correctIndex,
      explanation,
      points,
    });
  }

  if (dryRun === "true") {
    return res.json({ ok: errors.length === 0, errors, rows: toCreate.length });
  }

  if (errors.length)
    return res.status(400).json({ message: "Validation errors", errors });

  const created = await Question.insertMany(toCreate);
  // update quiz totalPoints
  const agg = await Question.aggregate([
    { $match: { quiz: quiz._id } },
    { $group: { _id: "$quiz", total: { $sum: "$points" } } },
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
  if (!quiz || !quiz.isActive)
    return res.status(404).json({ message: "Quiz not found or inactive" });

  const allQ = await Question.find({ quiz: id });
  if (!allQ.length)
    return res.status(400).json({ message: "No questions in this quiz yet" });

  let pool = quiz.shuffleQuestions ? shuffle(allQ) : allQ;
  const count = Math.min(
    Math.max(Number(questionCount) || allQ.length, 1),
    allQ.length
  );
  pool = pool.slice(0, count);

  const questionOrder = pool.map((q) => q._id);
  const maxScore = pool.reduce((s, q) => s + (q.points || 1), 0);

  // options shuffling per question if enabled
  const questionsPayload = pool.map((q) => {
    let opts = [...q.options];
    let correctIndex = q.correctIndex;
    if (quiz.shuffleOptions) {
      const original = opts.map((v, idx) => ({ v, idx }));
      const shuffled = shuffle(original);
      opts = shuffled.map((x) => x.v);
      correctIndex = shuffled.findIndex((x) => x.idx === q.correctIndex);
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

  const deadline = quiz.timeLimitSec
    ? new Date(startedAt.getTime() + quiz.timeLimitSec * 1000)
    : null;

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
  const attempt = await Attempt.findById(attemptId).populate("quiz");
  if (!attempt) return res.status(404).json({ message: "Attempt not found" });
  if (attempt.submittedAt)
    return res.status(400).json({ message: "Attempt already submitted" });
  if (String(attempt.user) !== String(req.user._id))
    return res.status(403).json({ message: "Forbidden" });

  const quiz = attempt.quiz;
  const questions = await Question.find({
    _id: { $in: attempt.questionOrder },
  });
  const qMap = new Map(questions.map((q) => [String(q._id), q]));

  const now = new Date();
  const durationSec = Math.floor(
    (now.getTime() - attempt.startedAt.getTime()) / 1000
  );

  let score = 0;
  const answerDocs = [];
  for (const ans of answers || []) {
    const q = qMap.get(String(ans.question));
    if (!q) continue;
    const isCorrect = Number(ans.selectedIndex) === q.correctIndex;
    let earnedPoints = isCorrect ? q.points || 1 : 0;
    score += earnedPoints;
    answerDocs.push({
      question: q._id,
      selectedIndex: ans.selectedIndex,
      isCorrect,
      earnedPoints,
    });
  }

  attempt.submittedAt = now;
  attempt.durationSec = durationSec;
  attempt.answers = answerDocs;
  attempt.score = score;
  await attempt.save();

  res.json({
    attemptId: attempt._id,
    score,
    maxScore: attempt.maxScore,
    durationSec,
  });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId).populate(
    "quiz user",
    "title timeLimitSec name profileImage"
  );
  if (!attempt) return res.status(404).json({ message: "Attempt not found" });
  if (
    String(attempt.user._id) !== String(req.user._id) &&
    !["exec", "admin"].includes(req.user.role)
  )
    return res.status(403).json({ message: "Forbidden" });

  const qIds = attempt.answers.map((a) => a.question);
  const questions = await Question.find({ _id: { $in: qIds } });
  const qMap = new Map(questions.map((q) => [String(q._id), q]));
  const review = attempt.answers.map((a) => {
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
    .populate("user", "name username profileImage.url");
  res.json(
    top.map((a) => ({
      user: {
        id: a.user._id,
        name: a.user.name,
        username: a.user.username,
        avatar: a.user.profileImage?.url || "",
      },
      score: a.score,
      maxScore: a.maxScore,
      durationSec: a.durationSec,
      attemptId: a._id,
    }))
  );
});

export const globalLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const agg = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null } } },
    {
      $group: {
        _id: "$user",
        totalPoints: { $sum: "$score" },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit },
  ]);
  // enrich with user and most scored subject
  const result = [];
  for (const row of agg) {
    const userId = row._id;
    // most scored course
    const courseAgg = await Attempt.aggregate([
      { $match: { submittedAt: { $ne: null }, user: userId } },
      {
        $lookup: {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },
      { $group: { _id: "$quiz.course", points: { $sum: "$score" } } },
      { $sort: { points: -1 } },
      { $limit: 1 },
    ]);
    const mostCourseId = courseAgg[0]?._id || null;
    result.push({
      userId,
      totalPoints: row.totalPoints,
      attempts: row.attempts,
      mostCourseId,
    });
  }
  // fetch users and courses
  const usersMap = new Map(
    (
      await User.find({ _id: { $in: result.map((r) => r.userId) } }).select(
        "name username profileImage"
      )
    ).map((u) => [String(u._id), u])
  );
  const courseIds = result.map((r) => r.mostCourseId).filter(Boolean);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  res.json(
    result.map((r) => ({
      user: {
        id: r.userId,
        name: usersMap.get(String(r.userId))?.name,
        username: usersMap.get(String(r.userId))?.username,
        avatar: usersMap.get(String(r.userId))?.profileImage?.url || "",
      },
      totalPoints: r.totalPoints,
      attempts: r.attempts,
      mostCourse: r.mostCourseId
        ? {
            id: r.mostCourseId,
            name: courseMap.get(String(r.mostCourseId))?.name,
            code: courseMap.get(String(r.mostCourseId))?.code,
          }
        : null,
    }))
  );
});

export const userLeaderboardDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select("name username profileImage");
  if (!user) return res.status(404).json({ message: "User not found" });

  const totals = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null }, user: user._id } },
    {
      $group: {
        _id: "$user",
        totalPoints: { $sum: "$score" },
        attempts: { $sum: 1 },
      },
    },
  ]);
  const perCourse = await Attempt.aggregate([
    { $match: { submittedAt: { $ne: null }, user: user._id } },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    {
      $group: {
        _id: "$quiz.course",
        points: { $sum: "$score" },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { points: -1 } },
  ]);
  const courseDocs = await Course.find({
    _id: { $in: perCourse.map((p) => p._id) },
  });
  const courseMap = new Map(courseDocs.map((c) => [String(c._id), c]));

  res.json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.profileImage?.url || "",
    },
    totalPoints: totals[0]?.totalPoints || 0,
    attempts: totals[0]?.attempts || 0,
    courses: perCourse.map((p) => ({
      id: p._id,
      name: courseMap.get(String(p._id))?.name,
      code: courseMap.get(String(p._id))?.code,
      points: p.points,
      attempts: p.attempts,
    })),
  });
});

// --- Export Attempts CSV (admin) ---
export const exportAttemptsCSV = asyncHandler(async (req, res) => {
  const { id } = req.params; // quiz id
  const attempts = await Attempt.find({ quiz: id, submittedAt: { $ne: null } })
    .populate("user", "name username profileImage.url")
    .sort({ createdAt: -1 });

  const header = [
    "attemptId",
    "userId",
    "name",
    "username",
    "score",
    "maxScore",
    "durationSec",
    "submittedAt",
  ];
  const rows = attempts.map((a) => [
    a._id,
    a.user?._id,
    a.user?.name,
    a.user?.username,
    a.score,
    a.maxScore,
    a.durationSec,
    a.submittedAt?.toISOString() || "",
  ]);

  const csv = [
    header.join(","),
    ...rows.map((r) =>
      r
        .map((v) => {
          const str = String(v ?? "");
          return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
        })
        .join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="attempts.csv"');
  res.send(csv);
});

// --- Admin Cleanup: Remove legacy negativeMarking field from DB ---
export const removeNegativeMarkingField = asyncHandler(async (req, res) => {
  const result = await Quiz.updateMany(
    { negativeMarking: { $exists: true } },
    { $unset: { negativeMarking: "" } }
  );
  res.json({
    matched: result.matchedCount ?? result.n,
    modified: result.modifiedCount ?? result.nModified,
  });
});

// Get all quizzes (public)
export const getAllQuizzes = asyncHandler(async (req, res) => {
  const {
    course,
    q,
    published,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (course) filter.course = course;
  if (typeof published !== "undefined")
    filter.published = String(published) === "true";
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { title: new RegExp(s, "i") },
      { description: new RegExp(s, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, quizzes] = await Promise.all([
    Quiz.countDocuments(filter),
    Quiz.find(filter)
      .populate("course", "code title")
      .populate("createdBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    data: quizzes,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Get a specific quiz (public)
export const getQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id)
    .populate("course", "code title")
    .populate("createdBy", "name");

  if (!quiz || !quiz.published) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.json({ data: quiz });
});

// Get quiz questions (for taking the quiz)
export const getQuizQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id).populate({
    path: "questions",
    match: { published: true },
    select: "question type options order points -correctAnswer -explanation",
  });

  if (!quiz || !quiz.published) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  // Sort questions by order
  const sortedQuestions = quiz.questions.sort((a, b) => a.order - b.order);

  res.json({
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
      },
      questions: sortedQuestions,
    },
  });
});




// Toggle quiz publish status (admin only)
export const toggleQuizPublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body || {};

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  quiz.published = Boolean(published);
  await quiz.save();

  res.json({ id: quiz._id, published: quiz.published });
});

// Get all questions for a quiz (admin only)
export const getQuizQuestionsAdmin = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const questions = await Question.find({ quiz: quizId })
    .sort("order")
    .populate("quiz", "title");

  res.json({ data: questions });
});

// Create a new question (admin only)
export const createQuestion = asyncHandler(async (req, res) => {
  const {
    quiz,
    question,
    type,
    options,
    correctAnswer,
    explanation,
    points,
    order,
  } = req.body;

  if (!quiz || !question || !correctAnswer) {
    return res
      .status(400)
      .json({ message: "quiz, question, and correctAnswer are required" });
  }

  if (
    type === "multiple_choice" &&
    (!options || !Array.isArray(options) || options.length < 2)
  ) {
    return res
      .status(400)
      .json({
        message: "multiple_choice questions require at least 2 options",
      });
  }

  const questionDoc = await Question.create({
    quiz,
    question,
    type: type || "multiple_choice",
    options: type === "multiple_choice" ? options : undefined,
    correctAnswer,
    explanation,
    points: points || 1,
    order: order || 0,
  });

  await questionDoc.populate("quiz", "title");
  res.status(201).json({ data: questionDoc });
});

// Update a question (admin only)
export const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("quiz", "title");

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json({ data: question });
});

// Delete a question (admin only)
export const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Question.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json({ message: "Question deleted successfully" });
});

// Reorder questions (admin only)
export const reorderQuestions = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { questionOrders } = req.body; // Array of { questionId, order }

  if (!Array.isArray(questionOrders)) {
    return res.status(400).json({ message: "questionOrders must be an array" });
  }

  const updatePromises = questionOrders.map(({ questionId, order }) =>
    Question.findByIdAndUpdate(questionId, { order })
  );

  await Promise.all(updatePromises);

  res.json({ message: "Questions reordered successfully" });
});
