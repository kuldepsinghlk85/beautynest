import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    const saved = localStorage.getItem("bc-theme") || "light"
    this.apply(saved)
  }

  toggle() {
    const current = document.documentElement.getAttribute("data-theme") || "light"
    const next = current === "dark" ? "light" : "dark"
    this.apply(next)
    localStorage.setItem("bc-theme", next)
  }

  apply(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
    document.body.setAttribute("data-bs-theme", theme)
    if (theme === "dark") {
      document.body.classList.add("theme-dark")
    } else {
      document.body.classList.remove("theme-dark")
    }
    const btn = document.getElementById("theme-toggle-btn")
    if (btn) {
      const sun = btn.querySelector(".icon-sun")
      const moon = btn.querySelector(".icon-moon")
      if (sun) sun.style.display = theme === "dark" ? "none" : "inline-block"
      if (moon) moon.style.display = theme === "dark" ? "inline-block" : "none"
    }
    window.dispatchEvent(new CustomEvent("theme:changed", { detail: { theme } }))
    if (typeof window.bcInitDashCharts === "function") {
      window.bcInitDashCharts()
    }
  }
}
