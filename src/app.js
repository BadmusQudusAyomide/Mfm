import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Root welcome page (modern stunning UI)
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MFM Backend</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e  50%, #16213e 100%);
        min-height: 100vh;
        color: #ffffff;
        overflow-x: hidden;
      }
      
      .background-pattern {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(0, 150, 255, 0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: 1;
      }
      
      .container {
        position: relative;
        z-index: 2;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      
      .main-card {
        background: rgba(30, 30, 46, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 3rem;
        max-width: 1000px;
        width: 100%;
        box-shadow: 
          0 32px 64px rgba(0, 0, 0, 0.4),
          0 16px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transform: translateY(0);
        transition: all 0.3s ease;
        animation: slideUp 0.8s ease-out;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(60px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .main-card:hover {
        transform: translateY(-8px);
        box-shadow: 
          0 40px 80px rgba(0, 0, 0, 0.5),
          0 20px 40px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      
      .header {
        text-align: center;
        margin-bottom: 3rem;
        position: relative;
      }
      
      .logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #00d4ff, #ff00a0);
        border-radius: 20px;
        margin: 0 auto 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        color: white;
        box-shadow: 0 16px 32px rgba(0, 212, 255, 0.4);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .title {
        font-size: clamp(2.5rem, 5vw, 3.5rem);
        font-weight: 800;
        background: linear-gradient(135deg, #00d4ff, #ff00a0, #00ff88);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
      }
      
      .subtitle {
        font-size: 1.2rem;
        color: #a1a1aa;
        font-weight: 400;
        opacity: 0;
        animation: fadeIn 1s ease-out 0.5s forwards;
      }
      
      @keyframes fadeIn {
        to { opacity: 1; }
      }
      
      .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #00ff88, #00d4ff);
        color: #0f0f23;
        padding: 0.6rem 1.1rem;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 700;
        margin-top: 1rem;
        box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.35), 0 12px 22px rgba(0, 255, 136, 0.25);
        position: relative;
        overflow: visible;
        animation: gradientShift 6s ease-in-out infinite;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        background: #0f0f23;
        border-radius: 50%;
        animation: blink 2s infinite;
      }
      
      .status-indicator::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 999px;
        background: radial-gradient(60% 60% at 50% 50%, rgba(0,255,136,0.35), rgba(0,212,255,0.0));
        filter: blur(6px);
        z-index: -1;
        animation: ringPulse 2.4s ease-in-out infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.5; }
      }
      
      @keyframes gradientShift {
        0% { filter: hue-rotate(0deg) saturate(1); }
        50% { filter: hue-rotate(20deg) saturate(1.2); }
        100% { filter: hue-rotate(0deg) saturate(1); }
      }
      
      @keyframes ringPulse {
        0% { transform: scale(0.98); opacity: 0.8; }
        50% { transform: scale(1.03); opacity: 1; }
        100% { transform: scale(0.98); opacity: 0.8; }
      }

      /* Add a gentle breathing glow to the main card */
      .main-card {
        animation: slideUp 0.8s ease-out, breathe 8s ease-in-out infinite;
      }
      
      @keyframes breathe {
        0% { box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1); }
        50% { box-shadow: 0 36px 72px rgba(0, 212, 255, 0.25), 0 24px 48px rgba(255, 0, 160, 0.15), inset 0 1px 0 rgba(255,255,255,0.1); }
        100% { box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1); }
      }
      
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
      }
      
      .endpoint-section {
        background: rgba(45, 45, 70, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .endpoint-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #00d4ff, #ff00a0);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }
      
      .endpoint-section:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
        background: rgba(55, 55, 85, 0.8);
        border-color: rgba(0, 212, 255, 0.3);
      }
      
      .endpoint-section:hover::before {
        transform: scaleX(1);
      }
      
      .section-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .section-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: white;
        font-weight: bold;
      }
      
      .health .section-icon { background: linear-gradient(135deg, #00ff88, #00d4ff); }
      .auth .section-icon { background: linear-gradient(135deg, #ff6b35, #f7931e); }
      .profile .section-icon { background: linear-gradient(135deg, #a855f7, #ec4899); }
      .groups .section-icon { background: linear-gradient(135deg, #00d4ff, #0ea5e9); }
      .events .section-icon { background: linear-gradient(135deg, #ff00a0, #ff6b35); }
      
      .endpoint-list {
        list-style: none;
        space-y: 0.5rem;
      }
      
      .endpoint-item {
        padding: 0.75rem;
        background: rgba(60, 60, 90, 0.5);
        border-radius: 10px;
        margin-bottom: 0.5rem;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .endpoint-item:hover {
        background: rgba(70, 70, 110, 0.7);
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 212, 255, 0.3);
      }
      
      .endpoint-link {
        color: #00d4ff;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: color 0.2s ease;
      }
      
      .endpoint-link:hover {
        color: #ff00a0;
      }
      
      .method {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-right: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .method.get { background: rgba(0, 212, 255, 0.2); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.3); }
      .method.post { background: rgba(0, 255, 136, 0.2); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.3); }
      .method.put { background: rgba(255, 107, 53, 0.2); color: #ff6b35; border: 1px solid rgba(255, 107, 53, 0.3); }
      .method.delete { background: rgba(255, 0, 160, 0.2); color: #ff00a0; border: 1px solid rgba(255, 0, 160, 0.3); }
      
      .code {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.85rem;
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .footer {
        text-align: center;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .footer-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 0, 160, 0.2));
        border-radius: 50px;
        transition: all 0.3s ease;
        border: 2px solid rgba(0, 212, 255, 0.3);
      }
      
      .footer-link:hover {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(255, 0, 160, 0.3));
        border-color: rgba(0, 212, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 212, 255, 0.3);
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .main-card {
          padding: 2rem 1.5rem;
          margin: 1rem;
        }
        
        .grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        .title {
          font-size: 2.5rem;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        }
      }
      
      @media (max-width: 480px) {
        .main-card {
          padding: 1.5rem 1rem;
        }
        
        .header {
          margin-bottom: 2rem;
        }
        
        .endpoint-section {
          padding: 1rem;
        }
      }
      
      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: light) {
        body {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          color: #1e293b;
        }
        
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          color: #1e293b;
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .endpoint-section {
          background: rgba(248, 250, 252, 0.8);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .endpoint-section:hover {
          background: rgba(241, 245, 249, 0.9);
        }
        
        .endpoint-item {
          background: rgba(241, 245, 249, 0.6);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .endpoint-item:hover {
          background: rgba(226, 232, 240, 0.8);
        }
        
        .section-title {
          color: #1e293b;
        }
        
        .subtitle {
          color: #64748b;
        }
        
        .code {
          background: rgba(0, 0, 0, 0.05);
          color: #374151;
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .footer {
          border-color: rgba(0, 0, 0, 0.1);
        }
      }
    </style>
  </head>
  <body>
    <div class="background-pattern"></div>
    <div class="container">
      <div class="main-card">
        <div class="header">
          <div class="logo">M</div>
          <h1 class="title">MFM Backend</h1>
          <p class="subtitle">High-performance API server ready to serve your applications</p>
          <div class="status-indicator">
            <div class="status-dot"></div>
            Server Online
          </div>
        </div>
        
        <div class="grid">
          <div class="endpoint-section health">
            <h3 class="section-title">
              <div class="section-icon">♥</div>
              Health Check
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <a href="/health" class="endpoint-link">/health</a>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section auth">
            <h3 class="section-title">
              <div class="section-icon">🔐</div>
              Authentication
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/auth/register</span>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/auth/login</span>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/auth/me</span>
                <small style="color: #6b7280; margin-left: 0.5rem;">(Bearer token)</small>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section profile">
            <h3 class="section-title">
              <div class="section-icon">👤</div>
              User Profile
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/profile/me</span>
                <small style="color: #6b7280; margin-left: 0.5rem;">(Bearer token)</small>
              </li>
              <li class="endpoint-item">
                <span class="method put">PUT</span>
                <span class="code">/api/profile/me</span>
                <small style="color: #6b7280; margin-left: 0.5rem;">(Bearer token, form-data)</small>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section groups">
            <h3 class="section-title">
              <div class="section-icon">👥</div>
              Groups
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/groups</span>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/groups</span>
                <small style="color: #6b7280; margin-left: 0.5rem;">(exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="method put">PUT</span>
                <span class="method delete">DEL</span>
                <span class="code">/api/groups/:id</span>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section events">
            <h3 class="section-title">
              <div class="section-icon">📅</div>
              Events
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/events</span>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/events</span>
                <small style="color: #6b7280; margin-left: 0.5rem;">(exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="method put">PUT</span>
                <span class="method delete">DEL</span>
                <span class="code">/api/events/:id</span>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section" style="border-color: rgba(34,197,94,0.3);">
            <h3 class="section-title">
              <div class="section-icon" style="background: linear-gradient(135deg,#22c55e,#16a34a)">📚</div>
              Tutorials (PDF)
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <a href="/api/tutorials/courses" class="endpoint-link">/api/tutorials/courses</a>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">list courses</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/tutorials/courses</span>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">create course (exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/tutorials/:courseId</span>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">list PDFs for a course</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/tutorials/:courseId</span>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">upload PDF (field: <span class="code">pdf</span>)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <a href="/api/tutorials/file/:id/view" class="endpoint-link">/api/tutorials/file/:id/view</a>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">view PDF</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <a href="/api/tutorials/file/:id/download" class="endpoint-link">/api/tutorials/file/:id/download</a>
                <small style="color: #a1a1aa; margin-left: 0.5rem;">download PDF</small>
              </li>
            </ul>
          </div>
          
          <div class="endpoint-section" style="border-color: rgba(99,102,241,0.35);">
            <h3 class="section-title">
              <div class="section-icon" style="background: linear-gradient(135deg,#6366f1,#4f46e5)">🧠</div>
              Quiz System
            </h3>
            <ul class="endpoint-list">
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/subjects</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">list subjects</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz/subjects</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">create subject (exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">list quizzes</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">create quiz (exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method put">PUT</span>
                <span class="code">/api/quiz/:id</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">update quiz (exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz/:id/questions/csv</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">upload questions CSV (field: <span class="code">csv</span>, dryRun)</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz/:id/start</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">start attempt (Bearer token)</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz/attempts/:attemptId/submit</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">submit answers (Bearer token)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/attempts/:attemptId</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">review attempt (Bearer token)</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/:id/leaderboard</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">quiz leaderboard</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/leaderboard/global</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">global leaderboard</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/leaderboard/user/:userId</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">user stats</small>
              </li>
              <li class="endpoint-item">
                <span class="method get">GET</span>
                <span class="code">/api/quiz/:id/attempts/export</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">export attempts CSV (exec/admin)</small>
              </li>
              <li class="endpoint-item">
                <span class="method post">POST</span>
                <span class="code">/api/quiz/admin/cleanup/remove-negative-marking</span>
                <small style="color:#a1a1aa; margin-left:.5rem;">one-time cleanup (exec/admin)</small>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <a href="/api" class="footer-link">
            🚀 Explore API Documentation
          </a>
        </div>
      </div>
    </div>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API index
app.get('/api', (req, res) => {
  res.json({
    name: 'MFM Backend',
    status: 'ok',
    endpoints: {
      health: '/health',
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
      profile: ['/api/profile/me (GET, PUT)'],
      groups: ['/api/groups', '/api/groups/:id'],
      events: ['/api/events', '/api/events/:id'],
      tutorials: [
        '/api/tutorials/courses (GET, POST)',
        '/api/tutorials/:courseId (GET, POST)',
        '/api/tutorials/file/:id/view (GET)',
        '/api/tutorials/file/:id/download (GET)'
      ],
      quiz: [
        '/api/quiz/subjects (GET, POST exec/admin)',
        '/api/quiz (GET, POST exec/admin)',
        '/api/quiz/:id (PUT exec/admin)',
        '/api/quiz/:id/questions/csv (POST exec/admin; field: csv; ?dryRun=true)',
        '/api/quiz/:id/start (POST; Bearer token)',
        '/api/quiz/attempts/:attemptId/submit (POST; Bearer token)',
        '/api/quiz/attempts/:attemptId (GET; Bearer token)',
        '/api/quiz/:id/leaderboard (GET)',
        '/api/quiz/leaderboard/global (GET)',
        '/api/quiz/leaderboard/user/:userId (GET)',
        '/api/quiz/:id/attempts/export (GET exec/admin)'
      ]
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

export default app;