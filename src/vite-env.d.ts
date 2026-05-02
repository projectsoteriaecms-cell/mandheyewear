/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  /** Snap Camera Kit Web API Token — public/client-side safe by design. */
  readonly VITE_SNAP_CAMERA_KIT_TOKEN?: string;
  /** Snap Camera Kit Lens Group ID containing M&H lenses. */
  readonly VITE_SNAP_LENS_GROUP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
