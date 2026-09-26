import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  toggle(event) {
    event.stopPropagation()
    this.menuTarget.classList.toggle("dropdown-menu--open")
    document.addEventListener("click", this._close.bind(this), { once: true })
  }

  _close() {
    if (this.menuTarget) {
      this.menuTarget.classList.remove("dropdown-menu--open")
    }
  }
}
