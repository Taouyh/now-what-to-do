/** Keep the underlying page stable while the Android IME resizes the editor. */
export class MobileViewport {
  private open = false;
  private settling = false;
  private quietTimer: ReturnType<typeof setTimeout> | undefined;
  private limitTimer: ReturnType<typeof setTimeout> | undefined;
  private reflow: () => void;

  constructor(reflow: () => void) {
    this.reflow = reflow;
    const resize = () => {
      this.updateEditorSize();
      if (this.settling) this.waitForQuiet();
    };
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('scroll', resize);
  }

  get frozen() { return this.open || this.settling; }

  private updateEditorSize() {
    const viewport = window.visualViewport;
    document.body.style.setProperty('--editor-height', `${viewport?.height || innerHeight}px`);
    document.body.style.setProperty('--editor-top', `${viewport?.offsetTop || 0}px`);
  }

  begin() {
    if (!document.body.classList.contains('mobile-book')) return;
    if (!this.frozen) document.body.style.setProperty('--mobile-layout-height', `${innerHeight}px`);
    clearTimeout(this.quietTimer);
    clearTimeout(this.limitTimer);
    this.open = true;
    this.settling = false;
    this.updateEditorSize();
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.settling = true;
    // Do not wait for the keyboard animation before hiding the dialog.
    (document.activeElement as HTMLElement | null)?.blur();
    (window as Window & { nativeApp?: { dismissKeyboard?: () => void } }).nativeApp?.dismissKeyboard?.();
    this.waitForQuiet();
    this.limitTimer = setTimeout(() => this.release(), 800);
  }

  private waitForQuiet() {
    clearTimeout(this.quietTimer);
    this.quietTimer = setTimeout(() => this.release(), 180);
  }

  private release() {
    if (this.open) return;
    clearTimeout(this.quietTimer);
    clearTimeout(this.limitTimer);
    this.settling = false;
    document.body.style.removeProperty('--mobile-layout-height');
    this.reflow();
  }
}
