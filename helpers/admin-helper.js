const userSchema = require("../model/userModel");

module.exports = {
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            try {
                var validAdmin = await userSchema.findOne({ email: adminData.email });
            } catch (err) {
                console.error(err);
            }
            if (validAdmin) {
                if (validAdmin.isAdmin) {
                    response.validAdmin = validAdmin;
                    response.status = true;
                    resolve(response);
                } else {
                    console.log("login Failed");
                    resolve({ status: false });
                }
            } else {
                console.log("NO Admin Found");
                resolve({ status: false });
            }
        });
    },
};