export const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export const TAG_COLORS = [
  'bg-slate-100 text-slate-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
]

export const ICON_MAP: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-5 w-5" />,
  help: <HelpCircle className="h-5 w-5" />,
  bug: <AlertTriangle className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  tag: <Tag className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
}

export const baseReplies: Record<string, ForumReply[]> = {
    t1: [
      { id: 'r1', topicId: 't1', authorName: 'Stefan P.', content: 'PDV prijava se nalazi u Knjigovodstvo > Porezi > PDV. Morate imati admin privilegije da biste videli ovaj meni.', likes: 5, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
      { id: 'r2', topicId: 't1', authorName: 'Dragana K.', content: 'Tačno, to je bilo moje iskustvo. Admin je morao da mi dodeli dodatne permisije. Posle toga sve radi savršeno.', likes: 3, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'r3', topicId: 't1', authorName: 'Admin Tim', content: 'Dodali smo detaljan vodič u sekciji Pomoć. Možete ga pronaći pod "PDV prijava - korak po korak".', likes: 8, isBest: true, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    t3: [
      { id: 'r4', topicId: 't3', authorName: 'Admin Tim', content: 'Identifikovali smo problem. Greška je u PDF generisanju kada faktura ima više od 5 stavki sa specijalnim karakterima. Popravka će biti u sledećem patch-u.', likes: 4, createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString() },
    ],
  }

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyTopicForm = { title: '', content: '', category: 'general', tags: '' as string }

export const emptyCatForm = { label: '', description: '', color: TAG_COLORS[0], icon: 'message' }

export const emptyTagForm = { name: '', description: '', color: TAG_COLORS[0] }

export const mockTopics = generateMockTopics();

export const mockCats = generateMockCategories();

export const catsWithCount = mockCats.map(cat => ({
      ...cat,
      topicCount: mockTopics.filter(tp => tp.category === cat.key).length,
    }));

export const totalViews = topics.reduce((sum, tp) => sum + (tp.views || 0), 0);

export const totalReplies = topics.reduce((sum, tp) => sum + (tp.replyCount || 0), 0);

export const totalLikes = topics.reduce((sum, tp) => sum + (tp.likes || 0), 0);

export const solvedCount = topics.filter(tp => tp.isSolved).length;

export const activeUsers = 47;

export const onlineNow = 8;

export const monthlyData = generateMonthlyData();

export const categoryPieData = categories.map(cat => ({
    name: cat.label,
    value: cat.topicCount,
  })).filter(d => d.value > 0);

export const topContributors = [
    { name: 'Admin Tim', posts: 54, badge: 'Admin', color: 'bg-orange-100 text-orange-700' },
    { name: 'Stefan Petrović', posts: 38, badge: 'Ekspert', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Jelena Stanković', posts: 32, badge: 'Aktivan', color: 'bg-violet-100 text-violet-700' },
    { name: 'Dragana Krstić', posts: 27, badge: 'Aktivan', color: 'bg-cyan-100 text-cyan-700' },
    { name: 'Nikola Marković', posts: 21, badge: 'Član', color: 'bg-slate-100 text-slate-700' },
  ]

export const trendingTopics = topics;

export const filteredTopics = topics.filter(tp => {
    if (topicSearch && !tp.title.toLowerCase().includes(topicSearch.toLowerCase()) && !tp.content.toLowerCase().includes(topicSearch.toLowerCase())) return false
    if (topicCatFilter !== 'all' && tp.category !== topicCatFilter) return false
    return true
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (topicSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (topicSort === 'popular') return (b.views || 0) - (a.views || 0)
    return (b.replyCount || 0) - (a.replyCount || 0)
  });

export const filteredQuestions = questions.filter(q => {
    if (qSearch && !q.title.toLowerCase().includes(qSearch.toLowerCase())) return false
    if (qFilter === 'open' && q.hasAccepted) return false
    if (qFilter === 'solved' && !q.hasAccepted) return false
    return true
  }).sort((a, b) => b.votes - a.votes);

export const filteredTags = tags.filter(tg =>
    !tagSearch || tg.name.toLowerCase().includes(tagSearch.toLowerCase()) || tg.description.toLowerCase().includes(tagSearch.toLowerCase())
  ).sort((a, b) => b.usageCount - a.usageCount);

export const handleCreateTopic = async () => {
    if (!topicForm.title.trim()) return
    const newTopic: ForumTopic = {
      id: `t-${Date.now()}`,
      title: topicForm.title,
      content: topicForm.content,
      category: topicForm.category,
      tags: topicForm.tags ? topicForm.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      authorName: 'Vi',
      authorAvatar: 'VI',
      views: 0,
      replyCount: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    }
    setTopics(prev => [newTopic, ...prev])
    setTopicDialogOpen(false)
    setTopicForm(emptyTopicForm)
  }

export const handleDeleteTopic = (id: string) => {
    setTopics(prev => prev.filter(tp => tp.id !== id))
    setDetailOpen(false)
    setSelectedTopic(null)
  }

export const handleTogglePin = (id: string) => {
    setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isPinned: !tp.isPinned } : tp))
  }

export const handleToggleLock = (id: string) => {
    setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isLocked: !tp.isLocked } : tp))
  }

export const handleToggleSolve = (id: string) => {
    setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isSolved: !tp.isSolved } : tp))
  }

export const handleOpenTopicDetail = (topic: ForumTopic) => {
    setSelectedTopic(topic)
    setTopicReplies(generateMockReplies(topic.id))
    setDetailOpen(true)
  }

export const handleSubmitReply = () => {
    if (!replyText.trim() || !selectedTopic) return
    const newReply: ForumReply = {
      id: `r-${Date.now()}`,
      topicId: selectedTopic.id,
      authorName: 'Vi',
      content: replyText,
      likes: 0,
      createdAt: new Date().toISOString(),
    }
    setTopicReplies(prev => [...prev, newReply])
    setReplyText('')
    setTopics(prev => prev.map(tp => tp.id === selectedTopic.id ? { ...tp, replyCount: (tp.replyCount || 0) + 1 } : tp))
  }

export const handleCreateCategory = () => {
    if (!catForm.label.trim()) return
    const newCat: ForumCategory = {
      id: `c-${Date.now()}`,
      key: catForm.label.toLowerCase().replace(/\s+/g, '_'),
      label: catForm.label,
      description: catForm.description,
      color: catForm.color,
      icon: catForm.icon,
      topicCount: 0,
      sortOrder: categories.length + 1,
    }
    setCategories(prev => [...prev, newCat])
    setCatDialogOpen(false)
    setCatForm(emptyCatForm)
    setEditingCategory(null)
  }

export const handleEditCategory = (cat: ForumCategory) => {
    setEditingCategory(cat)
    setCatForm({ label: cat.label, description: cat.description, color: cat.color, icon: cat.icon })
    setCatDialogOpen(true)
  }

export const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

export const handleVoteQuestion = (qId: string, delta: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, votes: q.votes + delta } : q))
  }

export const handleOpenQuestion = (q: ForumQuestion) => {
    setSelectedQuestion(q)
    setQDetailOpen(true)
    setNewAnswerText('')
  }

export const handleSubmitAnswer = () => {
    if (!newAnswerText.trim() || !selectedQuestion) return
    const newAnswer: ForumAnswer = {
      id: `a-${Date.now()}`,
      questionId: selectedQuestion.id,
      authorName: 'Vi',
      content: newAnswerText,
      votes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
    }
    const updatedQ = {
      ...selectedQuestion,
      answers: [...(selectedQuestion.answers || []), newAnswer],
      answerCount: (selectedQuestion.answerCount || 0) + 1,
    }
    setSelectedQuestion(updatedQ)
    setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? { ...q, answerCount: q.answerCount + 1, answers: [...(q.answers || []), newAnswer] } : q))
    setNewAnswerText('')
  }

export const handleAcceptAnswer = (qId: string, aId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q
      return {
        ...q,
        hasAccepted: true,
        answers: (q.answers || []).map(a => a.id === aId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }),
      }
    }))
    if (selectedQuestion?.id === qId) {
      setSelectedQuestion(prev => prev ? {
        ...prev,
        hasAccepted: true,
        answers: (prev.answers || []).map(a => a.id === aId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }),
      } : prev)
    }
  }

export const handleCreateTag = () => {
    if (!tagForm.name.trim()) return
    const newTag: ForumTag = {
      id: `tg-${Date.now()}`,
      name: tagForm.name,
      slug: tagForm.name.toLowerCase().replace(/\s+/g, '-'),
      description: tagForm.description,
      color: tagForm.color,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    setTags(prev => [...prev, newTag])
    setTagDialogOpen(false)
    setTagForm(emptyTagForm)
    setEditingTag(null)
  }

export const handleEditTag = (tg: ForumTag) => {
    setEditingTag(tg)
    setTagForm({ name: tg.name, description: tg.description, color: tg.color })
    setTagDialogOpen(true)
  }

export const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(tg => tg.id !== id))
  }

export const handleSaveSettings = () => {
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }

export const getCategoryLabel = (key?: string) => categories.find(c => c.key === key)?.label || key || '';

export const getCategoryColor = (key?: string) => categories.find(c => c.key === key)?.color || 'bg-gray-100 text-gray-700';

export const formatDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Danas'
    if (days === 1) return 'Juče'
    if (days < 7) return `Pre ${days} dana`
    if (days < 30) return `Pre ${Math.floor(days / 7)} ned`
    return new Date(dateStr).toLocaleDateString('sr-RS')
  }

export const renderKpiCard = (label: string, value: number | string, icon: React.ReactNode, color: string) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </Card>
  );

export const catColor = getCategoryColor(topic.category);

export const catLabel = getCategoryLabel(topic.category);

export const sizeClass = tag.usageCount > 20 ? 'text-lg px-5 py-2.5' : tag.usageCount > 10 ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5';

export function generateMockTopics(): ForumTopic[] {
  return [
    { id: 't1', title: 'Kako podesiti PDV prijavu?', content: 'Ne mogu da nađem opciju za PDV prijavu u modulu Knjigovodstvo. Probao sam sve opcije u meniju ali ne vidim tu funkciju. Da li je to dostupno samo za admin korisnike?', category: 'support', tags: ['pdv', 'knjigovodstvo'], authorName: 'Milan Jovanović', authorAvatar: 'MJ', views: 245, replyCount: 12, likes: 18, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 't2', title: 'Predlog: Automatski backup podataka', content: 'Predlažem dodavanje automatskog backup-a svih podataka na dnevnom nivou. To bi značajno poboljšalo sigurnost sistema i smanjilo rizik od gubitka podataka.', category: 'feature_request', tags: ['backup', 'predlog'], authorName: 'Jelena Stanković', authorAvatar: 'JS', views: 182, replyCount: 7, likes: 35, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 't3', title: 'Bug: Faktura ne šalje na email', content: 'Kada pokušam da pošaljem fakturu na email klijenta, dobijem grešku 500. Problem se javlja samo kada faktura ima više od 5 stavki. Testirano na Chrome i Firefox.', category: 'bug_report', tags: ['faktura', 'email', 'bug'], authorName: 'Nikola Marković', authorAvatar: 'NM', views: 328, replyCount: 15, likes: 8, isSolved: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 't4', title: 'Najbolje prakse za inventuru', content: 'Delim se iskustvom sa sprovođenom inventure u maloprodaji. Koristimo barkod skenere i aplikaciju za mobilni uređaj. Cela procedura traje oko 4 sata za 5000 artikala.', category: 'discussion', tags: ['inventura', 'maloprodaja', 'praksa'], authorName: 'Dragana Krstić', authorAvatar: 'DK', views: 456, replyCount: 23, likes: 42, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 't5', title: 'Nova verzija sistema 4.0!', content: 'Objavljujemo novu verziju sa 50+ modula, poboljšanim UI i novim funkcionalnostima. Proverite changelog za detalje. Hvala svima koji su učestvovali u beta testiranju!', category: 'announcement', tags: ['update', 'verzija'], authorName: 'Admin Tim', authorAvatar: 'AT', views: 1203, replyCount: 45, likes: 89, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 't6', title: 'Integracija sa bankama - vodič', content: 'Korak po korak vodič za povezivanje sistema sa bankovnim računima. Podržane banke: Intesa, Raiffeisen, Komercijalna, Eurobank. Konfiguracija traje 10 minuta.', category: 'tutorial', tags: ['banka', 'integracija', 'vodič'], authorName: 'Stefan Petrović', authorAvatar: 'SP', views: 567, replyCount: 18, likes: 56, isSolved: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 't7', title: 'Problem sa izvozom izveštaja u PDF', content: 'Kada izvezem izveštaj o prodaji u PDF formatu, karakteri na ćirilici se ne prikazuju ispravno. Umesto njih se pojavljuju prazni kvadratići.', category: 'bug_report', tags: ['pdf', 'izveštaj', 'bug', 'ćirilica'], authorName: 'Ana Ilić', authorAvatar: 'AI', views: 198, replyCount: 6, likes: 4, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: 't8', title: 'Kako koristiti naprednu pretragu?', content: 'Može li neko objasniti kako funkcioniše napredna pretraga u modulu Partneri? Želim da filtriram partnere po više kriterijuma istovremeno.', category: 'support', tags: ['pretraga', 'partneri'], authorName: 'Marko Nikolić', authorAvatar: 'MN', views: 134, replyCount: 4, likes: 7, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: 't9', title: 'Predlog za poboljšanje dashboard-a', content: 'Trenutni dashboard je koristan ali fali mu mogućnost prilagođavanja widget-a. Bilo bi sjajno da svaki korisnik može da podesi svoj izgled dashboard-a.', category: 'feature_request', tags: ['dashboard', 'predlog', 'ui'], authorName: 'Ivana Đorđević', authorAvatar: 'IĐ', views: 267, replyCount: 11, likes: 28, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 't10', title: 'Kalendar integracija sa Google Calendar', content: 'Uspešno sam integrisao kalendar modul sa Google Calendar. Evo koraka... Ovo je zaista korisno za timsku koordinaciju i zakazivanje sastanaka.', category: 'tutorial', tags: ['kalendar', 'google', 'integracija'], authorName: 'Dejan Stojanović', authorAvatar: 'DS', views: 389, replyCount: 14, likes: 33, createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
    { id: 't11', title: 'Diskusija: Monolit vs Mikroservisi', content: 'Sa rastom naše platforme, postavlja se pitanje da li treba da pređemo na mikroservisnu arhitekturu. Koje su vaše iskustvo i preporuke?', category: 'discussion', tags: ['arhitektura', 'mikroservisi', 'diskusija'], authorName: 'Vuk Matić', authorAvatar: 'VM', views: 178, replyCount: 21, likes: 15, isLocked: false, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: 't12', title: 'Novi modul: Vozi park objavljen!', content: 'Zadovoljstvo nam je da najavimo novi modul za upravljanje vozilima. Praćenje kilometraže, troškova održavanja, i zakazivanje servisa - sve na jednom mestu.', category: 'announcement', tags: ['vozila', 'novi-modul'], authorName: 'Admin Tim', authorAvatar: 'AT', views: 445, replyCount: 9, likes: 37, isPinned: false, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 't13', title: 'Problem sa multi-kompanijskim pristupom', content: 'Imam pristup dve kompanije ali ne mogu da prebacim kontekst bez ponovnog logovanja. Da li neko ima rešenje za ovaj problem?', category: 'support', tags: ['multi-tenant', 'pristup', 'bug'], authorName: 'Saša Popović', authorAvatar: 'SP', views: 89, replyCount: 3, likes: 2, createdAt: new Date(Date.now() - 86400000 * 11).toISOString() },
    { id: 't14', title: 'Automatizacija fakturisanja - iskustva', content: 'Već 6 meseci koristimo automatizovano fakturisanje i rezultati su fantastični. Vreme za obradu faktura je smanjeno za 70%. Evo kako smo to postigli...', category: 'discussion', tags: ['faktura', 'automatizacija', 'iskustvo'], authorName: 'Tanja Radovanović', authorAvatar: 'TR', views: 312, replyCount: 16, likes: 44, createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: 't15', title: 'Bug: Duple stavke u narudžbenici', content: 'Kada dodam stavku u narudžbenicu i zatim promenim količinu, stavka se duplira. Ovo se dešava konzistentno u svakom browseru.', category: 'bug_report', tags: ['narudžbenica', 'bug', 'duplikat'], authorName: 'Nenad Jovančević', authorAvatar: 'NJ', views: 156, replyCount: 8, likes: 5, isSolved: true, createdAt: new Date(Date.now() - 86400000 * 13).toISOString() },
  ]
}

export function generateMockCategories(): ForumCategory[] {
  return [
    { id: 'c1', key: 'general', label: 'Opšte', description: 'Opšte diskusije o sistemu i radnom okruženju', color: 'bg-slate-100 text-slate-700', icon: 'message', topicCount: 0, sortOrder: 1 },
    { id: 'c2', key: 'support', label: 'Podrška', description: 'Pitanja i problemi oko korišćenja sistema', color: 'bg-emerald-100 text-emerald-700', icon: 'help', topicCount: 0, sortOrder: 2 },
    { id: 'c3', key: 'feature_request', label: 'Predlozi', description: 'Predlozi za nove funkcionalnosti i poboljšanja', color: 'bg-amber-100 text-amber-700', icon: 'zap', topicCount: 0, sortOrder: 3 },
    { id: 'c4', key: 'bug_report', label: 'Bug-ovi', description: 'Prijave grešaka i problema u sistemu', color: 'bg-rose-100 text-rose-700', icon: 'bug', topicCount: 0, sortOrder: 4 },
    { id: 'c5', key: 'discussion', label: 'Diskusija', description: 'Otovrene diskusije i razmena iskustava', color: 'bg-violet-100 text-violet-700', icon: 'star', topicCount: 0, sortOrder: 5 },
    { id: 'c6', key: 'announcement', label: 'Obaveštenja', description: 'Zvanične najave i obaveštenja admin tima', color: 'bg-orange-100 text-orange-700', icon: 'flame', topicCount: 0, sortOrder: 6 },
    { id: 'c7', key: 'tutorial', label: 'Tutorijali', description: 'Vodiči, tutorijali i najbolje prakse', color: 'bg-cyan-100 text-cyan-700', icon: 'tag', topicCount: 0, sortOrder: 7 },
    { id: 'c8', key: 'offtopic', label: 'Van teme', description: 'Sve ostalo - opuštena zona za zajednicu', color: 'bg-pink-100 text-pink-700', icon: 'message', topicCount: 0, sortOrder: 8 },
  ]
}

export function generateMockQuestions(): ForumQuestion[] {
  return [
    { id: 'q1', title: 'Kako da kreiram prilagođeni izveštaj?', content: 'Treba mi izveštaj koji prikazuje prodaju po regionima za poslednjih 6 meseci sa poređenjem prethodne godine.', authorName: 'Milan J.', votes: 24, answerCount: 3, hasAccepted: true, tags: ['izveštaj', 'prilagođeno'], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), answers: [
      { id: 'a1', questionId: 'q1', authorName: 'Stefan P.', content: 'Možete koristiti modul Izveštaji > Prilagođeni izveštaji. Tamo imate opciju da definišete kolone, filtere i grupisanje po potrebi.', votes: 15, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
      { id: 'a2', questionId: 'q1', authorName: 'Jelena S.', content: 'Dodatno, možete zakazati automatsko slanje izveštaja na nedeljnom nivou kroz Podešavanja > Automatizacija.', votes: 8, isAccepted: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ] },
    { id: 'q2', title: 'Da li je moguća integracija sa spoljnim ERP sistemom?', content: 'Naša kompanija koristi spoljni ERP sistem i pitamo da li postoji način za sinhronizaciju podataka između njega i ovog sistema.', authorName: 'Jelena S.', votes: 18, answerCount: 2, hasAccepted: false, tags: ['integracija', 'erp', 'spoljni-sistem'], createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), answers: [
      { id: 'a3', questionId: 'q2', authorName: 'Admin Tim', content: 'Trenutno nemamo direktnu integraciju sa spoljnim ERP sistemom, ali podržavamo REST API kroz koji možete implementirati sinhronizaciju. Dokumentacija je dostupna u sekciji Integracije.', votes: 12, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ] },
    { id: 'q3', title: 'Koji je limit za broj stavki u fakturi?', content: 'Imamo klijenta sa velikim brojem stavki na jednoj fakturi. Da li postoji tehnički limit i šta se dešava ako ga pređemo?', authorName: 'Nikola M.', votes: 9, answerCount: 1, hasAccepted: true, tags: ['faktura', 'limiti'], createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), answers: [
      { id: 'a4', questionId: 'q3', authorName: 'Dragana K.', content: 'Tehnički limit je 999 stavki po fakturi. U praksi preporučujemo da faktura sa više od 100 stavki bude podeljena radi preglednosti.', votes: 6, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    ] },
    { id: 'q4', title: 'Kako omogućiti dvofaktorsku autentikaciju?', content: 'Želim da uključim 2FA za sve korisnike u mojoj kompaniji. Gde mogu da podesim ovu opciju?', authorName: 'Ana I.', votes: 31, answerCount: 2, hasAccepted: true, tags: ['sigurnost', '2fa', 'autentikacija'], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), answers: [
      { id: 'a5', questionId: 'q4', authorName: 'Admin Tim', content: 'Podešavanja > Sigurnost > Dvofaktorska autentikacija. Možete da je namestite kao obaveznu za sve korisnike ili ostavite opcionalnu.', votes: 22, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 4.5).toISOString() },
    ] },
    { id: 'q5', title: 'Gde se čuvaju logovi sistema?', content: 'Potrebni su mi logovi za audit svrhe. Gde mogu pronaći operativne logove i da li mogu da ih preuzmem?', authorName: 'Dejan S.', votes: 7, answerCount: 1, hasAccepted: false, tags: ['logovi', 'audit', 'sigurnost'], createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), answers: [
      { id: 'a6', questionId: 'q5', authorName: 'Stefan P.', content: 'Logovi su dostupni u Podešavanja > Sistem > Logovi. Možete ih filtrirati po datumu, korisniku i tipu događaja, i izvesti u CSV formatu.', votes: 4, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 5.5).toISOString() },
    ] },
    { id: 'q6', title: 'Kako da uvozim podatke iz Excela?', content: 'Imam listu od 500 partnera u Excel fajlu. Kako da ih masovno uvezem u sistem?', authorName: 'Marko N.', votes: 14, answerCount: 2, hasAccepted: true, tags: ['import', 'excel', 'partneri'], createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), answers: [
      { id: 'a7', questionId: 'q6', authorName: 'Ivana Đ.', content: 'Koristite Modul > Partneri > Uvoz. Sistem podržava XLSX i CSV formate. Pre uvoza, preuzmite templejt sa ispravnim formatom kolona.', votes: 10, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 6.5).toISOString() },
    ] },
    { id: 'q7', title: 'Da li sistem podržava višejezičnost?', content: 'Naš tim radi na engleskom i srpskom. Da li postoji opcija za promenu jezika interfejsa?', authorName: 'Vuk M.', votes: 11, answerCount: 1, hasAccepted: true, tags: ['jezik', 'prevod', 'lokalizacija'], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), answers: [
      { id: 'a8', questionId: 'q7', authorName: 'Admin Tim', content: 'Da, sistem podržava srpski (latinica i ćirilica) i engleski. Jezik možete promeniti u korisničkom profilu ili globalno kroz podešavanja kompanije.', votes: 9, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
    ] },
    { id: 'q8', title: 'Kako resetovati lozinku korisnika kao admin?', content: 'Korisnik je zaboravio lozinku i nema pristup emailu. Kako mogu kao admin da mu resetujem lozinku?', authorName: 'Saša P.', votes: 20, answerCount: 2, hasAccepted: true, tags: ['lozinka', 'admin', 'korisnici'], createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), answers: [
      { id: 'a9', questionId: 'q8', authorName: 'Admin Tim', content: 'Idite na Podešavanja > Korisnici > izaberite korisnika > Akcije > Resetuj lozinku. Možete postaviti privremenu lozinku koju će korisnik morati da promeni pri prvom logovanju.', votes: 16, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 7.5).toISOString() },
    ] },
    { id: 'q9', title: 'Kako postaviti automatizovana upozorenja?', content: 'Želim da dobijam notifikacije kada zalihe artikala padnu ispod minimuma. Kako da podesim ovu automatizaciju?', authorName: 'Tanja R.', votes: 16, answerCount: 1, hasAccepted: false, tags: ['automatizacija', 'zalihe', 'notifikacije'], createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), answers: [
      { id: 'a10', questionId: 'q9', authorName: 'Nikola M.', content: 'Magacin > Artikli > Automatizacija > Upozorenja na zalihama. Postavite minimalnu količinu i izaberite kanal obaveštenja (email, push, ili oba).', votes: 11, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 8.5).toISOString() },
    ] },
    { id: 'q10', title: 'Šta je najbolji način za obuku novih zaposlenih?', content: 'Imamo 10 novih zaposlenih koji treba da nauče da koriste sistem. Koje resurse preporučujete?', authorName: 'Nenad J.', votes: 27, answerCount: 2, hasAccepted: true, tags: ['edukacija', 'onboarding', 'resursi'], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), answers: [
      { id: 'a11', questionId: 'q10', authorName: 'Jelena S.', content: 'Preporučujemo: 1) Video tutorijali u sekciji Edukacija, 2) Sandbox okruženje za vežbanje, 3) Mentorski program sa iskusnim korisnicima. Prosečno vreme za obuku je 2-3 dana.', votes: 19, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 9.5).toISOString() },
    ] },
  ]
}

export function generateMockTags(): ForumTag[] {
  return [
    { id: 'tg1', name: 'faktura', slug: 'faktura', description: 'Sve vezano za fakturisanje i račune', color: TAG_COLORS[0], usageCount: 23, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'tg2', name: 'pdv', slug: 'pdv', description: 'Porez na dodatu vrednost', color: TAG_COLORS[1], usageCount: 18, createdAt: new Date(Date.now() - 86400000 * 28).toISOString() },
    { id: 'tg3', name: 'knjigovodstvo', slug: 'knjigovodstvo', description: 'Knjigovodstveni modul i funkcionalnosti', color: TAG_COLORS[2], usageCount: 15, createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
    { id: 'tg4', name: 'bug', slug: 'bug', description: 'Prijave grešaka u sistemu', color: TAG_COLORS[3], usageCount: 34, createdAt: new Date(Date.now() - 86400000 * 27).toISOString() },
    { id: 'tg5', name: 'predlog', slug: 'predlog', description: 'Predlozi za poboljšanja', color: TAG_COLORS[4], usageCount: 12, createdAt: new Date(Date.now() - 86400000 * 22).toISOString() },
    { id: 'tg6', name: 'integracija', slug: 'integracija', description: 'Integracije sa spoljnim servisima', color: TAG_COLORS[5], usageCount: 19, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: 'tg7', name: 'backup', slug: 'backup', description: 'Rezervne kopije podataka', color: TAG_COLORS[6], usageCount: 8, createdAt: new Date(Date.now() - 86400000 * 18).toISOString() },
    { id: 'tg8', name: 'sigurnost', slug: 'sigurnost', description: 'Bezbednost sistema i podataka', color: TAG_COLORS[7], usageCount: 14, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 'tg9', name: 'automatizacija', slug: 'automatizacija', description: 'Automatski procesi i radni tokovi', color: TAG_COLORS[0], usageCount: 11, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: 'tg10', name: 'email', slug: 'email', description: 'Email komunikacija i notifikacije', color: TAG_COLORS[1], usageCount: 21, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'tg11', name: 'partneri', slug: 'partneri', description: 'Upravljanje partnerima i klijentima', color: TAG_COLORS[2], usageCount: 16, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: 'tg12', name: 'magacin', slug: 'magacin', description: 'Magacinski posao i inventura', color: TAG_COLORS[3], usageCount: 13, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ]
}

export function generateMonthlyData() {
  return [
    { month: 'Jan', teme: 45, odgovori: 128, pregledi: 890 },
    { month: 'Feb', teme: 52, odgovori: 145, pregledi: 1020 },
    { month: 'Mar', teme: 38, odgovori: 112, pregledi: 780 },
    { month: 'Apr', teme: 67, odgovori: 198, pregledi: 1340 },
    { month: 'Maj', teme: 73, odgovori: 210, pregledi: 1560 },
    { month: 'Jun', teme: 59, odgovori: 175, pregledi: 1230 },
    { month: 'Jul', teme: 42, odgovori: 120, pregledi: 890 },
    { month: 'Avg', teme: 31, odgovori: 89, pregledi: 670 },
    { month: 'Sep', teme: 68, odgovori: 195, pregledi: 1420 },
    { month: 'Okt', teme: 81, odgovori: 234, pregledi: 1780 },
    { month: 'Nov', teme: 76, odgovori: 218, pregledi: 1650 },
    { month: 'Dec', teme: 55, odgovori: 156, pregledi: 1100 },
  ]
}

export function generateMockReplies(topicId: string): ForumReply[] {
  const baseReplies: Record<string, ForumReply[]> = {
    t1: [
      { id: 'r1', topicId: 't1', authorName: 'Stefan P.', content: 'PDV prijava se nalazi u Knjigovodstvo > Porezi > PDV. Morate imati admin privilegije da biste videli ovaj meni.', likes: 5, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
      { id: 'r2', topicId: 't1', authorName: 'Dragana K.', content: 'Tačno, to je bilo moje iskustvo. Admin je morao da mi dodeli dodatne permisije. Posle toga sve radi savršeno.', likes: 3, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'r3', topicId: 't1', authorName: 'Admin Tim', content: 'Dodali smo detaljan vodič u sekciji Pomoć. Možete ga pronaći pod "PDV prijava - korak po korak".', likes: 8, isBest: true, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    t3: [
      { id: 'r4', topicId: 't3', authorName: 'Admin Tim', content: 'Identifikovali smo problem. Greška je u PDF generisanju kada faktura ima više od 5 stavki sa specijalnim karakterima. Popravka će biti u sledećem patch-u.', likes: 4, createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString() },
    ],
  }
  return baseReplies[topicId] || [
    { id: `r-${topicId}-1`, topicId, authorName: 'Stefan P.', content: 'Hvala na pitanju! Radićemo na rešenju.', likes: 2, createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    { id: `r-${topicId}-2`, topicId, authorName: 'Jelena S.', content: 'Imam sličan problem. Javim ako nađem rešenje.', likes: 1, createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString() },
  ]
}
