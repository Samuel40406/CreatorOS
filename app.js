const $ = (s) => document.querySelector(s);
const money = (n) => Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dateBR = (d) => d ? new Date(d+'T12:00:00').toLocaleDateString('pt-BR') : '—';

const defaultData = {
  campaigns: [
    {id:1,brand:'Nike',name:'Verão 2026',value:6000,deadline:'2026-09-05',deliveries:2,status:'Ativa'},
    {id:2,brand:'Beats',name:'Sound On',value:3200,deadline:'2026-09-08',deliveries:3,status:'Ativa'},
    {id:3,brand:'Samsung',name:'Galaxy S26',value:3600,deadline:'2026-09-12',deliveries:1,status:'Aguardando'}
  ],
  metrics: [
    {campaign:'Nike — Verão 2026',platform:'Instagram',views:842391,likes:41283,comments:1842},
    {campaign:'Beats — Sound On',platform:'TikTok',views:1247820,likes:92310,comments:3910}
  ],
  payments: [
    {brand:'Nike',value:6000,due:'2026-08-30',status:'Atrasado'},
    {brand:'Beats',value:3200,due:'2026-09-08',status:'Em breve'},
    {brand:'Samsung',value:3600,due:'2026-09-20',status:'Pendente'}
  ]
};
let data = JSON.parse(localStorage.getItem('creatoros_mvp') || 'null') || defaultData;
let currentPage='inicio';

function save(){localStorage.setItem('creatoros_mvp',JSON.stringify(data));}
function totalViews(){return data.metrics.reduce((s,m)=>s+Number(m.views||0),0)}
function totalRevenue(){return data.campaigns.reduce((s,c)=>s+Number(c.value||0),0)}
function pending(){return data.payments.filter(p=>p.status!=='Recebido').reduce((s,p)=>s+Number(p.value||0),0)}

function dashboard(){
  const campaigns=data.campaigns.slice(0,5);
  const payments=data.payments.slice(0,5);
  return `
    <div class="grid stats">
      <div class="card"><div class="stat-label">Receita contratada</div><div class="stat-value">${money(totalRevenue())}</div><div class="trend up">↑ ${data.campaigns.length} campanhas</div></div>
      <div class="card"><div class="stat-label">A receber</div><div class="stat-value">${money(pending())}</div><div class="trend warn">Pagamentos pendentes</div></div>
      <div class="card"><div class="stat-label">Campanhas ativas</div><div class="stat-value">${data.campaigns.filter(c=>c.status==='Ativa').length}</div><div class="trend up">Seu pipeline</div></div>
      <div class="card"><div class="stat-label">Views registradas</div><div class="stat-value">${compact(totalViews())}</div><div class="trend up">Instagram + TikTok</div></div>
    </div>
    <div class="grid two">
      <div class="card"><div class="card-head"><h2>Próximas campanhas</h2><button class="link" data-go="campanhas">Ver todas →</button></div>
        <div class="list">${campaigns.length?campaigns.map(c=>campaignRow(c)).join(''):`<div class="empty">Nenhuma campanha cadastrada.</div>`}</div>
      </div>
      <div class="card"><div class="card-head"><h2>Pagamentos</h2><button class="link" data-go="financeiro">Ver todos →</button></div>
        <div class="list">${payments.length?payments.map(p=>paymentRow(p)).join(''):`<div class="empty">Nenhum pagamento.</div>`}</div>
      </div>
    </div>
    <div class="grid two" style="margin-top:14px">
      <div class="card"><div class="card-head"><h2>Resumo de performance</h2><button class="link" data-go="metricas">Abrir métricas →</button></div>
        <div class="grid metric-grid">
          <div><div class="stat-label">Views</div><div class="stat-value">${compact(totalViews())}</div></div>
          <div><div class="stat-label">Curtidas</div><div class="stat-value">${compact(data.metrics.reduce((s,m)=>s+Number(m.likes||0),0))}</div></div>
          <div><div class="stat-label">Comentários</div><div class="stat-value">${compact(data.metrics.reduce((s,m)=>s+Number(m.comments||0),0))}</div></div>
          <div><div class="stat-label">Posts medidos</div><div class="stat-value">${data.metrics.length}</div></div>
        </div>
        <p class="note">No MVP, as métricas são lançadas manualmente. A integração oficial com Instagram/TikTok entra em uma próxima versão.</p>
      </div>
      <div class="card"><div class="card-head"><h2>Visão dos próximos meses</h2></div>${bars()}</div>
    </div>`;
}
function compact(n){return n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n)}
function campaignRow(c){return `<div class="row"><div class="row-main"><div class="logo">${escape(c.brand[0])}</div><div><div class="row-title">${escape(c.brand)} — ${escape(c.name)}</div><div class="row-sub">${c.deliveries} entrega(s) · prazo ${dateBR(c.deadline)}</div></div></div><span class="pill ${c.status==='Ativa'?'green':'yellow'}">${escape(c.status)}</span></div>`}
function paymentRow(p){return `<div class="row"><div><div class="row-title">${escape(p.brand)}</div><div class="row-sub">${money(p.value)} · venc. ${dateBR(p.due)}</div></div><span class="pill ${p.status==='Atrasado'?'red':p.status==='Em breve'?'yellow':'green'}">${escape(p.status)}</span></div>`}
function bars(){let vals=[7200,9100,7800,12400,15600,18450];let max=Math.max(...vals);return `<div class="bar-wrap">${vals.map((v,i)=>`<div class="bar-col"><div class="bar" style="height:${Math.max(8,v/max*150)}px"></div><div class="bar-label">${['Abr','Mai','Jun','Jul','Ago','Set'][i]}</div></div>`).join('')}</div>`}

function campaignsPage(){
 return `<div class="page-actions"><input class="search" id="campaign-search" placeholder="Buscar campanhas..."><button class="primary" id="new-campaign">＋ Nova campanha</button></div>
 <div class="card"><table class="table"><thead><tr><th>Campanha</th><th>Prazo</th><th>Valor</th><th>Entregas</th><th>Status</th></tr></thead><tbody>
 ${data.campaigns.map(c=>`<tr><td><strong>${escape(c.brand)}</strong><br><span class="row-sub">${escape(c.name)}</span></td><td>${dateBR(c.deadline)}</td><td>${money(c.value)}</td><td>${c.deliveries}</td><td><span class="pill ${c.status==='Ativa'?'green':'yellow'}">${escape(c.status)}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function deliveriesPage(){
 const items=data.campaigns.flatMap(c=>Array.from({length:c.deliveries},(_,i)=>({brand:c.brand,name:c.name,n:i+1,deadline:c.deadline,status:i===0?'Pendente':'Planejada'})));
 return `<div class="card"><div class="card-head"><h2>Entregas</h2><span class="note">${items.length} no total</span></div><table class="table"><thead><tr><th>Marca</th><th>Entrega</th><th>Prazo</th><th>Status</th></tr></thead><tbody>${items.map(x=>`<tr><td><strong>${escape(x.brand)}</strong></td><td>${escape(x.name)} #${x.n}</td><td>${dateBR(x.deadline)}</td><td><span class="pill ${x.status==='Pendente'?'yellow':'green'}">${x.status}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function financePage(){
 return `<div class="grid stats"><div class="card"><div class="stat-label">Contratado</div><div class="stat-value">${money(totalRevenue())}</div></div><div class="card"><div class="stat-label">A receber</div><div class="stat-value">${money(pending())}</div></div><div class="card"><div class="stat-label">Pagamentos</div><div class="stat-value">${data.payments.length}</div></div><div class="card"><div class="stat-label">Campanhas</div><div class="stat-value">${data.campaigns.length}</div></div></div>
 <div class="card"><div class="card-head"><h2>Contas a receber</h2></div><table class="table"><thead><tr><th>Marca</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead><tbody>${data.payments.map(paymentRowTable).join('')}</tbody></table></div>`;
}
function paymentRowTable(p){return `<tr><td><strong>${escape(p.brand)}</strong></td><td>${money(p.value)}</td><td>${dateBR(p.due)}</td><td><span class="pill ${p.status==='Atrasado'?'red':p.status==='Em breve'?'yellow':'green'}">${p.status}</span></td></tr>`}
function metricsPage(){
 return `<div class="grid stats"><div class="card"><div class="stat-label">Views totais</div><div class="stat-value">${compact(totalViews())}</div></div><div class="card"><div class="stat-label">Curtidas</div><div class="stat-value">${compact(data.metrics.reduce((s,m)=>s+Number(m.likes||0),0))}</div></div><div class="card"><div class="stat-label">Comentários</div><div class="stat-value">${compact(data.metrics.reduce((s,m)=>s+Number(m.comments||0),0))}</div></div><div class="card"><div class="stat-label">Conteúdos</div><div class="stat-value">${data.metrics.length}</div></div></div>
 <div class="card"><div class="card-head"><h2>Conteúdos monitorados</h2><button class="primary" id="add-metric">＋ Registrar conteúdo</button></div><table class="table"><thead><tr><th>Campanha</th><th>Plataforma</th><th>Views</th><th>Curtidas</th><th>Comentários</th></tr></thead><tbody>${data.metrics.map(m=>`<tr><td>${escape(m.campaign)}</td><td>${escape(m.platform)}</td><td><strong>${Number(m.views).toLocaleString('pt-BR')}</strong></td><td>${Number(m.likes).toLocaleString('pt-BR')}</td><td>${Number(m.comments).toLocaleString('pt-BR')}</td></tr>`).join('')}</tbody></table>
 <p class="note">Próxima versão: conectar as contas do creator e atualizar métricas automaticamente usando APIs oficiais.</p></div>`;
}
function openMetric(){
 const campaign=prompt('Campanha (ex.: Nike — Verão 2026):'); if(!campaign)return;
 const platform=prompt('Plataforma (Instagram ou TikTok):','Instagram'); if(!platform)return;
 const views=prompt('Views do conteúdo:','0'); if(views===null)return;
 const likes=prompt('Curtidas:','0'); if(likes===null)return;
 const comments=prompt('Comentários:','0'); if(comments===null)return;
 data.metrics.push({campaign,platform,views:Number(views),likes:Number(likes),comments:Number(comments)});save();render();
}
function render(){
 const titles={inicio:'Olá! 👋',campanhas:'Campanhas',entregas:'Entregas',financeiro:'Financeiro',metricas:'Métricas'};
 $('#page-title').textContent=titles[currentPage];
 $('#app').innerHTML={inicio:dashboard,campanhas:campaignsPage,entregas:deliveriesPage,financeiro:financePage,metricas:metricsPage}[currentPage]();
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));
 bind();
}
function bind(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{currentPage=b.dataset.go;render()});
 const n=$('#new-campaign'); if(n)n.onclick=openCampaign;
 const q=$('#quick-campaign'); if(q)q.onclick=openCampaign;
 const add=$('#add-metric'); if(add)add.onclick=openMetric;
 const search=$('#campaign-search'); if(search)search.oninput=()=>{const term=search.value.toLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.style.display=r.innerText.toLowerCase().includes(term)?'':'none')};
}
function openCampaign(){
 $('#modal').classList.remove('hidden'); $('#modal-title').textContent='Nova campanha'; $('#campaign-form').reset();
}
$('#close-modal').onclick=()=>$('#modal').classList.add('hidden');
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};
$('#campaign-form').onsubmit=e=>{
 e.preventDefault();const f=new FormData(e.target);
 data.campaigns.unshift({id:Date.now(),brand:f.get('brand'),name:f.get('name'),value:Number(f.get('value')),deadline:f.get('deadline'),deliveries:Number(f.get('deliveries')),status:'Ativa'});
 data.payments.unshift({brand:f.get('brand'),value:Number(f.get('value')),due:f.get('deadline'),status:'Pendente'});
 save();$('#modal').classList.add('hidden');currentPage='campanhas';render();
};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{currentPage=b.dataset.page;render()});
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
render();
