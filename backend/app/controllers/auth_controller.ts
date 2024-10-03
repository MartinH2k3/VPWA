import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { ActiveSocket } from '#start/ws'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    const data = request.only(['username', 'email', 'password', 'first_name', 'last_name'])
    try {
      const user = await User.create(data)
      await auth.use('web').login(user)
      return user
    } catch (e) {
      switch (e.code) {
        case '23505': // Postgres error codes
          // format for e.detail is "Key (key)=(value) already exists."
          const output = e.detail.match(/\(([^)]+)\)/)
          return response.badRequest({ message: output[1] + ' already in use' })
        case '23502':
          return response.badRequest({ message: `${e.column} is required` })
        default:
          return response.badRequest({ message: 'Invalid data' })
      }
    }
  }

  // login from adonis documentation
  async login({ request, auth, response }: HttpContext) {
    // get credentials from the body
    const { email, password } = request.only(['email', 'password'])
    // verify credentials, this automatically returns 400 for invalid login somehow
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
    await auth.check()
    const user = auth!.user
    if (!user) return { success: false }
    // Find active socket
    const activeSocket = (global as any).activeSockets.find(
      (socket: ActiveSocket) => socket.user.id === user.id
    )
    console.log('Logging out', activeSocket?.user.username)

    activeSocket.updateChannles()

    // await auth.use('web').logout()
    // return { success: true }
  }

  async authWS({ auth, response }: HttpContext) {
    const authenticated = await auth.check()

    if (!authenticated) return response.unauthorized({ message: 'Invalid credentials' })

    if (!auth?.user) return response.unauthorized({ message: 'Invalid credentials' })

    // generate a random unique token incorporating the user id and the current time and randomness
    const token: string =
      auth.user.id +
      Math.random().toString(36).substr(2) +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2)

    ;(global as any).activeSockets.push({ user: auth.user, token })
    return response.ok(token)
  }
}
