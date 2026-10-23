
const test=require('node:test'); const assert=require('node:assert/strict');
process.env.OPENROUTER_API_KEY=''; process.env.OPENAI_API_KEY=''; delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
const express=require('../node_modules/express');
const mod=require('../routes/fp-wave38c');
process.env.OPENROUTER_API_KEY=''; process.env.OPENAI_API_KEY='';
let tasks=[]; let seq=1;
const mainRows=[{"id": 1, "container_id": "alpha-1", "status": "open", "destination": "X", "vessel_name": "V"}, {"id": 2, "container_id": "beta-2", "status": "held", "destination": "Y", "vessel_name": "W"}];
const pool={query:async(sql,params=[])=>{
  if(sql.includes('CREATE TABLE')) return {rows:[]};
  if(sql.startsWith('INSERT INTO fp_wave38c_tasks')){const r={id:seq++,user_id:params[0],title:params[1],status:params[2],priority:params[3],notes:params[4]};tasks.push(r);return{rows:[r]};}
  if(sql.startsWith('SELECT * FROM fp_wave38c_tasks WHERE id=')) return {rows:tasks.filter(t=>String(t.id)===String(params[0])&&t.user_id===params[1])};
  if(sql.startsWith('UPDATE fp_wave38c_tasks')){const t=tasks.find(x=>String(x.id)===String(params[4])); if(t) Object.assign(t,{title:params[0],status:params[1],priority:params[2],notes:params[3]}); return {rows:t?[t]:[]};}
  if(sql.startsWith('SELECT * FROM fp_wave38c_tasks')) return {rows:tasks.filter(t=>t.user_id===params[0])};
  return {rows:mainRows};
}};
const auth=(req,res,next)=>{ if(!req.headers.authorization) return res.status(401).json({error:'no token'}); req.user={id:7}; next(); };
test('fp-wave38c tasks/search/export/ai fallback', async()=>{
  assert.equal(mod.filterRows(mainRows,'alpha',{}).length,1);
  assert.ok(mod.toCsv([{a:0,b:false,c:''}]).includes('0,false,'));
  const app=express(); app.use(express.json()); app.use('/api/fp-wave38c', mod.createRouter({pool,auth}));
  const srv=app.listen(0); const u=`http://127.0.0.1:${srv.address().port}/api/fp-wave38c`; const H={authorization:'Bearer x','content-type':'application/json'};
  try{
    assert.equal((await fetch(u+'/tasks')).status,401);
    const created=await (await fetch(u+'/tasks',{method:'POST',headers:H,body:JSON.stringify({title:'T1'})})).json();
    assert.equal(created.title,'T1');
    const upd=await (await fetch(u+'/tasks/'+created.id,{method:'PUT',headers:H,body:JSON.stringify({status:'done'})})).json();
    assert.equal(upd.status,'done');
    assert.equal((await (await fetch(u+'/tasks?status=done',{headers:H})).json()).length,1);
    assert.equal((await (await fetch(u+'/main?q=alpha',{headers:H})).json()).length,1);
    const csv=await (await fetch(u+'/main/export?format=csv',{headers:H})).text(); assert.ok(csv.toLowerCase().includes('alpha'));
    assert.equal((await (await fetch(u+'/main/export?format=json',{headers:H})).json()).length,2);
    for(const f of mod.AI_FEATURES){ const ai=await (await fetch(u+'/ai/'+f,{method:'POST',headers:H,body:JSON.stringify({records:[]})})).json(); assert.equal(ai.aiGenerated,false); assert.equal(ai.sections.counts.records,0); assert.equal(ai.sections.emptyState.zero,0); assert.equal(ai.sections.emptyState.flag,false); }
  } finally { srv.close(); }
});
