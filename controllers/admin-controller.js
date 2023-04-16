const express = require("express");
const adminHelper = require("../helpers/admin-helper");
const bcrypt = require("bcrypt");

module.exports = {

    adminPage:(req,res)=>{
        res.render('admin/adminLogin',{message:false})
    },

    adminlogin: (req, res) => {
        if(req.session.admin){
            res.redirect('/admin',)
        }else{
            res.render("admin/adminLogin",);
        }
        
    },
    
    adminPostLogin: async (req, res) => {
        try {
          const adminData = await adminHelper.adminLogin(req.body);
          let admin = adminData.status;
      
          if (admin) {
            req.session.loggedInad = true;
            req.session.admin = adminData.validAdmin;
            res.render("../views/admin/adminLandingPage");
          } else {
            res.render("../views/admin/adminLogin",{message:'Invalid Username or Password'});
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },

      adminLogout: (req, res) => {
        req.session.destroy((error) => {
          if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          } else {
            res.redirect('/adminLogin',{message:false});
          }
        });
      }

      
};
