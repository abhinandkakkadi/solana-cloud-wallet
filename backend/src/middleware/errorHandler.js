const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
  
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
  
    if (err.code === "ECONNREFUSED") {
      return res.status(500).json({ error: "Database connection failed" });
    }
  
    if (err.message === 'User already exists') {
      return res.status(400).json({ error: err.message });
    }
  
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ error: err.message });
    }
  
    res.status(500).json({ error: "Internal server error" });
  };
  
  module.exports = { errorHandler };