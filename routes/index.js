const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const {catchErrors} = require('../handlers/errorHandlers') // imporitng catchErrors mathod

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', storeController.getStores);

router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));



router.get('/reverse/:name',(req,res)=>{
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse)
});

module.exports = router;
