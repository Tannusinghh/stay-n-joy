const userSchema = require("../models/userSchema");
const passport = require('passport');
const { saveRedirectUrl } = require('../loginCheck');

// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports.renderSignupForm = (req, res) => {
    res.render('signup', { req: req });
};

module.exports.signup = asyncWrap(async (req, res, next) => {
    const formData = req.body;
    let { username, email, password } = req.body;

    console.log("Form Data Received:");
    console.log(formData);

    const newUser = new userSchema({ email, username });
    const registeredUser = await userSchema.register(newUser, password);
    console.log(registeredUser);

    if (!registeredUser) {
        req.flash("error", "Error Occurred");
        return res.redirect("/signup");
    }

    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("Success", "Welcome " + req.user.username);
        console.log(req.user);
        res.redirect("/listings");
    });
});

module.exports.renderLoginForm = (req, res) => {
    res.render('login', { req: req });
};

module.exports.login = [
    saveRedirectUrl,
    passport.authenticate("local", { 
        failureRedirect: '/login', 
        failureFlash: true 
    }),
    asyncWrap(async (req, res) => {
        req.flash("Success", "Welcome " + req.user.username);
        const redirectUrl = res.locals.redirectUrl || '/listings';
        console.log("Redirecting to:", redirectUrl);
        res.redirect(redirectUrl);
    })
];

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("Success", "Logged Out Successfully");
        console.log(`User made a logout request ${req.user}`);
        res.redirect('/login');
    });
};
