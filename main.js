const fs = require("fs");
const JSDOM = require("jsdom").JSDOM;

const html = fs.readFileSync(process.argv[2], "UTF-8");
const document = new JSDOM(html).window.document;
const tables = document.querySelectorAll('table');

const data = {};
Array.from(tables).forEach(table => {
  const caption = table.querySelector('caption').textContent.trim();
  const label = caption.replace(/（.+\）$/, "");

  let ymd = [2020, null, null];
  if (caption.match(/([0-9]+)月[0-9]+日から/)) ymd[1] = parseInt(RegExp.$1);

  const dates = Array.from(table.querySelectorAll('th')).map(a => {
    let date = a.textContent.replace(/\s/g, "");
    if (date.match(/^([0-9]+)月([0-9]+)日$/)) {
      ymd[1] = parseInt(RegExp.$1);
      ymd[2] = parseInt(RegExp.$2);
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


console.log("日付," + labels.join(","));
dates.forEach(date => {
  const x = [date];
  labels.forEach(label => {
    x.push(data[date][label] || "");
  });
  console.log(x.join(","));
});
