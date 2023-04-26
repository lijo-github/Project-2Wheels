const adminHelper = require("../helpers/admin-helper");
const cloudinary = require("../config/cloudinary.js");
const convert = require("color-convert");

module.exports = {
    //*get home Page  */

    dashboard: (req, res) => {
        if (req.session.admin) {
            res.render("admin/adminLandingPage");
        } else {
            res.redirect("admin/login");
        }
    },

    //*get admin loginPage  */

    adminlogin: (req, res) => {
        if (req.session.isloggedInad) {
            res.render("../views/admin/adminLandingPage", { adLogErr: false });
        } else {
            res.redirect("/admin");
        }
    },

    //*post adminlogin Page  */

    adminPostLogin: async (req, res) => {
        try {
            const adminData = await adminHelper.adminLogin(req.body);
            let admin = adminData.status;

            if (admin) {
                req.session.isloggedInad = true;
                req.session.admin = adminData.validAdmin;
                res.render("../views/admin/adminLandingPage", { adLogErr: false });
            } else {
                res.redirect("/admin");
            }
        } catch (error) {
            console.error(error);
            res.render();
        }
    },

    //*get adminlogout Page  */

    adminLogout: (req, res) => {
        req.session.destroy((error) => {
            if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            } else {
                console.log("adminlogout succesfully");
                res.redirect("/admin");
            }
        });
    },

    viewUser: async (req, res) => {
        const status = req.query.status || "";
        console.log("data received", status);

        try {
            // const page = parseInt(req.query.page) || 1;
            // const pageSize = parseInt(req.query.pageSize) || 5;
            // const skip = (page - 1) * pageSize;
            // const count = await adminHelper.getUsercount();
            // const totalPages = Math.ceil(count / pageSize);
            // const currentPage = page > totalPages ? totalPages : page;
           const users = await adminHelper.getAllusers(status);
            // const paginatedUsers = users.slice(skip, skip + pageSize);

            res.render("../views/admin/view-user", {
                users,
                adLogErr: false,
                
            });
        } catch (err) {
            console.error(err);
            res.redirect("/admin");
        }
    },
    blockUser: async (req, res) => {
        let userId = req.params.id;
        try {
            await adminHelper.blockUser(userId);
            res.redirect("/admin/view-user");
        } catch (error) {
            console.error(error);
        }
    },
    unblockUser: async (req, res) => {
        let userId = req.params.id;
        try {
            await adminHelper.unblockUser(userId);
            res.redirect("/admin/view-user");
        } catch (err) {
            console.error(err);
        }
    },
    addBanner: async (req, res) => {
        if (req.session.isloggedInad) {
            try {
                let availCategory = await adminHelper.getAllCategory();
                res.render("admin/addBanner", { availCategory, productUploaded: false });
            } catch (err) {
                console.error(err);
            }
        } else {
            res.redirect("/admin");
        }
    },
    category: async (req, res) => {
        try {
            const viewCategory = await adminHelper.getAllCategory();
            res.render("admin/category", {
                viewCategory,
            });
        } catch (err) {
            console.error(err);
        }
    },
    addCategory: async (req, res) => {
        try {
            await adminHelper.addCategory(req.body);
            res.redirect("/admin/category");
        } catch (err) {
            console.error(err);
        }
    },
    editCategory: async (req, res) => {
        const { category: categoryName } = req.body;
        const id = req.params.id;

        try {
            await adminHelper.editCategory(categoryName, id);
            res.json({ status: "success" });
        } catch (err) {
            console.error(err);
        }
    },
    deleteCategory: async (req, res) => {
        let categoryId = req.params.id;

        try {
            await adminHelper.deleteCategory(categoryId);
            res.json({ status: "success" });
        } catch (err) {
            console.error(err);
            res.json({ status: "error" });
        }
    },
    listCategory: async (req, res) => {
        let categoryId = req.params.id;

        try {
            await adminHelper.listCategory(categoryId);
            res.json({ status: "success" });
        } catch (err) {
            console.error(err);
            res.json({ status: "error" });
        }
    },
    addProducts: async (req, res) => {
        try {
            var availCategory = await adminHelper.getAllCategory();
        } catch (err) {
            console.error(err);
        }
        let productFound;
        req.session.productFound ? productFound : !productFound;
        const productUploaded = req.session.productUploaded;
        const productUploadedErr = req.session.productUploadedErr;
        res.render("admin/add-products", {
            availCategory,
            productFound,
            productUploaded,
            productUploadedErr,
        });
    },
    addProductsPost: async (req, res) => {
        try {
            const files = req.files;
            console.log(files);
            const results = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path)));
            const productData = req.body;

            //convertion part color code to color name
            const colorCode = productData.productColor;
            const rgb = convert.hex.rgb(colorCode);
            const colorName = convert.rgb.keyword(rgb);
            productData.productColor = colorName;

            const productImages = results.map((file) => {
                return file.secure_url;
            });

            productData.productImages = productImages;
            productData.productStatus = "Listed";
            try {
                const productFound = await adminHelper.addProducts(productData);
                if (productFound) {
                    req.session.productUploaded = true;

                    res.redirect("/admin/add-products");
                    return;
                }
                req.session.productFound = true;

                res.redirect("/admin/add-products");
            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
            req.session.productUploadErr = true;

            res.redirect("/admin/add-products");
        }
    },

    getAllProducts: async (req, res) => {
        try {
            // var products = await adminHelper.getAllProducts();
            const products = await adminHelper.getAllProducts();
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const skip = (page - 1) * pageSize;
        const count = await adminHelper.getProductsCount();
        const totalPages = Math.ceil(count / pageSize);
        const currentPage = page > totalPages ? totalPages : page;
        const productsArray = Array.from(products);
const paginatedProducts = productsArray.slice(skip, skip + pageSize);
       

        res.render("admin/products", {
            products: paginatedProducts,
            currentPage,
            totalPages,
            pageSize,
            page,
            
        });
        } catch (err) {
            console.error(err);
        }
        
    },
    editProduct: async (req, res) => {
        let product;
        try {
            product = await adminHelper.getProductDetails(req.params.id);
            res.render("admin/edit-product", { product, productUpdated: false });
        } catch (err) {
            res.redirect("/admin");
            console.error(err);
        }
    },
    editProductPost: async (req, res) => {
        try {
            const files = req.files;
            const results = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path)));
            const productData = req.body;

            const colorCode = productData.productColor;
            const rgb = convert.hex.rgb(colorCode);
            const colorName = convert.rgb.keyword(rgb);
            productData.productColor = colorName;

            if (results) {
                const productImages = results.map((file) => {
                    return file.secure_url;
                });
                productData.productImages = productImages;
            }
            await adminHelper.updateProducts(productData, req.params.id);
            res.redirect("/admin/products");
        } catch (err) {
            console.error(err);
            req.session.productUploadError = true;

            res.redirect("/admin/edit-product");
        }
    },
    unlistPorduct: async (req, res) => {
        try {
            await adminHelper.unlistProduct(req.params.id);
            res.redirect("/admin/products");
        } catch (err) {
            console.error(err);
        }
    },
    orderDetails: async (req, res) => {
        try {
          const orders = await adminHelper.getOrderDetails();
          if (orders) {
            res.render("/admin/order-Management", { orders });
          }
        } catch (err) {
          console.error(err);
        }
      }
};
