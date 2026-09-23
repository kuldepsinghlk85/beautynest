import { Controller } from "@hotwired/stimulus"
import { Turbo } from "@hotwired/turbo-rails"

export default class extends Controller {
  connect() {
    this.setupTurboConfirm()
  }

  setupTurboConfirm() {
    if (window._confirmModalConfigured) return
    window._confirmModalConfigured = true

    Turbo.setConfirmMethod((message, element) => {
      return new Promise((resolve) => {
        const modal = document.getElementById("global-confirm-modal")
        const backdrop = document.getElementById("global-confirm-backdrop")

        if (!modal || !backdrop) {
          // Fallback if modal DOM is missing
          resolve(window.confirm(message))
          return
        }

        const titleEl = document.getElementById("confirm-modal-title")
        const messageEl = document.getElementById("confirm-modal-message")
        const detailEl = document.getElementById("confirm-modal-detail")
        const confirmBtn = document.getElementById("confirm-modal-confirm")
        const confirmBtnText = document.getElementById("confirm-modal-confirm-text")
        const modalIcon = document.getElementById("confirm-modal-icon")
        const btnIcon = document.getElementById("confirm-modal-btn-icon")
        const statusEl = document.getElementById("confirm-modal-status")
        const avatarEl = document.getElementById("confirm-modal-avatar")
        const cancelBtn = document.getElementById("confirm-modal-cancel")
        const closeBtn = document.getElementById("confirm-modal-close")

        // Handle case where element is a form created by button_to
        const trigger = (element?.dataset?.confirmTitle || element?.dataset?.confirmBtn)
          ? element
          : (element?.querySelector ? (element.querySelector("[data-confirm-title], [data-confirm-btn], [data-turbo-confirm]") || element) : element)

        // Populate content intelligently based on action type
        const msg = message || trigger?.dataset?.turboConfirm || ""
        const msgLower = msg.toLowerCase()
        const isAccept = msgLower.includes("accept")
        const isReject = msgLower.includes("reject")
        const isCancel = msgLower.includes("cancel")
        const isDelete = msgLower.includes("delete") || msgLower.includes("remove")

        let defaultTitle = "Confirm Action"
        let defaultBtn = "Confirm"
        let defaultIcon = "ti-alert-circle"
        let themeColor = "primary"

        if (isAccept) {
          defaultTitle = "Accept Booking"
          defaultBtn = "Accept Booking"
          defaultIcon = "ti-check"
          themeColor = "success"
        } else if (isReject) {
          defaultTitle = "Reject Booking"
          defaultBtn = "Reject Booking"
          defaultIcon = "ti-x"
          themeColor = "danger"
        } else if (isCancel) {
          defaultTitle = "Cancel Booking"
          defaultBtn = "Confirm Cancellation"
          defaultIcon = "ti-alert-triangle"
          themeColor = "warning"
        } else if (isDelete) {
          defaultTitle = "Confirm Deletion"
          defaultBtn = "Delete"
          defaultIcon = "ti-trash"
          themeColor = "danger"
        }

        const title = trigger?.dataset?.confirmTitle || defaultTitle
        const confirmText = trigger?.dataset?.confirmBtn || defaultBtn
        const iconClass = trigger?.dataset?.confirmIcon || defaultIcon
        const theme = trigger?.dataset?.confirmTheme || themeColor
        const detail = trigger?.dataset?.confirmDetail || ""

        if (titleEl) titleEl.textContent = title
        if (messageEl) messageEl.textContent = msg || "Are you sure you want to continue?"
        if (confirmBtnText) confirmBtnText.textContent = confirmText
        if (modalIcon) modalIcon.className = `ti ${iconClass} fs-1`
        if (btnIcon) btnIcon.className = `ti ${iconClass} me-1`

        // Dynamic theme colors (success, danger, warning, primary)
        if (statusEl) {
          statusEl.className = `modal-status bg-${theme}`
        }
        if (avatarEl) {
          avatarEl.className = `avatar avatar-lg rounded-circle bg-${theme}-subtle text-${theme} mx-auto mb-3`
        }
        if (confirmBtn) {
          confirmBtn.className = `btn btn-${theme} w-100 fw-semibold shadow-sm`
        }

        if (detailEl) {
          if (detail) {
            detailEl.textContent = detail
            detailEl.style.display = "block"
          } else {
            detailEl.style.display = "none"
          }
        }

        // Show modal & backdrop
        backdrop.style.display = "block"
        backdrop.style.opacity = "0.6"
        modal.style.display = "block"
        modal.classList.add("show")

        // Focus cancel button for safety against accidental deletion
        setTimeout(() => cancelBtn?.focus(), 50)

        const cleanup = () => {
          modal.classList.remove("show")
          modal.style.display = "none"
          backdrop.style.display = "none"
          backdrop.style.opacity = "0"
          document.removeEventListener("keydown", handleKeydown)
          confirmBtn?.removeEventListener("click", handleConfirm)
          cancelBtn?.removeEventListener("click", handleCancel)
          closeBtn?.removeEventListener("click", handleCancel)
          modal.removeEventListener("click", handleBackdropClick)
        }

        const handleConfirm = (e) => {
          e.preventDefault()
          cleanup()
          resolve(true)
        }

        const handleCancel = (e) => {
          e.preventDefault()
          cleanup()
          resolve(false)
        }

        const handleBackdropClick = (e) => {
          if (e.target === modal) {
            handleCancel(e)
          }
        }

        const handleKeydown = (e) => {
          if (e.key === "Escape") {
            handleCancel(e)
          }
        }

        confirmBtn?.addEventListener("click", handleConfirm)
        cancelBtn?.addEventListener("click", handleCancel)
        closeBtn?.addEventListener("click", handleCancel)
        modal.addEventListener("click", handleBackdropClick)
        document.addEventListener("keydown", handleKeydown)
      })
    })
  }
}
