document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  let lastVisibleSection = null;

  function checkScroll() {
    const viewportHeight = window.innerHeight;
    let sectionInView = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isVisible =
        rect.top < viewportHeight / 1.5 && rect.bottom > viewportHeight / 3;

      if (isVisible) {
        sectionInView = section;
      }
    });

    if (sectionInView) {
      if (lastVisibleSection && lastVisibleSection !== sectionInView) {
        lastVisibleSection.classList.remove("visible");
      }
      sectionInView.classList.add("visible");
      lastVisibleSection = sectionInView;
    } else if (lastVisibleSection) {
      lastVisibleSection.classList.remove("visible");
      lastVisibleSection = null;
    }
  }

  window.addEventListener("scroll", checkScroll);
  checkScroll(); // Llama a la función al cargar la página
});
