module.exports = ({ hostname, protocol, user, password, port }) => {
  return {
    rascal: {
      vhosts: {
        '/': {
          publicationChannelPools: {
            confirmPool: {
              autostart: true
            }
          },
          connection: {
            slashes: true,
            protocol: protocol || 'amqp',
            hostname: hostname || 'localhost',
            user: user,
            password: password,
            port: port || 5672
          },
          exchanges: [
            'standard'
          ],
          queues: [
            'messages.add',
            'messages.update',
            'messages.delete'
          ],
          bindings: [
            'standard[add] -> messages.add',
            'standard[update] -> messages.update',
            'standard[delete] -> messages.delete'
          ],
          publications: {
            'messages.add': {
              exchange: 'standard',
              routingKey: 'add',
              options: {
                persistent: false
              }
            },
            'messages.update': {
              exchange: 'standard',
              routingKey: 'update',
              options: {
                persistent: false
              }
            },
            'messages.delete': {
              exchange: 'standard',
              routingKey: 'delete',
              options: {
                persistent: false
              }
            }
          },
          subscriptions: {
            'addRuleSet': {
              queue: 'messages.add'
            },
            'updateRuleSet': {
              queue: 'messages.update'
            },
            'deleteRuleSet': {
              queue: 'messages.delete'
            }
          }
        }
      }
    }
  }
}