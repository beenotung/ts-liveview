# Guidelines for AI agents

**Check docs and code first**  
Before changing behavior, read any relevant docs (e.g. `docs/reference-*.md`) and **`tasks/*.md`** that touch the area. Follow existing store/helpers and data model; don't reintroduce deprecated fields or duplicate sources of truth.

---

**Keep related UIs in sync**  
When you change one flow (e.g. edit profile), check sibling flows (e.g. setup profile) and keep layout, wording, validation, and styles consistent so the product feels like one system.

---

**Respect naming and copy**  
Use the same terms and variable names as the rest of the codebase. Avoid redundant copy (e.g. don't repeat the same limit in two places in one section).

---

**Preserve validation and data shape**  
When extending a feature, keep client and server validation aligned and don't change indexing or display order in a way that breaks existing pages or stores.

---

**Minimal git diff**  
Change only what the task needs. Don't reformat, rewrap, or "fix" unrelated style; don't reorder imports or touch unused code. Smaller diffs are easier to review and less risky.

---

**Readability over brevity**  
"Concise" and "minimal" refer to scope and avoiding redundancy, not compressing code. New or edited code (e.g. CSS, JS) should follow the file's existing formatting and stay readable (e.g. one CSS property per line for multi-property rules, clear line breaks). Do not sacrifice readability for fewer lines.

---

**Edit before adding**  
Prefer changing existing files and reusing existing helpers over adding new files or duplicating logic. Create new files only when the task clearly requires them.

---

**Verify after edits**  
Run or check the linter on changed files and fix any new issues you introduced. Don't assume the change is correct without a quick sanity check.

---

**Prefer static imports**  
Use top-level `import` instead of `await import(...)` unless there is a clear reason (e.g. optional/heavy dependency, deliberate code-splitting). Static imports surface missing or broken dependencies at startup time instead of when that code path runs later.

---

**Prefer early-return helpers for multi-condition checks**  
When the logic is "check several conditions and then branch," use a small function with early returns (e.g. if condition A fails return false; if B fails return false; … return true) instead of many booleans and nested if. Keeps the main flow readable and avoids mistakes.

---

**Role and permission checks**  
When the project has auth and roles (e.g. admin, staff):

- **UI / "who sees what":** Prefer **specific user flags** (e.g. `user.is_admin`, `user.is_staff`, `user.is_editor`) over a single role string when you need different UI for different roles. A single role helper can collapse multiple flags into one value, so "show reduced UI for staff" or "admin-only section" should check the flag, not the role.
- **Gates:** When a feature is gated by role or permission (e.g. admin-only page, staff API), use the **same condition everywhere**: page auth, API auth, and any query/param checks. Avoid opening a feature on one page while leaving another (e.g. target page or API) still restricted.

---

**Document completed decisions in the right place**  
This file is for general rules only. When work is done that future changes should respect (decisions, where things live, what not to redo), add or update `tasks/*.md` or other project docs. Don't put completed-task context here.

---

**Back / return URLs**  
On list or detail pages, the back button should go to the **parent or hub** (e.g. list or dashboard), not to the same page. Avoid `return_url` or back targets that point to the current page.

---

**Minimal, page-specific headers**  
Don't duplicate full branding or layout on every page unless the product clearly needs it. Prefer a simple, page-specific header (e.g. screen title and back button).

---

**Input normalization (trim, etc.) on the input**  
Do trim and similar normalization in the **input's `onchange` or `onblur`**, not in the form's `onsubmit`. That way the value is normalized as the user edits and submit handlers stay simple.

---

**Include the plugin when using toast / Swal / modal helpers**  
If a page uses `showToast`, `Swal.fire`, or other UI helpers from a plugin, **include that plugin in the page output** (e.g. `sweetAlertPlugin.node`). Otherwise the call runs at runtime and fails because the script wasn't loaded. When adding feedback (toast, confirm, alert) to a page, check how similar pages do it and include the same plugin.

---

**No blocking browser dialogs**  
Do not use `alert(...)`, `confirm(...)`, or `prompt(...)`. They block the JS runtime and can disconnect the WebSocket. Use SweetAlert2 (`Swal.fire`) for confirmations, success/error messages, and user input so the UI stays non-blocking. Include the SweetAlert plugin on the page when using `Swal`.

---

**Database: proxy for simple CRUD, prepared statements for complex**  
For simple single-table CRUD, use the **proxy** and **filter / find / pick** helper functions with static type checking. Use **prepared statements** when the query is complex (joins, subqueries, etc.).

---

**Prepared statement typing and parameters (when using raw `db.prepare`)**  
Define statements at **top level** (module or file scope), not inside request or page functions, so bad SQL is caught at startup. Specify generic types: `db.prepare<Params, RowType>(...)`. The result type is the **single-row** type; `.all()` returns `RowType[]` and `.get(...)` returns `RowType | undefined`. Do not use `as any` on the result of `.all()` or `.get()`. Use **named parameters** in SQL (e.g. `WHERE id = :id`) and pass a **single object** to `.get()`, `.all()`, and `.run()` — e.g. `stmt.get({ id })`, `stmt.all({ type })`, `stmt.run({ id, name })`. Avoid positional placeholders (`?`) and passing multiple positional arguments.

---

**Navigation: use Link (SPA), not plain ion-button href or JS**  
Use **`<Link href="...">`** or **`<Link tagName="ion-button" href="...">`** (or an IonButton component that uses Link) so the router does SPA navigation. Plain **`<ion-button href="...">`** or **`<a href="...">`** without Link causes a full page refresh. Do not use `onclick="location.href = ..."` for navigation. Use `Redirect` only for post-submit or conditional redirects.

**Link default tagName is `a`**  
Do not write **`tagName="a"`** on `<Link>`; it is the default. Only specify **`tagName`** when you need a different element (e.g. `tagName="ion-button"`, `tagName="ion-item"`).

---

**Return / back link in page flows**  
When a page has a back/return button or is reachable from multiple entry points, make the return target **conditional** using **`return_url`** from the query (e.g. `backHref = getContextSearchParams(context)?.get('return_url') || '/default-page'`). When linking to that page from elsewhere, pass **`?return_url=<current-or-referrer-page>`** so the user returns to the right place. Avoid hardcoding a single return target.

---

**Locale in JSX vs `t` for composed strings**  
Use **`<Locale />`** in JSX for translatable UI text. Use **`t = makeText(context)`** and **`t({ en, zh_hk, zh_cn })`** only when building a string in code (toast, throw, email, etc.).

---

**Prefer JSX over HTML-in-string for DOM**  
When building UI that gets inserted into the page, use **JSX markup with `id` or stable selectors** and reference those elements in code. Do not use `innerHTML`, template literals that build tags, or string concatenation for markup. JSX gives type safety, auto-escaping (XSS safety), easier passing of server-side variables, syntax highlighting, and better tooling. Don't add new string-based markup.
