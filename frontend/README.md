# Study Mate — frontend

React 19 + Vite + Tailwind CSS 4, in English, Russian and Kazakh. See the [main README](../README.md) for the whole project.

```bash
npm install
npm run dev      # http://localhost:5173, forwards /api to http://localhost:8080
npm run lint
npm run build    # static files in dist/
```

In Docker the built files are served by nginx (`nginx/default.conf.template`), which also forwards `/api`
to the backend given in `BACKEND_URL`.

| Folder | What is there |
| --- | --- |
| `src/pages/` | One file per screen (Login, Browse, Create, Group details, Applicants, My groups, Requested, Profile) |
| `src/components/` | Parts of those screens, grouped by screen; shared ones in `common/` |
| `src/api.js` | Every call to the backend, plus date and time helpers |
| `src/translations/` | Texts in `en`, `ru` and `kz` (same keys in each) |
