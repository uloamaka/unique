const router = require("express").Router();
const controller = require("../controllers/blog.controller");
const Blog = require("../models/blog")
const { multerUploader } = require("../utils/cloudinary");
const paginatedResults = require("../middlewares/pagination.middleware");


router.post("/", multerUploader.single("image"), controller.createBlogPost);
router.get("/",paginatedResults(Blog), controller.getAllBlogs);
router.get("/:id", controller.getABlogById);
router.patch("/:id/update_title", controller.updateBlogTitle);
router.patch("/:id/update_content", controller.updateBlogContent);
router.delete("/:id/delete", controller.deleteBlogPost);

module.exports = router;
