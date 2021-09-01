
// /computer-programming/30/5800693606596608/5237743653175296.png

// email: raxeni5133@eyeremind.com
// pass: FuckKhan123!

const fs = require("fs");
const fetch = require("node-fetch");
let logins = require("./logins");
let baseUrl = "https://www.khanacademy.org/api/internal";
let activeKAAS = "4jAcPRf595IFLFoG8tTLrg"; //logins[2000].KAAS;
let generation = 9;

// Create program
async function makeNewCopy() {
  let title = `#${generation}`;
  let thumbnailPath = "assets/winston.gif";
  let headers = {
    "content-type": "application/json",
    "x-ka-fkey": `lol`,
    cookie: `KAAS=${activeKAAS}; fkey=lol`,
  };
  let req = await fetch(`${baseUrl}/scratchpads`, {
    headers: headers,
    body: JSON.stringify({
      userAuthoredContentType: "pjs",
      title: title,
      revision: {
        code: `// w1nston v1rus ${title}`,
        folds: [],
        image_url: `data:image/png;base64,${fs.readFileSync(
          thumbnailPath,
          "base64"
        )}`,
      },
    }),
    method: "POST",
  });
  response = await req.json();
  return response;
}

async function voteProgram200(programData) {
  let entity_key = programData.key;

  // Define task
  for (var i = 0; i < 150; i ++) {
		let ind = (3 + generation * 200 + i) % logins.length
		let KAAS = logins[ind].KAAS
    let res = await fetch(
      `${baseUrl}/discussions/voteentity?entity_key=${entity_key}&vote_type=${1}`,
      {
        headers: {
          "content-type": "application/json",
          "x-ka-fkey": `lol`,
          cookie: `KAAS=${KAAS}; fkey=lol`,
        },
        body: ``,
        method: "POST",
      }
    )
      if (res.status !== 200) {
         console.log(`Error voting: ${res.status}`);
				 continue
      }
    console.log(res.status, generation, i);
  }
}

async function mainLoop() {
  for (let i = 0; i < 30; i++) {
    let programData = await makeNewCopy();
		console.log('new!!', programData.url);
    //await voteProgram200(programData);
    generation++;
  }
}

mainLoop();
