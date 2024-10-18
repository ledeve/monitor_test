document.addEventListener("DOMContentLoaded", () => {
    const outline = document.querySelector(".outline ul");
    const headings = document.querySelectorAll("h1, h2"); // Select both h1 and h2

    // Generate outline dynamically
    headings.forEach((heading, index) => {
        const sectionId = `section${index + 1}`;
        heading.setAttribute("id", sectionId); // Add unique ID to each heading

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${sectionId}`;
        a.textContent = heading.textContent;

        // Apply a different class for h2 links to style them differently
        if (heading.tagName === "H2") {
            a.classList.add("h2-link"); // Add the h2-link class for <h2>
        }

        li.appendChild(a);
        outline.appendChild(li);
    });

    // Scroll highlighting
    window.addEventListener("scroll", () => {
        let currentSection = "";

        headings.forEach((heading) => {
            const sectionTop = heading.offsetTop;
            if (window.pageYOffset >= sectionTop - 60) {
                currentSection = heading.getAttribute("id");
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