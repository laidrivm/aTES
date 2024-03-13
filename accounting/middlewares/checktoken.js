const authForm = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const user_id = document.getElementById('user_id').value;
      const user_secret = document.getElementById('user_secret').value;

      try {
        const response = await fetch("http://localhost:3001/authenticate", {
          method: 'POST',
          headers: {
            'Content-Type': 'application\/json'
          },
          body: JSON.stringify({ user_id, user_secret })
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }
        const data = await response.json();

        document.cookie = "token="+data.token;

        window.location.href = "\/";
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    });
  });
<\/script>

<form id="authForm">
  <label for="user_id">User ID:<\/label>
  <input type="text" id="user_id" name="user_id"><br>
  <label for="user_secret">User Secret:<\/label>
  <input type="password" id="user_secret" name="user_secret"><br>
  <input type="submit" value="Authenticate">
<\/form>
`;

// Middleware function to check if user has a token in a request cookie
async function checkToken(req, res, next) {
    try {
        // If token exists, verify it
        if (req.cookies?.token) {
            const token = req.cookies.token;
            const response = await fetch(`${process.env.AUTH_URI}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            // If token is valid, set user object in request and proceed
            const userData = await response.json();
            req.user = userData;
            next();
        } else {
            // If token doesn't exist, respond with bare HTML form
            res.send(authForm);
        }
    } catch (error) {
        console.error("Error checking token:", error);
        // Clear the cookie if token is invalid
        res.clearCookie('token');
        res.status(401).json({ error: "Unauthorized" });
    }
}

module.exports = checkToken;
