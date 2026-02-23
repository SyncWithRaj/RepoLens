import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { protect } from "./auth.middleware.js";

const router = Router();

// redirect to github
router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

// github callback
router.get( "/github/callback", passport.authenticate("github", { session: false}), (req, res) => {
        const user = req.user as any; // Type assertion for user
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            success: true,
            user,
        })
    }
)

router.get("/me", protect, (req, res) => {
    const user = (req as any).user;
    res.json({
        success: true,
        user,
    })
})

export default router;