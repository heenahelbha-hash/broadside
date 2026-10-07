// =========================================================
// BROADSIDE - MAIN JAVASCRIPT
// =========================================================


// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


// Add a small press effect to buttons
document.querySelectorAll(".button, .nav-button").forEach(button => {

    button.addEventListener("click", function () {

        this.style.transform = "translate(2px, 2px)";

        setTimeout(() => {

            this.style.transform = "";

        }, 120);

    });

});


// Reveal sections when scrolling
const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {
        threshold: 0.12
    }

);

sections.forEach(section => {

    observer.observe(section);

});


// Press status animation
const greenDot = document.querySelector(".green-dot");

if (greenDot) {

    setInterval(() => {

        greenDot.style.opacity =
            greenDot.style.opacity === "0.4" ? "1" : "0.4";

    }, 1200);

}