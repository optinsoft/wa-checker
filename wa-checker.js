const { Client, LocalAuth } = require('whatsapp-web.js');

const fs = require('fs');
const readline = require('readline');

async function checkAccountList(client) {
    const readFileName = 'accounts.txt';
    const existsFileName = 'exists.txt';
    const notExistsFileName = 'notexists.txt';

    const readStream = fs.createReadStream(readFileName);
    const existsStream = fs.createWriteStream(existsFileName);
    const notExistsStream = fs.createWriteStream(notExistsFileName);
    
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const acc_re = /[0-9]{10,}/;
        const acc_arr = line.match(acc_re);
        if (acc_arr) {
            const acc_id = acc_arr[0];
            console.log(`Checking: ${acc_id}...`);
            const acc_registered = client && await client.isRegisteredUser(acc_id);
            console.log(`${acc_id}:`, (acc_registered ? 'exists' : ' does not exist' ));
            if (acc_registered) {
                existsStream.write(`${line}\n`);
            }
            else {
                notExistsStream.write(`${line}\n`);
            }
            //await new Promise(resolve => setTimeout(resolve, 1000)); // delay 1 second
        }
    }
    if (client) {
        client.destroy();
    }
}

function startClient() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: false }
    });
    client.on('ready', () => checkAccountList(client));
    client.initialize();
}

//checkAccountList(null);
startClient();