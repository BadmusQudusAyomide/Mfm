import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Root welcome page (enhanced stunning UI)
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MFM Backend</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      :root {
        --primary-cyan: #00d4ff;
        --primary-magenta: #ff00a0;
        --primary-green: #00ff88;
        --accent-orange: #ff6b35;
        --accent-purple: #a855f7;
        --dark-bg: #0a0a0f;
        --card-bg: rgba(15, 15, 25, 0.95);
        --glass-border: rgba(255, 255, 255, 0.08);
        --text-primary: #ffffff;
        --text-secondary: #a1a1aa;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: radial-gradient(ellipse at top, #0f0f23 0%, #0a0a0f 50%, #050508 100%);
        min-height: 100vh;
        color: var(--text-primary);
        overflow-x: hidden;
        position: relative;
      }
      
      /* Animated background particles */
      .particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }
      
      .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: linear-gradient(45deg, var(--primary-cyan), var(--primary-magenta));
        border-radius: 50%;
        animation: float 6s ease-in-out infinite;
        opacity: 0.6;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
        25% { transform: translateY(-30px) rotate(90deg); opacity: 1; }
        50% { transform: translateY(-60px) rotate(180deg); opacity: 0.8; }
        75% { transform: translateY(-30px) rotate(270deg); opacity: 1; }
      }
      
      /* Flowing gradient background */
      .background-flow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          conic-gradient(from 0deg at 20% 30%, rgba(0, 212, 255, 0.1) 0deg, transparent 60deg),
          conic-gradient(from 120deg at 80% 70%, rgba(255, 0, 160, 0.08) 0deg, transparent 60deg),
          conic-gradient(from 240deg at 40% 80%, rgba(0, 255, 136, 0.06) 0deg, transparent 60deg);
        pointer-events: none;
        z-index: 1;
        animation: flowRotate 20s linear infinite;
      }
      
      @keyframes flowRotate {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      
      /* Mesh gradient overlay */
      .mesh-gradient {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 0, 160, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 40%);
        pointer-events: none;
        z-index: 1;
        animation: meshPulse 8s ease-in-out infinite alternate;
      }
      
      @keyframes meshPulse {
        0% { opacity: 0.7; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.05); }
      }
      
      .container {
        position: relative;
        z-index: 2;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      
      .main-card {
        background: var(--card-bg);
        backdrop-filter: blur(30px);
        border: 1px solid var(--glass-border);
        border-radius: 32px;
        padding: 4rem;
        max-width: 1200px;
        width: 100%;
        box-shadow: 
          0 48px 96px rgba(0, 0, 0, 0.4),
          0 24px 48px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(0, 212, 255, 0.1);
        position: relative;
        overflow: hidden;
        animation: cardEntrance 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Card glow effect */
      .main-card::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--primary-cyan), var(--primary-magenta), var(--primary-green), var(--accent-orange));
        border-radius: 34px;
        z-index: -1;
        opacity: 0;
        animation: borderGlow 4s ease-in-out infinite;
      }
      
      @keyframes borderGlow {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.3; }
      }
      
      @keyframes cardEntrance {
        0% {
          opacity: 0;
          transform: translateY(100px) scale(0.9);
          filter: blur(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }
      
      .main-card:hover {
        transform: translateY(-12px);
        box-shadow: 
          0 64px 128px rgba(0, 0, 0, 0.5),
          0 32px 64px rgba(0, 212, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(0, 212, 255, 0.3);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .header {
        text-align: center;
        margin-bottom: 4rem;
        position: relative;
      }
      
      /* Enhanced logo with 3D effect */
      .logo {
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, var(--primary-cyan), var(--primary-magenta), var(--primary-green));
        border-radius: 24px;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 900;
        color: white;
        position: relative;
        transform-style: preserve-3d;
        animation: logoFloat 6s ease-in-out infinite;
        cursor: pointer;
        transition: all 0.4s ease;
      }
      
      .logo::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        border-radius: inherit;
        filter: blur(20px);
        opacity: 0.6;
        z-index: -1;
        animation: logoGlow 3s ease-in-out infinite alternate;
      }
      
      .logo:hover {
        transform: rotateY(15deg) rotateX(5deg) scale(1.1);
        box-shadow: 0 20px 40px rgba(0, 212, 255, 0.4);
      }
      
      @keyframes logoFloat {
        0%, 100% { transform: translateY(0px) rotateY(0deg); }
        25% { transform: translateY(-8px) rotateY(5deg); }
        50% { transform: translateY(-12px) rotateY(0deg); }
        75% { transform: translateY(-8px) rotateY(-5deg); }
      }
      
      @keyframes logoGlow {
        0% { opacity: 0.4; transform: scale(0.95); }
        100% { opacity: 0.8; transform: scale(1.05); }
      }
      
      /* Enhanced title with text effects */
      .title {
        font-size: clamp(3rem, 6vw, 4.5rem);
        font-weight: 900;
        background: linear-gradient(135deg, var(--primary-cyan), var(--primary-magenta), var(--primary-green));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1rem;
        letter-spacing: -0.04em;
        position: relative;
        animation: titleGlow 4s ease-in-out infinite;
      }
      
      .title::after {
        content: 'MFM Backend';
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(255, 0, 160, 0.3));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        z-index: -1;
        animation: titleShadow 4s ease-in-out infinite;
      }
      
      @keyframes titleGlow {
        0%, 100% { filter: brightness(1) saturate(1); }
        50% { filter: brightness(1.2) saturate(1.3); }
      }
      
      @keyframes titleShadow {
        0%, 100% { transform: translate(0, 0); opacity: 0.5; }
        50% { transform: translate(2px, 2px); opacity: 0.8; }
      }
      
      .subtitle {
        font-size: 1.3rem;
        color: var(--text-secondary);
        font-weight: 400;
        opacity: 0;
        animation: fadeInUp 1s ease-out 0.8s forwards;
        position: relative;
      }
      
      @keyframes fadeInUp {
        to { 
          opacity: 1; 
          transform: translateY(0);
        }
        from {
          opacity: 0;
          transform: translateY(20px);
        }
      }
      
      /* Enhanced status indicator */
      .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        background: linear-gradient(135deg, var(--primary-green), var(--primary-cyan));
        color: var(--dark-bg);
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 800;
        margin-top: 2rem;
        position: relative;
        overflow: hidden;
        animation: statusPulse 3s ease-in-out infinite;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .status-indicator::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
      
      .status-indicator:hover {
        transform: scale(1.05);
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
      }
      
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      @keyframes statusPulse {
        0%, 100% { 
          box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 0 20px rgba(0, 255, 136, 0);
          transform: scale(1.02);
        }
      }

      /* Creative status badge */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.85rem;
        background: rgba(20, 20, 35, 0.9);
        border: 1px solid rgba(0, 255, 136, 0.35);
        padding: 0.75rem 1.25rem;
        border-radius: 999px;
        margin-top: 2rem;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.04);
      }
      .status-badge .pulse-ring {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 50%, #00ff88 0%, #00d4ff 60%);
        position: relative;
        box-shadow: 0 0 12px rgba(0,255,136,0.8);
      }
      .status-badge .pulse-ring::before,
      .status-badge .pulse-ring::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 999px;
        border: 2px solid rgba(0, 255, 136, 0.35);
        animation: ring 2.2s ease-out infinite;
      }
      .status-badge .pulse-ring::after { animation-delay: 1.1s; }
      @keyframes ring {
        0% { transform: scale(0.6); opacity: 0.9; }
        80% { transform: scale(1.6); opacity: 0; }
        100% { opacity: 0; }
      }
      .status-badge .status-text {
        font-weight: 800;
        letter-spacing: 0.02em;
        background: linear-gradient(90deg, #00ff88, #00d4ff, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 0.95rem;
        white-space: nowrap;
      }
      .status-badge .wave {
        display: inline-flex;
        align-items: end;
        gap: 2px;
        margin-left: 4px;
      }
      .status-badge .wave i {
        display: block;
        width: 2px;
        height: 8px;
        background: linear-gradient(180deg, rgba(0,212,255,0.9), rgba(0,212,255,0.2));
        border-radius: 2px;
        animation: eq 1s ease-in-out infinite;
      }
      .status-badge .wave i:nth-child(1) { animation-delay: 0s; height: 6px; }
      .status-badge .wave i:nth-child(2) { animation-delay: 0.1s; height: 10px; }
      .status-badge .wave i:nth-child(3) { animation-delay: 0.2s; height: 14px; }
      .status-badge .wave i:nth-child(4) { animation-delay: 0.3s; height: 10px; }
      .status-badge .wave i:nth-child(5) { animation-delay: 0.4s; height: 6px; }
      @keyframes eq {
        0%, 100% { transform: scaleY(0.6); opacity: 0.8; }
        50% { transform: scaleY(1.4); opacity: 1; }
      }
      
      .status-dot {
        width: 10px;
        height: 10px;
        background: var(--dark-bg);
        border-radius: 50%;
        animation: dotPulse 2s infinite;
        position: relative;
      }
      
      .status-dot::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: inherit;
        animation: ripple 2s infinite;
      }
      
      @keyframes dotPulse {
        0%, 50% { opacity: 1; transform: scale(1); }
        51%, 100% { opacity: 0.7; transform: scale(0.8); }
      }
      
      @keyframes ripple {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
      
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-top: 4rem;
      }
      
      /* Enhanced endpoint sections */
      .endpoint-section {
        background: rgba(20, 20, 35, 0.8);
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        padding: 2rem;
        backdrop-filter: blur(15px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        transform: translateY(0);
      }
      
      .endpoint-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, var(--primary-cyan), var(--primary-magenta), transparent);
        transform: scaleX(0);
        transition: transform 0.4s ease;
      }
      
      .endpoint-section::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 212, 255, 0.1) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      .endpoint-section:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.4),
          0 10px 20px rgba(0, 212, 255, 0.2);
        background: rgba(25, 25, 45, 0.9);
        border-color: rgba(0, 212, 255, 0.4);
      }
      
      .endpoint-section:hover::before {
        transform: scaleX(1);
      }
      
      .endpoint-section:hover::after {
        opacity: 1;
      }
      
      .section-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .section-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: white;
        font-weight: bold;
        position: relative;
        animation: iconFloat 4s ease-in-out infinite;
      }
      
      @keyframes iconFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(5deg); }
      }
      
      .health .section-icon { background: linear-gradient(135deg, var(--primary-green), var(--primary-cyan)); }
      .auth .section-icon { background: linear-gradient(135deg, var(--accent-orange), #f7931e); }
      .profile .section-icon { background: linear-gradient(135deg, var(--accent-purple), #ec4899); }
      .groups .section-icon { background: linear-gradient(135deg, var(--primary-cyan), #0ea5e9); }
      .events .section-icon { background: linear-gradient(135deg, var(--primary-magenta), var(--accent-orange)); }
      
      .endpoint-list {
        list-style: none;
      }
      
      .endpoint-item {
        padding: 1rem;
        background: rgba(30, 30, 50, 0.6);
        border-radius: 12px;
        margin-bottom: 0.75rem;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.05);
        position: relative;
        overflow: hidden;
      }
      
      .endpoint-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, var(--primary-cyan), var(--primary-magenta));
        transition: width 0.3s ease;
      }
      
      .endpoint-item:hover {
        background: rgba(40, 40, 70, 0.8);
        transform: translateX(8px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border-color: rgba(0, 212, 255, 0.4);
      }
      
      .endpoint-item:hover::before {
        width: 4px;
      }
      
      .endpoint-link {
        color: var(--primary-cyan);
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .endpoint-link:hover {
        color: var(--primary-magenta);
        text-shadow: 0 0 10px rgba(255, 0, 160, 0.5);
      }
      
      .method {
        display: inline-block;
        padding: 0.3rem 0.7rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 800;
        margin-right: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        position: relative;
        overflow: hidden;
      }
      
      .method::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: methodShimmer 3s infinite;
      }
      
      @keyframes methodShimmer {
        0% { left: -100%; }
        50% { left: -100%; }
        100% { left: 100%; }
      }
      
      .method.get { 
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.1)); 
        color: var(--primary-cyan); 
        border: 1px solid rgba(0, 212, 255, 0.4);
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
      }
      .method.post { 
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.1)); 
        color: var(--primary-green); 
        border: 1px solid rgba(0, 255, 136, 0.4);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
      }
      .method.put { 
        background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 107, 53, 0.1)); 
        color: var(--accent-orange); 
        border: 1px solid rgba(255, 107, 53, 0.4);
        box-shadow: 0 0 10px rgba(255, 107, 53, 0.2);
      }
      .method.delete { 
        background: linear-gradient(135deg, rgba(255, 0, 160, 0.3), rgba(255, 0, 160, 0.1)); 
        color: var(--primary-magenta); 
        border: 1px solid rgba(255, 0, 160, 0.4);
        box-shadow: 0 0 10px rgba(255, 0, 160, 0.2);
      }
      
      .code {
        background: rgba(0, 0, 0, 0.4);
        padding: 0.3rem 0.6rem;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9rem;
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
      }
      
      .footer {
        text-align: center;
        margin-top: 4rem;
        padding-top: 3rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .footer-link {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 700;
        font-size: 1.1rem;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 0, 160, 0.2));
        border-radius: 50px;
        transition: all 0.4s ease;
        border: 2px solid rgba(0, 212, 255, 0.3);
        position: relative;
        overflow: hidden;
      }
      
      .footer-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s ease;
      }
      
      .footer-link:hover {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(255, 0, 160, 0.3));
        border-color: rgba(0, 212, 255, 0.6);
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 12px 24px rgba(0, 212, 255, 0.4);
      }
      
      .footer-link:hover::before {
        left: 100%;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .container { 
          padding: 0;
          align-items: stretch;
          justify-content: stretch;
        }
        .main-card {
          width: 100%;
          max-width: none;
          padding: 1.5rem 1rem;
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }
        
        .grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .title {
          font-size: 2rem;
        }
        
        .logo {
          width: 64px;
          height: 64px;
          font-size: 1.5rem;
        }
      }
      
      @media (max-width: 480px) {
        .main-card { padding: 1rem; }
        
        .header { margin-bottom: 2rem; }
        
        .endpoint-section { padding: 1rem; }
        .section-title { font-size: 1.2rem; }
        .endpoint-item { padding: 0.75rem; }
        .method { font-size: 0.7rem; }
        .code { font-size: 0.8rem; }
      }
      
      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="particles" id="particles"></div>
    <div class="background-flow"></div>
    <div class="mesh-gradient"></div>
    
    <div class="container">
      <div class="main-card">
        <div class="header">
          <div class="logo">M</div>
          <h1 class="title">MFM Backend</h1>
          <p class="subtitle">High-performance API server with cutting-edge architecture</p>
          <div class="status-badge" title="Server Online">
            <div class="pulse-ring"></div>
            <span class="status-text">Server Online</span>
            <span class="wave"><i></i><i></i><i></i><i></i><i></i></span>
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

    <script>
      // Create floating particles
      function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const numParticles = 50;
        
        for (let i = 0; i < numParticles; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 6 + 's';
          particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
          particlesContainer.appendChild(particle);
        }
      }
      
      // Mouse tracking for interactive effects
      document.addEventListener('mousemove', (e) => {
        const sections = document.querySelectorAll('.endpoint-section');
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          section.style.setProperty('--mouse-x', x + '%');
          section.style.setProperty('--mouse-y', y + '%');
        });
      });
      
      // Interactive logo rotation
      const logo = document.querySelector('.logo');
      logo.addEventListener('mouseenter', () => {
        logo.style.animation = 'logoFloat 0.6s ease-in-out, logoSpin 0.6s ease-in-out';
      });
      
      logo.addEventListener('mouseleave', () => {
        logo.style.animation = 'logoFloat 6s ease-in-out infinite';
      });
      
      // Add CSS for logo spin animation
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes logoSpin {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg) scale(1); }
        }
      \`;
      document.head.appendChild(style);
      
      // Status badge click effect
      const statusBadge = document.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.addEventListener('click', () => {
          statusBadge.style.transform = 'scale(1.05)';
          setTimeout(() => {
            statusBadge.style.transform = '';
          }, 150);
        });
      }
      
      // Initialize particles
      createParticles();
      
      // Parallax effect for background elements
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax1 = document.querySelector('.background-flow');
        const parallax2 = document.querySelector('.mesh-gradient');
        
        if (parallax1) {
          parallax1.style.transform = 'translateY(' + (scrolled * 0.5) + 'px) rotate(' + (scrolled * 0.1) + 'deg)';
        }
        if (parallax2) {
          parallax2.style.transform = 'translateY(' + (scrolled * 0.3) + 'px) scale(' + (1 + scrolled * 0.0001) + ')';
        }
      });
      
      
      // Add entrance animation to endpoint sections
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
          }
        });
      }, observerOptions);
      
      // Add slide-in animation
      const slideInStyle = document.createElement('style');
      slideInStyle.textContent = \`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      \`;
      document.head.appendChild(slideInStyle);
      
      // Observe all endpoint sections
      document.querySelectorAll('.endpoint-section').forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
      });
    </script>
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