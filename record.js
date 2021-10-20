let fs = require("fs");
let xl = require("excel4node");

let wb = new xl.Workbook();

let ws = wb.addWorksheet("Level 1");

let jsonData = fs.readFileSync("pepcoding.json", "utf-8");
let record = JSON.parse(jsonData);

let qh = {
  font: {
    color: "#e63946",
    size: 18,
    bold: true,
  },
  alignment: {
    horizontal: ["center"],
    vertical: ["center"],
  },
};

let Fs = {
  font: {
    size: 13,
    bold: true,
  },
  fill: {
    type: "pattern",
    patternType: "solid",
    fgColor: "#06d6a0",
  },
  alignment: {
    horizontal: ["center"],
    vertical: ["center"],
  },
};

let zs = {
  font: {
    size: 13,
    bold: true,
  },
  fill: {
    type: "pattern",
    patternType: "solid",
    fgColor: "#ef233c",
  },
  alignment: {
    horizontal: ["center"],
    vertical: ["center"],
  },
};

let qn = {
  font: {
    size: 15,
  },
};

let ps = {
  font: {
    size: 13,
    bold: true,
  },
  fill: {
    type: "pattern",
    patternType: "solid",
    fgColor: "#98c1d9",
  },
  alignment: {
    horizontal: ["center"],
    vertical: ["center"],
  },
};

ws.cell(1, 1).string("Questions").style(qh);
ws.cell(1, 2).string("History ").style(qh);
ws.column(1).setWidth(60);
let itr = 2;
for (let q in record) {
  let history = record[q].submissions;
  ws.cell(itr, 1).link(record[q].link, q, "pepcoding question link").style(qn);

  for (let i = 0; i < history.length; i++) {
    ws.column(i + 2).setWidth(17);

    let date = history[i].date;
    let score = history[i].score;
    let details = date + " | " + score;

    if (parseInt(score) === 10) {
      ws.cell(itr, i + 2)
        .string(details)
        .style(Fs);
    } else if (parseInt(score) === 0) {
      ws.cell(itr, i + 2)
        .string(details)
        .style(zs);
    } else {
      ws.cell(itr, i + 2)
        .string(details)
        .style(ps);
    }
  }
  itr++;
}

// wb.write("QuestionSubmission.xlsx");
