# CryptPass - Secure Password Generator

A free, cryptographically secure, client-side React TypeScript application for password generation. It operates entirely in the browser using the Web Crypto API, meaning no passwords ever leave your machine or get sent to a server.

## Features

1.  **Cryptographic Security**: Passwords are generated using the Web Crypto API's `window.crypto.getRandomValues()` method, ensuring high-entropy, mathematically unpredictable outcomes (strictly avoiding insecure pseudo-random generation like `Math.random()`).
2.  **Flexible Form Modes**:
    *   **Random Characters**: Configure length (8-128, default 16) and choose combinations of Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), and Symbols (`!@#$%^&*...`).
    *   **Memorable Passphrase**: Creates a memorable password using a list of 200 common English words, adjustable word counts (3 to 6 words), and custom separators (hyphen, dot, underscore, space, or none).
3.  **Ambiguous Exclusions**: Optional filter to remove highly ambiguous character glyphs (`I, l, 1, O, 0, |`) from generated strings to prevent transcription errors.
4.  **Math Entropy Meter**: Estimates password strength in bits of entropy using the formula:
    $$\text{Entropy} = \text{length} \times \log_2(\text{pool\_size})$$
    Strength is divided into:
    *   **Weak**: <40 bits (Red bar)
    *   **Fair**: 40-60 bits (Orange bar)
    *   **Strong**: 60-80 bits (Yellow bar)
    *   **Very Strong**: >80 bits (Green bar)
5.  **Multi-Generation**: Select and generate 1, 5, 10, or 20 passwords at once.
6.  **Action Controls**: Individual copy buttons for each password row, and a "Copy All" utility (newline-separated) for bulk operations.
7.  **Tab Session History**: Retains the last 10 passwords generated during the active browser session in `sessionStorage` (cleared automatically when closing the browser tab).
8.  **Keyboard Bindings**: Allows generating a new password instantly by pressing the Space or Enter key while focusing on the page.

---

## Technical Details

*   **Framework**: [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Cryptography**: Native Web Crypto API
*   **Styling**: Pure CSS (featuring glowing cards, smooth color transitions, and custom sliders)
*   **Fonts**: `Space Grotesk` loaded via Google Fonts.

---

## Local Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Navigate to the repository folder:
   ```bash
   cd Passwordgenerator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local dev server:
   ```bash
   npm run dev
   ```
4. Compile for production:
   ```bash
   npm run build
   ```

---

## Deployment

This client-side static web application can be deployed directly to Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository `PasswordGenerator`.
4. Click **Deploy**.

---

## Advanced Features Implemented

*   **API Key & Hash Secret Presets**: Support for Hex keys (128-bit/256-bit), Base64 tokens (256-bit/512-bit), and native UUID v4 formats using secure random bytes.
*   **Time-to-Crack Estimator**: Simulates standard GPU rig guess rates ($10^{10}$ guesses/sec) to show expected brute-force duration in minutes, years, or eons.
*   **Phonetic Pronounceable Passphrases**: Generates secure but easy-to-read passwords by combining random syllables instead of standard English wordlists.

## Submission Details
*   **Developer**: Phulkeshwar Mahto
*   **Email**: [phulkeshwar.e@gmail.com](mailto:phulkeshwar.e@gmail.com)
*   **Organization**: Built for Digital Heroes ([https://digitalheroesco.com](https://digitalheroesco.com))
