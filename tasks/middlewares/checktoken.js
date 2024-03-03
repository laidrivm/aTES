const jwt = require('jsonwebtoken');

// Middleware function to check if user has a token in a request cookie
async function checkToken(req, res, next) {
    try {
        // Check if token exists in request cookies
        const token = req.cookies.token;

        // If token exists, verify it
        if (token) {
            // Make a request to the /verify endpoint to verify the token
            const response = await axios.post(`${process.env.AUTH_URI}/verify`, { token });

            // If token is valid, set user object in request and proceed
            req.user = response.data;
            next(req, res);
        } else {
            // If token doesn't exist, respond with bare HTML form
            const form = `
                <form action="http://127.0.0.1/authenticate" method="post">
                    <label for="user_id">User ID:</label>
                    <input type="text" id="user_id" name="user_id"><br>
                    <label for="user_secret">User Secret:</label>
                    <input type="password" id="user_secret" name="user_secret"><br>
                    <input type="submit" value="Authenticate">
                </form>
            `;
            res.send(form);
        }
    } catch (error) {
        console.error("Error checking token:", error);
        // Clear the cookie if token is invalid
        res.clearCookie('token');
        res.status(401).json({ error: "Unauthorized" });
    }
}

module.exports = checkToken;