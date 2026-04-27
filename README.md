# Gift Aura (Cloud-Ready React + TypeScript + Tailwind)

Premium single-page ecommerce storefront for **Gift Aura**.

## One-click cloud deployment (no CLI required)

### Deploy to Vercel (recommended)
1. Open your GitHub repo in browser.
2. Click this link and import the repo:
   - `https://vercel.com/new`
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.

### Deploy to Netlify
1. Open: `https://app.netlify.com/start`
2. Import this GitHub repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy site.

## Edit later without terminal
- Use **GitHub Web Editor** (`.` key in repo) or **github.dev**.
- Or connect repo in **CodeSandbox** / **StackBlitz** and edit in browser.

## Project structure
- `src/GiftAura.tsx` → main storefront component
- `src/App.tsx` → app shell
- `src/main.tsx` → React mount
- `src/index.css` → Tailwind imports
- `tailwind.config.js`, `postcss.config.js` → Tailwind setup
- `vite.config.ts` → Vite config
