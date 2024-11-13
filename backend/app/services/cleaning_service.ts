// will be cron job for cleaning up old channels
import Channel from '#models/channel'

export default class CleaningService {
  public static async cleanUp() {
    const dateConsideredInactive = new Date()
    dateConsideredInactive.setDate(dateConsideredInactive.getDate() - 30)
    // Get all channels with their messages
    const inactiveChannels = await Channel.query()
      .where('created_at', '<', dateConsideredInactive) // Don't remove empty channels created sooner than 30 days ago
      .whereDoesntHave('messages', (query) => {
        query.where('created_at', '>', dateConsideredInactive)
      }) // Only remove channels with no messages

    for (const channel of inactiveChannels) {
      await channel.delete()
    }
  }
}
