import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/auth_validator'

export default class AuthController {
  async register({ request, auth }: HttpContext) {
    console.log(request.only(['username', 'email', 'password', 'first_name', 'last_name']))
    const data = await registerValidator.validate(
      request.only(['username', 'email', 'password', 'first_name', 'last_name'])
    )
    console.log(data)
    const user = await User.create(data)
    await auth.use('web').login(user)
    return user
  }

  // login from adonis documentation
  async login({ request, auth, response }: HttpContext) {
    // get credentials from the body
    const { email, password } = request.only(['email', 'password'])
    // verify credentials
    const user = await User.verifyCredentials(email, password)
    // log in
    await auth.use('web').login(user)
    // if incorrect credentials, return http status 401
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    // return username
    return response.ok(user)
  }

  async logout({ auth }: HttpContext) {
    await auth.use('web').logout()
    return { success: true }
  }
}
