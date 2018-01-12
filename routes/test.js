const router = require('express').Router();

router.get('/', (req, res) => {
    res.end('Working.');
});

module.exports = router;