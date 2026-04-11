import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/documentApi';
import type { Resume } from '../types/resume';
import ExperienceTimeline from '../components/ExperienceTimeline';
import SkillsDisplay from '../components/SkillsDisplay';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import PDFViewer from '../components/PDFViewer';
import api from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ArrowLeft, Download, Trash2, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Zap, User, FileText
} from 'lucide-react';

type Tab = 'overview' | 'experience' | 'education' | 'skills';

/* ── helpers ── */
const scoreLabel = (s: number) =>
  s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Weak';

const scoreRingColor = (s: number) =>
  s >= 80 ? '#22C55E' : s >= 60 ? '#FFFFFF' : s >= 40 ? '#FBBF24' : '#EF4444';

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ── ScoreRing SVG ── */
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreRingColor(score);
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1A1A1A" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════ */

const ResumeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => { if (id) fetchResume(); }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeApi.getResumeById(id!);
      const data: Resume = response.data;
      setResume(data);
      if (data.document?.id) {
        try {
          const docRes = await api.get(`/api/documents/${data.document.id}/download`, { responseType: 'blob' });
          const blob = URL.createObjectURL(docRes.data);
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = blob;
          setDocumentBlobUrl(blob);
        } catch { /* preview unavailable */ }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch resume', 'error');
      navigate('/resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resume?.document?.id || !resume?.document?.original_filename) {
      showToast('No document available', 'error'); return;
    }
    try {
      await resumeApi.downloadResume(resume.document.id, resume.document.original_filename);
      showToast('Downloaded successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Download failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await resumeApi.deleteResume(id!);
      showToast('Resume deleted', 'success');
      navigate('/resumes');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A0A0A0]" />
        </div>
      </DashboardLayout>
    );
  }
  if (!resume) return null;

  const score = resume.match_score;
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',   label: 'Overview',   icon: <User    className="w-3.5 h-3.5" /> },
    { key: 'experience', label: 'Experience', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: 'education',  label: 'Education',  icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'skills',     label: 'Skills',     icon: <Zap     className="w-3.5 h-3.5" /> },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Back nav ── */}
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-2 text-[#555555] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Resumes
        </button>

        {/* ── Hero card ── */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl p-6 hover:border-white/10 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[#888888]">{initials(resume.candidate_name)}</span>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight truncate">{resume.candidate_name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {resume.email && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#555555]">
                    <Mail className="w-3.5 h-3.5" />{resume.email}
                  </span>
                )}
                {resume.phone && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#555555]">
                    <Phone className="w-3.5 h-3.5" />{resume.phone}
                  </span>
                )}
                {resume.location && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#555555]">
                    <MapPin className="w-3.5 h-3.5" />{resume.location}
                  </span>
                )}
              </div>
            </div>

            {/* Score ring */}
            {score !== undefined && score !== null && (
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <ScoreRing score={score} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white leading-none">{score}</span>
                    <span className="text-[9px] text-[#444444] uppercase tracking-widest font-bold">Score</span>
                  </div>
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: scoreRingColor(score) }}
                >
                  {scoreLabel(score)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] bg-black border border-[#1A1A1A] rounded-lg hover:border-white/20 hover:text-white transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#111111]">
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-xl font-bold text-white">{resume.total_experience_years}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Yrs Exp</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-xl font-bold text-white">{resume.skills?.length ?? 0}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Skills</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-xl font-bold text-white">{resume.experience?.length ?? 0}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Roles</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-xl font-bold text-white">{resume.education?.length ?? 0}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Degrees</p>
            </div>
          </div>
        </div>

        {/* ── Main grid: tabbed content left + PDF right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — tabbed panel */}
          <div className="lg:col-span-3 space-y-0">

            {/* Tab bar */}
            <div className="flex gap-1 bg-[#0A0A0A] border border-[#111111] rounded-xl p-1 mb-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                    activeTab === t.key
                      ? 'bg-white text-black'
                      : 'text-[#444444] hover:text-[#888888]'
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl p-6 hover:border-white/10 transition-all duration-300 min-h-[400px]">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {resume.summary ? (
                    <div>
                      <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">
                        Professional Summary
                      </p>
                      <p className="text-sm text-[#888888] leading-relaxed">{resume.summary}</p>
                    </div>
                  ) : (
                    <p className="text-[#2A2A2A] text-sm">No summary available.</p>
                  )}

                  {/* Contact details */}
                  <div>
                    <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">
                      Contact
                    </p>
                    <div className="space-y-2">
                      {resume.email && (
                        <div className="flex items-center gap-3 p-3 bg-black border border-[#0F0F0F] rounded-lg">
                          <Mail className="w-4 h-4 text-[#444444] flex-shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest">Email</p>
                            <p className="text-sm text-white mt-0.5">{resume.email}</p>
                          </div>
                        </div>
                      )}
                      {resume.phone && (
                        <div className="flex items-center gap-3 p-3 bg-black border border-[#0F0F0F] rounded-lg">
                          <Phone className="w-4 h-4 text-[#444444] flex-shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest">Phone</p>
                            <p className="text-sm text-white mt-0.5">{resume.phone}</p>
                          </div>
                        </div>
                      )}
                      {resume.location && (
                        <div className="flex items-center gap-3 p-3 bg-black border border-[#0F0F0F] rounded-lg">
                          <MapPin className="w-4 h-4 text-[#444444] flex-shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest">Location</p>
                            <p className="text-sm text-white mt-0.5">{resume.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  {resume.languages && resume.languages.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.languages.map((lang, i) => (
                          <span key={i} className="px-3 py-1.5 bg-black border border-[#1A1A1A] text-[#888888] text-xs font-medium rounded-lg">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resume.certifications && resume.certifications.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.certifications.map((cert, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-400/10 text-green-400 text-xs font-medium rounded-lg border border-green-400/20">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXPERIENCE */}
              {activeTab === 'experience' && (
                <div>
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Work Experience</p>
                  {resume.experience && resume.experience.length > 0
                    ? <ExperienceTimeline experiences={resume.experience} />
                    : <p className="text-[#2A2A2A] text-sm">No experience entries found.</p>
                  }
                </div>
              )}

              {/* EDUCATION */}
              {activeTab === 'education' && (
                <div>
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Education</p>
                  {resume.education && resume.education.length > 0 ? (
                    <div className="space-y-3">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="bg-black border border-[#0F0F0F] rounded-lg p-5 hover:border-white/10 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-white">{edu.degree}</h3>
                              <p className="text-xs text-[#888888] mt-1">{edu.institution}</p>
                              {edu.field_of_study && (
                                <p className="text-xs text-[#555555] mt-0.5">{edu.field_of_study}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              {edu.graduation_year && (
                                <span className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">
                                  {edu.graduation_year}
                                </span>
                              )}
                              {edu.gpa && (
                                <p className="text-[10px] text-[#444444] mt-0.5">GPA {edu.gpa}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#2A2A2A] text-sm">No education entries found.</p>
                  )}
                </div>
              )}

              {/* SKILLS */}
              {activeTab === 'skills' && (
                <div>
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Skills</p>
                  {resume.skills && resume.skills.length > 0
                    ? <SkillsDisplay skills={resume.skills} />
                    : <p className="text-[#2A2A2A] text-sm">No skills listed.</p>
                  }
                </div>
              )}
            </div>
          </div>

          {/* Right — sticky PDF preview */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              {documentBlobUrl && resume.document ? (
                <PDFViewer fileUrl={documentBlobUrl} filename={resume.document.original_filename} />
              ) : (
                <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl aspect-[3/4] flex flex-col items-center justify-center gap-4 hover:border-white/10 transition-all duration-300">
                  <div className="w-14 h-14 flex items-center justify-center bg-black border border-[#1A1A1A] rounded-xl">
                    <FileText className="w-6 h-6 text-[#333333]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#2A2A2A] uppercase tracking-widest">
                    {resume.document ? 'Processing preview…' : 'No document'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Resume">
        <div className="space-y-4">
          <p className="text-sm text-[#888888]">
            Are you sure you want to delete <span className="text-white font-semibold">{resume.candidate_name}</span>'s resume?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] border border-[#1A1A1A] rounded-lg hover:bg-[#111111] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ResumeDetail;
