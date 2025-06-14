const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// MongoDB Connection
main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log("MongoDB Connection Error:", err);
    process.exit(1);
});

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
    } catch (err) {
        console.log("MongoDB Connection Error:", err);
        throw err;
    }
}

// Middleware
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", { error: "Something went wrong!" });
});

// Routes
app.get("/", (req, res) => {
    res.send("hi im root");
});

app.get("/testListing", async (req, res) => {
    try {
        const sampleListing = new Listing({
            title: "my new villa",
            description: "buy the beach",
            price: 1200,
            location: "goa",
            country: "India"
        });
        await sampleListing.save();
        console.log("sample was saved");
        res.send("successful");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving sample listing");
    }
});

app.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("index", { allListings });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error fetching listings" });
    }
});

app.get("/listings/new", (req, res) => {
    res.render("new");
});

app.get("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).render("error", { error: "Listing not found" });
        }
        res.render("show", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error fetching listing" });
    }
});

app.post("/listings", async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error creating listing" });
    }
});

app.get("/listings/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).render("error", { error: "Listing not found" });
        }
        res.render("edit", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error fetching listing for edit" });
    }
});

app.put("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
        if (!listing) {
            return res.status(404).render("error", { error: "Listing not found" });
        }
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error updating listing" });
    }
});

app.delete("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) {
            return res.status(404).render("error", { error: "Listing not found" });
        }
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { error: "Error deleting listing" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});