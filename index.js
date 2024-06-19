const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');

const client = new Client();
client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});
async function fetchAllMessages(channel) {
    let messages = [];
    let lastMessageId = null;

    while (true) {
        const fetchedMessages = await channel.messages.fetch({
            limit: 100,
            before: lastMessageId,
        });

        if (fetchedMessages.size === 0) {
            break;
        }

        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastMessageId = fetchedMessages.last().id;

        // Rate limit prevention
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return messages;
}

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!f')) {
    
        const args = message.content.split(' ');
        const channelId = args[1];

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            message.channel.send('Invalid channel ID.');
            return;
        }

        const messages = await fetchAllMessages(channel);
        const attachmentLinks = [];

        messages.forEach((msg) => {
            msg.attachments.forEach((attachment) => {
                attachmentLinks.push(attachment.url);
            });
        });

        fs.writeFileSync('attachments.txt', attachmentLinks.join('\n'), 'utf-8');
        message.channel.send(`Saved ${attachmentLinks.length} attachment links to attachments.txt.`);
    message.channel.send({
            content: `Saved ${attachmentLinks.length} attachment links:`,
            files: ['attachments.txt']
        }).then(() => {
            // Delete the file after sending
            fs.unlinkSync('attachments.txt');
            console.log('File deleted successfully.');
        }).catch(err => {
            console.error('Error sending file:', err);
        });
    }
});
client.login(process.env['TOKEN']);
