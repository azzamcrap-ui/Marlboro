/*
  TK-EDU Game - HTML/CSS/JS
  Copyright © 2026 MTsN 1 Lamongan
  Licensed for educational use.
*/

(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- SFX ----------
  const sfx = {
    start: $("sfx-start"),
    next: $("sfx-next"),
    correct: $("sfx-correct"),
    wrong: $("sfx-wrong"),
    gameover: $("sfx-gameover"),
  };

  let sfxEnabled = true;

  // Some browsers require the audio to be initiated by a user gesture.
  // We'll try to trigger playback from click handlers.

  function playSfx(name) {
    const el = sfx[name];
    if (!sfxEnabled || !el) return;

    try {
      el.pause();
      el.currentTime = 0;
      // autoplay policy: must be triggered by user gesture; this will still fail silently otherwise
      el.play();
    } catch (_) {
      // ignore
    }
  }

  const screens = {

    home: $("screen-home"),
    game: $("screen-game"),
    end: $("screen-end"),
  };

  const scoreEl = $("score");
  const livesEl = $("lives");
  const levelEl = $("level");

  const btnStart = $("btn-start");
  const btnHow = $("btn-how");
  const howBox = $("how-box");

  const questionTitle = $("question-title");
  const tagTheme = $("tag-theme");

  const ansA = $("ans-a");
  const ansB = $("ans-b");
  const ansC = $("ans-c");

  const buttons = Array.from(document.querySelectorAll(".answer"));
  const feedback = $("feedback");
  const btnNext = $("btn-next");
  const btnRestart = $("btn-restart");

  const qIndexEl = $("q-index");
  const qTotalEl = $("q-total");
  const barFill = $("bar-fill");

  const countCorrectEl = $("count-correct");
  const countWrongEl = $("count-wrong");

  const teacherSpeech = $("teacher-speech");
  const timerText = $("timer-text");


  const endTitle = $("end-title");
  const endSummary = $("end-summary");
  const endScore = $("end-score");
  const endCorrect = $("end-correct");
  const endWrong = $("end-wrong");

  const btnPlayAgain = $("btn-play-again");
  const btnBackHome = $("btn-back-home");

  const state = {
    score: 0,
    lives: 3,
    level: 1,
    idx: 0,
    correct: 0,
    wrong: 0,
    locked: false,
    currentSet: [],

    // timer per soal (detik)
    timePerQuestion: 5,
    timerLeft: 5,
    timerId: null,
    timerRunning: false,
  };


  const data = {
    1: {
      theme: "Campuran",
      speech: [
        "Yuk latihan Matematika & English! 📚✨",
        "Pilih jawaban yang paling tepat!",
      ],
      questions: [
        // --- MATEMATIKA (5) ---
        {
          q: "2 × 3 = ...",
          theme: "Matematika - Perkalian",
          choices: { A: "5", B: "6", C: "7" },
          answer: "B",
          explain: "2 × 3 = 6.",
        },
        {
          q: "4 × 5 = ...",
          theme: "Matematika - Perkalian",
          choices: { A: "18", B: "20", C: "25" },
          answer: "B",
          explain: "4 × 5 = 20.",
        },
        {
          q: "7 + 8 = ...",
          theme: "Matematika - Penjumlahan",
          choices: { A: "14", B: "15", C: "16" },
          answer: "B",
          explain: "7 + 8 = 15.",
        },
        {
          q: "9 + 6 = ...",
          theme: "Matematika - Penjumlahan",
          choices: { A: "13", B: "15", C: "20" },
          answer: "B",
          explain: "9 + 6 = 15.",
        },
        {
          q: "15 − 7 = ...",
          theme: "Matematika - Pengurangan",
          choices: { A: "6", B: "7", C: "8" },
          answer: "C",
          explain: "15 − 7 = 8.",
        },

        // --- BAHASA INGGRIS SD (5) ---
        {
          q: "‘I have two cats.’ artinya ...",
          theme: "English - Kalimat",
          choices: { A: "Saya punya dua kucing", B: "Saya punya satu kucing", C: "Kucing saya dua ekor besar" },
          answer: "A",
          explain: "I have two cats = Saya punya dua kucing.",
        },
        {
          q: "‘What is your name?’ artinya ...",
          theme: "English - Pertanyaan",
          choices: { A: "Apa nama kamu?", B: "Di mana kamu?", C: "Berapa umur kamu?" },
          answer: "A",
          explain: "What is your name? = Apa nama kamu?",
        },
        {
          q: "‘Good morning’ artinya ...",
          theme: "English - Sapaan",
          choices: { A: "Selamat pagi", B: "Selamat malam", C: "Selamat siang" },
          answer: "A",
          explain: "Good morning = Selamat pagi.",
        },
        {
          q: "‘How are you?’ jawabannya yang benar adalah ...",
          theme: "English - Jawaban",
          choices: { A: "I am fine, thank you.", B: "I am hungry.", C: "I like blue." },
          answer: "A",
          explain: "How are you? biasanya dijawab I am fine, thank you.",
        },
        {
          q: "Pilih kata untuk ‘apel’ ...",
          theme: "English - Kosakata",
          choices: { A: "Apple", B: "Orange", C: "Grape" },
          answer: "A",
          explain: "Apple = apel.",
        },
      ],
    },
  };


  // ---------- helpers ----------
  function showScreen(name) {
    Object.values(screens).forEach((el) => (el.hidden = true));
    screens[name].hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateHUD() {
    scoreEl.textContent = String(state.score);
    livesEl.textContent = String(state.lives);
    levelEl.textContent = String(state.level);

    qIndexEl.textContent = String(state.idx + 1);
    qTotalEl.textContent = String(state.currentSet.length);

    const pct = state.currentSet.length
      ? ((state.idx / state.currentSet.length) * 100).toFixed(0)
      : 0;
    barFill.style.width = pct + "%";

    countCorrectEl.textContent = String(state.correct);
    countWrongEl.textContent = String(state.wrong);
  }

  function setTeacherSpeech(text) {
    teacherSpeech.textContent = text;
  }

  function lockAnswers(lock) {
    state.locked = lock;
    buttons.forEach((b) => {
      b.disabled = lock;
    });
    btnNext.disabled = true;
  }

  function setFeedback(text, kind) {
    feedback.textContent = text;
    feedback.style.color = kind === "good" ? "#16a34a" : kind === "bad" ? "#ef4444" : "#0b1224";
  }

  function formatChoiceText(obj) {
    ansA.textContent = obj.A;
    ansB.textContent = obj.B;
    ansC.textContent = obj.C;
  }

  function shuffleArray(arr) {
    // Fisher–Yates
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickLevelQuestions(level) {
    const lv = data[level] || data[1];

    // clone so shuffle doesn't mutate original data
    state.currentSet = lv.questions.map((q) => ({ ...q, choices: { ...q.choices } }));

    // Shuffle jawaban (A/B/C) setiap game mulai ulang, tapi tetap menjaga answer yang benar
    state.currentSet.forEach((q) => {
      const letters = ["A", "B", "C"];
      shuffleArray(letters);

      const oldChoices = { ...q.choices };
      const oldAnswer = q.answer; // "A" | "B" | "C"

      // map pilihan lama -> posisi baru
      // misal: letters = ["B","A","C"] berarti nilai lama A pindah ke posisi letters[?]
      // Kita lakukan dengan cara: ambil nilai lama berdasarkan index & assign ke huruf baru.
      // oldChoices.A/B/C mengikuti urutan lettersNew yang diacak.
      const oldValues = [oldChoices.A, oldChoices.B, oldChoices.C];
      const newChoices = {};
      letters.forEach((newKey, i) => {
        newChoices[newKey] = oldValues[i];
      });

      // Hitung ulang answer: nilai yang benar lama adalah oldChoices[oldAnswer]
      const correctValue = oldChoices[oldAnswer];
      q.choices = newChoices;
      q.answer = letters.find((k) => newChoices[k] === correctValue);
    });
  }


  function stopTimer() {
    state.timerRunning = false;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();

    state.timerRunning = true;
    state.timerLeft = state.timePerQuestion;
    timerText?.classList.remove("warn", "danger");
    timerText && (timerText.textContent = String(state.timerLeft));

    state.timerId = setInterval(() => {
      if (!state.timerRunning) return;
      state.timerLeft -= 1;
      if (timerText) {
        timerText.textContent = String(Math.max(0, state.timerLeft));
        timerText.classList.toggle("warn", state.timerLeft <= 2 && state.timerLeft > 0);
        timerText.classList.toggle("danger", state.timerLeft <= 1);
      }

      if (state.timerLeft <= 0) {
        // time out = wrong
        stopTimer();
        const q = state.currentSet[state.idx];

        lockAnswers(true);
        buttons.forEach((b) => b.classList.remove("correct", "wrong"));
        const correctKey = q.answer;
        buttons.forEach((b) => {
          if (b.getAttribute("data-key") === correctKey) {
            b.classList.add("correct");
          }
        });

        state.wrong += 1;
        state.lives -= 1;
        setFeedback("Waktu habis! " + (q.explain || ""), "bad");

        updateHUD();
        btnNext.disabled = false;
        btnNext.textContent = "Lanjut";

        if (state.lives <= 0) {
          endGame();
        }
      }
    }, 1000);
  }

  function renderQuestion() {
    const q = state.currentSet[state.idx];
    const lv = data[state.level] || data[1];

    questionTitle.textContent = q.q;
    tagTheme.textContent = "Tema: " + (q.theme || lv.theme);
    formatChoiceText(q.choices);

    setTeacherSpeech(lv.speech[Math.min(lv.speech.length - 1, state.idx)]);

    feedback.textContent = "";
    feedback.style.color = "#0b1224";

    btnNext.disabled = true;
    lockAnswers(false);
    startTimer();
  }


  function endGame() {
    playSfx("gameover");
    showScreen("end");

    endScore.textContent = String(state.score);

    endCorrect.textContent = String(state.correct);
    endWrong.textContent = String(state.wrong);

    const maxScore = state.currentSet.length * 10;
    const ratio = maxScore ? state.score / maxScore : 0;

    let label = "Hebat!";
    if (ratio >= 0.8) label = "Mantap! Kamu juara! 🏆";
    else if (ratio >= 0.55) label = "Semangat terus! 🌟";
    else label = "Terus belajar ya! 💪";

    endTitle.textContent = label;
    endSummary.textContent = `Kamu menyelesaikan ${state.currentSet.length} soal. Terima kasih sudah belajar bersama Bu Guru!`;
  }

  function start(level = 1) {
    stopTimer();

    state.score = 0;
    state.lives = 3;
    state.level = level;
    state.idx = 0;
    state.correct = 0;
    state.wrong = 0;

    pickLevelQuestions(state.level);
    updateHUD();

    btnNext.disabled = true;
    lockAnswers(false);

    showScreen("game");
    renderQuestion();
  }


  function nextQuestion() {
    stopTimer();
    state.idx++;
    if (state.idx >= state.currentSet.length) {

      // simple: if level 1 finished and lives >0, offer level 2 automatically
      const nextLevel = state.level === 1 ? 2 : 1;
      // move to end game always per current task; keep it simple
      endGame();
      return;
    }
    updateHUD();
    renderQuestion();
  }

  function answerForKey(key) {
    const q = state.currentSet[state.idx];
    return q.answer === key;
  }

  // ---------- events ----------
  btnStart.addEventListener("click", () => {
    playSfx("start");
    btnHow.blur();
    start(1);
  });


  btnHow.addEventListener("click", () => {
    howBox.hidden = !howBox.hidden;
  });

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.locked) return;

      const key = btn.getAttribute("data-key");
      const q = state.currentSet[state.idx];
      const isCorrect = q.answer === key;

      // mark selection
      lockAnswers(true);

      buttons.forEach((b) => {
        b.classList.remove("correct", "wrong");
        if (b.getAttribute("data-key") === key) {
          b.classList.add(isCorrect ? "correct" : "wrong");
        }
      });

      if (isCorrect) {
        playSfx("correct");
        state.correct += 1;
        state.score += 10;
        setFeedback("Benar! " + q.explain, "good");
      } else {
        playSfx("wrong");
        state.wrong += 1;
        state.lives -= 1;
        setFeedback("Wah, kurang tepat. " + q.explain, "bad");
      }


      updateHUD();
      btnNext.disabled = false;

      if (state.lives <= 0) {
        endGame();
      } else {
        btnNext.textContent = "Lanjut";
      }
    });
  });

  btnNext.addEventListener("click", () => {
    playSfx("next");
    // reset highlight
    buttons.forEach((b) => b.classList.remove("correct", "wrong"));
    btnNext.disabled = true;
    nextQuestion();
  });




  btnRestart?.addEventListener("click", () => {
    // Tetap restart game, tapi jika yang dimaksud adalah kembali ke halaman awal
    // maka gunakan tombol "Mulai Bermain" setelah restart.
    playSfx("start");
    start(1);
  });


  const btnBackHomeInGame = $("btn-back-home");
  btnBackHomeInGame?.addEventListener("click", () => {
    playSfx("start");
    showScreen("home");
  });

  btnPlayAgain.addEventListener("click", () => {
    playSfx("start");
    start(1);
  });

  // Tombol "Kembali" di screen-end
  const btnBackHomeEnd = $("btn-back-home");
  btnBackHomeEnd?.addEventListener("click", () => {
    playSfx("start");
    showScreen("home");
  });





  // keyboard shortcuts for accessibility
  document.addEventListener("keydown", (e) => {
    if (screens.game.hidden) return;
    if (state.locked) return;

    if (e.key === "a" || e.key === "A") buttons.find((b) => b.dataset.key === "A")?.click();
    if (e.key === "b" || e.key === "B") buttons.find((b) => b.dataset.key === "B")?.click();
    if (e.key === "c" || e.key === "C") buttons.find((b) => b.dataset.key === "C")?.click();
    if (e.key === "Enter" && !btnNext.disabled) btnNext.click();
  });

  // initial screen
  showScreen("home");
})();

