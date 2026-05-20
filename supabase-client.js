// ============================================================
// supabase-client.js
// Cliente de conexión a Supabase para Patitas Sanas
// Importa este script en cada HTML ANTES de tu lógica propia:
//   <script src="supabase-client.js"></script>
// ============================================================

// ── Configuración ────────────────────────────────────────────
const SUPABASE_URL = "https://glszipyftpwxrgkbaaye.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsc3ppcHlmdHB3eHJna2JhYXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzY3MjgsImV4cCI6MjA5NDQ1MjcyOH0." +
  "RWlMvfWsOK2XjlAi30i37KnVB8vSSG7uBWPvcoxYnJ4";

// ── Headers reutilizables ────────────────────────────────────
const HEADERS = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

// ── Cliente principal ────────────────────────────────────────
const supabase = {
  // ── URL base por tabla ──────────────────────────────────────
  _url(table) {
    return `${SUPABASE_URL}/rest/v1/${table}`;
  },

  // ── SELECT ──────────────────────────────────────────────────
  // Ejemplo: supabase.select("citas", "select=*&estado=eq.pendiente")
  async select(table, queryString = "select=*") {
    try {
      const res = await fetch(`${this._url(table)}?${queryString}`, {
        method: "GET",
        headers: HEADERS,
      });
      if (!res.ok) throw await res.json();
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`[Supabase] SELECT error en "${table}":`, error);
      return { data: null, error };
    }
  },

  // ── INSERT ──────────────────────────────────────────────────
  // Ejemplo: supabase.insert("citas", { dueno: "Juan", mascota: "Toby" })
  async insert(table, body) {
    try {
      const res = await fetch(this._url(table), {
        method: "POST",
        headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await res.json();
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`[Supabase] INSERT error en "${table}":`, error);
      return { data: null, error };
    }
  },

  // ── UPDATE ──────────────────────────────────────────────────
  // Ejemplo: supabase.update("citas", "id=eq.5", { estado: "pagada" })
  async update(table, filter, body) {
    try {
      const res = await fetch(`${this._url(table)}?${filter}`, {
        method: "PATCH",
        headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await res.json();
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`[Supabase] UPDATE error en "${table}":`, error);
      return { data: null, error };
    }
  },

  // ── DELETE ──────────────────────────────────────────────────
  // Ejemplo: supabase.delete("citas", "id=eq.5")
  async delete(table, filter) {
    try {
      const res = await fetch(`${this._url(table)}?${filter}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      if (!res.ok) throw await res.json();
      return { data: null, error: null };
    } catch (error) {
      console.error(`[Supabase] DELETE error en "${table}":`, error);
      return { data: null, error };
    }
  },

  // ── AUTH: Registro ──────────────────────────────────────────
  async signUp(email, password) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error("[Supabase] signUp error:", error);
      return { user: null, session: null, error };
    }
  },

  // ── AUTH: Login ─────────────────────────────────────────────
  async signIn(email, password) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw data;

      // Guardar sesión en localStorage para reusarla entre páginas
      localStorage.setItem("sb_session", JSON.stringify(data));
      return { user: data.user, session: data, error: null };
    } catch (error) {
      console.error("[Supabase] signIn error:", error);
      return { user: null, session: null, error };
    }
  },

  // ── AUTH: Logout ────────────────────────────────────────────
  async signOut() {
    const session = this.getSession();
    try {
      if (session) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            ...HEADERS,
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem("sb_session");
    }
  },

  // ── AUTH: Sesión activa ─────────────────────────────────────
  getSession() {
    const raw = localStorage.getItem("sb_session");
    return raw ? JSON.parse(raw) : null;
  },

  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },
};

console.log("[Supabase] Cliente listo →", SUPABASE_URL);
