#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Countdown</bitbar.title>
// <bitbar.version>v1.1.0</bitbar.version>
// <bitbar.author>Ilan Kleiman</bitbar.author>
// <bitbar.author.github>shortland</bitbar.author.github>
// <bitbar.desc>Shows a countdown to important events.</bitbar.desc>
// <bitbar.image></bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.abouturl>https://github.com/shortland/BitBar-Countdown-Plugin</bitbar.abouturl>

/**
 * DIRECTIONS:
 * 1. Download this file to your BitBar plugins directory
 * 2. Go to this link: 
 *   https://console.developers.google.com/henhouse/?pb=%5B%22hh-0%22%2C%22calendar%22%2Cnull%2C%5B%5D%2C%22https%3A%2F%2Fdevelopers.google.com%22%2Cnull%2C%5B%5D%2Cnull%2C%22Enable%20the%20Google%20Calendar%20API%22%2C1%2Cnull%2C%5B%5D%2Cfalse%2Cfalse%2Cnull%2Cnull%2Cnull%2Cnull%2Cfalse%2Cnull%2Cfalse%2Cfalse%2Cnull%2Cnull%2Cnull%2C%22OTHER%22%2Cnull%2C%22Quickstart%22%2Ctrue%2C%22Quickstart%22%2Cnull%2Cnull%2Cfalse%5D
 *   and press the button "DOWNLOAD CLIENT CONFIGURATION"
 * 3. Save the file (credentials.json) to the BitBar plugins directory
 * 4. Install GoogleApis: 
 *  $ npm install googleapis@39 --save
 * 5. 
 */
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// don't show events with these titles
const IGNORE_EVENTS = [
    "CSE 320 - FREY 104",
    "CSE 352 - JAVITS 111",
    "CSE 331 - LE 102",
    "CSE 337 - JAVITS 102",
    "Work"
];

const API_DATA_DIR = 'api_data';
// show events from 12 hours ago
const EVENTS_FROM = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();
const NUM_EVENTS = 30;

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/** 
 * BitBar Icon 
 */
console.log("📅");
console.log("---");

/**
 * Google Calendar API Authorization
 */
fs.stat(__dirname + '/' + API_DATA_DIR + '/credentials.json', function (err, stat) {
    if (err == null) {
        fs.readFile(__dirname + '/' + API_DATA_DIR + '/credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), listEvents);
        });
    } else if (err.code === 'ENOENT') {
        console.log("Google credentials doesn't exist");
        console.log("Follow directions at top of file");
    } else {
        console.log('Error: ', err.code);
    }
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(__dirname + '/' + API_DATA_DIR + '/token.json', (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(API_DATA_DIR + '/token.json', JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to ' + API_DATA_DIR + '/token.json');
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: EVENTS_FROM,
        maxResults: NUM_EVENTS,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            events.map((event, i) => {
                if (IGNORE_EVENTS.includes(event.summary)) {
                    return;
                }

                const start = event.start.dateTime || event.start.date;
                const startDate = new Date(start);
                let seconds = parseInt((startDate.getTime() - new Date().getTime()) / 1000, 10);

                let color = "green";
                if (seconds < 0) {
                    color = "orange";
                    // seconds in a day
                    seconds = 86400 - (seconds + 86400);
                }

                let days = Math.floor(seconds / (3600 * 24));
                seconds -= days * 3600 * 24;

                let hrs = Math.floor(seconds / 3600);
                seconds -= hrs * 3600;

                let mnts = Math.floor(seconds / 60);
                seconds -= mnts * 60;

                console.log('---');
                console.log(event.summary + " | color=" + color);
                console.log(days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + seconds + " Seconds" + "| color=" + color);
            });
        } else {
            console.log('No upcoming events found.');
        }

        /**
         * Pressable link that opens up this file via vscode (command line utils installed) via terminal command
         */
        console.log("---");
        console.log("Edit | bash='code " + __filename + "'");
    });
}
