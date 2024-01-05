// 1. install jwt from it's web site and install it in server site
// 2. require(jwtwebtoken)
// 3. create api in server site app.post('/jwt',(req,res)=>{
//     const user = req.body;
//     const token = jwt.sign(object, secret, {expiresIn('1h')})
//     res.send(token)
// })  

// for generate random secret key 
// open cmd in vscode
// node> require('crypto').randomBytes(64).toString()

// client side
// we have to send token when the user will log in 
// 1.use axios,install axios in client side, 
// 2. axios.post('server link', object)
//     .then(res => {
//         console.log(res.data)
//     })

/**
 * install express cookie-parser
 * 1. set cookies with http only. for development secure: false;
 * for https it will be true
 * 
 * res
      .cookie('token', token,{
        httpOnly: true,
        secure: false,
        sameSite: 'none'

      }
        )
      .send({sucess: true});
 *2. cors important
      app.use(cors({
        origin: ['http://localhost:5173'],
        credentials: true
        }))

  3. client side axios setting
 */