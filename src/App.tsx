import { useState, useEffect, useCallback } from 'react';

// Wordlist containing 200 common English words for Passphrase Mode
const wordlist = [
  "about", "above", "across", "action", "active", "actor", "admit", "adopt", "advice", "advise", "affect", "agency", "agent", 
  "agree", "ahead", "allow", "almost", "along", "alpha", "always", "among", "amount", "anchor", "animal", "annual", "answer", 
  "anyone", "appeal", "appear", "apple", "apply", "around", "arrive", "artist", "aspect", "assess", "assume", "attack", "attend", 
  "author", "avatar", "avoid", "award", "backup", "banana", "beacon", "beauty", "become", "before", "behind", "belief", "belong", 
  "below", "beyond", "bishop", "bitter", "border", "bottle", "bottom", "bought", "branch", "breeze", "bridge", "bright", "broken", 
  "budget", "burden", "button", "buyer", "camera", "camp", "campus", "cancel", "cancer", "canyon", "carbon", "career", "castle", 
  "casual", "cattle", "caught", "center", "chance", "change", "charge", "cheese", "cherry", "choice", "choose", "church", "cinema", 
  "circle", "client", "climate", "clinic", "closed", "closer", "coffee", "cohort", "colleague", "column", "combat", "comedy", 
  "commit", "common", "comply", "copper", "corner", "cotton", "county", "couple", "course", "cove", "coyote", "craft", "crater", 
  "credit", "crisis", "critic", "crunch", "crystal", "custom", "damage", "danger", "darkness", "database", "dealer", "debate", 
  "decade", "decent", "decide", "decree", "defeat", "defend", "define", "degree", "demand", "depend", "deputy", "desert", "design", 
  "desire", "detail", "detect", "device", "devote", "dialog", "diesel", "differ", "dinner", "direct", "doctor", "domain", "donor", 
  "double", "dragon", "drawer", "dream", "driver", "duration", "during", "dynamic", "eagle", "earth", "easily", "echo", "editor", 
  "effect", "effort", "eighty", "either", "elbow", "elder", "elect", "element", "elite", "engine", "enough", "entire", "entity", 
  "enzyme", "epoch", "equal", "equity", "escape", "estate", "ethics", "ethnic", "eval", "event", "every", "except", "expert", 
  "export", "fabric", "factor", "falcon", "family", "famous", "farmer", "father", "fault", "favor", "fellow", "female", "fibers", 
  "field", "fierce", "fifth", "fifty", "figure", "filter", "finder", "finger", "finish"
];

// Custom Syllables for Pronounceable Passphrase Mode
const syllables = [
  "ba", "be", "bi", "bo", "bu", "ca", "ce", "ci", "co", "cu",
  "da", "de", "di", "do", "du", "fa", "fe", "fi", "fo", "fu",
  "ga", "ge", "gi", "go", "gu", "ha", "he", "hi", "ho", "hu",
  "ja", "je", "ji", "jo", "ju", "ka", "ke", "ki", "ko", "ku",
  "la", "le", "li", "lo", "lu", "ma", "me", "mi", "mo", "mu",
  "na", "ne", "ni", "no", "nu", "pa", "pe", "pi", "po", "pu",
  "ra", "re", "ri", "ro", "ru", "sa", "se", "si", "so", "su",
  "ta", "te", "ti", "to", "tu", "va", "ve", "vi", "vo", "vu",
  "wa", "we", "wi", "wo", "wu", "ya", "ye", "yi", "yo", "yu",
  "za", "ze", "zi", "zo", "zu"
];

type GeneratorMode = 'random' | 'passphrase' | 'dev';
type Separator = 'hyphen' | 'dot' | 'underscore' | 'space' | 'none';
type StrengthLabel = 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
type DevPreset = 'hex128' | 'hex256' | 'b64-256' | 'b64-512' | 'uuid';

interface HistoryItem {
  id: string;
  val: string;
  timestamp: string;
}

export default function App() {
  // Navigation / Mode selection
  const [mode, setMode] = useState<GeneratorMode>('random');

  // Random Characters Mode Controls
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  // Passphrase Mode Controls
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<Separator>('hyphen');
  const [passphraseSource, setPassphraseSource] = useState<'words' | 'syllables'>('words');

  // Developer Presets Mode Controls
  const [devPreset, setDevPreset] = useState<DevPreset>('uuid');

  // Quantity to generate
  const [quantity, setQuantity] = useState<number>(1);

  // Output State
  const [passwords, setPasswords] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
  const [copyAllText, setCopyAllText] = useState<string>('⎘ Copy All');

  // Custom Word Controls
  const [customWord, setCustomWord] = useState<string>('');
  const [customWordPos, setCustomWordPos] = useState<'start' | 'end' | 'random'>('random');

  // FAQ Active Accordion
  const [faqActive, setFaqActive] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setFaqActive(faqActive === index ? null : index);
  };

  // History Log
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize history
  useEffect(() => {
    const saved = sessionStorage.getItem('pwd_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Dynamic FAQ JSON-LD Injection for deep SEO
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is my custom word or password transmitted to any server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. CryptPass runs entirely inside your browser's local sandbox using the W3C Web Cryptography API (CSPRNG). No passwords, custom words, or parameters are sent over the network."
          }
        },
        {
          "@type": "Question",
          "name": "How does adding a custom word affect my password strength?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Including a custom word increases password memorability but may lower total entropy compared to pure random keys, unless the custom word itself is highly complex. Position randomization helps prevent basic dictionary attacks."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between entropy and character length?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Length is the number of characters, while entropy (measured in bits) represents the mathematical complexity. Higher entropy means more guesses are required to crack the key using brute-force search."
          }
        },
        {
          "@type": "Question",
          "name": "What are pronounceable phonetic syllables?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Syllable-based passphrases combine vowel-consonant blocks (like 'bafidu') to make passwords easy to pronounce and remember while remaining highly secure against automated crackers."
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld';
    script.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Secure Cryptographically Random number helper
  const secureRandomInt = (max: number): number => {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return Math.floor((array[0] / 4294967296) * max);
  };

  // Helper bytes generator
  const secureRandomBytes = (len: number): Uint8Array => {
    const arr = new Uint8Array(len);
    window.crypto.getRandomValues(arr);
    return arr;
  };

  // Convert bytes to Hex helper
  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Convert bytes to Base64 helper
  const bytesToBase64 = (bytes: Uint8Array): string => {
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  };

  // Main Generator Logic
  const generate = useCallback(() => {
    setErrorMsg(null);

    // 1. DEVELOPER PRESETS MODE
    if (mode === 'dev') {
      const generated: string[] = [];
      try {
        for (let q = 0; q < quantity; q++) {
          if (devPreset === 'uuid') {
            if (typeof window.crypto.randomUUID === 'function') {
              generated.push(window.crypto.randomUUID());
            } else {
              // Custom RFC4122 v4 UUID fallback
              const bytes = secureRandomBytes(16);
              bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
              bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx
              const hex = bytesToHex(bytes);
              generated.push(
                `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`
              );
            }
          } else if (devPreset === 'hex128') {
            generated.push(bytesToHex(secureRandomBytes(16)));
          } else if (devPreset === 'hex256') {
            generated.push(bytesToHex(secureRandomBytes(32)));
          } else if (devPreset === 'b64-256') {
            generated.push(bytesToBase64(secureRandomBytes(32)));
          } else if (devPreset === 'b64-512') {
            generated.push(bytesToBase64(secureRandomBytes(64)));
          }
        }
        setPasswords(generated);
        addToHistory(generated);
      } catch (err) {
        setErrorMsg('Web Crypto support failed.');
      }
      return;
    }

    // 2. PASSPHRASE MODE
    if (mode === 'passphrase') {
      const generated: string[] = [];
      const sepChars = { hyphen: '-', dot: '.', underscore: '_', space: ' ', none: '' };
      const activeSep = sepChars[separator];

      for (let q = 0; q < quantity; q++) {
        const words: string[] = [];
        for (let w = 0; w < wordCount; w++) {
          if (passphraseSource === 'words') {
            const randIdx = secureRandomInt(wordlist.length);
            words.push(wordlist[randIdx]);
          } else {
            // Syllables mode: Combine 3 syllables to form 1 pronounceable block
            let sylWord = '';
            for (let s = 0; s < 3; s++) {
              const randIdx = secureRandomInt(syllables.length);
              sylWord += syllables[randIdx];
            }
            words.push(sylWord);
          }
        }

        // Inject custom word
        if (customWord) {
          if (customWordPos === 'start') {
            words.unshift(customWord);
          } else if (customWordPos === 'end') {
            words.push(customWord);
          } else {
            const insertIdx = secureRandomInt(words.length + 1);
            words.splice(insertIdx, 0, customWord);
          }
        }

        generated.push(words.join(activeSep));
      }

      setPasswords(generated);
      addToHistory(generated);
      return;
    }

    // 3. RANDOM CHARACTERS MODE
    const upperPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerPool = 'abcdefghijklmnopqrstuvwxyz';
    const numberPool = '0123456789';
    const symbolPool = '!@#$%^&*()_+-=[]{}|;\':",./<>?';

    let charPool = '';
    if (includeUpper) charPool += upperPool;
    if (includeLower) charPool += lowerPool;
    if (includeNumbers) charPool += numberPool;
    if (includeSymbols) charPool += symbolPool;

    if (excludeAmbiguous) {
      charPool = charPool.replace(/[Il1O0|]/g, '');
    }

    if (charPool === '') {
      setErrorMsg('Please select at least one character set.');
      setPasswords([]);
      return;
    }

    const generated: string[] = [];
    for (let q = 0; q < quantity; q++) {
      let pwd = '';
      const randomLength = Math.max(0, length - (customWord ? customWord.length : 0));
      for (let l = 0; l < randomLength; l++) {
        const randIdx = secureRandomInt(charPool.length);
        pwd += charPool[randIdx];
      }
      if (customWord) {
        if (customWordPos === 'start') {
          pwd = customWord + pwd;
        } else if (customWordPos === 'end') {
          pwd = pwd + customWord;
        } else {
          const insertIdx = secureRandomInt(pwd.length + 1);
          pwd = pwd.substring(0, insertIdx) + customWord + pwd.substring(insertIdx);
        }
      }
      generated.push(pwd);
    }

    setPasswords(generated);
    addToHistory(generated);
  }, [
    mode,
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    wordCount,
    separator,
    passphraseSource,
    devPreset,
    quantity,
    customWord,
    customWordPos,
  ]);

  // Generate on load / trigger changes
  useEffect(() => {
    generate();
  }, [generate]);

  // Keyboard binding for fast regeneration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'BUTTON' ||
            active.tagName === 'SELECT')
        ) {
          return;
        }
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generate]);

  // History logger
  const addToHistory = (newPwds: string[]) => {
    setHistory((prev) => {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const items: HistoryItem[] = newPwds.map((pwd, idx) => ({
        id: Math.random().toString(36).substring(2, 9) + idx,
        val: pwd,
        timestamp: nowStr,
      }));
      const updated = [...items, ...prev].slice(0, 10);
      sessionStorage.setItem('pwd_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('pwd_history');
    showToast('History cleared.');
  };

  const handleCopySingle = (val: string, index: number) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    });
  };

  const handleCopyAll = () => {
    if (passwords.length === 0) return;
    navigator.clipboard.writeText(passwords.join('\n')).then(() => {
      setCopyAllText('✓ Copied All!');
      setTimeout(() => setCopyAllText('⎘ Copy All'), 2000);
    });
  };

  // Math Strength & Entropy Estimator
  const calculateEntropy = (): { entropy: number; strength: StrengthLabel; color: string } => {
    if (mode === 'dev') {
      const bits = { hex128: 128, hex256: 256, 'b64-256': 256, 'b64-512': 512, uuid: 122 }[devPreset];
      return { entropy: bits, strength: 'Very Strong', color: 'var(--very-strong)' };
    }

    if (mode === 'passphrase') {
      const pool = passphraseSource === 'words' ? wordlist.length : syllables.length;
      // If syllables mode, each word has 3 syllables
      const multiplier = passphraseSource === 'words' ? 1 : 3;
      const entropy = wordCount * multiplier * Math.log2(pool);

      let strength: StrengthLabel = 'Weak';
      let color = 'var(--weak)';
      if (entropy >= 55) {
        strength = 'Very Strong';
        color = 'var(--very-strong)';
      } else if (entropy >= 40) {
        strength = 'Strong';
        color = 'var(--strong)';
      } else if (entropy >= 25) {
        strength = 'Fair';
        color = 'var(--fair)';
      }
      return { entropy, strength, color };
    }

    // Random Characters
    let poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 29;
    if (excludeAmbiguous) poolSize -= 6;

    if (poolSize === 0 || length === 0) {
      return { entropy: 0, strength: 'Weak', color: 'var(--weak)' };
    }

    const entropy = length * Math.log2(poolSize);
    let strength: StrengthLabel = 'Weak';
    let color = 'var(--weak)';

    if (entropy > 80) {
      strength = 'Very Strong';
      color = 'var(--very-strong)';
    } else if (entropy >= 60) {
      strength = 'Strong';
      color = 'var(--strong)';
    } else if (entropy >= 35) {
      strength = 'Fair';
      color = 'var(--fair)';
    }

    return { entropy, strength, color };
  };

  const { entropy, strength, color } = calculateEntropy();
  const strengthPercent = Math.min(100, (entropy / 110) * 100);

  // Time-to-crack calculation assuming 10^10 guesses per second GPU cluster
  const getCrackTime = (ent: number): string => {
    if (ent <= 0) return 'Instant';
    const log2Sec = ent - 34.21928; // log2(guesses) - log2(2 * 10^10)
    if (log2Sec < 0) {
      const sec = Math.pow(2, log2Sec);
      if (sec < 0.01) return 'Instant';
      return `${sec.toFixed(2)} seconds`;
    }
    const seconds = Math.pow(2, log2Sec);
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} mins`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    const years = days / 365;
    if (years < 100) return `${Math.round(years)} years`;
    const centuries = years / 100;
    if (centuries < 10000) return `${Math.round(centuries)} centuries`;
    return 'Eons (Billions of years)';
  };

  const showToast = (msg: string) => {
    const el = document.getElementById('toast-banner');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2000);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="logo">
          <span>🔒 CryptPass</span>
          <span className="logo-badge">PRO</span>
        </div>
        <div className="author-chip">
          By <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp;
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">Enterprise Cryptography Suite · Web Crypto</div>
        <h1>Secure <span>Password Generator</span></h1>
        <p>
          Generate random keys, phonetic passphrases, or developer tokens locally. Pure client-side calculations.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* INPUT CONTROLS CARD */}
        <div className="card">
          <div className="card-title">⚙️ Generator Parameters</div>

          {/* Mode Switcher */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'random' ? 'active' : ''}`}
              onClick={() => setMode('random')}
            >
              Random Characters
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'passphrase' ? 'active' : ''}`}
              onClick={() => setMode('passphrase')}
            >
              Memorable Passphrase
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'dev' ? 'active' : ''}`}
              onClick={() => setMode('dev')}
            >
              Developer Presets
            </button>
          </div>

          {/* Mode Specific Settings */}
          {mode === 'random' && (
            <>
              <div className="field">
                <div className="field-header">
                  <label htmlFor="length">Password Length</label>
                  <span className="field-value">{length}</span>
                </div>
                <input
                  id="length"
                  type="range"
                  className="slider"
                  min="8"
                  max="128"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                />
              </div>

              <div className="checkbox-grid">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={includeUpper}
                    onChange={(e) => setIncludeUpper(e.target.checked)}
                  />
                  Uppercase (A-Z)
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={includeLower}
                    onChange={(e) => setIncludeLower(e.target.checked)}
                  />
                  Lowercase (a-z)
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                  Numbers (0-9)
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                  Symbols (!@#...)
                </label>
              </div>

              <div className="field">
                <label className="switch-label">
                  <span>Exclude Ambiguous (I, l, 1, O, 0, |)</span>
                  <input
                    type="checkbox"
                    checked={excludeAmbiguous}
                    onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  />
                  <span className="switch-track">
                    <span className="switch-thumb"></span>
                  </span>
                </label>
              </div>
            </>
          )}

          {mode === 'passphrase' && (
            <>
              <div className="field">
                <label>Passphrase Source</label>
                <div className="toggle-toggle" style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    style={{ flex: 1, padding: '8px', border: 'none', background: passphraseSource === 'words' ? 'var(--accent)' : 'transparent', color: passphraseSource === 'words' ? '#0A0A0F' : 'var(--text-sec)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    onClick={() => setPassphraseSource('words')}
                  >
                    Common Words
                  </button>
                  <button
                    type="button"
                    style={{ flex: 1, padding: '8px', border: 'none', background: passphraseSource === 'syllables' ? 'var(--accent)' : 'transparent', color: passphraseSource === 'syllables' ? '#0A0A0F' : 'var(--text-sec)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    onClick={() => setPassphraseSource('syllables')}
                  >
                    Phonetic Syllables
                  </button>
                </div>
              </div>

              <div className="field">
                <div className="field-header">
                  <label htmlFor="wordCount">Word/Block Count</label>
                  <span className="field-value">{wordCount}</span>
                </div>
                <input
                  id="wordCount"
                  type="range"
                  className="slider"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                />
              </div>

              <div className="field">
                <div className="field-header">
                  <label htmlFor="separator">Word Separator</label>
                </div>
                <div className="btn-group" id="separator" style={{ marginTop: '4px' }}>
                  {(['hyphen', 'dot', 'underscore', 'space', 'none'] as Separator[]).map((sep) => (
                    <button
                      key={sep}
                      type="button"
                      className={`grp-btn ${separator === sep ? 'active' : ''}`}
                      onClick={() => setSeparator(sep)}
                      style={{ fontSize: '0.8rem', padding: '8px 2px' }}
                    >
                      {sep === 'hyphen' ? 'Hyphen (-)' : sep === 'dot' ? 'Dot (.)' : sep === 'underscore' ? 'Underscore (_)' : sep === 'space' ? 'Space' : 'None'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'dev' && (
            <div className="field">
              <label>Select Developer Key Format</label>
              <div className="dev-presets-grid" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className={`preset-btn grp-btn ${devPreset === 'uuid' ? 'active' : ''}`}
                  onClick={() => setDevPreset('uuid')}
                >
                  UUID v4
                </button>
                <button
                  type="button"
                  className={`preset-btn grp-btn ${devPreset === 'hex128' ? 'active' : ''}`}
                  onClick={() => setDevPreset('hex128')}
                >
                  Hex 128-bit
                </button>
                <button
                  type="button"
                  className={`preset-btn grp-btn ${devPreset === 'hex256' ? 'active' : ''}`}
                  onClick={() => setDevPreset('hex256')}
                >
                  Hex 256-bit
                </button>
                <button
                  type="button"
                  className={`preset-btn grp-btn ${devPreset === 'b64-256' ? 'active' : ''}`}
                  onClick={() => setDevPreset('b64-256')}
                >
                  Base64 256-bit
                </button>
                <button
                  type="button"
                  className={`preset-btn grp-btn ${devPreset === 'b64-512' ? 'active' : ''}`}
                  onClick={() => setDevPreset('b64-512')}
                >
                  Base64 512-bit
                </button>
              </div>
            </div>
          )}

          {/* Custom Word Inclusion */}
          {mode !== 'dev' && (
            <div className="custom-word-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', marginBottom: '16px' }}>
              <div className="field-header">
                <label htmlFor="customWord" style={{ fontSize: '0.85rem', color: 'var(--text-sec)', fontWeight: 600 }}>🔤 Include Custom Word</label>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  id="customWord"
                  type="text"
                  placeholder="e.g. Hero, Secure"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value.replace(/\s/g, ''))}
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                <select
                  value={customWordPos}
                  onChange={(e) => setCustomWordPos(e.target.value as 'start' | 'end' | 'random')}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="random">At Random Position</option>
                  <option value="start">At Start</option>
                  <option value="end">At End</option>
                </select>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-mute)', marginTop: '4px' }}>
                Injects your custom word into the generated token. Spaces are auto-removed.
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="field">
            <div className="field-header">
              <label>Generation Quantity</label>
            </div>
            <div className="btn-group" style={{ marginTop: '4px' }}>
              {[1, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`grp-btn ${quantity === num ? 'active' : ''}`}
                  onClick={() => setQuantity(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

          <button type="button" className="gen-btn" onClick={generate}>
            ⚡ Generate Key
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-mute)', marginTop: '8px' }}>
            Tip: Press [Space] or [Enter] on the page background to generate again
          </div>
        </div>

        {/* OUTPUTS CARD */}
        {passwords.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔑 Generated Token</span>
              {passwords.length > 1 && (
                <button type="button" className="clear-btn" onClick={handleCopyAll} style={{ color: 'var(--accent)' }}>
                  {copyAllText}
                </button>
              )}
            </div>

            <div className="output-list">
              {passwords.map((pwd, idx) => (
                <div key={idx} className="output-row">
                  <span className="pwd-text">{pwd}</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopySingle(pwd, idx)}
                  >
                    {copiedStates[idx] ? '✓ Copied' : '⎘ Copy'}
                  </button>
                </div>
              ))}
            </div>

            {/* Strength Meter section */}
            <div className="strength-section">
              <div className="strength-header">
                <span className="strength-title">Entropy Rating</span>
                <span className="strength-label-val" style={{ color: color }}>
                  {strength}
                </span>
              </div>
              <div className="strength-bar-container">
                <div
                  className="strength-bar"
                  style={{ width: `${strengthPercent}%`, backgroundColor: color }}
                ></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-mute)' }}>
                <span>Entropy: {entropy.toFixed(1)} bits</span>
                <span>Pool size: {mode === 'dev' ? 'N/A' : (mode === 'passphrase' ? (passphraseSource === 'words' ? wordlist.length : syllables.length) : (excludeAmbiguous ? 85 : 91))}</span>
              </div>

              {/* Time-to-crack Estimation */}
              <div className="crack-time-info">
                <span className="crack-time-lbl">Estimated crack time (GPU cluster):</span>
                <span className="crack-time-val">{getCrackTime(entropy)}</span>
              </div>
            </div>

            <p className="security-note">
              Keys are generated fully locally using Cryptographically Secure Pseudo-Random Number Generators (CSPRNG) inside your browser. No transmission occurs.
            </p>
          </div>
        )}

        {/* HISTORY PANEL */}
        <div className="card history-card-wrap">
          <div className="history-header">
            <div className="card-title" style={{ marginBottom: 0 }}>📜 Historical Log (Session Only)</div>
            {history.length > 0 && (
              <button type="button" className="clear-btn" onClick={handleClearHistory}>
                🗑 Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-empty">No history recorded yet.</div>
          ) : (
            <div className="history-list">
              {history.map((item, idx) => (
                <div key={item.id} className="output-row" style={{ padding: '8px 12px' }}>
                  <span className="pwd-text" style={{ fontSize: '0.92rem', color: 'var(--text-sec)' }}>{item.val}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-mute)' }}>{item.timestamp}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopySingle(item.val, idx + 1000)}
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    >
                      {copiedStates[idx + 1000] ? '✓ Copied' : '⎘ Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ SECTION */}
        <div className="card faq-card">
          <div className="card-title">❓ Frequently Asked Questions (FAQ)</div>
          <div className="faq-list">
            {[
              {
                q: "Is my custom word or password transmitted to any server?",
                a: "No. CryptPass runs entirely inside your browser's local sandbox using the W3C Web Cryptography API (CSPRNG). No passwords, custom words, or parameters are sent over the network."
              },
              {
                q: "How does adding a custom word affect my password strength?",
                a: "Including a custom word increases password memorability but may lower total entropy compared to pure random keys, unless the custom word itself is highly complex. Position randomization helps prevent basic dictionary attacks."
              },
              {
                q: "What is the difference between entropy and character length?",
                a: "Length is the number of characters, while entropy (measured in bits) represents the mathematical complexity. Higher entropy means more guesses are required to crack the key using brute-force search."
              },
              {
                q: "What are pronounceable phonetic syllables?",
                a: "Syllable-based passphrases combine vowel-consonant blocks (like 'bafidu') to make passwords easy to pronounce and remember while remaining highly secure against automated crackers."
              }
            ].map((item, index) => (
              <div key={index} className={`faq-item ${faqActive === index ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={faqActive === index}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">{faqActive === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <p className="footer-author">
          Built by <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp;
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
          <br />
          B.Tech CSE · NIAMT Ranchi
        </p>
        <a className="dh-btn" href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Built for Digital Heroes
        </a>
      </footer>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="toast" id="toast-banner"></div>
    </>
  );
}
