// =========================================================
// BROADSIDE - MAIN JAVASCRIPT
// =========================================================

// =========================================================
// SMOOTH SCROLLING
// =========================================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (event) {

        const targetId =
            this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});

// =========================================================
// BUTTON PRESS EFFECT
// =========================================================

document
    .querySelectorAll(".button, .nav-button")
    .forEach(button => {

        button.addEventListener("click", function () {

            this.style.transform =
                "translate(2px, 2px)";

            setTimeout(() => {

                this.style.transform = "";

            }, 120);

        });

    });

// =========================================================
// REVEAL SECTIONS
// =========================================================

const sections =
    document.querySelectorAll(".section");

if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target
                            .classList
                            .add("visible");

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

}

// =========================================================
// PRESS STATUS ANIMATION
// =========================================================

const greenDot =
    document.querySelector(".green-dot");

if (greenDot) {

    setInterval(() => {

        greenDot.style.opacity =
            greenDot.style.opacity === "0.4"
                ? "1"
                : "0.4";

    }, 1200);

}

// =========================================================
// GEMINI PRODUCT GENERATOR
// =========================================================

const productIdea =
    document.getElementById("productIdea");

const generateProductBtn =
    document.getElementById(
        "generateProductBtn"
    );

const submitProductBtn =
    document.getElementById(
        "submitProductBtn"
    );

const generatorStatus =
    document.getElementById(
        "generatorStatus"
    );

const generatedProduct =
    document.getElementById(
        "generatedProduct"
    );

const generatedName =
    document.getElementById(
        "generatedName"
    );

const generatedTagline =
    document.getElementById(
        "generatedTagline"
    );

const generatedCategory =
    document.getElementById(
        "generatedCategory"
    );

const generatedPrice =
    document.getElementById(
        "generatedPrice"
    );

const generatedDescription =
    document.getElementById(
        "generatedDescription"
    );

const productList =
    document.getElementById(
        "productList"
    );

let currentGeneratedProduct = null;

// =========================================================
// GENERATE PRODUCT
// =========================================================

if (generateProductBtn) {

    generateProductBtn.addEventListener(
        "click",
        async () => {

            const idea =
                productIdea.value.trim();

            if (!idea) {

                generatorStatus.textContent =
                    "PLEASE ENTER A PRODUCT IDEA FIRST.";

                productIdea.focus();

                return;

            }

            // -----------------------------------------
            // DISABLE BUTTON
            // -----------------------------------------

            generateProductBtn.disabled =
                true;

            generateProductBtn.textContent =
                "GENERATING...";

            generatorStatus.textContent =
                "GEMINI IS CREATING YOUR PRODUCT...";

            try {

                // -----------------------------------------
                // REQUEST WITH TIMEOUT
                // -----------------------------------------

                const controller =
                    new AbortController();

                const timeout =
                    setTimeout(() => {

                        controller.abort();

                    }, 60000);

                const response =
                    await fetch(
                        "/api/generate-product",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    idea: idea
                                }),

                            signal:
                                controller.signal
                        }
                    );

                clearTimeout(timeout);

                // -----------------------------------------
                // READ RESPONSE
                // -----------------------------------------

                const text =
                    await response.text();

                let data = {};

                try {

                    data =
                        JSON.parse(text);

                }

                catch {

                    throw new Error(
                        `Server returned an invalid response (${response.status}).`
                    );

                }

                // -----------------------------------------
                // ERROR
                // -----------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        `Server error: ${response.status}`
                    );

                }

                if (
                    !data.product
                ) {

                    throw new Error(
                        "No product was returned by the server."
                    );

                }

                // -----------------------------------------
                // SAVE PRODUCT
                // -----------------------------------------

                currentGeneratedProduct =
                    data.product;

                // -----------------------------------------
                // DISPLAY PRODUCT
                // -----------------------------------------

                generatedName.textContent =
                    data.product.name;

                generatedTagline.textContent =
                    data.product.tagline;

                generatedCategory.textContent =
                    data.product.category;

                generatedPrice.textContent =
                    `₹${Number(
                        data.product.price
                    ).toFixed(2)}`;

                generatedDescription.textContent =
                    data.product.description;

                generatedProduct.hidden =
                    false;

                generatorStatus.textContent =
                    "PRODUCT GENERATED SUCCESSFULLY.";

                generatedProduct.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

            catch (error) {

                console.error(
                    "Generation error:",
                    error
                );

                if (
                    error.name ===
                    "AbortError"
                ) {

                    generatorStatus.textContent =
                        "GENERATION TIMED OUT. PLEASE TRY AGAIN.";

                }

                else {

                    generatorStatus.textContent =
                        error.message ||
                        "Something went wrong.";

                }

            }

            finally {

                generateProductBtn.disabled =
                    false;

                generateProductBtn.textContent =
                    "GENERATE WITH AI";

            }

        }
    );

}

// =========================================================
// SUBMIT PRODUCT
// =========================================================

if (submitProductBtn) {

    submitProductBtn.addEventListener(
        "click",
        async () => {

            if (!currentGeneratedProduct) {

                generatorStatus.textContent =
                    "GENERATE A PRODUCT BEFORE SUBMITTING.";

                return;

            }

            submitProductBtn.disabled =
                true;

            submitProductBtn.textContent =
                "SUBMITTING...";

            try {

                const response =
                    await fetch(
                        "/api/products",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    currentGeneratedProduct
                                )
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to submit product."
                    );

                }

                addProductToPage(
                    data.product
                );

                generatorStatus.textContent =
                    "PRODUCT SUBMITTED SUCCESSFULLY.";

                productIdea.value = "";

                generatedProduct.hidden =
                    true;

                currentGeneratedProduct =
                    null;

                document
                    .getElementById("products")
                    .scrollIntoView({
                        behavior: "smooth"
                    });

            }

            catch (error) {

                console.error(error);

                generatorStatus.textContent =
                    error.message ||
                    "Unable to submit product.";

            }

            finally {

                submitProductBtn.disabled =
                    false;

                submitProductBtn.textContent =
                    "SUBMIT PRODUCT";

            }

        }
    );

}

// =========================================================
// ADD PRODUCT TO PAGE
// =========================================================

function addProductToPage(product) {

    if (!productList) {
        return;
    }

    const emptyMessage =
        productList.querySelector(
            ".empty-products"
        );

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const card =
        document.createElement("article");

    card.className =
        "product-card";

    const category =
        document.createElement("div");

    category.className =
        "product-card-category";

    category.textContent =
        product.category;

    const title =
        document.createElement("h3");

    title.textContent =
        product.name;

    const tagline =
        document.createElement("p");

    tagline.className =
        "product-card-tagline";

    tagline.textContent =
        product.tagline;

    const description =
        document.createElement("p");

    description.className =
        "product-card-description";

    description.textContent =
        product.description;

    const bottom =
        document.createElement("div");

    bottom.className =
        "product-card-bottom";

    const price =
        document.createElement("strong");

    price.className =
        "product-price";

    price.textContent =
        `₹${Number(
            product.price
        ).toFixed(2)}`;

    const source =
        document.createElement("span");

    source.className =
        "product-source";

    source.textContent =
        "AI GENERATED";

    bottom.appendChild(price);
    bottom.appendChild(source);

    card.appendChild(category);
    card.appendChild(title);
    card.appendChild(tagline);
    card.appendChild(description);
    card.appendChild(bottom);

    productList.prepend(card);

}

// =========================================================
// LOAD SAVED PRODUCTS
// =========================================================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        if (
            Array.isArray(data.products)
        ) {

            data.products.forEach(
                product => {

                    addProductToPage(
                        product
                    );

                }
            );

        }

    }

    catch (error) {

        console.log(
            "Products could not be loaded.",
            error
        );

    }

}

loadProducts();