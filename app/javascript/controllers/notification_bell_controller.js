// notification_bell_controller.js
// Polls the admin unread-count endpoint every 30 s.
// When a new unread notification arrives while the page is open, it plays
// a short beep (synthesised via Web Audio — no server assets needed) and
// shows a dismissible toast in the bottom-right corner.
//
// Usage (added to _header.html.erb):
//   data-controller="notification-bell"
//   data-notification-bell-url-value="/admin/notifications/unread_count"
//   data-notification-bell-interval-value="30"   (seconds, optional, default 30)

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url:      { type: String,  default: "/admin/notifications/unread_count" },
    interval: { type: Number,  default: 30 }   // seconds between polls
  }

  connect() {
    this._lastCount = null
    this._initAudio()
    this._poll()
    this._timer = setInterval(() => this._poll(), this.intervalValue * 1000)

    // Expose sound test helper for debugging or manual preview
    window.testNotificationSound = () => this._playBeep()
  }

  _initAudio() {
    this._unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (AudioCtx) {
          if (!this._audioCtx) this._audioCtx = new AudioCtx()
          if (this._audioCtx.state === "suspended") this._audioCtx.resume()
        }
      } catch (_) {}
    }
    document.addEventListener("click", this._unlockAudio, { once: true })
    document.addEventListener("keydown", this._unlockAudio, { once: true })
  }

  disconnect() {
    clearInterval(this._timer)
  }

  // ── private ──────────────────────────────────────────────────────────────

  async _poll() {
    try {
      const res  = await fetch(this.urlValue, { headers: { "Accept": "application/json" } })
      if (!res.ok) return
      const data = await res.json()
      const count = data.unread_count ?? 0

      // Update the badge in the header
      this._updateBadge(count)

      // First poll: just record baseline, don't alert on page load
      if (this._lastCount === null) {
        this._lastCount = count
        return
      }

      // New notifications arrived since last poll
      if (count > this._lastCount) {
        this._playBeep()
        this._showToast(count - this._lastCount)
      }

      this._lastCount = count
    } catch (_) {
      // Network error — silently ignore, will retry
    }
  }

  _updateBadge(count) {
    const badge = document.getElementById("notification-badge")
    if (!badge) return
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count
      badge.classList.remove("d-none")
    } else {
      badge.classList.add("d-none")
    }
  }

  _playBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = this._audioCtx && this._audioCtx.state !== "closed" ? this._audioCtx : new AudioCtx()
      this._audioCtx = ctx

      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const now = ctx.currentTime

      // High-volume, rich dual-tone chime (Note 1: 880Hz A5, Note 2: 1318.5Hz E6)
      const playTone = (freq, startTime, duration, peakGain) => {
        // Primary oscillator (sine)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, startTime)

        // Harmonic overtone (triangle for acoustic punch & body)
        const harm = ctx.createOscillator()
        const harmGain = ctx.createGain()
        harm.type = "triangle"
        harm.frequency.setValueAtTime(freq * 2, startTime)

        // Master gain for this tone
        gain.gain.setValueAtTime(0.01, startTime)
        gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        harmGain.gain.setValueAtTime(0.005, startTime)
        harmGain.gain.linearRampToValueAtTime(peakGain * 0.35, startTime + 0.02)
        harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7)

        osc.connect(gain)
        harm.connect(harmGain)
        gain.connect(ctx.destination)
        harmGain.connect(ctx.destination)

        osc.start(startTime)
        harm.start(startTime)
        osc.stop(startTime + duration)
        harm.stop(startTime + duration)
      }

      // First loud chime (880Hz, peak volume 0.80)
      playTone(880, now, 0.28, 0.80)

      // Second loud chime (1318.5Hz, peak volume 0.90) - rings out brightly
      playTone(1318.5, now + 0.16, 0.48, 0.90)
    } catch (_) {
      // AudioContext blocked — ignore
    }
  }

  _showToast(newCount) {
    // Remove any existing toast first
    document.getElementById("bc-notif-toast")?.remove()

    const toast = document.createElement("div")
    toast.id = "bc-notif-toast"
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "assertive")
    toast.style.cssText = [
      "position:fixed", "bottom:24px", "right:24px", "z-index:9999",
      "min-width:288px", "max-width:360px",
      "background:var(--surface,#1e293b)", "color:var(--text-1,#f1f5f9)",
      "border:1px solid var(--border,#334155)", "border-radius:14px",
      "box-shadow:0 8px 32px rgba(0,0,0,0.35)",
      "padding:14px 16px", "display:flex", "align-items:flex-start", "gap:12px",
      "backdrop-filter:blur(12px)", "-webkit-backdrop-filter:blur(12px)",
      "animation:bc-slide-in 0.25s cubic-bezier(0.16,1,0.3,1)"
    ].join(";")

    toast.innerHTML = `
      <style>
        @keyframes bc-slide-in {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      </style>
      <span style="font-size:22px;line-height:1;flex-shrink:0">🔔</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:0.875rem;margin-bottom:2px">
          ${newCount === 1 ? "1 new notification" : `${newCount} new notifications`}
        </div>
        <a href="/admin/notifications"
           style="font-size:0.8rem;color:var(--accent,#0a84ff);text-decoration:none;"
           onclick="document.getElementById('bc-notif-toast')?.remove()">
          View all notifications →
        </a>
      </div>
      <button onclick="document.getElementById('bc-notif-toast')?.remove()"
              style="background:none;border:none;color:var(--text-3,#94a3b8);cursor:pointer;font-size:16px;line-height:1;padding:0;flex-shrink:0"
              aria-label="Dismiss">✕</button>
    `

    document.body.appendChild(toast)

    // Auto-dismiss after 8 seconds
    setTimeout(() => toast.remove(), 8000)
  }
}
