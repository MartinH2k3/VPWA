import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(255),
    email: vine.string().email().maxLength(255),
    password: vine.string().minLength(8).maxLength(255),
    first_name: vine.string().minLength(3).maxLength(255),
    last_name: vine.string().minLength(3).maxLength(255),
  })
)
