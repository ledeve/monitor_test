document.addEventListener("DOMContentLoaded", () => {
    const outline = document.querySelector(".outline ul");
    const sections = document.querySelectorAll("h1");

    // Generate outline dynamically
    sections.forEach((section, index) => {
        const sectionId = `section${index + 1}`;
        section.setAttribute("id", sectionId); // Add unique ID to each section

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${sectionId}`;
        a.textContent = section.textContent;

        li.appendChild(a);
        outline.appendChild(li);
    });

    // Scroll highlighting
    window.addEventListener("scroll", () => {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 60) {
                currentSection = section.getAttribute("id");
            }
        });

        document.querySelectorAll(".outline a").forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });
});