const fs = require('fs');
const statePath = 'state.json';
const prdPath = 'docs/PRD.md';

try {
  const prdContent = fs.readFileSync(prdPath, 'utf8');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  
  state.workflowVersion = 2;
  state.state = 5;
  state.prd.markdown = prdContent;
  state.prd.finalized = false;
  state.prd.revisiFeedback = "";
  
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  console.log('Successfully updated state.json after revision.');
} catch (e) {
  console.error('Error updating state:', e);
}
