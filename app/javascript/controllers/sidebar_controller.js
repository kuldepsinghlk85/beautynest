import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["nav"]

  connect() {
    const saved = localStorage.getItem("bc-sidebar-collapsed")
    if (saved === "true" && window.innerWidth > 992) this.collapse()

    this.closeOnNavigate = () => this.closeMobile()
    document.addEventListener("turbo:before-visit", this.closeOnNavigate)
  }

  disconnect() {
    document.removeEventListener("turbo:before-visit", this.closeOnNavigate)
  }

  toggle() {
    const el = document.querySelector(".sidebar")
    const collapsed = el?.classList.contains("sidebar--collapsed")
    if (collapsed) {
      this.expand()
    } else {
      this.collapse()
    }
  }

  collapse() {
    document.querySelector(".sidebar")?.classList.add("sidebar--collapsed")
    document.querySelector(".main-column")?.classList.add("expanded")
    localStorage.setItem("bc-sidebar-collapsed", "true")
  }

  expand() {
    document.querySelector(".sidebar")?.classList.remove("sidebar--collapsed")
    document.querySelector(".main-column")?.classList.remove("expanded")
    localStorage.setItem("bc-sidebar-collapsed", "false")
  }

  toggleMobile() {
    const sidebar = document.querySelector(".sidebar")
    const overlay = document.querySelector(".sidebar-overlay")
    if (sidebar) {
      const isOpen = sidebar.classList.toggle("sidebar--mobile-open")
      if (overlay) overlay.classList.toggle("sidebar-overlay--visible", isOpen)
      document.body.classList.toggle("sidebar-mobile-locked", isOpen)
    }
  }

  closeMobile() {
    const sidebar = document.querySelector(".sidebar")
    const overlay = document.querySelector(".sidebar-overlay")
    sidebar?.classList.remove("sidebar--mobile-open")
    overlay?.classList.remove("sidebar-overlay--visible")
    document.body.classList.remove("sidebar-mobile-locked")
  }
}
