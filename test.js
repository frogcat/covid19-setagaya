const test = require('tape');
const fs = require('fs');
const filename = `${__dirname}/docs/data.csv`;

test('data.csv', function(t) {
  t.ok(fs.existsSync(filename), `data.csv が存在すること`);

  const lines = fs.readFileSync(filename, "UTF-8").trim().split("\n");
  t.ok(lines.length > 1, '2行以上のデータがあること');

  t.equal(lines.shift(), "日付,区民の検査件数,検査陽性者数の推移,日ごとの感染者数", 'ヘッダ行は既定のものであること');

  lines.forEach(line => {
    t.ok(line.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2},[0-9]*,[0-9]+,[0-9]+$/), `${line} が既定の正規表現を満たすこと`);
  });

  t.ok(lines.find((line, i) => i > 0 && !(lines[i - 1] < line)) === undefined, 'データは昇順ソートされていること');
  t.ok(lines[0].startsWith("2020-06-01"), '最古のデータは 2020-06-01 のものであること');

  const now = new Date();
  const ymd = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(a => a < 10 ? "0" + a : "" + a).join("-");
  t.ok(lines[lines.length - 1] < ymd, '最新のデータは現在日付よりも以前であること');

  t.end();

});
