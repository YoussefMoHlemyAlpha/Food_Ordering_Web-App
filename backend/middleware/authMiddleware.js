import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access denied. Admins only." });
        }
    });
};


export const verifyDeliveryMan = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "deliveryMan") {
            next();
        } else {
            res.status(403).json({ message: "Access denied. Delivery men only." });
        }
    });
};
