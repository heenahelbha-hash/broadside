// =========================================================
// BROADSIDE SERVER
// Gemini AI Product Generator
// =========================================================

const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

// =========================================================
// CONFIGURATION
// =========================================================

dotenv.config({
    path: path.join(__dirname, ".env")
});

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

const app = express();

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

// =========================================================
// CHECK API KEY
// =========================================================

if (!GEMINI_API_KEY) {
    console.error("");
    console.error("======================================");
    console.error("ERROR: GEMINI_API_KEY IS MISSING");
    console.error("======================================");
    console.error("");
    console.error("Add GEMINI_API_KEY to your .env file.");
    console.error("");

    process.exit(1);
}

// =========================================================
// GEMINI CLIENT
// =========================================================

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(express.json({ limit: "1mb" }));

app.use(express.static(__dirname));

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

// =========================================================
// PRODUCT STORAGE
// =========================================================

const products = [];

// =========================================================
// HOME PAGE
// =========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html"),
        error => {

            if (error) {

                res.sendFile(
                    path.join(
                        __dirname,
                        "..",
                        "index.html"
                    )
                );

            }

        }
    );

});

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/api/health", (req, res) => {

    res.json({
        status: "online",
        service: "Broadside Gemini Product Generator",
        model: GEMINI_MODEL,
        geminiConfigured: Boolean(GEMINI_API_KEY)
    });

});

// =========================================================
// GENERATE PRODUCT
// =========================================================

app.post("/api/generate-product", async (req, res) => {

    try {

        const idea =
            String(req.body.idea || "").trim();

        // -----------------------------------------
        // VALIDATE IDEA
        // -----------------------------------------

        if (!idea) {

            return res.status(400).json({
                success: false,
                error: "Product idea is required."
            });

        }

        if (idea.length > 500) {

            return res.status(400).json({
                success: false,
                error: "Product idea must be 500 characters or less."
            });

        }

        console.log("");
        console.log("======================================");
        console.log("GENERATING PRODUCT");
        console.log("======================================");
        console.log("Idea:", idea);
        console.log("Model:", GEMINI_MODEL);
        console.log("");

        // -----------------------------------------
        // PROMPT
        // -----------------------------------------

        const prompt = `
You are the product copywriter for BROADSIDE,
a community letterpress print shop.

Create ONE realistic letterpress product based on:

"${idea}"

Return ONLY valid JSON.

Use exactly this structure:

{
  "name": "short product name",
  "tagline": "short memorable tagline",
  "category": "one category",
  "price": 0,
  "description": "2 to 3 sentence product description"
}

Rules:

- The product must fit a traditional letterpress print shop.
- The name should be short.
- The tagline must be under 12 words.
- The description must be between 30 and 70 words.
- Price must be a realistic number in Indian Rupees.
- Do not include the ₹ symbol in the price field.
- Do not use markdown.
- Do not add extra fields.
`;

        // -----------------------------------------
        // GEMINI REQUEST
        // -----------------------------------------

        const response =
            await ai.models.generateContent({

                model: GEMINI_MODEL,

                contents: prompt,

                config: {
                    responseMimeType: "application/json"
                }

            });

        // -----------------------------------------
        // GET RESPONSE TEXT
        // -----------------------------------------

        const text =
            response.text;

        console.log("Gemini response received.");

        if (!text) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }

        console.log("Gemini JSON:", text);

        // -----------------------------------------
        // PARSE JSON
        // -----------------------------------------

        let product;

        try {

            product = JSON.parse(text);

        }

        catch (error) {

            console.error(
                "Invalid Gemini JSON:",
                text
            );

            throw new Error(
                "Gemini returned invalid JSON."
            );

        }

        // -----------------------------------------
        // VALIDATE PRODUCT
        // -----------------------------------------

        if (
            !product.name ||
            !product.tagline ||
            !product.category ||
            product.price === undefined ||
            !product.description
        ) {

            throw new Error(
                "Gemini returned incomplete product information."
            );

        }

        // -----------------------------------------
        // NORMALIZE PRICE
        // -----------------------------------------

        product.price =
            Number(product.price);

        if (
            Number.isNaN(product.price) ||
            product.price < 0
        ) {

            product.price = 499;

        }

        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        console.log("");
        console.log("PRODUCT GENERATED:");
        console.log(product);
        console.log("");

        return res.json({

            success: true,

            product: {

                name:
                    String(product.name).trim(),

                tagline:
                    String(product.tagline).trim(),

                category:
                    String(product.category).trim(),

                price:
                    product.price,

                description:
                    String(product.description).trim()

            }

        });

    }

    catch (error) {

        console.error("");
        console.error("======================================");
        console.error("GEMINI GENERATION ERROR");
        console.error("======================================");
        console.error(error);
        console.error("");

        let message =
            "Unable to generate product.";

        // -----------------------------------------
        // FRIENDLY ERROR MESSAGES
        // -----------------------------------------

        if (
            error.message &&
            error.message.toLowerCase().includes("api key")
        ) {

            message =
                "Gemini API key is invalid or missing.";

        }

        else if (
            error.message &&
            error.message.toLowerCase().includes("quota")
        ) {

            message =
                "Gemini API quota has been exceeded.";

        }

        else if (
            error.message &&
            error.message.toLowerCase().includes("model")
        ) {

            message =
                `Gemini model "${GEMINI_MODEL}" is unavailable. Check GEMINI_MODEL in .env.`;

        }

        else if (error.message) {

            message =
                error.message;

        }

        return res.status(500).json({

            success: false,

            error: message

        });

    }

});

// =========================================================
// SUBMIT PRODUCT
// =========================================================

app.post("/api/products", (req, res) => {

    try {

        const {
            name,
            tagline,
            category,
            price,
            description
        } = req.body;

        if (
            !name ||
            !tagline ||
            !category ||
            price === undefined ||
            !description
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "All product fields are required."

            });

        }

        const numericPrice =
            Number(price);

        if (
            Number.isNaN(numericPrice) ||
            numericPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Invalid product price."

            });

        }

        const product = {

            id:
                Date.now(),

            name:
                String(name).trim(),

            tagline:
                String(tagline).trim(),

            category:
                String(category).trim(),

            price:
                numericPrice,

            description:
                String(description).trim(),

            createdAt:
                new Date().toISOString()

        };

        products.push(product);

        console.log(
            "Product submitted:",
            product.name
        );

        return res.status(201).json({

            success: true,

            product:
                product

        });

    }

    catch (error) {

        console.error(
            "Product submission error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Unable to submit product."

        });

    }

});

// =========================================================
// GET PRODUCTS
// =========================================================

app.get("/api/products", (req, res) => {

    res.json({

        success: true,

        products:
            products

    });

});

// =========================================================
// 404 API HANDLER
// =========================================================

app.use("/api", (req, res) => {

    res.status(404).json({

        success: false,

        error:
            `API endpoint not found: ${req.method} ${req.originalUrl}`

    });

});

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("       BROADSIDE PRESS ONLINE");
    console.log("======================================");
    console.log("");
    console.log(`Server running at:`);
    console.log(`http://localhost:${PORT}`);
    console.log("");
    console.log(`Gemini model: ${GEMINI_MODEL}`);
    console.log("");
    console.log("Gemini API: CONFIGURED");
    console.log("");
    console.log("Press CTRL+C to stop the server.");
    console.log("");

});