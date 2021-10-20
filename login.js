let puppeteer = require("puppeteer-extra");
let pluginStealth = require("puppeteer-extra-plugin-stealth");
let fs = require("fs");
let history = {};
(async () => {
  puppeteer.use(pluginStealth());
  let browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  let detailObj = {
    Email: "",
    PassWord: "",
  };

  // we have two option to login on
  // by emailid and password
  // await loginPepecodingWithPassword(browser);

  // using goole login
  // first we login to browser then goto pepcoding website then choose google login
  await loginGoogleInBrowser(browser, detailObj);
  await loginPepecodingWithGoogle(browser);
})();

//========== Level 1
// get links of all topics of level1
async function Level1_Links(browser) {
  let resourceLink = "https://www.pepcoding.com/resources/";
  let level1 = await browser.newPage();
  await level1.bringToFront(); // to shift focus to new tab
  await level1.goto(resourceLink);

  await level1.waitForTimeout(3000);
  await level1.click("a[href='/resources/online-java-foundation']");

  await level1.waitForTimeout(3000);

  const xpath_expression = "//ul/li/a[@href]";
  const links = await level1.$x(xpath_expression);
  const link_urls = await level1.evaluate((...links) => {
    return links.map((e) => e.href);
  }, ...links);

  let topicLinks = [];
  for (let i = 7; i < link_urls.length - 3; i++) {
    topicLinks.push(link_urls[i]);
  }

  await allQuestion(browser, topicLinks);
  await browser.close();
}

// =========== Level 2
async function Level2_Links(browser) {
  let resourceLink = "https://www.pepcoding.com/resources/";
  let level1 = await browser.newPage();
  await level1.bringToFront(); // to shift focus to new tab
  await level1.goto(resourceLink);

  await level1.click("a[href='/resources/online-java-foundation']");

  await level1.waitForTimeout(3000);
  const xpath_expression = "//ul/li/a[@href]";

  const links = await level1.$x(xpath_expression);
  const link_urls = await level1.evaluate((...links) => {
    return links.map((e) => e.href);
  }, ...links);

  let topicLinks = [];
  for (let i = 7; i < link_urls.length - 3; i++) {
    topicLinks.push(link_urls[i]);
  }

  return topicLinks;
}

// itertate topic and find all questions links in thar topic
async function allQuestion(browser, topicLinks) {
  let questionTab = await browser.newPage();
  await questionTab.bringToFront();
  for (let i = 0; i <= topicLinks.length; i++) {
    // we can run this smaller also till what topic we want excel sheet
    await questionTab.goto(topicLinks[i], {
      waitUntil: "networkidle2",
    });

    let questionLinks = await questionTab.$$eval(
      "li[resource-type='ojquestion']  a",
      (aTag) =>
        aTag.map((x) => "https://www.pepcoding.com" + x.getAttribute("href"))
    );

    await getQuestionSubmissions(browser, questionTab, questionLinks);
  }
  await questionTab.close();
}

// itertate question and find submission data of each question
async function getQuestionSubmissions(browser, tab, questionLinks) {
  let questionTab = await browser.newPage();
  await questionTab.bringToFront();

  for (let q = 0; q < questionLinks.length; q++) {
    let linkSplit = questionLinks[q].split("/");
    let questionName = linkSplit[linkSplit.length - 2];
    await questionTab.goto(questionLinks[q], {
      waitUntil: "networkidle2",
    });
    await questionTab.click("a[action='showHistory']");
    await questionTab.waitForTimeout(3000);

    console.log("Start here ");
    let selectorDate =
      "ul >li[action='showSubmittedCode']>div>span:nth-child(4)";
    let selectorScore =
      "ul >li[action='showSubmittedCode']>div>span:nth-child(5)";
    const submissionDate = await questionTab.$$eval(selectorDate, (el) =>
      el.map((x) => x.innerText)
    );
    const submissionScore = await questionTab.$$eval(selectorScore, (el) =>
      el.map((x) => x.innerText)
    );

    let submissions = [];
    for (let i = 0; i < submissionDate.length; i++) {
      let score = {
        date: submissionDate[i],
        score: submissionScore[i],
      };
      submissions.push(score);
    }
    console.log(submissions);
    history[questionName] = {
      link: questionLinks[q],
      submissions,
    };

    console.dir(history);
  }
  console.log("loop finish ");
  console.dir(history);
  fs.writeFileSync("pepcoding.json", JSON.stringify(history), "utf-8");

  await questionTab.close();
}

///================  Authtentication section =======================

// auth with email and passoword
let pep = {
  email: "",
  PassWord: "",
};

async function loginPepecodingWithPassword(browser) {
  const tab2 = await browser.newPage();
  await tab2.bringToFront(); // to shift focus to new tab
  let url = "https://www.pepcoding.com/login";
  await tab2.goto(url, {
    waitUntil: "networkidle2",
  });

  await tab2.type("input[name='email']", pep.email, { delay: 30 });
  await tab2.type("input[name='password']", pep.PassWord, { delay: 30 });
  await tab2.keyboard.press("Enter");
  await tab2.waitForNavigation({ waitUntil: "networkidle2" });

  await Level1_Links(browser);
}

// auth with google account

async function loginGoogleInBrowser(browser, detailObj) {
  let pages = await browser.pages();
  let tab1 = pages[0];
  await tab1.goto(
    "https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin"
  );

  await tab1.waitForTimeout(3000);
  await tab1.waitForSelector("input"); //Email Id
  await tab1.type("input", detailObj.Email, { delay: 30 });

  await tab1.waitForSelector("span.VfPpkd-vQzf8d"); //Submit
  await tab1.click("span.VfPpkd-vQzf8d", { delay: 30 });

  await tab1.waitForTimeout(2000);
  await tab1.waitForSelector("input.whsOnd.zHQkBf"); //Password
  await tab1.waitForTimeout(3000);
  await tab1.type("input.whsOnd.zHQkBf", detailObj.PassWord, { delay: 50 });

  await tab1.waitForTimeout(2000);
  await tab1.waitForSelector("span.VfPpkd-vQzf8d"); //Submit
  await tab1.waitForSelector("span.VfPpkd-vQzf8d");
  await tab1.click("span.VfPpkd-vQzf8d", { delay: 100 });
  await tab1.waitForTimeout(30000);
  return;
}

async function loginPepecodingWithGoogle(browser) {
  const tab2 = await browser.newPage();
  await tab2.bringToFront(); // to shift focus to new tab
  let url = "https://www.pepcoding.com/login";
  await tab2.goto(url, {
    waitUntil: "networkidle2",
  });
  await tab2.waitForSelector(".abcRioButtonContents");
  const link = await tab2.$(".abcRioButtonContents"); // declare object
  const newPagePromise = new Promise((x) => tab2.once("popup", x));

  await link.click(); // click, a new tab opens
  const newPage = await newPagePromise; // declare new tab /window,

  const loginTab = await browser.newPage();
  await loginTab.goto(newPage._target._targetInfo.url, {
    waitUntil: "networkidle2",
  });

  await loginTab.waitForSelector("div.w1I7fb");
  await loginTab.click("div.w1I7fb");
  await loginTab.waitForTimeout(30000);
  await loginTab.close();
  await loginTab.waitForTimeout(10000);
  await newPage.close();

  await Level1_Links(browser);
}
