import React, { useState } from 'react';
import {
  Award,
  Flame,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Trophy,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { MediaImage } from './KimaKuamiLogo';
import { BRAND_IMAGES } from '../data/mockData';
import { CommunityPost } from '../types';

export const CommunityView: React.FC = () => {
  const {
    state,
    currentUser,
    createCommunityPost,
    toggleLikePost,
    addCommentToPost,
    toggleJoinChallenge,
  } = useAppState();

  const [subTab, setSubTab] = useState<'feed' | 'desafios' | 'ranking'>('feed');
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>(
    currentUser?.role === 'trainer' ? 'Dica do Treinador' : 'Conquista'
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const visiblePosts = state.posts.filter((p) => !p.reported);

  const clientRanking = state.users
    .filter((u) => u.role === 'cliente' && u.status === 'Ativo')
    .sort((a, b) => (b.streakDays || 0) - (a.streakDays || 0));

  const photoPresets = [
    { label: 'Sem foto', url: '' },
    { label: 'Musculação', url: BRAND_IMAGES.strengthBench },
    { label: 'Halteres', url: BRAND_IMAGES.heroAthlete },
    { label: 'Cardio', url: BRAND_IMAGES.cardioRunner },
  ];

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    createCommunityPost(postText.trim(), postCategory, selectedPhoto || undefined);
    setPostText('');
    setSelectedPhoto('');
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1C2421] rounded-2xl border border-[#245C43]/30 w-fit">
        {[
          { id: 'feed', label: 'Feed Social' },
          { id: 'desafios', label: 'Desafios' },
          { id: 'ranking', label: 'Ranking' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as 'feed' | 'desafios' | 'ranking')}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === tab.id
                ? 'bg-[#B7F34A] text-[#101312]'
                : 'text-[#929B95] hover:text-[#F5F7F3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Composer + Feed */}
          <div className="lg:col-span-8 space-y-4">
            <form
              onSubmit={handlePublish}
              className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <MediaImage
                  src={currentUser?.avatar || BRAND_IMAGES.avatarCarlos}
                  alt={currentUser?.name || 'Membro'}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F7F3] truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-[#929B95]">
                    Partilha uma conquista, resultado ou dica com a comunidade
                  </p>
                </div>
              </div>

              <textarea
                rows={3}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={
                  currentUser?.role === 'trainer'
                    ? 'Escreve uma dica técnica ou educativa para os membros...'
                    : 'Como correu o teu treino de hoje na Kima Kuami?'
                }
                className="w-full rounded-2xl bg-[#101312] border border-[#245C43]/40 p-3.5 text-sm text-[#F5F7F3] placeholder:text-[#929B95]/60 focus:outline-none focus:border-[#B7F34A]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={postCategory}
                    onChange={(e) =>
                      setPostCategory(e.target.value as CommunityPost['category'])
                    }
                    className="min-h-[40px] rounded-xl bg-[#101312] border border-[#245C43]/40 px-3 text-xs text-[#F5F7F3]"
                  >
                    <option value="Conquista">Conquista</option>
                    <option value="Treino">Treino</option>
                    <option value="Objetivo">Objetivo</option>
                    <option value="Dica do Treinador">Dica do Treinador</option>
                  </select>

                  <div className="flex items-center gap-1.5 bg-[#101312] border border-[#245C43]/40 rounded-xl px-2.5 min-h-[40px]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#929B95]" />
                    <select
                      value={selectedPhoto}
                      onChange={(e) => setSelectedPhoto(e.target.value)}
                      className="bg-transparent text-xs text-[#F5F7F3] focus:outline-none"
                    >
                      {photoPresets.map((p) => (
                        <option key={p.label} value={p.url} className="bg-[#101312]">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!postText.trim()}
                  className="min-h-[42px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar
                </button>
              </div>
            </form>

            {/* Posts */}
            {visiblePosts.map((post) => {
              const liked = currentUser ? post.likes.includes(currentUser.id) : false;
              const commentText = commentInputs[post.id] || '';
              return (
                <article
                  key={post.id}
                  className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <MediaImage
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F7F3]">
                            <span className="truncate">{post.authorName}</span>
                            {post.authorRole === 'trainer' && (
                              <span className="text-[11px] font-medium text-[#B7F34A]">
                                · Personal Trainer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#929B95]">
                            {post.category} · {post.createdAt}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[#F5F7F3]/95 leading-relaxed">{post.content}</p>
                  </div>

                  {post.image && (
                    <div className="h-56 sm:h-64 w-full bg-[#101312] overflow-hidden">
                      <MediaImage
                        src={post.image}
                        alt={post.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-3 border-t border-[#101312]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`min-h-[40px] px-3 rounded-xl inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
                          liked
                            ? 'bg-[#B7F34A]/15 text-[#B7F34A]'
                            : 'bg-[#101312] text-[#929B95] hover:text-[#F5F7F3]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-[#B7F34A]' : ''}`} />
                        <span className="tabular-nums">{post.likes.length}</span> Gostar
                      </button>

                      <span className="inline-flex items-center gap-1.5 text-xs text-[#929B95]">
                        <MessageCircle className="w-4 h-4" />
                        <span className="tabular-nums">{post.comments.length}</span> comentários
                      </span>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#101312]">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 text-xs">
                            <MediaImage
                              src={c.authorAvatar}
                              alt={c.authorName}
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="rounded-xl bg-[#101312] px-3 py-2 flex-1">
                              <span className="font-semibold text-[#F5F7F3]">{c.authorName}</span>
                              <span className="text-[#929B95] ml-2">{c.createdAt}</span>
                              <p className="text-[#F5F7F3]/90 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Escreve um comentário de apoio..."
                        className="flex-1 min-h-[40px] rounded-xl bg-[#101312] border border-[#245C43]/40 px-3 text-xs text-[#F5F7F3] placeholder:text-[#929B95]/60 focus:outline-none focus:border-[#B7F34A]"
                      />
                      <button
                        onClick={() => {
                          addCommentToPost(post.id, commentText);
                          setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                        }}
                        className="min-h-[40px] px-3.5 rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-semibold hover:bg-[#245C43]/80"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Side Challenges Preview on Desktop */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#F5F7F3]">
                  Desafios Ativos
                </h3>
                <button
                  onClick={() => setSubTab('desafios')}
                  className="text-xs font-semibold text-[#B7F34A] hover:underline"
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-3">
                {state.challenges.slice(0, 3).map((ch) => {
                  const pct = Math.min(100, Math.round((ch.currentProgress / ch.targetCount) * 100));
                  return (
                    <div key={ch.id} className="rounded-2xl bg-[#101312] p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#F5F7F3]">{ch.title}</p>
                        <span className="text-xs font-mono-tabular text-[#B7F34A] tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1C2421] overflow-hidden">
                        <div
                          className="h-full bg-[#B7F34A] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#929B95]">
                        {ch.currentProgress} / {ch.targetCount} {ch.unitLabel} · {ch.participantsCount} atletas
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'desafios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.challenges.map((ch) => {
            const pct = Math.min(100, Math.round((ch.currentProgress / ch.targetCount) * 100));
            return (
              <div
                key={ch.id}
                className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#101312] flex items-center justify-center">
                      <Flame className="w-5 h-5 text-[#B7F34A]" />
                    </div>
                    <span className="text-xs text-[#929B95]">Termina {ch.endsAt}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#F5F7F3]">{ch.title}</h3>
                    <p className="text-xs text-[#929B95] mt-1 leading-relaxed">{ch.description}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono-tabular">
                      <span className="text-[#F5F7F3]">
                        {ch.currentProgress} / {ch.targetCount} {ch.unitLabel}
                      </span>
                      <span className="text-[#B7F34A]">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#101312] overflow-hidden">
                      <div
                        className="h-full bg-[#B7F34A] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#101312]">
                  <span className="text-xs text-[#929B95] tabular-nums">
                    {ch.participantsCount} participantes
                  </span>
                  <button
                    onClick={() => toggleJoinChallenge(ch.id)}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-colors ${
                      ch.joined
                        ? 'bg-[#245C43] text-[#F5F7F3]'
                        : 'bg-[#B7F34A] text-[#101312]'
                    }`}
                  >
                    {ch.joined ? 'Inscrito' : 'Participar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'ranking' && (
        <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#B7F34A]" />
            <h3 className="font-display text-lg font-bold text-[#F5F7F3]">
              Ranking de Conquistas Kima Kuami
            </h3>
          </div>
          <div className="divide-y divide-[#101312]">
            {clientRanking.map((member, index) => (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-7 text-center font-mono-tabular font-bold text-sm ${
                      index === 0 ? 'text-[#B7F34A]' : 'text-[#929B95]'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <MediaImage
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5F7F3] truncate">{member.name}</p>
                    <p className="text-xs text-[#929B95] truncate">{member.goal}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 text-sm font-bold font-mono-tabular text-[#B7F34A]">
                    <Award className="w-4 h-4" />
                    {member.streakDays || 0} dias
                  </div>
                  <p className="text-[11px] text-[#929B95] tabular-nums">
                    {member.weeklyCompleted || 0}/{member.weeklyTarget || 5} esta semana
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
