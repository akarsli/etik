/**
 * Mühendislik Etiği - Quiz ve Sınav Platformu
 * Uygulama Mantığı ve Durum Yönetimi
 */

(function () {
  'use strict';

  // ==========================================
  // Uygulama Durumu (State)
  // ==========================================
  const state = {
    currentSource: 'yeni', // 'yeni', 'eski' veya 'custom'
    activeQuiz: null,      // Seçilen quiz objesi
    activeQuestions: [],   // Çözülmekte olan sorular listesi
    currentIndex: 0,       // Aktif soru indeksi
    userAnswers: {},       // { [questionId]: { selectedKey, isCorrect, selfEval, visited } }
    mode: 'practice',      // 'practice' veya 'exam'
    isWrongOnlyRetry: false,
    timerSeconds: 0,
    timerInterval: null,
    reviewFilter: 'wrong', // 'wrong', 'empty', 'correct', 'all'
    customCollection: null // Dinamik yüklenen dosya
  };

  // ==========================================
  // DOM Elementleri
  // ==========================================
  const views = {
    home: document.getElementById('viewHome'),
    quiz: document.getElementById('viewQuiz'),
    result: document.getElementById('viewResult')
  };

  // Masaüstü Nav Butonları
  const navHomeBtn = document.getElementById('navHomeBtn');
  const brandBtn = document.getElementById('brandBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const modePracticeBtn = document.getElementById('modePracticeBtn');
  const modeExamBtn = document.getElementById('modeExamBtn');

  // Mobil Navbar Menüsü
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  const mobileNavHomeBtn = document.getElementById('mobileNavHomeBtn');
  const mobileModePracticeBtn = document.getElementById('mobileModePracticeBtn');
  const mobileModeExamBtn = document.getElementById('mobileModeExamBtn');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');

  // Quiz Hamburger Menüsü & Mobil İstatistikler
  const quizHamburgerBtn = document.getElementById('quizHamburgerBtn');
  const quizDropdownMenu = document.getElementById('quizDropdownMenu');
  const mobileStatCorrect = document.getElementById('mobileStatCorrect');
  const mobileStatWrong = document.getElementById('mobileStatWrong');
  const mobileQuizTimer = document.getElementById('mobileQuizTimer');
  const menuTimerPill = document.getElementById('menuTimerPill');
  const menuStatCorrect = document.getElementById('menuStatCorrect');
  const menuStatWrong = document.getElementById('menuStatWrong');
  const menuFinishBtn = document.getElementById('menuFinishBtn');
  const menuDrawerBtn = document.getElementById('menuDrawerBtn');
  const menuNotesBtn = document.getElementById('menuNotesBtn');
  const menuToggleModeBtn = document.getElementById('menuToggleModeBtn');
  const menuModeText = document.getElementById('menuModeText');
  const menuThemeBtn = document.getElementById('menuThemeBtn');
  const menuExitQuizBtn = document.getElementById('menuExitQuizBtn');

  // Kaynak Seçim Kartları
  const sourceCardYeni = document.getElementById('sourceCardYeni');
  const sourceCardEski = document.getElementById('sourceCardEski');
  const fileInput = document.getElementById('fileInput');
  const selectedSourceHeading = document.getElementById('selectedSourceHeading');
  const selectedSourceSub = document.getElementById('selectedSourceSub');
  const quizListGrid = document.getElementById('quizListGrid');
  const startAllQuizBtn = document.getElementById('startAllQuizBtn');

  // Quiz Ekranı
  const quizTopCollection = document.getElementById('quizTopCollection');
  const quizTopTitle = document.getElementById('quizTopTitle');
  const statCorrect = document.getElementById('statCorrect');
  const statWrong = document.getElementById('statWrong');
  const quizTimer = document.getElementById('quizTimer');
  const finishEarlyBtn = document.getElementById('finishEarlyBtn');
  const questionCounter = document.getElementById('questionCounter');
  const progressPercent = document.getElementById('progressPercent');
  const progressBarFill = document.getElementById('progressBarFill');

  const qNumberTag = document.getElementById('qNumberTag');
  const qTypeTag = document.getElementById('qTypeTag');
  const qReviewTag = document.getElementById('qReviewTag');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const openEndedBox = document.getElementById('openEndedBox');
  const showAnswerBtn = document.getElementById('showAnswerBtn');
  const openEndedAnswerContent = document.getElementById('openEndedAnswerContent');
  const openEndedAnswerText = document.getElementById('openEndedAnswerText');
  const evalCorrectBtn = document.getElementById('evalCorrectBtn');
  const evalWrongBtn = document.getElementById('evalWrongBtn');

  const explanationBox = document.getElementById('explanationBox');
  const explanationTitle = document.getElementById('explanationTitle');
  const explanationText = document.getElementById('explanationText');

  const prevQuestionBtn = document.getElementById('prevQuestionBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const questionListDrawerBtn = document.getElementById('questionListDrawerBtn');

  // Sonuç Ekranı
  const scoreCircle = document.getElementById('scoreCircle');
  const scorePercent = document.getElementById('scorePercent');
  const resultBadge = document.getElementById('resultBadge');
  const resultTitle = document.getElementById('resultTitle');
  const resultDesc = document.getElementById('resultDesc');
  const resTotal = document.getElementById('resTotal');
  const resCorrect = document.getElementById('resCorrect');
  const resWrong = document.getElementById('resWrong');
  const resEmpty = document.getElementById('resEmpty');
  const resTime = document.getElementById('resTime');

  const retryWrongOnlyBtn = document.getElementById('retryWrongOnlyBtn');
  const retryWrongText = document.getElementById('retryWrongText');
  const restartQuizBtn = document.getElementById('restartQuizBtn');
  const nextQuizBtn = document.getElementById('nextQuizBtn');
  const resultBackHomeBtn = document.getElementById('resultBackHomeBtn');

  const tabWrong = document.getElementById('tabWrong');
  const tabEmpty = document.getElementById('tabEmpty');
  const tabCorrect = document.getElementById('tabCorrect');
  const tabAll = document.getElementById('tabAll');
  const tabCountWrong = document.getElementById('tabCountWrong');
  const tabCountEmpty = document.getElementById('tabCountEmpty');
  const tabCountCorrect = document.getElementById('tabCountCorrect');
  const tabCountAll = document.getElementById('tabCountAll');
  const reviewQuestionsList = document.getElementById('reviewQuestionsList');

  // Modallar
  const questionNavModal = document.getElementById('questionNavModal');
  const closeNavModalBtn = document.getElementById('closeNavModalBtn');
  const navQuestionGrid = document.getElementById('navQuestionGrid');

  const notesModal = document.getElementById('notesModal');
  const closeNotesModalBtn = document.getElementById('closeNotesModalBtn');
  const notesModalTitle = document.getElementById('notesModalTitle');
  const notesModalContent = document.getElementById('notesModalContent');

  // ==========================================
  // Başlangıç Yüklemesi
  // ==========================================
  function init() {
    initTheme();
    bindEvents();
    renderSourceQuizzes('yeni');
  }

  // ==========================================
  // Tema Yönetimi
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('app_theme', next);
  }

  // ==========================================
  // Görünüm Değiştirici
  // ==========================================
  function switchView(viewName) {
    Object.keys(views).forEach(k => views[k].classList.remove('active'));
    views[viewName].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Açık menüleri kapat
    if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
    if (mobileNavMenu) mobileNavMenu.classList.remove('active');

    if (viewName === 'home') {
      navHomeBtn.style.display = 'none';
      if (mobileNavHomeBtn) mobileNavHomeBtn.style.display = 'none';
      stopTimer();
    } else {
      navHomeBtn.style.display = 'inline-flex';
      if (mobileNavHomeBtn) mobileNavHomeBtn.style.display = 'flex';
    }
  }

  // ==========================================
  // Kaynak ve Quiz Listeleme
  // ==========================================
  function getCurrentCollection() {
    if (state.currentSource === 'custom' && state.customCollection) {
      return state.customCollection;
    }
    return QUIZ_COLLECTIONS[state.currentSource] || QUIZ_COLLECTIONS.yeni;
  }

  function renderSourceQuizzes(sourceKey) {
    state.currentSource = sourceKey;

    // Kart seçim durumu
    sourceCardYeni.classList.toggle('selected', sourceKey === 'yeni');
    sourceCardEski.classList.toggle('selected', sourceKey === 'eski');

    const col = getCurrentCollection();
    selectedSourceHeading.textContent = `${col.title} — Bölümler (${col.quizCount} Quiz)`;
    selectedSourceSub.textContent = `Toplam ${col.totalQuestions} soru mevcut. Çözmek istediğin quizi seçerek hemen başla.`;

    quizListGrid.innerHTML = '';

    col.quizzes.forEach((quiz, idx) => {
      const card = document.createElement('div');
      card.className = 'quiz-item-card';

      // LocalStorage'dan önceki puanı kontrol et
      const scoreKey = `score_${state.currentSource}_q${quiz.id}`;
      const savedScore = localStorage.getItem(scoreKey);
      let historyHtml = '';
      if (savedScore) {
        try {
          const s = JSON.parse(savedScore);
          historyHtml = `<div class="quiz-history-tag completed">✓ Son Skor: %${s.percent} (${s.correct}/${s.total})</div>`;
        } catch (e) {}
      } else {
        historyHtml = `<div class="quiz-history-tag">Henüz çözülmedi</div>`;
      }

      // Varsa not butonu
      const hasNotes = quiz.notes && quiz.notes.trim().length > 0;
      const notesBtnHtml = hasNotes
        ? `<button class="btn btn-secondary btn-sm quiz-notes-btn" data-qid="${quiz.id}" title="Bölüm Notları / İpuçları">📖 Notlar</button>`
        : '';

      card.innerHTML = `
        <div class="quiz-item-header">
          <span class="quiz-number-badge">QUIZ ${idx + 1}</span>
          <span class="quiz-q-count">${quiz.questionCount} Soru</span>
        </div>
        <h3 class="quiz-item-title">${escapeHtml(quiz.title)}</h3>
        ${historyHtml}
        <div class="quiz-item-actions">
          ${notesBtnHtml}
          <button class="btn btn-primary btn-sm quiz-start-btn" data-qid="${quiz.id}">Quize Başla</button>
        </div>
      `;

      quizListGrid.appendChild(card);
    });

    // Not butonları
    quizListGrid.querySelectorAll('.quiz-notes-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const qid = parseInt(btn.dataset.qid);
        const q = col.quizzes.find(item => item.id === qid);
        if (q) openNotesModal(q);
      });
    });

    // Başla butonları
    quizListGrid.querySelectorAll('.quiz-start-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const qid = parseInt(btn.dataset.qid);
        const q = col.quizzes.find(item => item.id === qid);
        if (q) startQuiz(q);
      });
    });
  }

  // ==========================================
  // Quiz Başlatma
  // ==========================================
  function startQuiz(quizObj, customQuestionList = null, isWrongRetry = false) {
    clearAutoNextTimeout();
    state.activeQuiz = quizObj;
    state.isWrongOnlyRetry = isWrongRetry;
    state.activeQuestions = customQuestionList || quizObj.questions;
    state.currentIndex = 0;
    state.userAnswers = {};

    if (state.activeQuestions.length === 0) {
      alert('Bu quizde soru bulunamadı!');
      return;
    }

    const col = getCurrentCollection();
    quizTopCollection.textContent = isWrongRetry
      ? `Tekrar Modu (${state.activeQuestions.length} Yanlış Soru)`
      : col.title;
    quizTopTitle.textContent = quizObj.title;

    updateStatsDisplay();
    startTimer();
    renderCurrentQuestion();
    switchView('quiz');
  }

  function startAllQuizzesCombined() {
    const col = getCurrentCollection();
    let allQs = [];
    col.quizzes.forEach(q => {
      allQs = allQs.concat(q.questions);
    });

    if (allQs.length === 0) {
      alert('Koleksiyonda soru bulunamadı.');
      return;
    }

    const marathonQuiz = {
      id: 'marathon',
      title: `${col.title} — Tüm Sorular (${allQs.length} Soru)`,
      questions: allQs
    };

    startQuiz(marathonQuiz);
  }

  // ==========================================
  // Zamanlayıcı
  // ==========================================
  function startTimer() {
    stopTimer();
    state.timerSeconds = 0;
    const initialTime = '00:00';
    quizTimer.textContent = initialTime;
    if (mobileQuizTimer) mobileQuizTimer.textContent = initialTime;
    if (menuTimerPill) menuTimerPill.textContent = initialTime;

    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
      const s = (state.timerSeconds % 60).toString().padStart(2, '0');
      const timeFormatted = `${m}:${s}`;
      quizTimer.textContent = timeFormatted;
      if (mobileQuizTimer) mobileQuizTimer.textContent = timeFormatted;
      if (menuTimerPill) menuTimerPill.textContent = timeFormatted;
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  // ==========================================
  // Soru Render Etme
  // ==========================================
  function renderCurrentQuestion() {
    const q = state.activeQuestions[state.currentIndex];
    const total = state.activeQuestions.length;
    const currentNum = state.currentIndex + 1;

    // İlerleme çubuğu ve sayaç
    questionCounter.textContent = `Soru ${currentNum} / ${total}`;
    const pct = Math.round((currentNum / total) * 100);
    progressPercent.textContent = `%${pct}`;
    progressBarFill.style.width = `${pct}%`;

    // Etiketler
    qNumberTag.textContent = `Soru ${q.number || currentNum}`;
    
    let typeName = 'Çoktan Seçmeli';
    if (q.type === 'true_false') typeName = 'Doğru / Yanlış';
    if (q.type === 'open_ended') typeName = 'Açık Uçlu / Klasik';
    qTypeTag.textContent = typeName;

    qReviewTag.style.display = q.needsReview ? 'inline-block' : 'none';

    // Soru Metni
    questionText.textContent = q.text;

    // Cevap durumu
    const qAns = state.userAnswers[q.id];

    // Nav butonları
    prevQuestionBtn.disabled = state.currentIndex === 0;
    if (state.currentIndex === total - 1) {
      nextQuestionBtn.innerHTML = `<span>Sonuçları Gör</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    } else {
      nextQuestionBtn.innerHTML = `<span>Sonraki Soru</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    }

    // Seçenekler veya Açık Uçlu Panel
    if (q.type === 'open_ended') {
      optionsContainer.style.display = 'none';
      openEndedBox.style.display = 'block';
      renderOpenEndedQuestion(q, qAns);
    } else {
      openEndedBox.style.display = 'none';
      optionsContainer.style.display = 'flex';
      renderChoiceOptions(q, qAns);
    }

    // Açıklama Kutusu
    renderExplanation(q, qAns);
  }

  // Seçenekleri Render Etme
  function renderChoiceOptions(q, qAns) {
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.key = opt.key;

      const isSelected = qAns && qAns.selectedKey === opt.key;
      if (isSelected) {
        btn.classList.add('selected');
      }

      // Eğer Pratik modundaysa ve cevaplandıysa doğru/yanlış göster
      if (state.mode === 'practice' && qAns) {
        if (opt.isCorrect) {
          btn.classList.add('correct-reveal');
        } else if (isSelected && !qAns.isCorrect) {
          btn.classList.add('wrong-reveal');
        }
      }

      const keyLabel = opt.key.toUpperCase();
      btn.innerHTML = `
        <span class="option-key">${keyLabel}</span>
        <span class="option-text">${escapeHtml(opt.text)}</span>
      `;

      btn.addEventListener('click', () => {
        handleOptionSelect(q, opt);
      });

      optionsContainer.appendChild(btn);
    });
  }

  // Otomatik Sonraki Soru Zamanlayıcısı (Pratik Modu İçin)
  let autoNextTimeout = null;

  function clearAutoNextTimeout() {
    if (autoNextTimeout) {
      clearTimeout(autoNextTimeout);
      autoNextTimeout = null;
    }
  }

  // Soru Kartına Akıllı Odaklanma (Sayfanın en başına zıplamayı önler)
  function scrollToQuestionCard() {
    const card = document.getElementById('questionCard');
    if (card) {
      const header = document.getElementById('mainHeader');
      const navbarHeight = header ? header.offsetHeight : 65;
      const rect = card.getBoundingClientRect();
      
      // Eğer soru kartının üst kısmı ekranın yukarısında kalmışsa veya çok aşağıdaysa odakla
      if (rect.top < navbarHeight || rect.top > window.innerHeight * 0.45) {
        const targetY = window.pageYOffset + rect.top - navbarHeight - 14;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }
  }

  // Seçenek Seçimi
  function handleOptionSelect(q, selectedOpt) {
    clearAutoNextTimeout();

    const isCorrect = !!selectedOpt.isCorrect;
    state.userAnswers[q.id] = {
      selectedKey: selectedOpt.key,
      selectedText: selectedOpt.text,
      correctKey: q.correctKey,
      isCorrect: isCorrect,
      question: q
    };

    updateStatsDisplay();

    if (state.mode === 'practice') {
      renderCurrentQuestion();

      // Pratik Modunda 1.5 saniye sonuç (doğru/yanlış ve açıklama) gösterildikten sonra otomatik diğer soruya geç
      autoNextTimeout = setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    } else {
      // Sınav modunda sadece seçimi güncelle, kullanıcı soruyu kendisi değiştirir
      const allBtns = optionsContainer.querySelectorAll('.option-btn');
      allBtns.forEach(b => b.classList.toggle('selected', b.dataset.key === selectedOpt.key));
    }
  }

  // Açık Uçlu Soru
  function renderOpenEndedQuestion(q, qAns) {
    clearAutoNextTimeout();
    openEndedAnswerContent.style.display = 'none';
    showAnswerBtn.style.display = 'inline-flex';
    openEndedAnswerText.textContent = q.answerText || q.answerRaw || 'Cevap metni bulunamadı.';

    if (qAns) {
      openEndedAnswerContent.style.display = 'block';
      showAnswerBtn.style.display = 'none';
    }

    showAnswerBtn.onclick = () => {
      openEndedAnswerContent.style.display = 'block';
      showAnswerBtn.style.display = 'none';
    };

    evalCorrectBtn.onclick = () => {
      clearAutoNextTimeout();
      state.userAnswers[q.id] = {
        selectedKey: 'Bilindi',
        selectedText: 'Kendini doğru olarak değerlendirdi',
        correctKey: 'Doğru',
        isCorrect: true,
        question: q
      };
      updateStatsDisplay();
      goToNextQuestion();
    };

    evalWrongBtn.onclick = () => {
      clearAutoNextTimeout();
      state.userAnswers[q.id] = {
        selectedKey: 'Bilinmedi',
        selectedText: 'Kendini eksik/bilemedi olarak değerlendirdi',
        correctKey: 'Örnek Cevap',
        isCorrect: false,
        question: q
      };
      updateStatsDisplay();
      goToNextQuestion();
    };
  }

  // Açıklama Kutusunu Render Etme
  function renderExplanation(q, qAns) {
    if (state.mode === 'practice' && qAns) {
      explanationBox.style.display = 'block';
      if (qAns.isCorrect) {
        explanationTitle.textContent = '🎉 Harika! Doğru Cevap';
        explanationTitle.style.color = 'var(--emerald)';
      } else {
        explanationTitle.textContent = '❌ Yanlış Cevap';
        explanationTitle.style.color = 'var(--rose)';
      }

      let exp = q.explanation || '';
      if (!exp && q.answerRaw) {
        exp = q.answerRaw;
      }
      if (!exp) {
        exp = `Doğru Cevap: ${q.correctKey}`;
      }

      explanationText.textContent = exp;
    } else {
      explanationBox.style.display = 'none';
    }
  }

  // Canlı Sayaç İstatistikleri
  function updateStatsDisplay() {
    let correct = 0;
    let wrong = 0;

    Object.values(state.userAnswers).forEach(ans => {
      if (ans.isCorrect) correct++;
      else wrong++;
    });

    statCorrect.textContent = correct;
    statWrong.textContent = wrong;
    if (mobileStatCorrect) mobileStatCorrect.textContent = correct;
    if (mobileStatWrong) mobileStatWrong.textContent = wrong;
    if (menuStatCorrect) menuStatCorrect.textContent = correct;
    if (menuStatWrong) menuStatWrong.textContent = wrong;
  }

  // Sonraki / Önceki Soru
  function goToNextQuestion() {
    clearAutoNextTimeout();
    if (state.currentIndex < state.activeQuestions.length - 1) {
      state.currentIndex++;
      renderCurrentQuestion();
      scrollToQuestionCard();
    } else {
      finishQuiz();
    }
  }

  function goToPrevQuestion() {
    clearAutoNextTimeout();
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderCurrentQuestion();
      scrollToQuestionCard();
    }
  }

  // ==========================================
  // Quizi Bitirme ve Sonuç Fonksiyonu
  // (Kullanıcının İstediği Temel Fonksiyon)
  // ==========================================
  function finishQuiz() {
    clearAutoNextTimeout();
    stopTimer();

    const total = state.activeQuestions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;
    const wrongQuestions = [];
    const emptyQuestions = [];
    const correctQuestions = [];

    state.activeQuestions.forEach((q, idx) => {
      const userAns = state.userAnswers[q.id];
      if (!userAns) {
        emptyCount++;
        emptyQuestions.push({ q, userAns: null, idx: idx + 1 });
      } else if (userAns.isCorrect) {
        correctCount++;
        correctQuestions.push({ q, userAns, idx: idx + 1 });
      } else {
        wrongCount++;
        wrongQuestions.push({ q, userAns, idx: idx + 1 });
      }
    });

    const percent = Math.round((correctCount / total) * 100);

    // Dairesel Gösterge & Skor
    scorePercent.textContent = `%${percent}`;
    const deg = Math.round((percent / 100) * 360);
    const scoreColor = percent >= 70 ? 'var(--emerald)' : (percent >= 50 ? 'var(--amber)' : 'var(--rose)');
    scoreCircle.style.background = `conic-gradient(${scoreColor} 0deg, ${scoreColor} ${deg}deg, var(--bg-tertiary) ${deg}deg)`;

    // İstatistik Metinleri
    resTotal.textContent = total;
    resCorrect.textContent = correctCount;
    resWrong.textContent = wrongCount;
    resEmpty.textContent = emptyCount;

    const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
    const s = (state.timerSeconds % 60).toString().padStart(2, '0');
    resTime.textContent = `${m}:${s}`;

    // Rozet ve Yorum
    if (percent === 100) {
      resultBadge.textContent = 'Kusursuz Başarı! 🏆';
      resultBadge.style.color = 'var(--emerald)';
      resultTitle.textContent = 'Mükemmel! Tüm Soruları Doğru Yaptın';
      resultDesc.textContent = 'Bu bölümün tüm detaylarına tamamen hakimsin.';
    } else if (percent >= 80) {
      resultBadge.textContent = 'Çok Başarılı! ⭐';
      resultBadge.style.color = 'var(--emerald)';
      resultTitle.textContent = 'Tebrikler! Yüksek Başarı';
      resultDesc.textContent = 'Birkaç küçük tekrarla sınavda tam puan alabilirsin.';
    } else if (percent >= 50) {
      resultBadge.textContent = 'İyi Çalışma 👍';
      resultBadge.style.color = 'var(--amber)';
      resultTitle.textContent = 'Fena Değil, Geliştirilebilir';
      resultDesc.textContent = 'Yanlış yaptığın soruları inceleyerek eksiklerini kolayca tamamlayabilirsin.';
    } else {
      resultBadge.textContent = 'Tekrar Gerekiyor 📚';
      resultBadge.style.color = 'var(--rose)';
      resultTitle.textContent = 'Bölümü Tekrar Gözden Geçir';
      resultDesc.textContent = 'Aşağıdaki yanlış soruları ve açıklamalarını dikkatle inceleyerek tekrar çöz.';
    }

    // Skor Kaydetme (LocalStorage)
    if (!state.isWrongOnlyRetry && state.activeQuiz && state.activeQuiz.id !== 'marathon') {
      const scoreKey = `score_${state.currentSource}_q${state.activeQuiz.id}`;
      localStorage.setItem(scoreKey, JSON.stringify({
        percent,
        correct: correctCount,
        total,
        date: new Date().toISOString()
      }));
    }

    // Sadece Yanlışları Tekrar Çöz Butonu Durumu
    if (wrongQuestions.length > 0) {
      retryWrongOnlyBtn.style.display = 'inline-flex';
      retryWrongText.textContent = `Yalnızca Yanlışları Tekrar Çöz (${wrongQuestions.length} Soru)`;
      retryWrongOnlyBtn.onclick = () => {
        const wrongList = wrongQuestions.map(item => item.q);
        startQuiz(state.activeQuiz, wrongList, true);
      };
    } else {
      retryWrongOnlyBtn.style.display = 'none';
    }

    // Sekme Sayıları
    tabCountWrong.textContent = wrongCount;
    tabCountEmpty.textContent = emptyCount;
    tabCountCorrect.textContent = correctCount;
    tabCountAll.textContent = total;

    // Varsayılan olarak yanlışlar sekmesini aç (yanlış yoksa tümünü aç)
    state.reviewFilter = wrongCount > 0 ? 'wrong' : 'all';
    updateReviewFilterTabs();
    renderReviewList(wrongQuestions, emptyQuestions, correctQuestions);

    switchView('result');
  }

  // ==========================================
  // Yanlış ve İnceleme Soruları Listesi
  // ==========================================
  function renderReviewList(wrongList, emptyList, correctList) {
    reviewQuestionsList.innerHTML = '';

    let itemsToRender = [];
    if (state.reviewFilter === 'wrong') {
      itemsToRender = wrongList;
    } else if (state.reviewFilter === 'empty') {
      itemsToRender = emptyList;
    } else if (state.reviewFilter === 'correct') {
      itemsToRender = correctList;
    } else {
      // Tüm sorular
      itemsToRender = [].concat(wrongList, emptyList, correctList).sort((a, b) => a.idx - b.idx);
    }

    if (itemsToRender.length === 0) {
      reviewQuestionsList.innerHTML = `
        <div class="empty-review-state">
          <div class="empty-review-icon">✨</div>
          <h4>Bu kategoride soru bulunmuyor!</h4>
          <p>${state.reviewFilter === 'wrong' ? 'Tebrikler! Hiç yanlış yapmadınız.' : 'Farklı bir filtre seçebilirsiniz.'}</p>
        </div>
      `;
      return;
    }

    itemsToRender.forEach(({ q, userAns, idx }) => {
      const card = document.createElement('div');
      
      let statusClass = 'is-empty';
      let statusBadge = '<span class="review-status-badge badge-empty">Boş Bırakıldı</span>';
      
      if (userAns) {
        if (userAns.isCorrect) {
          statusClass = 'is-correct';
          statusBadge = '<span class="review-status-badge badge-correct">✓ Doğru</span>';
        } else {
          statusClass = 'is-wrong';
          statusBadge = '<span class="review-status-badge badge-wrong">✗ Yanlış</span>';
        }
      }

      card.className = `review-item-card ${statusClass}`;

      // Kullanıcının cevabı ve doğru cevap metni
      let userChoiceText = 'Cevap verilmedi (Boş)';
      if (userAns) {
        userChoiceText = `${userAns.selectedKey}) ${userAns.selectedText || ''}`;
      }

      let correctChoiceText = '';
      if (q.type === 'open_ended') {
        correctChoiceText = q.answerText || q.answerRaw || 'Belirtilmedi';
      } else {
        const correctOpt = (q.options || []).find(o => o.isCorrect);
        if (correctOpt) {
          correctChoiceText = `${correctOpt.key}) ${correctOpt.text}`;
        } else if (q.correctKey) {
          correctChoiceText = q.correctKey;
        } else {
          correctChoiceText = q.answerText || 'Belirtilmedi';
        }
      }

      // Varsa açıklama
      let expHtml = '';
      const expText = q.explanation || q.answerRaw;
      if (expText && expText.trim().length > 0) {
        expHtml = `
          <div class="review-explanation">
            <strong>💡 Açıklama / Not:</strong> ${escapeHtml(expText)}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="review-card-top">
          <span class="review-q-num">Soru ${idx}</span>
          ${statusBadge}
        </div>
        <div class="review-q-text">${escapeHtml(q.text)}</div>
        <div class="review-answers-box">
          <div class="answer-row">
            <span class="answer-badge ${userAns && userAns.isCorrect ? 'correct' : 'wrong'}">Senin Cevabın</span>
            <span class="answer-text-val">${escapeHtml(userChoiceText)}</span>
          </div>
          <div class="answer-row">
            <span class="answer-badge correct">Doğru Cevap</span>
            <span class="answer-text-val">${escapeHtml(correctChoiceText)}</span>
          </div>
        </div>
        ${expHtml}
      `;

      reviewQuestionsList.appendChild(card);
    });
  }

  function updateReviewFilterTabs() {
    [tabWrong, tabEmpty, tabCorrect, tabAll].forEach(t => t.classList.remove('active'));
    if (state.reviewFilter === 'wrong') tabWrong.classList.add('active');
    if (state.reviewFilter === 'empty') tabEmpty.classList.add('active');
    if (state.reviewFilter === 'correct') tabCorrect.classList.add('active');
    if (state.reviewFilter === 'all') tabAll.classList.add('active');
  }

  // ==========================================
  // Soru Gezgini Modalı (Drawer)
  // ==========================================
  function openQuestionNavModal() {
    navQuestionGrid.innerHTML = '';
    state.activeQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'nav-q-btn';
      btn.textContent = idx + 1;

      const userAns = state.userAnswers[q.id];
      if (userAns) {
        btn.classList.add('answered');
      }
      if (idx === state.currentIndex) {
        btn.classList.add('current');
      }

      btn.addEventListener('click', () => {
        state.currentIndex = idx;
        renderCurrentQuestion();
        closeNavModal();
      });

      navQuestionGrid.appendChild(btn);
    });

    questionNavModal.classList.add('active');
  }

  function closeNavModal() {
    questionNavModal.classList.remove('active');
  }

  // ==========================================
  // Bölüm Notları Modalı
  // ==========================================
  function openNotesModal(quizObj) {
    notesModalTitle.textContent = `${quizObj.title} — Bölüm Notları`;
    notesModalContent.textContent = quizObj.notes || 'Bu bölüm için ek not bulunmamaktadır.';
    notesModal.classList.add('active');
  }

  function closeNotesModal() {
    notesModal.classList.remove('active');
  }

  // ==========================================
  // Dinamik TXT Dosyası Ayrıştırma (Parser)
  // ==========================================
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const text = evt.target.result;
        const parsed = parseCustomTxt(text, file.name);
        if (parsed.quizCount === 0 || parsed.totalQuestions === 0) {
          alert('Dosyada quiz veya soru formatı bulunamadı. Lütfen standart formatta bir txt dosyası seçin.');
          return;
        }

        state.customCollection = parsed;
        renderSourceQuizzes('custom');
        alert(`Başarılı! "${file.name}" yüklendi. ${parsed.quizCount} quiz ve ${parsed.totalQuestions} soru ayrıştırıldı.`);
      } catch (err) {
        console.error(err);
        alert('Dosya ayrıştırılırken bir hata oluştu: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  // Client-side TXT Parser
  function parseCustomTxt(text, filename) {
    const headerRe = /={10,}\s*\n(.*?QUIZ\s+\d+.*?)\n={10,}/gi;
    const matches = [];
    let m;
    while ((m = headerRe.exec(text)) !== null) {
      matches.push({ title: m[1].trim(), index: m.index, end: headerRe.lastIndex });
    }

    const quizzes = [];

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const title = matches[i].title;
        const start = matches[i].end;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const chunk = text.substring(start, end);
        quizzes.push(parseSingleQuizChunk(chunk, i + 1, title));
      }
    } else {
      // Tek parça halinde tüm metin
      quizzes.push(parseSingleQuizChunk(text, 1, filename));
    }

    const totalQuestions = quizzes.reduce((sum, q) => sum + q.questionCount, 0);

    return {
      id: 'custom',
      title: `Yüklenen: ${filename}`,
      quizCount: quizzes.length,
      totalQuestions: totalQuestions,
      quizzes: quizzes
    };
  }

  function parseSingleQuizChunk(chunk, quizId, quizTitle) {
    const qRegex = /(?:^|\n)(\d+)\)\s+([\s\S]*?)(?=(?:\n\d+\)\s+|\Z))/g;
    const parsedQuestions = [];
    let qm;

    while ((qm = qRegex.exec(chunk)) !== null) {
      const qNum = parseInt(qm[1]);
      const raw = qm[2].trim();
      const lines = raw.split('\n');

      const qTextLines = [];
      const optLines = [];
      const ansLines = [];
      let mode = 'q';

      for (const line of lines) {
        const s = line.trim();
        if (/✔?\s*Cevap:/i.test(line)) {
          mode = 'ans';
          ansLines.push(line);
        } else if (mode === 'ans') {
          ansLines.push(line);
        } else if (/^\s*\[[ ✔xX*]*\]/.test(line)) {
          mode = 'opt';
          optLines.push(line);
        } else if (mode === 'opt') {
          if (line.startsWith('   ') && !/^\s*\[/.test(line)) {
            if (optLines.length > 0) optLines[optLines.length - 1] += ' ' + s;
          } else {
            optLines.push(line);
          }
        } else {
          qTextLines.push(line);
        }
      }

      const qText = qTextLines.join(' ').replace(/\s+/g, ' ').trim();
      const rawAns = ansLines.join('\n').trim();
      const cleanAns = rawAns.replace(/^\s*✔?\s*Cevap:\s*/i, '').trim();

      const options = [];
      let correctKey = null;

      optLines.forEach((oline, oIdx) => {
        const om = oline.match(/^\s*\[([ ✔xX*]*)\]\s*([a-zA-ZğüşıöçĞÜŞİÖÇ\d\.\)\-]+)?\s*(.*)/);
        if (om) {
          const checked = /✔|x|\*/i.test(om[1]);
          const prefix = (om[2] || '').trim();
          const rest = (om[3] || '').trim();
          const full = (prefix + ' ' + rest).trim();

          let key = prefix.replace(/[\)\.]/g, '').trim() || String(oIdx + 1);
          let labelText = rest || full;

          if (/^doğru/i.test(full) || /^yanlış/i.test(full)) {
            key = /^doğru/i.test(full) ? 'Doğru' : 'Yanlış';
            labelText = key;
          }

          if (checked) correctKey = key;

          options.push({
            key: key,
            text: labelText,
            isCorrect: checked
          });
        }
      });

      let qType = 'multiple_choice';
      if (options.length === 0) {
        qType = 'open_ended';
      } else if (options.length === 2 && options.some(o => o.key === 'Doğru' || o.key === 'Yanlış')) {
        qType = 'true_false';
      }

      let explanation = '';
      if (cleanAns) {
        const lastParen = cleanAns.match(/\(([^)]+)\)\s*$/);
        if (lastParen) explanation = lastParen[1].trim();

        if (qType !== 'open_ended' && !correctKey) {
          if (/DOĞRU/i.test(cleanAns)) correctKey = 'Doğru';
          else if (/YANLIŞ/i.test(cleanAns)) correctKey = 'Yanlış';
          else {
            const mKey = cleanAns.match(/^([a-zA-Z])[\)\.\s]/);
            if (mKey) correctKey = mKey[1];
          }
        }
      }

      if (correctKey) {
        options.forEach(opt => {
          if (opt.key.toLowerCase() === correctKey.toLowerCase()) opt.isCorrect = true;
        });
      }

      parsedQuestions.push({
        id: `custom_${quizId}_${qNum}`,
        number: qNum,
        type: qType,
        text: qText,
        options: options,
        correctKey: correctKey,
        answerRaw: rawAns,
        answerText: cleanAns,
        explanation: explanation,
        needsReview: raw.includes('[kontrol et]')
      });
    }

    return {
      id: quizId,
      title: quizTitle,
      notes: '',
      questionCount: parsedQuestions.length,
      questions: parsedQuestions
    };
  }

  // ==========================================
  // Klavye Kısayolları
  // ==========================================
  function handleKeyDown(e) {
    if (!views.quiz.classList.contains('active')) return;
    if (questionNavModal.classList.contains('active') || notesModal.classList.contains('active')) return;

    const key = e.key.toLowerCase();

    // Seçenek tuşları (1, 2, 3, 4 veya a, b, c, d)
    const q = state.activeQuestions[state.currentIndex];
    if (q && q.type !== 'open_ended' && q.options && q.options.length > 0) {
      let targetIndex = -1;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        targetIndex = parseInt(key) - 1;
      } else if (['a', 'b', 'c', 'd', 'e'].includes(key)) {
        targetIndex = key.charCodeAt(0) - 97;
      }

      if (targetIndex >= 0 && targetIndex < q.options.length) {
        handleOptionSelect(q, q.options[targetIndex]);
        return;
      }
    }

    // Yön tuşları
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      goToNextQuestion();
    } else if (e.key === 'ArrowLeft') {
      goToPrevQuestion();
    }
  }

  // ==========================================
  // Olay Dinleyicileri (Event Listeners)
  // ==========================================
  function bindEvents() {
    // Header Butonları
    brandBtn.addEventListener('click', () => switchView('home'));
    navHomeBtn.addEventListener('click', () => switchView('home'));
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Mobil Navbar Menü Olayları
    if (mobileMenuBtn && mobileNavMenu) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNavMenu.classList.toggle('active');
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
      });
    }

    if (mobileNavHomeBtn) {
      mobileNavHomeBtn.addEventListener('click', () => {
        if (mobileNavMenu) mobileNavMenu.classList.remove('active');
        switchView('home');
      });
    }

    if (mobileModePracticeBtn && mobileModeExamBtn) {
      mobileModePracticeBtn.addEventListener('click', () => {
        state.mode = 'practice';
        modePracticeBtn.classList.add('active');
        modeExamBtn.classList.remove('active');
        mobileModePracticeBtn.classList.add('active');
        mobileModeExamBtn.classList.remove('active');
        if (menuModeText) menuModeText.textContent = 'Mod: Pratik Modu';
        if (mobileNavMenu) mobileNavMenu.classList.remove('active');
        if (views.quiz.classList.contains('active')) renderCurrentQuestion();
      });

      mobileModeExamBtn.addEventListener('click', () => {
        state.mode = 'exam';
        modeExamBtn.classList.add('active');
        modePracticeBtn.classList.remove('active');
        mobileModeExamBtn.classList.add('active');
        mobileModePracticeBtn.classList.remove('active');
        if (menuModeText) menuModeText.textContent = 'Mod: Sınav Modu';
        if (mobileNavMenu) mobileNavMenu.classList.remove('active');
        if (views.quiz.classList.contains('active')) renderCurrentQuestion();
      });
    }

    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener('click', () => {
        toggleTheme();
        if (mobileNavMenu) mobileNavMenu.classList.remove('active');
      });
    }

    // Quiz Ekranı Hamburger Menü Olayları
    if (quizHamburgerBtn && quizDropdownMenu) {
      quizHamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quizDropdownMenu.classList.toggle('active');
        if (mobileNavMenu) mobileNavMenu.classList.remove('active');
      });
    }

    if (menuFinishBtn) {
      menuFinishBtn.addEventListener('click', () => {
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
        if (confirm('Quizi şimdi bitirip sonuçları ve yanlış soruları görmek istiyor musunuz?')) {
          finishQuiz();
        }
      });
    }

    if (menuDrawerBtn) {
      menuDrawerBtn.addEventListener('click', () => {
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
        openQuestionNavModal();
      });
    }

    if (menuNotesBtn) {
      menuNotesBtn.addEventListener('click', () => {
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
        if (state.activeQuiz) openNotesModal(state.activeQuiz);
      });
    }

    if (menuToggleModeBtn) {
      menuToggleModeBtn.addEventListener('click', () => {
        state.mode = state.mode === 'practice' ? 'exam' : 'practice';
        modePracticeBtn.classList.toggle('active', state.mode === 'practice');
        modeExamBtn.classList.toggle('active', state.mode === 'exam');
        if (mobileModePracticeBtn) mobileModePracticeBtn.classList.toggle('active', state.mode === 'practice');
        if (mobileModeExamBtn) mobileModeExamBtn.classList.toggle('active', state.mode === 'exam');
        if (menuModeText) menuModeText.textContent = state.mode === 'practice' ? 'Mod: Pratik Modu' : 'Mod: Sınav Modu';
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
        if (views.quiz.classList.contains('active')) renderCurrentQuestion();
      });
    }

    if (menuThemeBtn) {
      menuThemeBtn.addEventListener('click', () => {
        toggleTheme();
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
      });
    }

    if (menuExitQuizBtn) {
      menuExitQuizBtn.addEventListener('click', () => {
        if (quizDropdownMenu) quizDropdownMenu.classList.remove('active');
        switchView('home');
      });
    }

    // Sayfa boşluğuna tıklanınca açık dropdown menüleri kapat
    document.addEventListener('click', (e) => {
      if (quizDropdownMenu && !quizDropdownMenu.contains(e.target) && e.target !== quizHamburgerBtn && !quizHamburgerBtn.contains(e.target)) {
        quizDropdownMenu.classList.remove('active');
      }
      if (mobileNavMenu && !mobileNavMenu.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
        mobileNavMenu.classList.remove('active');
      }
    });

    // Mod Değiştirici (Masaüstü)
    modePracticeBtn.addEventListener('click', () => {
      state.mode = 'practice';
      modePracticeBtn.classList.add('active');
      modeExamBtn.classList.remove('active');
      if (mobileModePracticeBtn) mobileModePracticeBtn.classList.add('active');
      if (mobileModeExamBtn) mobileModeExamBtn.classList.remove('active');
      if (menuModeText) menuModeText.textContent = 'Mod: Pratik Modu';
      if (views.quiz.classList.contains('active')) renderCurrentQuestion();
    });

    modeExamBtn.addEventListener('click', () => {
      state.mode = 'exam';
      modeExamBtn.classList.add('active');
      modePracticeBtn.classList.remove('active');
      if (mobileModeExamBtn) mobileModeExamBtn.classList.add('active');
      if (mobileModePracticeBtn) mobileModePracticeBtn.classList.remove('active');
      if (menuModeText) menuModeText.textContent = 'Mod: Sınav Modu';
      if (views.quiz.classList.contains('active')) renderCurrentQuestion();
    });

    // Kaynak Seçim Kartları
    sourceCardYeni.addEventListener('click', () => renderSourceQuizzes('yeni'));
    sourceCardEski.addEventListener('click', () => renderSourceQuizzes('eski'));
    fileInput.addEventListener('change', handleFileUpload);
    startAllQuizBtn.addEventListener('click', startAllQuizzesCombined);

    // Quiz Kontrolleri
    prevQuestionBtn.addEventListener('click', goToPrevQuestion);
    nextQuestionBtn.addEventListener('click', goToNextQuestion);
    finishEarlyBtn.addEventListener('click', () => {
      if (confirm('Quizi şimdi bitirip sonuçları ve yanlış soruları görmek istiyor musunuz?')) {
        finishQuiz();
      }
    });

    // Soru Gezgini Modalı
    questionListDrawerBtn.addEventListener('click', openQuestionNavModal);
    closeNavModalBtn.addEventListener('click', closeNavModal);
    questionNavModal.addEventListener('click', e => {
      if (e.target === questionNavModal) closeNavModal();
    });

    // Notlar Modalı
    closeNotesModalBtn.addEventListener('click', closeNotesModal);
    notesModal.addEventListener('click', e => {
      if (e.target === notesModal) closeNotesModal();
    });

    // Sonuç Ekranı Butonları
    restartQuizBtn.addEventListener('click', () => {
      startQuiz(state.activeQuiz);
    });

    nextQuizBtn.addEventListener('click', () => {
      const col = getCurrentCollection();
      if (!state.activeQuiz || state.activeQuiz.id === 'marathon') {
        switchView('home');
        return;
      }
      const nextId = state.activeQuiz.id + 1;
      const nextQ = col.quizzes.find(item => item.id === nextId);
      if (nextQ) {
        startQuiz(nextQ);
      } else {
        alert('Tebrikler! Koleksiyondaki tüm quizleri tamamladınız.');
        switchView('home');
      }
    });

    resultBackHomeBtn.addEventListener('click', () => switchView('home'));

    // Sonuç Filtre Sekmeleri
    tabWrong.addEventListener('click', () => {
      state.reviewFilter = 'wrong';
      updateReviewFilterTabs();
      finishQuizFilterUpdate();
    });
    tabEmpty.addEventListener('click', () => {
      state.reviewFilter = 'empty';
      updateReviewFilterTabs();
      finishQuizFilterUpdate();
    });
    tabCorrect.addEventListener('click', () => {
      state.reviewFilter = 'correct';
      updateReviewFilterTabs();
      finishQuizFilterUpdate();
    });
    tabAll.addEventListener('click', () => {
      state.reviewFilter = 'all';
      updateReviewFilterTabs();
      finishQuizFilterUpdate();
    });

    // Klavye
    window.addEventListener('keydown', handleKeyDown);
  }

  function finishQuizFilterUpdate() {
    const wrongQuestions = [];
    const emptyQuestions = [];
    const correctQuestions = [];

    state.activeQuestions.forEach((q, idx) => {
      const userAns = state.userAnswers[q.id];
      if (!userAns) {
        emptyQuestions.push({ q, userAns: null, idx: idx + 1 });
      } else if (userAns.isCorrect) {
        correctQuestions.push({ q, userAns, idx: idx + 1 });
      } else {
        wrongQuestions.push({ q, userAns, idx: idx + 1 });
      }
    });

    renderReviewList(wrongQuestions, emptyQuestions, correctQuestions);
  }

  // Yardımcı Güvenlik Fonksiyonu
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Uygulamayı Başlat
  document.addEventListener('DOMContentLoaded', init);

})();
