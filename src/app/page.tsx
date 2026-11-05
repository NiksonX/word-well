"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";

type Word = {
  word: string;
  level: "A1" | "A2" | "B1" | "B2";
  part: string;
  pronunciation: string;
  meaning: string;
  example: string;
};

const words: Word[] = [
  { word: "curious", level: "A2", part: "adjective", pronunciation: "/ˈkjʊəriəs/", meaning: "Wanting to know or learn about something.", example: "The curious student stayed after class to ask one more question." },
  { word: "achieve", level: "A2", part: "verb", pronunciation: "/əˈtʃiːv/", meaning: "To succeed in doing or reaching something through effort.", example: "A little practice each day can help you achieve your goal." },
  { word: "reliable", level: "B1", part: "adjective", pronunciation: "/rɪˈlaɪəbl/", meaning: "That you can trust or depend on.", example: "We need a reliable source before we share the information." },
  { word: "notice", level: "A2", part: "verb", pronunciation: "/ˈnəʊtɪs/", meaning: "To see or become aware of something.", example: "Did you notice how the final paragraph changes the tone?" },
  { word: "approach", level: "B2", part: "noun", pronunciation: "/əˈprəʊtʃ/", meaning: "A way of dealing with a person or situation.", example: "Her calm approach made the difficult conversation easier." },
  { word: "benefit", level: "B1", part: "noun", pronunciation: "/ˈbenɪfɪt/", meaning: "An advantage or helpful result.", example: "One benefit of reading widely is a stronger vocabulary." },
  { word: "gather", level: "B1", part: "verb", pronunciation: "/ˈɡæðə(r)/", meaning: "To bring things together or collect information.", example: "The researchers gathered responses from local residents." },
  { word: "ordinary", level: "A2", part: "adjective", pronunciation: "/ˈɔːdnri/", meaning: "Normal or not especially different.", example: "It was an ordinary morning until the phone rang." },
  { word: "aware", level: "B1", part: "adjective", pronunciation: "/əˈweə(r)/", meaning: "Knowing that something exists or is happening.", example: "Are you aware of the new library opening hours?" },
  { word: "efficient", level: "B2", part: "adjective", pronunciation: "/ɪˈfɪʃnt/", meaning: "Working well without wasting time or resources.", example: "A clear plan is an efficient way to begin the project." },
  { word: "journey", level: "A1", part: "noun", pronunciation: "/ˈdʒɜːni/", meaning: "The act of travelling from one place to another.", example: "The train journey through the hills took two hours." },
  { word: "improve", level: "A1", part: "verb", pronunciation: "/ɪmˈpruːv/", meaning: "To become better, or to make something better.", example: "She listens to podcasts to improve her English." },
  { word: "consider", level: "A2", part: "verb", pronunciation: "/kənˈsɪdə(r)/", meaning: "To think carefully about something before deciding.", example: "We should consider every option before we choose." },
  { word: "evidence", level: "A2", part: "noun", pronunciation: "/ˈevɪdəns/", meaning: "Facts or information that show whether something is true.", example: "The report includes evidence from several studies." },
  { word: "maintain", level: "B2", part: "verb", pronunciation: "/meɪnˈteɪn/", meaning: "To keep something at the same level or in good condition.", example: "It takes effort to maintain a healthy work-life balance." },
  { word: "generous", level: "B1", part: "adjective", pronunciation: "/ˈdʒenərəs/", meaning: "Willing to give or share more than is expected.", example: "It was generous of him to offer us a place to stay." },
  { word: "environment", level: "A2", part: "noun", pronunciation: "/ɪnˈvaɪrənmənt/", meaning: "The natural world, or the conditions around someone.", example: "Small choices can have an impact on the environment." },
  { word: "significant", level: "B2", part: "adjective", pronunciation: "/sɪɡˈnɪfɪkənt/", meaning: "Large or important enough to be noticed.", example: "The study found a significant change in reading habits." },
  { word: "support", level: "A2", part: "verb", pronunciation: "/səˈpɔːt/", meaning: "To help or encourage someone or something.", example: "Good feedback can support learners as they grow." },
  { word: "opportunity", level: "A2", part: "noun", pronunciation: "/ˌɒpəˈtjuːnəti/", meaning: "A situation that makes it possible to do something.", example: "The exchange programme was a great opportunity to travel." },
];

const levels = ["All", "A1", "A2", "B1", "B2"] as const;
type LevelFilter = (typeof levels)[number];
const savedWordsKey = "wordwell-saved";
const savedWordsEvent = "wordwell:saved-words";

function subscribeToSavedWords(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedWordsEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedWordsEvent, onChange);
  };
}

function getSavedWordsSnapshot() {
  return window.localStorage.getItem(savedWordsKey) ?? "[]";
}

function getServerSavedWordsSnapshot() {
  return "[]";
}

export default function Home() {
  const [level, setLevel] = useState<LevelFilter>("All");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const savedSnapshot = useSyncExternalStore(subscribeToSavedWords, getSavedWordsSnapshot, getServerSavedWordsSnapshot);
  const saved = JSON.parse(savedSnapshot) as string[];
  const [showSaved, setShowSaved] = useState(false);

  const deck = words.filter((item) => {
    const matchesLevel = level === "All" || item.level === level;
    const matchesSearch = `${item.word} ${item.meaning}`.toLowerCase().includes(query.toLowerCase());
    const matchesSaved = !showSaved || saved.includes(item.word);
    return matchesLevel && matchesSearch && matchesSaved;
  });
  const currentIndex = deck.length ? index % deck.length : 0;
  const current = deck[currentIndex];

  function moveCard(direction: -1 | 1) {
    if (!deck.length) return;
    setIndex((currentIndex) => (currentIndex + direction + deck.length) % deck.length);
    setFlipped(false);
  }

  function toggleSaved(word: string) {
    const next = saved.includes(word)
      ? saved.filter((item) => item !== word)
      : [...saved, word];
    window.localStorage.setItem(savedWordsKey, JSON.stringify(next));
    window.dispatchEvent(new Event(savedWordsEvent));
  }

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCard(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCard(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.code === "Space") {
      event.preventDefault();
      setFlipped((isFlipped) => !isFlipped);
    }
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      handleKeyDown(event);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Wordwell home">
          <span className="brand-mark">w.</span>
          <span>wordwell</span>
        </a>
        <div className="topbar-right">
          <span className="daily-note"><span className="status-dot" /> A good day to learn a word</span>
          <a className="source-link" href="https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000" target="_blank" rel="noreferrer">Oxford 3000 / 5000 <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="workspace" id="home">
        <aside className="deck-sidebar">
          <div className="sidebar-heading">
            <div>
              <p className="eyebrow">YOUR STUDY DECK</p>
              <h1>Word garden</h1>
            </div>
            <span className="deck-count">{deck.length.toString().padStart(2, "0")}</span>
          </div>

          <div className="level-filters" aria-label="Filter by CEFR level">
            {levels.map((item) => (
              <button className={`level-chip ${level === item ? "active" : ""}`} key={item} onClick={() => setLevel(item)} aria-pressed={level === item}>{item}</button>
            ))}
          </div>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a word..." aria-label="Find a word" />
            <kbd>/</kbd>
          </label>

          <div className="list-toolbar">
            <span>{showSaved ? "SAVED WORDS" : "IN THIS DECK"}</span>
            <button className={`saved-filter ${showSaved ? "active" : ""}`} onClick={() => setShowSaved((value) => !value)} aria-label={showSaved ? "Show all words" : "Show saved words"} title={showSaved ? "Show all words" : "Show saved words"}>{showSaved ? "★" : "☆"}</button>
          </div>

          <nav className="word-list" aria-label="Words in this deck">
            {deck.map((item, itemIndex) => (
              <button className={`word-row ${itemIndex === currentIndex ? "selected" : ""}`} key={item.word} onClick={() => { setIndex(itemIndex); setFlipped(false); }}>
                <span className="word-row-name">{item.word}<small>{item.part}</small></span>
                <span className={`row-level level-${item.level.toLowerCase()}`}>{item.level}</span>
              </button>
            ))}
            {!deck.length && <p className="empty-list">No words found. Try another level or search.</p>}
          </nav>

          <a className="oxford-card-link" href="https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000" target="_blank" rel="noreferrer">
            <span className="oxford-link-mark">O</span>
            <span><strong>Explore the full list</strong><small>Oxford Learner&apos;s Dictionaries</small></span>
            <span className="link-arrow" aria-hidden="true">↗</span>
          </a>
        </aside>

        <section className="study-area" aria-label="Flashcard study area">
          <div className="study-heading">
            <div>
              <p className="eyebrow">A MOMENT FOR YOUR VOCABULARY</p>
              <h2>Small words. <em>Big worlds.</em></h2>
            </div>
            <div className="progress-wrap">
              <span>{deck.length ? `${String(currentIndex + 1).padStart(2, "0")} / ${String(deck.length).padStart(2, "0")}` : "00 / 00"}</span>
              <div className="progress-track"><i style={{ width: `${deck.length ? ((index + 1) / deck.length) * 100 : 0}%` }} /></div>
            </div>
          </div>

          <div className="card-stage">
            <div className="card-shadow card-shadow-back" />
            <div className={`flashcard ${flipped ? "is-flipped" : ""}`}>
              {current ? <>
                <button className="card-face card-front" onClick={() => setFlipped(true)} aria-label={`Reveal meaning of ${current.word}`}>
                  <span className="card-topline"><span>WORD NO. {String(words.indexOf(current) + 1).padStart(2, "0")}</span><span className={`level-tag level-${current.level.toLowerCase()}`}>{current.level}</span></span>
                  <span className="word-display">{current.word}</span>
                  <span className="word-meta"><i /> {current.part} <span className="pronunciation">{current.pronunciation}</span></span>
                  <span className="card-bottomline"><span>Take a guess, then turn the card</span><span className="turn-icon" aria-hidden="true">↻</span></span>
                  <span className="card-ornament" aria-hidden="true">✳</span>
                </button>
                <button className="card-face card-back" onClick={() => setFlipped(false)} aria-label={`Hide meaning of ${current.word}`}>
                  <span className="card-topline"><span>THE MEANING</span><span className={`level-tag level-${current.level.toLowerCase()}`}>{current.level}</span></span>
                  <span className="meaning-label">{current.word}</span>
                  <span className="meaning-text">{current.meaning}</span>
                  <span className="example-block"><span>IN A SENTENCE</span><span>“{current.example}”</span></span>
                  <span className="card-bottomline"><span>Turn back to the word</span><span className="turn-icon" aria-hidden="true">↻</span></span>
                </button>
              </> : <div className="card-empty"><span>✳</span><p>{showSaved ? "Save a word to start your collection." : "No words in this view."}</p><button onClick={() => { setShowSaved(false); setQuery(""); setLevel("All"); }}>Back to the deck</button></div>}
            </div>
          </div>

          <div className="study-controls">
            <button className="icon-button" onClick={() => moveCard(-1)} aria-label="Previous word" title="Previous word (left arrow)"><span aria-hidden="true">←</span></button>
            <button className={`save-button ${current && saved.includes(current.word) ? "is-saved" : ""}`} onClick={() => current && toggleSaved(current.word)} disabled={!current} aria-label={current && saved.includes(current.word) ? "Remove saved word" : "Save word"} title="Save word"><span aria-hidden="true">{current && saved.includes(current.word) ? "★" : "☆"}</span></button>
            <button className="reveal-button" onClick={() => current && setFlipped((value) => !value)} disabled={!current}>{flipped ? "Show word" : "Reveal meaning"}<span aria-hidden="true">↗</span></button>
            <button className="icon-button" onClick={() => moveCard(1)} aria-label="Next word" title="Next word (right arrow)"><span aria-hidden="true">→</span></button>
          </div>

          <div className="keyboard-hint"><span>←</span><span>→</span> browse <b>·</b> <span>↑</span><span>↓</span> flip <b>·</b> <kbd>space</kbd> flip</div>
        </section>
      </section>
      <footer className="page-footer"><span>ONE WORD AT A TIME</span><span>Built for curious minds <i>✳</i></span></footer>
    </main>
  );
}
