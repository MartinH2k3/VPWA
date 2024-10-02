/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router.get('/auth', async ({ auth, response }) => {
  const authenticated = await auth.check()
  return response.status(authenticated ? 200 : 401).send({ authenticated: authenticated })
})
router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout'])
router.get('/authWS', [AuthController, 'authWS'])
