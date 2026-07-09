const fs = require('fs');

const stateStr = fs.readFileSync('state.json', 'utf-8');
const state = JSON.parse(stateStr);

const prdStr = fs.readFileSync('docs/PRD.md', 'utf-8');

state.prd = {
  markdown: prdStr,
  finalized: false,
  revisiFeedback: ""
};
state.state = 4;

fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
console.log("State updated to 4 with PRD markdown.");
