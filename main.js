const fs = require("fs");
const JSDOM = require("jsdom").JSDOM;

let html = fs.readFileSync(process.argv[2], "UTF-8");
html = html.replace(/日ごとの陽性者数/g, "日ごとの感染者数");

const document = new JSDOM(html).window.document;
const tables = document.querySelectorAll('table');

const data = {};

(function() {
  let header = null;
  fs.readFileSync(process.argv[3], "UTF-8").trim().split("\n").map(a => a.split(",")).forEach(a => {
    const date = a.shift();
    if (header === null) {
      header = a;
    } else {
      data[date] = {};
      header.forEach((key, i) => {
        data[date][key] = a[i];
      });
    }
  });
})();

Array.from(tables).forEach(table => {
  const caption = table.querySelector('caption').textContent.trim();
  const label = caption.replace(/（.+\）$/, "");

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let ymd = [year, null, null];
  if (caption.match(/([0-9]+)月[0-9]+日/)) ymd[1] = parseInt(RegExp.$1);
  if (ymd[1] > month) ymd[0] = year - 1;

  const dates = Array.from(table.querySelectorAll('th')).map(a => {
    let date = a.textContent.replace(/\s/g, "");
    if (date.match(/^([0-9]+)月([0-9]+)日$/)) {
      ymd[1] = parseInt(RegExp.$1);
      ymd[2] = parseInt(RegExp.$2);
      if (ymd[1] > month) ymd[0] = year - 1;
    } else if (date.match(/^([0-9]+)日$/)) {
      ymd[2] = parseInt(RegExp.$1);
    } else {
      return date;
    }
    return ymd.map((a, i) => i !== 0 && a < 10 ? "0" + a : a).join("-");
  });

  const values = Array.from(table.querySelectorAll('td')).map(a => a.textContent.trim());

  dates.forEach((date, i) => {
    if (!date.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/)) return;
    if (data[date] === undefined) data[date] = {};
    data[date][label] = values[i];
  });
});

const dates = Object.keys(data).sort();
const labels = [];
Object.values(data).forEach(a => {
  Object.keys(a).forEach(b => {
    if (labels.indexOf(b) === -1) labels.push(b);
  });
});

let result = `日付,${labels.join(",")}\n`;
dates.forEach(date => {
  const x = [date];
  labels.forEach(label => {
    x.push(data[date][label] || "");
  });
  result += `${x.join(",")}\n`;
});

fs.writeFileSync(process.argv[3], result, "UTF-8");
