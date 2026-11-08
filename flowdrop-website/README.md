# FlowDrop Official Website for GitHub Pages

This is the standalone, production-ready website for **FlowDrop**, pre-configured for deployment to **GitHub Pages** under the base path `/flowdrop-website/`.

## Features

- **Platform-Native Design**: Matches FlowDrop's official branding with electric-blue accents, dark/light theme toggle, and responsive typography.
- **Direct GitHub Releases Downloads**: Download buttons point directly to tagged release assets:
  - Windows: `FlowDrop-Setup-v2.4.0.exe`
  - Android: `FlowDrop-v2.4.0.apk`
- **Automatic Operating System Detection**: Automatically detects whether visitors are on Windows or Android and highlights the relevant installer.
- **Zero Secrets / Zero Backend Dependencies**: Completely static React + Vite build that runs on any CDN or GitHub Pages with no backend or Tauri native requirements.
- **Package Verification**: SHA-256 checksums with one-click copy and installation guide.

## Local Development

```bash
cd flowdrop-website
npm install
npm run dev
```

The dev server will run locally.

## Production Build

```bash
cd flowdrop-website
npm run build
```

This generates optimized static HTML/CSS/JS in `flowdrop-website/dist/`.

## GitHub Pages Deployment

A GitHub Actions workflow is provided at `.github/workflows/deploy-pages.yml`.

### One-Time Setup in GitHub:

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish the site to:
   `https://<username>.github.io/flowdrop-website/`

## Releases Configuration

When publishing a new release:
1. Create a tag matching the release version (e.g. `v2.4.0`).
2. Attach the signed Windows installer (`FlowDrop-Setup-v2.4.0.exe`) and Android package (`FlowDrop-v2.4.0.apk`) to the release.
