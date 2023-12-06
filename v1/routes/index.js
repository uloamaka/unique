const router = require("express").Router();

const adminRouter = require("./admin");
const authRouter = require("./auth");
const blogRouter = require("./blog.router");
const contactRouter = require("./contact.router");
const galleryRouter = require("./gallery.router");
const userRouter = require("./user");


router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Hallo! This is the unique events API"
    });
});

router.use("./admin", adminRouter);
router.use("/auth", authRouter);
router.use("/blogs", blogRouter);
router.use("/contact_us", contactRouter);
router.use("/galleries", galleryRouter);
router.use("/user", userRouter);

module.exports = router;