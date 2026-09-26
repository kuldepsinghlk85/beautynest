import "@hotwired/turbo-rails"
import "controllers"

// Elevate table row and sticky action cell z-index when a dropdown opens
document.addEventListener("show.bs.dropdown", (e) => {
  const btn = e.target;
  const tr = btn.closest("tr");
  if (tr) {
    tr.classList.add("tr-dropdown-open");
    const td = btn.closest("td");
    if (td) td.classList.add("td-dropdown-open");

    // If near bottom of viewport, flip to dropup
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdown = btn.closest(".dropdown");
    if (dropdown) {
      if (spaceBelow < 170 && rect.top > 170) {
        dropdown.classList.add("dropup");
      } else {
        dropdown.classList.remove("dropup");
      }
    }
  }
});

document.addEventListener("hide.bs.dropdown", (e) => {
  const btn = e.target;
  const tr = btn.closest("tr");
  if (tr) {
    tr.classList.remove("tr-dropdown-open");
    const td = btn.closest("td");
    if (td) td.classList.remove("td-dropdown-open");
  }
  const dropdown = btn?.closest?.(".dropdown");
  if (dropdown) dropdown.classList.remove("dropup");
});
