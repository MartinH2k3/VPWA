import Channel from '#models/channel'
import User from '#models/user'
import SocketSession from './handlers/SocketSession.js'

interface PendingWebSocketAuthentificationRequest {
  user: User
  token: string
}

class SocketSessions extends Array<SocketSession> {
  getForActiveChannel(channelName: string) {
    return this.filter((session) => session.activeChannelName === channelName)
  }
  getUserSession(userId: number) {
    return this.find((session) => session.user.id === userId)
  }

  async updateChannelMembers(channelName: string) {
    // Update everyone's members list that has this channel as active
    const channel = await Channel.query().where('name', channelName).first()

    if (!channel) return

    // Update status for all users in the channel
    const members = (await channel.related('members').query().where('kicked', false)).map(
      (member) => {
        console.log(this.getUserSession(member.id)?.status);

        return {
          id: member.id,
          username: member.username,
          firstName: member.first_name,
          lastName: member.last_name,
          status: this.getUserSession(member.id)?.status ?? 'offline',
        }
      }
    )

    this.getForActiveChannel(channelName).forEach((session) => {
      session.send('update_channel_members', {
        channelName,
        members: members,
      })
    })
  }
}
let pendingAuthentificationRequests: PendingWebSocketAuthentificationRequest[] = []
let socketSessions: SocketSessions = new SocketSessions()

export { pendingAuthentificationRequests, socketSessions }
