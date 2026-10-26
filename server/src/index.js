import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import qrcode from "qrcode";
import crypto from "crypto";
import vm from "vm";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import {
  mockStudentProfile,
  mockStudentsList,
  mockSchedule,
  mockHomeworks,
  mockMarks,
  mockLeaderboard,
  mockCodeTasks
} from "./mockData.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ==========================================
// In-Memory Storage & State
// ==========================================
const qrSessions = new Map(); // sessionId -> { status: 'pending'|'approved', user, expiresAt }
const registeredUsers = new Map(); // username.toLowerCase() -> user profile
let activeProfile = { ...mockStudentProfile };
let activeStudents = [...mockStudentsList];
let activeSchedule = [...mockSchedule];
let activeHomeworks = [...mockHomeworks];
let activeMarks = [...mockMarks];
let customApiToken = null;
let applicationKey = "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6";
let topAcademyApiBase = "https://msapi.top-academy.ru/api/v2";

// Clean up expired QR sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of qrSessions.entries()) {
    if (session.expiresAt < now) {
      qrSessions.delete(id);
    }
  }
}, 30000);

// ==========================================
// 1. QR Authentication API
// ==========================================
app.get("/api/auth/qr/generate", async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 300000; // 5 minutes

    qrSessions.set(sessionId, {
      status: "pending",
      user: null,
      createdAt: Date.now(),
      expiresAt
    });

    // Content encoded inside QR code
    const host = req.get("host") || `localhost:${PORT}`;
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = process.env.PUBLIC_URL || `${protocol}://${host}`;
    const qrPayload = JSON.stringify({
      app: "top-journal-2.0",
      type: "auth_request",
      sessionId,
      authUrl: `${baseUrl}/api/auth/qr/approve`,
      expiresAt
    });

    const qrDataUrl = await qrcode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });

    res.json({
      success: true,
      sessionId,
      qrDataUrl,
      expiresAt
    });
  } catch (error) {
    console.error("Error generating QR:", error);
    res.status(500).json({ success: false, error: "Failed to generate QR code" });
  }
});

app.get("/api/auth/qr/status/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = qrSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, status: "expired" });
  }

  if (session.expiresAt < Date.now()) {
    qrSessions.delete(sessionId);
    return res.json({ success: false, status: "expired" });
  }

  res.json({
    success: true,
    status: session.status,
    user: session.user || null
  });
});

app.post("/api/auth/qr/approve", (req, res) => {
  const { sessionId, userToken, studentData } = req.body;
  const session = qrSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: "Session expired or invalid" });
  }

  const approvedUser = studentData || activeProfile;
  session.status = "approved";
  session.user = approvedUser;

  // Notify connected desktop client via Socket.io
  io.to(`qr-${sessionId}`).emit("qr-approved", {
    sessionId,
    user: approvedUser,
    token: userToken || "top-jwt-" + crypto.randomUUID()
  });

  res.json({
    success: true,
    message: "Authorization approved! Desktop will login automatically."
  });
});

// ==========================================
// 2. Authentication & Journal API Proxy
// ==========================================
app.post("/api/auth/register", (req, res) => {
  const { username, password, fullName, group, branch } = req.body;
  if (!username || !username.trim() || !password || !password.trim()) {
    return res.status(400).json({ success: false, error: "Укажите никнейм/логин и пароль" });
  }

  const normalized = username.trim().toLowerCase();
  const displayName = fullName?.trim() || username.trim();

  const newStudent = {
    ...mockStudentProfile,
    id: "std-" + crypto.randomUUID().slice(0, 8),
    username: username.trim(),
    fullName: displayName,
    email: `${username.trim()}@student.top-academy.ru`,
    group: group?.trim() || "ВЕБ-22/3 (Программирование)",
    branch: branch?.trim() || "Центральный филиал",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
    coins: 600,
    gems: 150,
    level: 6,
    levelTitle: "Студент ТОП",
    averageGrade: 11.5,
    attendancePercentage: 100,
    isDemo: false
  };

  registeredUsers.set(normalized, { ...newStudent, password: password.trim() });
  activeProfile = newStudent;

  const idx = activeStudents.findIndex((s) => s.username?.toLowerCase() === normalized);
  if (idx !== -1) {
    activeStudents[idx] = newStudent;
  } else {
    activeStudents.unshift(newStudent);
  }

  return res.json({
    success: true,
    token: "top-local-jwt-" + Date.now(),
    user: newStudent,
    message: `Аккаунт ${displayName} успешно создан!`
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password, token, isDemo, fullName, group, branch, isRegister } = req.body;

  // 1. Explicit demo login
  if (isDemo || username === "demo_student" || username === "demo") {
    activeProfile = { ...mockStudentProfile, isDemo: true };
    return res.json({
      success: true,
      token: "demo-jwt-token-active",
      user: activeProfile,
      source: "demo_mode"
    });
  }

  // 2. Direct session token login
  if (token) {
    customApiToken = token.trim();
    try {
      const profRes = await axios.get(`${topAcademyApiBase}/settings/user-info`, {
        headers: { Authorization: `Bearer ${customApiToken}` },
        timeout: 6000
      });
      if (profRes.data) {
        activeProfile = {
          ...activeProfile,
          fullName: profRes.data.full_name || profRes.data.name || activeProfile.fullName,
          group: profRes.data.group_name || activeProfile.group,
          branch: profRes.data.branch_name || activeProfile.branch,
          avatar: profRes.data.small_avatar || activeProfile.avatar,
          coins: profRes.data.gaming_points?.points ?? activeProfile.coins,
          gems: profRes.data.gaming_points?.crystals ?? activeProfile.gems,
          isDemo: false
        };
      }
    } catch (e) {
      console.log("[API PROXY] Could not fetch user-info via token:", e.message);
    }

    return res.json({
      success: true,
      token: customApiToken,
      user: activeProfile,
      source: "custom_token"
    });
  }

  // 3. Check registered local users first
  if (username && password) {
    const normalized = username.trim().toLowerCase();
    if (registeredUsers.has(normalized)) {
      const existing = registeredUsers.get(normalized);
      if (existing.password === password.trim()) {
        activeProfile = { ...existing };
        delete activeProfile.password;
        return res.json({
          success: true,
          token: "top-local-jwt-" + Date.now(),
          user: activeProfile,
          source: "local_registered"
        });
      }
    }

    // Attempt live credentials proxy login to Journal TOP Academy API
    try {
      console.log(`[API PROXY] Authenticating with ${topAcademyApiBase}/auth/login (username: ${username}, AppKey: ${applicationKey.slice(0, 8)}...)`);
      const topResponse = await axios.post(
        `${topAcademyApiBase}/auth/login`,
        {
          application_key: applicationKey,
          username: username.trim(),
          password: password.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Origin": "https://journal.top-academy.ru",
            "Referer": "https://journal.top-academy.ru/"
          },
          timeout: 6000
        }
      );

      const receivedToken = topResponse.data?.token || topResponse.data?.access_token;
      if (receivedToken) {
        customApiToken = receivedToken;
        console.log("[API PROXY] TOP Academy authorization successful for user:", username);

        // Fetch user profile
        try {
          const profileRes = await axios.get(`${topAcademyApiBase}/settings/user-info`, {
            headers: { Authorization: `Bearer ${customApiToken}` },
            timeout: 6000
          });
          if (profileRes.data) {
            activeProfile = {
              ...activeProfile,
              fullName: profileRes.data.full_name || profileRes.data.name || fullName?.trim() || username.trim(),
              group: profileRes.data.group_name || activeProfile.group,
              branch: profileRes.data.branch_name || activeProfile.branch,
              avatar: profileRes.data.small_avatar || activeProfile.avatar,
              coins: profileRes.data.gaming_points?.points ?? activeProfile.coins,
              gems: profileRes.data.gaming_points?.crystals ?? activeProfile.gems,
              isDemo: false
            };
            registeredUsers.set(normalized, { ...activeProfile, password: password.trim() });
            const idx = activeStudents.findIndex((s) => s.id === activeProfile.id);
            if (idx !== -1) {
              activeStudents[idx] = { ...activeStudents[idx], ...activeProfile };
            }
          }
        } catch (e) {
          console.log("[API PROXY] Could not fetch user-info immediately:", e.message);
        }

        // Fetch schedule, homework, marks in parallel
        try {
          const date = new Date().toISOString().split("T")[0];
          const [schedRes, hwRes, marksRes] = await Promise.allSettled([
            axios.get(`${topAcademyApiBase}/schedule/operations/get-by-date?date_filter=${date}`, {
              headers: { Authorization: `Bearer ${customApiToken}` },
              timeout: 6000
            }),
            axios.get(`${topAcademyApiBase}/homework/operations/list`, {
              headers: { Authorization: `Bearer ${customApiToken}` },
              timeout: 6000
            }),
            axios.get(`${topAcademyApiBase}/progress/operations/student-visits`, {
              headers: { Authorization: `Bearer ${customApiToken}` },
              timeout: 6000
            })
          ]);

          if (schedRes.status === "fulfilled" && Array.isArray(schedRes.value.data) && schedRes.value.data.length > 0) {
            activeSchedule = schedRes.value.data;
          }
          if (hwRes.status === "fulfilled" && Array.isArray(hwRes.value.data) && hwRes.value.data.length > 0) {
            activeHomeworks = hwRes.value.data;
          }
          if (marksRes.status === "fulfilled" && Array.isArray(marksRes.value.data) && marksRes.value.data.length > 0) {
            activeMarks = marksRes.value.data;
          }
        } catch (e) {
          console.log("[API PROXY] Sync error:", e.message);
        }

        return res.json({
          success: true,
          token: customApiToken,
          user: activeProfile,
          source: "live_journal_api"
        });
      }
    } catch (err) {
      console.log("[API PROXY] TOP Academy login not matched, creating/logging in with personal account for:", username);
      // Fallback: Create or log into personal student account with the entered nickname/name!
      const displayName = fullName?.trim() || username.trim();
      const newStudent = {
        ...mockStudentProfile,
        id: "std-" + crypto.randomUUID().slice(0, 8),
        username: username.trim(),
        fullName: displayName,
        email: `${username.trim()}@student.top-academy.ru`,
        group: group?.trim() || "ВЕБ-22/3 (Программирование)",
        branch: branch?.trim() || "Центральный филиал",
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
        coins: 600,
        gems: 150,
        level: 6,
        levelTitle: "Студент ТОП",
        averageGrade: 11.5,
        attendancePercentage: 100,
        isDemo: false
      };

      registeredUsers.set(normalized, { ...newStudent, password: password.trim() });
      activeProfile = newStudent;

      const idx = activeStudents.findIndex((s) => s.username?.toLowerCase() === normalized);
      if (idx !== -1) {
        activeStudents[idx] = newStudent;
      } else {
        activeStudents.unshift(newStudent);
      }

      return res.json({
        success: true,
        token: "top-local-jwt-" + Date.now(),
        user: newStudent,
        source: "personal_account",
        message: `Вы успешно вошли как ${displayName}!`
      });
    }
  }

  // 4. Default: require credentials or demo flag
  res.status(400).json({
    success: false,
    error: "Укажите логин (никнейм) и пароль"
  });
});

// Set custom student profile without cloud password
app.post("/api/auth/set-profile", (req, res) => {
  const { fullName, group, branch, faculty } = req.body;
  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, error: "Укажите ваше имя или ФИО" });
  }

  activeProfile = {
    ...activeProfile,
    fullName: fullName.trim(),
    group: group?.trim() || activeProfile.group,
    branch: branch?.trim() || activeProfile.branch,
    faculty: faculty?.trim() || activeProfile.faculty,
    isDemo: false
  };

  const idx = activeStudents.findIndex(s => s.id === activeProfile.id);
  if (idx !== -1) {
    activeStudents[idx] = { ...activeStudents[idx], ...activeProfile };
  } else {
    activeStudents.unshift({ ...activeProfile });
  }

  res.json({
    success: true,
    user: activeProfile,
    token: "custom-local-token-" + Date.now()
  });
});

app.get("/api/settings/token", (req, res) => {
  res.json({
    success: true,
    hasToken: !!customApiToken,
    applicationKey,
    apiBase: topAcademyApiBase,
    status: "connected"
  });
});

app.post("/api/settings/token", (req, res) => {
  const { token, apiBase, appKey } = req.body;
  if (token !== undefined) customApiToken = token;
  if (apiBase) topAcademyApiBase = apiBase;
  if (appKey) applicationKey = appKey;
  res.json({
    success: true,
    hasToken: !!customApiToken,
    applicationKey,
    apiBase: topAcademyApiBase
  });
});

app.get("/api/journal/profile", async (req, res) => {
  if (customApiToken) {
    try {
      const resp = await axios.get(`${topAcademyApiBase}/settings/user-info`, {
        headers: { Authorization: `Bearer ${customApiToken}` },
        timeout: 5000
      });
      if (resp.data) {
        activeProfile = {
          ...activeProfile,
          fullName: resp.data.full_name || resp.data.name || activeProfile.fullName,
          group: resp.data.group_name || activeProfile.group,
          branch: resp.data.branch_name || activeProfile.branch,
          avatar: resp.data.small_avatar || activeProfile.avatar,
          coins: resp.data.gaming_points?.points ?? activeProfile.coins,
          gems: resp.data.gaming_points?.crystals ?? activeProfile.gems
        };
      }
    } catch (e) {
      // fallback to activeProfile
    }
  }
  res.json({ success: true, profile: activeProfile, hasLiveToken: !!customApiToken });
});

// Update own profile ("украшать как душа пожелает")
app.put("/api/journal/profile", (req, res) => {
  const updates = req.body;
  
  activeProfile = {
    ...activeProfile,
    ...updates,
    id: activeProfile.id
  };

  // Sync into activeStudents list
  const idx = activeStudents.findIndex((s) => s.id === activeProfile.id);
  if (idx !== -1) {
    activeStudents[idx] = { ...activeStudents[idx], ...activeProfile };
  } else {
    activeStudents.unshift({ ...activeProfile });
  }

  res.json({ success: true, profile: activeProfile });
});

// Get all public student profiles in the group
app.get("/api/journal/students", (req, res) => {
  res.json({ success: true, students: activeStudents });
});

// Get a single student public profile by ID
app.get("/api/journal/students/:id", (req, res) => {
  const { id } = req.params;
  if (id === "me" || id === activeProfile.id) {
    return res.json({ success: true, student: activeProfile, isMe: true });
  }
  const student = activeStudents.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ success: false, message: "Студент не найден" });
  }
  res.json({ success: true, student, isMe: false });
});

// Send respect or message to a classmate's public profile
app.post("/api/journal/students/:id/respect", (req, res) => {
  const { id } = req.params;
  const { message, author } = req.body;

  const target = activeStudents.find((s) => s.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: "Студент не найден" });
  }

  target.respectsCount = (target.respectsCount || 0) + 1;
  if (message && message.trim()) {
    target.guestbook = target.guestbook || [];
    target.guestbook.unshift({
      id: "gb-" + Date.now(),
      author: author || activeProfile.fullName,
      avatar: activeProfile.avatar,
      text: message.trim(),
      time: "Только что"
    });
  }

  if (id === activeProfile.id) {
    activeProfile.respectsCount = target.respectsCount;
    activeProfile.guestbook = target.guestbook;
  }

  res.json({
    success: true,
    respectsCount: target.respectsCount,
    guestbook: target.guestbook,
    message: "Респект успешно отправлен сокурснику!"
  });
});

app.get("/api/journal/schedule", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  if (customApiToken) {
    try {
      const resp = await axios.get(`${topAcademyApiBase}/schedule/operations/get-by-date?date_filter=${date}`, {
        headers: { Authorization: `Bearer ${customApiToken}` },
        timeout: 5000
      });
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        return res.json({ success: true, schedule: resp.data, source: "live_api" });
      }
    } catch (e) {
      // fallback
    }
  }
  res.json({ success: true, schedule: activeSchedule, source: "cached" });
});

app.get("/api/journal/homework", async (req, res) => {
  if (customApiToken) {
    try {
      const resp = await axios.get(`${topAcademyApiBase}/homework/operations/list`, {
        headers: { Authorization: `Bearer ${customApiToken}` },
        timeout: 5000
      });
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        return res.json({ success: true, homeworks: resp.data, source: "live_api" });
      }
    } catch (e) {
      // fallback
    }
  }
  res.json({ success: true, homeworks: activeHomeworks, source: "cached" });
});

app.post("/api/journal/homework/:id/submit", (req, res) => {
  const { id } = req.params;
  const { comment, files } = req.body;

  const hwIndex = activeHomeworks.findIndex((h) => h.id === id);
  if (hwIndex === -1) {
    return res.status(404).json({ success: false, message: "Homework not found" });
  }

  activeHomeworks[hwIndex].status = "in_progress";
  activeHomeworks[hwIndex].submission = {
    submittedAt: new Date().toISOString(),
    comment: comment || "Решение отправлено студентом через Journal 2.0",
    files: files || []
  };

  res.json({
    success: true,
    message: "Домашнее задание успешно отправлено на проверку!",
    homework: activeHomeworks[hwIndex]
  });
});

app.get("/api/journal/marks", async (req, res) => {
  if (customApiToken) {
    try {
      const resp = await axios.get(`${topAcademyApiBase}/progress/operations/student-visits`, {
        headers: { Authorization: `Bearer ${customApiToken}` },
        timeout: 5000
      });
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        return res.json({ success: true, marks: resp.data, source: "live_api" });
      }
    } catch (e) {
      // fallback
    }
  }
  res.json({ success: true, marks: activeMarks, source: "cached" });
});

app.post("/api/journal/marks/add", (req, res) => {
  const { subject, teacher, mark, type, topic, date } = req.body;
  if (!subject || !mark) {
    return res.status(400).json({ success: false, message: "Предмет и оценка обязательны" });
  }

  let subItem = activeMarks.find(m => m.subject.toLowerCase() === subject.toLowerCase());
  const newMarkObj = {
    date: date || new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
    mark: Number(mark),
    type: type || "Практика",
    topic: topic || "Практическое занятие"
  };

  if (subItem) {
    subItem.marksList.unshift(newMarkObj);
    const sum = subItem.marksList.reduce((acc, curr) => acc + curr.mark, 0);
    subItem.average = Number((sum / subItem.marksList.length).toFixed(2));
  } else {
    subItem = {
      subject,
      teacher: teacher || "Преподаватель Академии",
      average: Number(mark),
      attendanceRate: 100,
      marksList: [newMarkObj]
    };
    activeMarks.unshift(subItem);
  }

  // Recalculate student overall average
  const allMarks = activeMarks.flatMap(s => s.marksList.map(m => m.mark));
  if (allMarks.length > 0) {
    const totalAvg = allMarks.reduce((a, b) => a + b, 0) / allMarks.length;
    activeProfile.averageGrade = Number(totalAvg.toFixed(2));
  }

  res.json({ success: true, marks: activeMarks, message: "Оценка успешно добавлена в журнал!" });
});

// Full 1-Click Diary Sync Endpoint with TOP Academy Official API
app.post("/api/journal/sync", async (req, res) => {
  const { username, password, token } = req.body;
  let userToken = token || customApiToken;

  if (username && password) {
    try {
      console.log(`[SYNC API] Logging in via ${topAcademyApiBase}/auth/login with applicationKey: ${applicationKey.slice(0, 8)}...`);
      const topResponse = await axios.post(
        `${topAcademyApiBase}/auth/login`,
        {
          application_key: applicationKey,
          username,
          password
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Origin": "https://journal.top-academy.ru",
            "Referer": "https://journal.top-academy.ru/"
          },
          timeout: 8000
        }
      );
      if (topResponse.data?.token || topResponse.data?.access_token) {
        userToken = topResponse.data.token || topResponse.data.access_token;
        customApiToken = userToken;
      }
    } catch(err) {
      console.log("[SYNC API] Auth failed:", err.response?.data || err.message);
      return res.status(401).json({
        success: false,
        error: "Неверный логин или пароль студента в Академии ТОП",
        details: err.response?.data
      });
    }
  }

  if (!userToken) {
    return res.status(400).json({ success: false, error: "Укажите логин и пароль или сессионный токен" });
  }

  let syncResults = { profile: false, schedule: false, homework: false };

  // 1. Fetch Profile
  try {
    const profRes = await axios.get(`${topAcademyApiBase}/settings/user-info`, {
      headers: { Authorization: `Bearer ${userToken}` },
      timeout: 6000
    });
    if (profRes.data) {
      activeProfile = {
        ...activeProfile,
        fullName: profRes.data.full_name || profRes.data.name || activeProfile.fullName,
        group: profRes.data.group_name || activeProfile.group,
        branch: profRes.data.branch_name || activeProfile.branch,
        avatar: profRes.data.small_avatar || activeProfile.avatar,
        coins: profRes.data.gaming_points?.points ?? activeProfile.coins,
        gems: profRes.data.gaming_points?.crystals ?? activeProfile.gems
      };
      // Sync into students list
      const idx = activeStudents.findIndex(s => s.id === activeProfile.id);
      if (idx !== -1) {
        activeStudents[idx] = { ...activeStudents[idx], ...activeProfile };
      }
      syncResults.profile = true;
    }
  } catch(e) {}

  // 2. Fetch Schedule
  try {
    const date = new Date().toISOString().split("T")[0];
    const schedRes = await axios.get(`${topAcademyApiBase}/schedule/operations/get-by-date?date_filter=${date}`, {
      headers: { Authorization: `Bearer ${userToken}` },
      timeout: 6000
    });
    if (Array.isArray(schedRes.data) && schedRes.data.length > 0) {
      activeSchedule = schedRes.data;
      syncResults.schedule = true;
    }
  } catch(e) {}

  // 3. Fetch Homework
  try {
    const hwRes = await axios.get(`${topAcademyApiBase}/homework/operations/list`, {
      headers: { Authorization: `Bearer ${userToken}` },
      timeout: 6000
    });
    if (Array.isArray(hwRes.data) && hwRes.data.length > 0) {
      activeHomeworks = hwRes.data;
      syncResults.homework = true;
    }
  } catch(e) {}

  // 4. Fetch Marks & Visits
  try {
    const marksRes = await axios.get(`${topAcademyApiBase}/progress/operations/student-visits`, {
      headers: { Authorization: `Bearer ${userToken}` },
      timeout: 6000
    });
    if (Array.isArray(marksRes.data) && marksRes.data.length > 0) {
      activeMarks = marksRes.data;
      syncResults.marks = true;
    }
  } catch(e) {}

  res.json({
    success: true,
    message: "Синхронизация с серверами Академии ТОП успешно выполнена!",
    syncResults,
    profile: activeProfile,
    schedule: activeSchedule,
    homeworks: activeHomeworks,
    marks: activeMarks
  });
});

app.get("/api/journal/rating", (req, res) => {
  res.json({ success: true, leaderboard: mockLeaderboard });
});

app.get("/api/code/tasks", (req, res) => {
  res.json({ success: true, tasks: mockCodeTasks });
});

// ==========================================
// 3. Stepik-like Code Auto-Testing Runner
// ==========================================
app.post("/api/code/run", (req, res) => {
  const { code, language = "javascript", testCases = [] } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ success: false, error: "Код программы не предоставлен" });
  }

  // Security check: block dangerous operations and system access
  const forbiddenPatterns = [
    /process\s*\./i,
    /child_process/i,
    /require\s*\(/i,
    /import\s*\(/i,
    /fs\s*\./i,
    /global\s*\./i,
    /__proto__/i,
    /constructor\s*\[/i,
    /\.constructor\s*\(/i
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(code)) {
      return res.json({
        success: false,
        error: "Ошибка безопасности: использование системных вызовов (process, require, child_process, fs) запрещено правилами песочницы.",
        testResults: []
      });
    }
  }

  const startTime = Date.now();
  const testResults = [];
  let passedCount = 0;
  let generalOutput = "";

  try {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let consoleLogs = [];

      const sandbox = {
        console: {
          log: (...args) => consoleLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
          error: (...args) => consoleLogs.push("[ERROR] " + args.join(" ")),
          warn: (...args) => consoleLogs.push("[WARN] " + args.join(" "))
        }
      };

      const context = vm.createContext(sandbox);

      // Extract function call or evaluate with input
      const harnessScript = `
        ${code}
        ;(() => {
          try {
            // Find function declared in code (function declaration, const/let/var arrow function or function expr)
            const regex = /(?:function\\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\\s+([a-zA-Z0-9_$]+)\\s*=)/g;
            const matches = [...${JSON.stringify(code)}.matchAll(regex)];
            const candidates = matches.map(m => m[1] || m[2]).filter(Boolean);

            let fn = null;
            for (let i = candidates.length - 1; i >= 0; i--) {
              try {
                const target = eval(candidates[i]);
                if (typeof target === 'function') {
                  fn = target;
                  break;
                }
              } catch (_) {}
            }

            if (!fn) {
              const knownNames = ["sumEvenIndices", "isPalindrome", "solve", "solution"];
              for (const name of knownNames) {
                try {
                  const target = eval(name);
                  if (typeof target === 'function') {
                    fn = target;
                    break;
                  }
                } catch (_) {}
              }
            }

            if (typeof fn === 'function') {
              const testInput = eval(${JSON.stringify(tc.input)});
              const res = fn(testInput);
              return typeof res === 'object' && res !== null ? JSON.stringify(res) : String(res);
            }
            return "No function found";
          } catch(e) {
            return "Execution error: " + e.message;
          }
        })();
      `;

      let executionResult = "";
      try {
        executionResult = vm.runInContext(harnessScript, context, { timeout: 2000 });
      } catch (runErr) {
        executionResult = `Runtime Error: ${runErr.message}`;
      }

      const passed = String(executionResult).trim() === String(tc.expected).trim();
      if (passed) passedCount++;

      testResults.push({
        testIndex: i + 1,
        input: tc.input,
        expected: tc.expected,
        actual: executionResult,
        passed,
        logs: consoleLogs
      });
    }

    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      allPassed: passedCount === testCases.length && testCases.length > 0,
      passedCount,
      totalCount: testCases.length,
      durationMs,
      testResults
    });
  } catch (err) {
    res.json({
      success: false,
      error: `Ошибка компиляции/запуска: ${err.message}`,
      testResults: []
    });
  }
});

// ==========================================
// 4. Realtime Socket.IO: WebRTC Calls & Whiteboard
// ==========================================
const rooms = new Map(); // roomId -> Map(socketId -> { user, mediaState })
const boardStates = new Map(); // roomId -> array of strokes

io.on("connection", (socket) => {
  // Listen for QR Auth Room
  socket.on("join-qr-room", (sessionId) => {
    socket.join(`qr-${sessionId}`);
  });

  // Video Call Room Signaling
  socket.on("join-call-room", ({ roomId, user }) => {
    socket.join(`call-${roomId}`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const roomParticipants = rooms.get(roomId);
    roomParticipants.set(socket.id, {
      socketId: socket.id,
      user: user || { id: socket.id, name: "Студент" },
      mediaState: { mic: true, video: true, screen: false, handRaised: false }
    });

    // Notify others in room
    socket.to(`call-${roomId}`).emit("user-joined-call", {
      socketId: socket.id,
      user: user || { id: socket.id, name: "Студент" },
      mediaState: { mic: true, video: true, screen: false, handRaised: false }
    });

    // Send existing participants list to joining socket
    const existingList = Array.from(roomParticipants.values()).filter(p => p.socketId !== socket.id);
    socket.emit("existing-participants", existingList);
  });

  socket.on("leave-call-room", ({ roomId }) => {
    socket.leave(`call-${roomId}`);
    if (rooms.has(roomId)) {
      const roomParticipants = rooms.get(roomId);
      if (roomParticipants.has(socket.id)) {
        roomParticipants.delete(socket.id);
        io.to(`call-${roomId}`).emit("user-left-call", { socketId: socket.id });
        if (roomParticipants.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });

  // WebRTC Signal Exchange (Offer, Answer, ICE Candidate)
  socket.on("call-signal", ({ targetSocketId, signal, senderUser }) => {
    io.to(targetSocketId).emit("call-signal", {
      senderSocketId: socket.id,
      signal,
      senderUser
    });
  });

  // Media State Toggling (Mic, Camera, Screen Sharing, Hand Raise)
  socket.on("update-media-state", ({ roomId, mediaState }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const participant = room.get(socket.id);
      participant.mediaState = { ...participant.mediaState, ...mediaState };
      socket.to(`call-${roomId}`).emit("peer-media-updated", {
        socketId: socket.id,
        mediaState: participant.mediaState
      });
    }
  });

  // Call Chat Messages
  socket.on("send-call-message", ({ roomId, message }) => {
    const msgPayload = {
      id: crypto.randomUUID(),
      senderSocketId: socket.id,
      ...message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.to(`call-${roomId}`).emit("new-call-message", msgPayload);
  });

  // Whiteboard Realtime Sync per Room / Classroom
  socket.on("join-board-room", ({ roomId }) => {
    socket.join(`board-${roomId}`);
    const state = boardStates.get(roomId) || [];
    socket.emit("board-init-state", state);
  });

  socket.on("leave-board-room", ({ roomId }) => {
    socket.leave(`board-${roomId}`);
  });

  socket.on("board-draw-stroke", ({ roomId, stroke }) => {
    if (!boardStates.has(roomId)) {
      boardStates.set(roomId, []);
    }
    const strokes = boardStates.get(roomId);
    if (stroke?.id) {
      const existingIdx = strokes.findIndex((s) => s.id === stroke.id);
      if (existingIdx !== -1) {
        strokes[existingIdx] = stroke;
        socket.to(`board-${roomId}`).emit("board-update-stroke", stroke);
        return;
      }
    }
    strokes.push(stroke);
    // Keep max 5000 elements in memory
    if (strokes.length > 5000) strokes.shift();

    socket.to(`board-${roomId}`).emit("board-draw-stroke", stroke);
  });

  socket.on("board-undo", ({ roomId }) => {
    if (boardStates.has(roomId)) {
      const strokes = boardStates.get(roomId);
      strokes.pop();
      io.to(`board-${roomId}`).emit("board-init-state", strokes);
    }
  });

  socket.on("board-delete-stroke", ({ roomId, strokeId }) => {
    if (boardStates.has(roomId)) {
      const strokes = boardStates.get(roomId);
      const idx = strokes.findIndex((s) => s.id === strokeId);
      if (idx !== -1) {
        strokes.splice(idx, 1);
      }
      socket.to(`board-${roomId}`).emit("board-delete-stroke", { strokeId });
    }
  });

  socket.on("board-clear", ({ roomId }) => {
    boardStates.set(roomId, []);
    socket.to(`board-${roomId}`).emit("board-cleared");
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    for (const [roomId, roomParticipants] of rooms.entries()) {
      if (roomParticipants.has(socket.id)) {
        roomParticipants.delete(socket.id);
        io.to(`call-${roomId}`).emit("user-left-call", { socketId: socket.id });
        if (roomParticipants.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });
});

// Serve frontend build if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

function getLocalNetworkIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (_) {}
  return "localhost";
}

server.listen(PORT, "0.0.0.0", () => {
  const lanIp = getLocalNetworkIp();
  console.log(`===============================================`);
  console.log(`🚀 Journal 2.0 Server running on port ${PORT}`);
  console.log(`🌐 Local Network (LAN) URL: http://${lanIp}:${PORT}`);
  console.log(`💻 Localhost URL:           http://localhost:${PORT}`);
  console.log(`📡 WebSocket Signaling & WebRTC Ready!`);
  console.log(`===============================================`);
});
