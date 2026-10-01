interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SUGGESTION_DEBOUNCE?: string;
  readonly VITE_CSRF_COOKIE_NAME?: string;
  readonly VITE_CSRF_HEADER_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
