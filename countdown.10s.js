#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Countdown</bitbar.title>
// <bitbar.version>v1.0.0</bitbar.version>
// <bitbar.author>Ilan Kleiman</bitbar.author>
// <bitbar.author.github>shortland</bitbar.author.github>
// <bitbar.desc>Shows a countdown to important events.</bitbar.desc>
// <bitbar.image></bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.abouturl>https://github.com/shortland/BitBar-Countdown-Plugin</bitbar.abouturl>

/**
 * TODO: Get this from Google Calendar (only specific ones?)
 */
const items = {
    "Marginalia Meeting": {
        "Date": "2019.11.06",
        "Time": "15:00",
    },
    "Dr Visit": {
        "Date": "2019.11.04",
        "Time": "14:30",
    },
    "Meet 331 TA": {
        "Date": "2019.10.31",
        "Time": "10:00",
    },
    "CSE 320 HW #4": {
        "Date": "2019.11.15",
        "Time": "23:59",
    },
    "Moms Birthday": {
        "Date": "2019.11.02",
        "Time": "00:00:01",
    },
};

/**
 * Aggresively cute emoticon to remind you to view it
 */
console.log("🤬");

/**
 * Sort the object by putting the items into an array
 */
const sorted_values = Array();
for (let item in items) {
    sorted_values.push([item, items[item]]);
}
sorted_values.sort(function (a, b) {
    return (new Date(a[1].Date + " " + a[1].Time).getTime() - new Date(b[1].Date + " " + b[1].Time).getTime());
});

/**
 * Print out the items.
 */
for (let sorted in sorted_values) {
    let seconds = parseInt((new Date("" + sorted_values[sorted][1].Date + " " + sorted_values[sorted][1].Time + "").getTime() - new Date().getTime()) / 1000, 10);

    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;

    console.log("---");
    console.log(sorted_values[sorted][0]);
    console.log(days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + seconds + " Seconds");
}
