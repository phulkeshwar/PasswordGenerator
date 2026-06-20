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

type Separator = 'hyphen' | 'dot' | 'underscore' | 'space' | 'none';
type StrengthLabel = 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

interface HistoryItem {
  id: string;
  val: string;
  timestamp: string;
}

export default function App() {
  // Mode State: 'random' | 'passphrase'
  const [mode, setMode] = useState<'random' | 'passphrase'>('random');

  // Random Mode Controls
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  // Passphrase Mode Controls
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<Separator>('hyphen');

  // Shared Controls
  const [quantity, setQuantity] = useState<number>(1);

  // Output State
  const [passwords, setPasswords] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
  const [copyAllText, setCopyAllText] = useState<string>('⎘ Copy All');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load History on Mount
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

  // Secure Random Number Generator Helper using Web Crypto
  const secureRandomInt = (max: number): number => {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Secure mapping to integer
    return Math.floor((array[0] / 4294967296) * max);
  };

  // Generate Passwords Function
  const generate = useCallback(() => {
    setErrorMsg(null);

    // Passphrase Mode Generation
    if (mode === 'passphrase') {
      const generated: string[] = [];
      const sepChars = {
        hyphen: '-',
        dot: '.',
        underscore: '_',
        space: ' ',
        none: '',
      };
      const activeSep = sepChars[separator];

      for (let q = 0; q < quantity; q++) {
        const words: string[] = [];
        for (let w = 0; w < wordCount; w++) {
          const randIdx = secureRandomInt(wordlist.length);
          words.push(wordlist[randIdx]);
        }
        generated.push(words.join(activeSep));
      }

      setPasswords(generated);
      addToHistory(generated);
      return;
    }

    // Random Mode Generation
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
      // Remove ambiguous characters: I, l, 1, O, 0, |
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
      for (let l = 0; l < length; l++) {
        const randIdx = secureRandomInt(charPool.length);
        pwd += charPool[randIdx];
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
    quantity,
  ]);

  // Generate on load
  useEffect(() => {
    generate();
  }, [generate]);

  // Handle Add to History
  const addToHistory = (newPwds: string[]) => {
    setHistory((prev) => {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const items: HistoryItem[] = newPwds.map((pwd, idx) => ({
        id: Math.random().toString(36).substr(2, 9) + idx, // Simple non-predictable client ID
        val: pwd,
        timestamp: nowStr,
      }));
      // Keep only last 10
      const updated = [...items, ...prev].slice(0, 10);
      sessionStorage.setItem('pwd_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const active = document.activeElement;
        // Do not trigger generator if user is focusing inputs
        if (
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'BUTTON')
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

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('pwd_history');
  };

  // Copy Single Password
  const handleCopySingle = (val: string, index: number) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    });
  };

  // Copy All Passwords (newline-separated)
  const handleCopyAll = () => {
    if (passwords.length === 0) return;
    navigator.clipboard.writeText(passwords.join('\n')).then(() => {
      setCopyAllText('✓ Copied All!');
      setTimeout(() => setCopyAllText('⎘ Copy All'), 2000);
    });
  };

  // Entropy Calculation
  // Entropy = length * log2(pool_size)
  const calculateEntropy = (): { entropy: number; strength: StrengthLabel; color: string } => {
    if (mode === 'passphrase') {
      // In passphrase mode, pool size is wordlist size (200)
      const entropy = wordCount * Math.log2(wordlist.length); // 200 words -> ~7.64 bits per word
      let strength: StrengthLabel = 'Weak';
      let color = 'var(--weak)';

      if (entropy >= 45) {
        strength = 'Very Strong';
        color = 'var(--very-strong)';
      } else if (entropy >= 35) {
        strength = 'Strong';
        color = 'var(--strong)';
      } else if (entropy >= 22) {
        strength = 'Fair';
        color = 'var(--fair)';
      }
      return { entropy, strength, color };
    }

    // Random Mode Pool Size
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

    const poolSize = charPool.length;
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
    } else if (entropy >= 40) {
      strength = 'Fair';
      color = 'var(--fair)';
    }

    return { entropy, strength, color };
  };

  const { entropy, strength, color } = calculateEntropy();

  // Width of strength bar percentage
  const strengthPercent = Math.min(100, (entropy / 105) * 100);

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="logo">
          <span>🔒 CryptPass</span>
          <span className="logo-badge">SECURE</span>
        </div>
        <div className="author-chip">
          By <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp;
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">Digital Heroes Trial · Tool 5</div>
        <h1>Secure <span>Password Generator</span></h1>
        <p>
          Generate strong, random passwords using the Web Crypto API. Fully client-side, zero server logs.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* INPUT CONTROLS CARD */}
        <div className="card">
          <div className="card-title">⚙️ Generator Controls</div>

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
          </div>

          {/* Mode-Specific Settings */}
          {mode === 'random' ? (
            <>
              {/* Length Selector */}
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

              {/* Character set options */}
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

              {/* Exclude Ambiguous Characters Switch */}
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
          ) : (
            <>
              {/* Passphrase Word Count */}
              <div className="field">
                <div className="field-header">
                  <label htmlFor="wordCount">Number of Words</label>
                  <span className="field-value">{wordCount}</span>
                </div>
                <input
                  id="wordCount"
                  type="range"
                  className="slider"
                  min="3"
                  max="6"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                />
              </div>

              {/* Passphrase Separator Selector */}
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

          {/* Number of Passwords (Quantity Selector) */}
          <div className="field">
            <div className="field-header">
              <label>Passwords to Generate</label>
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

          {/* Generate Action Button */}
          <button type="button" className="gen-btn" onClick={generate}>
            ⚡ Generate Passwords
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-mute)', marginTop: '8px' }}>
            Tip: Press [Space] or [Enter] on your keyboard to regenerate
          </div>
        </div>

        {/* OUTPUTS CARD */}
        {passwords.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔑 Generated Output</span>
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
                <span className="strength-title">Password Strength</span>
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
              <div className="entropy-lbl">
                Entropy: {entropy.toFixed(1)} bits
              </div>
            </div>

            <p className="security-note">
              Passwords are generated entirely in your browser using the Web Crypto API. Nothing is sent to any server.
            </p>
          </div>
        )}

        {/* HISTORY PANEL */}
        <div className="card">
          <div className="history-header">
            <div className="card-title" style={{ marginBottom: 0 }}>📜 History (Current Session)</div>
            {history.length > 0 && (
              <button type="button" className="clear-btn" onClick={handleClearHistory}>
                🗑 Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-empty">No passwords generated in this session yet.</div>
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
    </>
  );
}
