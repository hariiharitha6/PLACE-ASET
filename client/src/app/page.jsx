'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SmoothScroll from '../components/SmoothScroll';
import { 
  Bot, 
  Trophy, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Zap, 
  Target, 
  Cpu, 
  GraduationCap, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import styles from './page.module.css';
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <SmoothScroll>
      <div className={styles.landingRoot}>
        {/* Glow Spheres */}
        <div className={styles.ambientGlowTop} />
        <div className={styles.ambientGlowMid} />
        <div className={styles.ambientGlowBottom} />

        {/* 1. Header / Navigation */}
        <nav className={styles.topNav}>
          <Link href="/" className={styles.logoBox}>
            <div className={styles.logoIcon}>🎓</div>
            <span className={styles.logoText}>{APP_NAME}</span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#journey" className={styles.navLink}>Learning Path</a>
            <a href="#dual-mode" className={styles.navLink}>Dual Mode</a>
            <a href="#ai-copilot" className={styles.navLink}>AI Engine</a>
            <a href="#community" className={styles.navLink}>Community</a>
          </div>

          <div className={styles.navCtaBox}>
            <Link href="/login" className={styles.signInBtn} id="nav-login-btn">
              Sign In
            </Link>
            <Link href="/register" className={styles.getStartedBtn} id="nav-register-btn">
              Get Started →
            </Link>
          </div>
        </nav>

        <main className={styles.container}>
          {/* SECTION 1: HERO */}
          <section className={styles.heroSection}>
            <div className={styles.heroBadge}>
              <Sparkles size={15} /> Competitive Learning & Assessment Infrastructure
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroGradientText}>Campus Placements, Elevated.</span><br />
              <span className={styles.heroAccentText}>Real-Time Competitions & AI Mentorship.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              PLACE@ASET unites institutional campus training with personalized AI learning.
              Master technical assessments, compete in timed challenges, simulate AI mock interviews, and build ATS-verified resumes.
            </p>

            <div className={styles.heroActions}>
              <Link href="/register" className={styles.heroPrimaryBtn} id="hero-get-started-btn">
                Launch Candidate Portal <ArrowRight size={18} />
              </Link>
              <Link href="/login" className={styles.heroSecondaryBtn} id="hero-sign-in-btn">
                Sign In to Institute Workspace
              </Link>
            </div>

            {/* Quick Feature Pillars */}
            <div className={styles.grid4} style={{ width: '100%', marginTop: '30px' }}>
              <div className={styles.card} style={{ padding: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '700', fontSize: '13px' }}>
                  <Cpu size={16} /> Multi-Provider AI
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Gemini, OpenAI, Anthropic & Local Ollama router architecture.</div>
              </div>
              <div className={styles.card} style={{ padding: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: '700', fontSize: '13px' }}>
                  <Trophy size={16} /> Live Challenges
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Weekly timed placement tests with live leaderboard rankings.</div>
              </div>
              <div className={styles.card} style={{ padding: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '13px' }}>
                  <Award size={16} /> Verifiable Badges
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Cryptographically signed digital certificates & QR validation.</div>
              </div>
              <div className={styles.card} style={{ padding: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: '700', fontSize: '13px' }}>
                  <Lock size={16} /> Strict Privacy
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Independent Personal Mode with user-isolated Supabase RLS.</div>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHAT PLACE@ASET SOLVES */}
          <section id="features" className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Core Problem Solved</span>
              <h2 className={styles.sectionTitle}>Transforming Fragmented Placement Training</h2>
              <p className={styles.sectionDescription}>
                Traditional placement prep suffers from disconnected platforms, generic question sets, and lack of verifiable candidate readiness. PLACE@ASET delivers end-to-end alignment.
              </p>
            </div>

            <div className={styles.grid3}>
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                  <Target size={24} />
                </div>
                <h3 className={styles.cardTitle}>Precision Assessment Matching</h3>
                <p className={styles.cardText}>
                  Curated question repositories categorized by Tier-1 IT companies (TCS, Infosys, Wipro, Cognizant) with detailed difficulty rubrics and automated test cases.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                  <Bot size={24} />
                </div>
                <h3 className={styles.cardTitle}>Continuous AI Mentorship</h3>
                <p className={styles.cardText}>
                  Intelligent conversational assistance offering real-time code explanations, dynamic daily study plans, career roadmap planning, and instant weakness remediation.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                  <BarChart3 size={24} />
                </div>
                <h3 className={styles.cardTitle}>Institutional Governance</h3>
                <p className={styles.cardText}>
                  Multi-tier RBAC for Principals, HODs, Faculty, Placement Officers, and Challenge Hosts with department-level analytics and automated compliance reporting.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: STUDENT LEARNING JOURNEY */}
          <section id="journey" className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Four-Stage Roadmap</span>
              <h2 className={styles.sectionTitle}>The Student Preparation Journey</h2>
              <p className={styles.sectionDescription}>
                A structured, progressive workflow engineered to take engineering candidates from baseline aptitude to top-tier campus recruitment offers.
              </p>
            </div>

            <div className={styles.card} style={{ padding: '36px' }}>
              <div className={styles.timelineStep}>
                <div className={styles.timelineNumber}>1</div>
                <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                  Diagnostic Aptitude & Core Foundation
                </h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Assess baseline aptitude across Quantitative, Logical Reasoning, Verbal, and Technical Core (DSA, DBMS, OS, Networks) to generate a personalized readiness radar.
                </p>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.timelineNumber}>2</div>
                <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                  Question Bank Mastery & Arena Practice
                </h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Solve verified multi-choice questions with instant feedback, time tracking, anti-cheat detection, and gamified XP streak multipliers.
                </p>
              </div>

              <div className={styles.timelineStep}>
                <div className={styles.timelineNumber}>3</div>
                <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                  Weekly Placement Challenges & Live Arena
                </h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Compete in scheduled campus challenges, earn verifiable digital credentials, and climb the institution and department leaderboards.
                </p>
              </div>

              <div className={styles.timelineStep} style={{ marginBottom: 0 }}>
                <div className={styles.timelineNumber}>4</div>
                <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                  AI Mock Interviews & ATS Resume Optimization
                </h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Simulate technical and HR interviews with real-time AI scoring, and build an ATS-compliant resume tuned for high match rates.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: INSTITUTE ECOSYSTEM + SECTION 5: PERSONAL LEARNING MODE */}
          <section id="dual-mode" className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Dual Architecture</span>
              <h2 className={styles.sectionTitle}>Institute Mode vs. Personal Learning Mode</h2>
              <p className={styles.sectionDescription}>
                Seamlessly toggle between formal institutional academic assessments and independent, self-paced learning.
              </p>
            </div>

            <div className={styles.dualModeBox}>
              <div className={styles.modeCard}>
                <div className={styles.modeHeader}>
                  <GraduationCap size={22} style={{ color: '#818cf8' }} /> Mode 1 — Institute Mode
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Tailored for colleges like Ahalia School of Engineering and Technology (ASET) with complete departmental hierarchy and governance.
                </p>
                <ul style={{ margin: '12px 0 0 18px', padding: 0, fontSize: '13px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Multi-Department access (CSE, ECE, EEE, ME, CE)</li>
                  <li>Institutional RBAC: Student, Faculty, HOD, Principal, Admin</li>
                  <li>Official campus challenges and placement drive tests</li>
                  <li>Department-wide analytics & student comparison</li>
                </ul>
              </div>

              <div className={styles.modeCard} style={{ borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(15, 23, 42, 0.8)' }}>
                <div className={styles.modeHeader}>
                  <Sparkles size={22} style={{ color: '#38bdf8' }} /> Mode 2 — Personal Learning Mode
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Empowers individual learners to use PLACE@ASET independently without requiring institutional administration or faculty approvals.
                </p>
                <ul style={{ margin: '12px 0 0 18px', padding: 0, fontSize: '13px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Upload private study materials, notes, & PDF cheatsheets</li>
                  <li>Automated AI generation of flashcards, quizzes & summaries</li>
                  <li>Private AI document Q&A and personalized study roadmaps</li>
                  <li>100% private and protected by Supabase Row Level Security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 6: AI MENTOR & SECTION 7: RESOURCE INTELLIGENCE */}
          <section id="ai-copilot" className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Multi-Model AI Intelligence</span>
              <h2 className={styles.sectionTitle}>AI Personal Mentor & Resource Engine</h2>
              <p className={styles.sectionDescription}>
                Powered by a multi-provider fallback engine (Gemini, OpenAI, Anthropic, Azure, Ollama) that delivers instant, structured technical reasoning.
              </p>
            </div>

            <div className={styles.grid2}>
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>
                  <Bot size={24} />
                </div>
                <h3 className={styles.cardTitle}>AI Mentor & Interactive Copilot</h3>
                <p className={styles.cardText}>
                  Multi-turn conversational assistant grounded in your practice history, performance analytics, and uploaded study materials.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>⚡ Daily Study Plan</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>📈 Weekly Review</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>🎯 Practice Recs</span>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)' }}>
                  <BookOpen size={24} />
                </div>
                <h3 className={styles.cardTitle}>Document Intelligence & Extraction</h3>
                <p className={styles.cardText}>
                  Extracts structured questions, explanations, and flashcards from lecture notes and practice papers with high-precision OCR.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>📑 Executive Summary</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>🗂️ Active Recall Cards</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>🔍 Semantic Duplicate Check</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: PRACTICE/CHALLENGES & SECTION 9: COMMUNITY */}
          <section id="community" className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Competitive Excellence</span>
              <h2 className={styles.sectionTitle}>Arena Practice & Collaborative Community</h2>
              <p className={styles.sectionDescription}>
                Engage in daily timed questions, compete in weekly challenges, and collaborate with peers through verified solutions.
              </p>
            </div>

            <div className={styles.grid3}>
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <Trophy size={24} />
                </div>
                <h3 className={styles.cardTitle}>Weekly Timed Challenges</h3>
                <p className={styles.cardText}>
                  Real-time leaderboard standings, automated submission grading, anti-cheat detection, and official digital badge awards.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                  <Users size={24} />
                </div>
                <h3 className={styles.cardTitle}>Community Discussion Forum</h3>
                <p className={styles.cardText}>
                  Collaborative problem solving, peer upvotes, pinned faculty answers, and automated duplicate question detection.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' }}>
                  <Award size={24} />
                </div>
                <h3 className={styles.cardTitle}>Verifiable Digital Credentials</h3>
                <p className={styles.cardText}>
                  Instant vector/SVG certificate generation with verifiable QR hashes for placement resumes and LinkedIn credentials.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 10: ANALYTICS & SECTION 11: REALTIME COLLABORATION */}
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Real-Time Telemetry</span>
              <h2 className={styles.sectionTitle}>Deep Analytics & Instant Synchronization</h2>
              <p className={styles.sectionDescription}>
                Supabase Realtime updates keep notifications, challenge standings, and community discussions synchronized in real time.
              </p>
            </div>

            <div className={styles.grid2}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} style={{ color: '#38bdf8' }} /> Placement Readiness Telemetry
                </h3>
                <p className={styles.cardText}>
                  Radar charts analyzing topic mastery across Data Structures, Algorithms, DBMS, Operating Systems, Aptitude, and Verbal Communication.
                </p>
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '13px', color: '#94a3b8' }}>
                  📊 Real-time aggregate scoring calculated directly from practice performance and mock assessments.
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} style={{ color: '#fbbf24' }} /> Selective Supabase Realtime
                </h3>
                <p className={styles.cardText}>
                  Instant push updates for notification alerts, community upvotes, challenge completions, and certificate unlocks with zero duplicate connections.
                </p>
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '13px', color: '#94a3b8' }}>
                  ⚡ Clean lifecycle management with automatic unmount cleanup and optimistic UI mutations.
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 12: FINAL CALL TO ACTION */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaCard}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                🎓
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.03em' }}>
                Ready to Master Campus Placements?
              </h2>
              <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
                Join thousands of students and faculty members preparing for competitive placement excellence with PLACE@ASET.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                <Link href="/register" className={styles.heroPrimaryBtn}>
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link href="/login" className={styles.heroSecondaryBtn}>
                  Sign In to Existing Profile
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Real Supabase Data
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} /> End-to-End AI Router
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Dual Institute & Personal Mode
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </SmoothScroll>
  );
}
