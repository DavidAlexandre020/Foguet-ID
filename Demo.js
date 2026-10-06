const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d');
const rnd=(a,b)=>a+Math.random()*(b-a),TOTAL=14;
let W,H,s,dpr,t=0,cx,cy,S,bay,L1,L2,reach;
let debris=[],collected=0,mass=0,paused=false,manual=false,speed=1,flash=0,flashMsg='',glow=0;
const arm={ee:{x:0,y:0},g:.7,state:'idle',target:null,timer:0};
const stars=Array.from({length:160},()=>({x:Math.random(),y:Math.random(),r:rnd(.4,1.4),a:rnd(.3,1)}));
const land=Array.from({length:60},()=>({a:Math.random()*6.283,r:rnd(.93,.995),w:rnd(.03,.1),h:rnd(.008,.025),c:['#3b7a3a','#5f9a45','#a8a05a','#2f6a4a'][Math.floor(rnd(0,4))],cl:Math.random()<.45}));

function resize(){
  dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();W=r.width;H=r.height;
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  s=Math.max(.6,Math.min(W/900,H/620,1.4));
}
function geom(){
  cx=W*.17;cy=H*.36+Math.sin(t*.6)*3*s;
  S={x:cx+90*s,y:cy-8*s};bay={x:cx+52*s,y:cy+30*s};
  L1=185*s;L2=165*s;reach=(L1+L2)*.96;
}
function mk(x){
  const sz=rnd(15,28),pts=Array.from({length:8},(_,i)=>{const a=i/8*6.283;const r=rnd(.6,1.2);return[Math.cos(a)*r,Math.sin(a)*r]});
  return{x:x,y:rnd(.1,.7)*H,vx:-rnd(12,26),vy:rnd(-3,3),a:rnd(0,6.28),va:rnd(-.6,.6),type:Math.floor(rnd(0,4)),sz,mass:Math.round(rnd(20,900)),sc:1,mode:'free',pts};
}
function init(){
  geom();debris=[];collected=0;mass=0;
  for(let i=0;i<TOTAL;i++)debris.push(mk(rnd(S.x+60*s,W+W*.3)));
  arm.ee={x:bay.x,y:bay.y};arm.state='idle';arm.target=null;arm.g=.7;
}
const inReach=d=>Math.hypot(d.x-S.x,d.y-S.y)<reach-d.sz*s*.3;
function pick(){let b=null,bd=1e9;for(const d of debris){if(d.mode!=='free'||!inReach(d))continue;const k=Math.hypot(d.x-arm.ee.x,d.y-arm.ee.y);if(k<bd){bd=k;b=d}}return b}
function moveEE(g,dt){
  const dx=g.x-arm.ee.x,dy=g.y-arm.ee.y,d=Math.hypot(dx,dy),st=240*s*dt;
  if(d<=st){arm.ee.x=g.x;arm.ee.y=g.y;return true}
  arm.ee.x+=dx/d*st;arm.ee.y+=dy/d*st;return false;
}
function update(dt){
  t+=dt;geom();
  for(const d of debris){
    d.a+=d.va*dt;
    if(d.mode!=='free')continue;
    d.x+=d.vx*s*dt;d.y+=d.vy*s*dt;
    if(d.x<S.x+30*s){d.x=W+60;d.y=rnd(.1,.7)*H}
  }
  const T=arm.target,k=Math.min(1,dt*8);
  const ready={x:S.x+reach*.6,y:S.y-reach*.15};
  switch(arm.state){
    case 'idle':
      arm.g+=(.7-arm.g)*k;
      if(!manual&&!arm.target)arm.target=pick();
      if(arm.target){arm.state='approach';}
      else moveEE(ready,dt);
      break;
    case 'approach':
      arm.g+=(.7-arm.g)*k;
      if(!T||T.mode!=='free'||!inReach(T)){arm.target=null;arm.state='idle';break}
      if(moveEE(T,dt)){arm.state='grab';arm.timer=0}
      break;
    case 'grab':
      arm.timer+=dt;arm.g+=(.12-arm.g)*k;arm.ee.x=T.x;arm.ee.y=T.y;
      if(arm.timer>.6){T.mode='held';arm.state='return'}
      break;
    case 'return':
      arm.g=.12;
      if(moveEE(bay,dt)){arm.state='store';arm.timer=0}
      T.x=arm.ee.x;T.y=arm.ee.y;
      break;
    case 'store':
      arm.timer+=dt;glow=1;arm.g+=(.7-arm.g)*k;T.x=arm.ee.x;T.y=arm.ee.y;T.sc=Math.max(0,1-arm.timer/.9);
      if(arm.timer>=.9){
        debris.splice(debris.indexOf(T),1);collected++;mass+=T.mass;arm.target=null;arm.state='idle';
      }
      break;
  }
  glow=Math.max(0,glow-dt*1.5);
}

/* ---------- desenho ---------- */
function grid(x,y,w,h,nx,ny,fill,line){
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.strokeStyle=line;ctx.lineWidth=.7;ctx.beginPath();
  for(let i=1;i<nx;i++){ctx.moveTo(x+w*i/nx,y);ctx.lineTo(x+w*i/nx,y+h)}
  for(let j=1;j<ny;j++){ctx.moveTo(x,y+h*j/ny);ctx.lineTo(x+w,y+h*j/ny)}
  ctx.stroke();ctx.strokeRect(x,y,w,h);
}
function drawEarth(){
  const R=W*1.25,ex=W*.55,ey=H*.74+R;
  let g=ctx.createRadialGradient(ex,ey,R,ex,ey,R+70*s);
  g.addColorStop(0,'rgba(90,170,255,.6)');g.addColorStop(1,'rgba(90,170,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(ex,ey,R+70*s,0,6.283);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(ex,ey,R,0,6.283);ctx.clip();
  g=ctx.createRadialGradient(ex,ey-R*.9,R*.05,ex,ey,R);
  g.addColorStop(0,'#4a9be8');g.addColorStop(.5,'#1c5fb8');g.addColorStop(1,'#06214f');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(const b of land){
    const th=b.a+t*.006;const x=ex+Math.cos(th)*R*b.r,y=ey+Math.sin(th)*R*b.r;
    ctx.save();ctx.translate(x,y);ctx.rotate(th+Math.PI/2);
    ctx.fillStyle=b.cl?'rgba(255,255,255,.5)':b.c;
    ctx.beginPath();ctx.ellipse(0,0,b.w*R,b.h*R,0,0,6.283);ctx.fill();ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle='rgba(150,205,255,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(ex,ey,R,0,6.283);ctx.stroke();
}
function drawDebris(d){
  const u=d.sz*s;ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.scale(d.sc,d.sc);
  if(d.type===0){grid(-u*1.3,-u*.7,u*2.6,u*1.4,6,3,'#1a3a8f','rgba(140,175,255,.7)');ctx.strokeStyle='#8a8f99';ctx.lineWidth=1.5;ctx.strokeRect(-u*1.3,-u*.7,u*2.6,u*1.4)}
  else if(d.type===1){const g=ctx.createLinearGradient(0,-u*.5,0,u*.5);g.addColorStop(0,'#d5dae2');g.addColorStop(1,'#5b6270');ctx.fillStyle=g;ctx.fillRect(-u*1.2,-u*.5,u*2.4,u);ctx.fillStyle='#2a303b';ctx.beginPath();ctx.ellipse(u*1.2,0,u*.18,u*.5,0,0,6.283);ctx.fill()}
  else if(d.type===2){ctx.fillStyle='#2a2f3a';ctx.strokeStyle='#7d8696';ctx.lineWidth=1.2;ctx.fillRect(-u*.8,-u*.8,u*1.6,u*1.6);ctx.strokeRect(-u*.8,-u*.8,u*1.6,u*1.6);ctx.fillStyle='#b8913a';ctx.fillRect(-u*.6,-u*.6,u*.7,u*.5);grid(u*.8,-u*.5,u*1.1,u,3,3,'#1a3a8f','rgba(140,175,255,.7)')}
  else{ctx.fillStyle='#3a3d46';ctx.strokeStyle='#8a909c';ctx.lineWidth=1.2;ctx.beginPath();d.pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p[0]*u,p[1]*u));ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.restore();
}
function drawShip(){
  ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);
  ctx.strokeStyle='#8a93a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,-55);ctx.lineTo(10,-70);ctx.moveTo(-60,55);ctx.lineTo(-60,70);ctx.stroke();
  ctx.save();ctx.translate(10,-70);ctx.transform(1,0,-.35,1,0,0);grid(-70,-85,120,85,8,6,'#173a96','rgba(150,185,255,.55)');ctx.restore();
  ctx.save();ctx.translate(-60,70);ctx.transform(1,0,.3,1,0,0);grid(-80,0,120,80,8,5,'#173a96','rgba(150,185,255,.55)');ctx.restore();
  // antena
  ctx.strokeStyle='#cfd5df';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-30,-52);ctx.lineTo(-30,-78);ctx.stroke();
  ctx.fillStyle='#f1f4f9';ctx.strokeStyle='#8a93a5';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(-30,-86,16,20,-.35,0,6.283);ctx.fill();ctx.stroke();
  // bocal
  ctx.fillStyle='#0d1522';ctx.beginPath();ctx.ellipse(-112,0,16,44,0,0,6.283);ctx.fill();ctx.strokeStyle='#c9a24a';ctx.lineWidth=3;ctx.stroke();
  // corpo
  const g=ctx.createLinearGradient(0,-55,0,55);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#dfe5ee');g.addColorStop(1,'#8d9ab0');
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-110,-55,200,110,34);ctx.fill();
  ctx.strokeStyle='rgba(60,72,96,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-84,-52);ctx.lineTo(-84,52);ctx.moveTo(40,-54);ctx.lineTo(40,54);ctx.stroke();
  ctx.fillStyle='#1a2230';ctx.beginPath();ctx.roundRect(56,-44,34,88,10);ctx.fill();
  ctx.fillStyle='#6fc3ff';[-30,-10,10,30].forEach(y=>{ctx.beginPath();ctx.arc(66,y,2.5,0,6.283);ctx.fill()});
  // compartimento
  ctx.fillStyle='#141b28';ctx.beginPath();ctx.roundRect(30,22,44,16,4);ctx.fill();
  ctx.strokeStyle=`rgba(95,211,95,${.35+.65*glow})`;ctx.lineWidth=2;ctx.shadowColor='#5fd35f';ctx.shadowBlur=14*glow;ctx.stroke();ctx.shadowBlur=0;
  // folha + texto
  ctx.fillStyle='#4fb04a';ctx.beginPath();ctx.moveTo(-70,12);ctx.bezierCurveTo(-90,-6,-76,-28,-52,-24);ctx.bezierCurveTo(-48,-2,-56,12,-70,12);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-68,10);ctx.lineTo(-56,-16);ctx.stroke();
  ctx.fillStyle='#1b2333';ctx.textAlign='left';
  ctx.font="700 14px 'Space Grotesk',sans-serif";ctx.fillText('CLEAN SPACE',-42,-8);
  ctx.font="600 12px 'Space Grotesk',sans-serif";ctx.fillText('MISSION',-42,6);
  ctx.fillRect(-42,11,66,1);
  ctx.font="500 5.5px 'Space Grotesk',sans-serif";ctx.fillText('UM FUTURO MAIS LIMPO',-42,20);ctx.fillText('PARA O ESPAÇO',-42,27);
  ctx.restore();
}
function ik(wt){
  const dx=wt.x-S.x,dy=wt.y-S.y,d=Math.hypot(dx,dy),dd=Math.max(Math.abs(L1-L2)+4,Math.min(L1+L2-1,d)),base=Math.atan2(dy,dx);
  const c=Math.max(-1,Math.min(1,(L1*L1+dd*dd-L2*L2)/(2*L1*dd))),a=base-Math.acos(c);
  return{e:{x:S.x+Math.cos(a)*L1,y:S.y+Math.sin(a)*L1},w:{x:S.x+Math.cos(base)*dd,y:S.y+Math.sin(base)*dd}};
}
function seg(a,b,w){
  ctx.lineCap='round';
  ctx.strokeStyle='#2b3445';ctx.lineWidth=w+5*s;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.strokeStyle='#e8ecf2';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  const an=Math.atan2(b.y-a.y,b.x-a.x),nx=-Math.sin(an),ny=Math.cos(an);
  ctx.strokeStyle='#8794a8';ctx.lineWidth=3*s;ctx.lineCap='butt';
  for(const f of[.3,.7]){const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;ctx.beginPath();ctx.moveTo(x-nx*w*.45,y-ny*w*.45);ctx.lineTo(x+nx*w*.45,y+ny*w*.45);ctx.stroke()}
}
function joint(p,r){
  ctx.fillStyle='#232b3a';ctx.strokeStyle='#c9a24a';ctx.lineWidth=2.5*s;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.283);ctx.fill();ctx.stroke();
  ctx.fillStyle='#46536e';ctx.beginPath();ctx.arc(p.x,p.y,r*.5,0,6.283);ctx.fill();
  ctx.fillStyle='#6fc3ff';ctx.beginPath();ctx.arc(p.x+r*.3,p.y-r*.3,1.6*s,0,6.283);ctx.fill();
}
function drawArm(){
  const th=Math.atan2(arm.ee.y-S.y,arm.ee.x-S.x),wt={x:arm.ee.x-Math.cos(th)*14*s,y:arm.ee.y-Math.sin(th)*14*s};
  const k=ik(wt);
  seg(S,k.e,24*s);seg(k.e,k.w,20*s);
  joint(S,21*s);joint(k.e,16*s);joint(k.w,12*s);
  if(arm.target&&arm.target.mode==='held')drawDebris(arm.target);
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const sg of[-1,1]){
    const a1=th+sg*arm.g,p1={x:k.w.x+Math.cos(a1)*20*s,y:k.w.y+Math.sin(a1)*20*s},a2=th+sg*(arm.g-.9),p2={x:p1.x+Math.cos(a2)*14*s,y:p1.y+Math.sin(a2)*14*s};
    for(const[c,w]of[['#2b3445',9*s],['#cfd5df',5.5*s]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(k.w.x,k.w.y);ctx.lineTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke()}
  }
}
function reticle(d){
  const r=d.sz*s*1.3+8*s;ctx.save();ctx.translate(d.x,d.y);ctx.rotate(t*1.2);
  ctx.strokeStyle='#5fd35f';ctx.lineWidth=2;ctx.setLineDash([r*.5,r*.35]);ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.stroke();ctx.restore();
}
function draw(){
  geom();
  ctx.fillStyle='#05080f';ctx.fillRect(0,0,W,H);
  for(const p of stars){ctx.fillStyle=`rgba(255,255,255,${p.a})`;ctx.fillRect(p.x*W,p.y*H,p.r,p.r)}
  drawEarth();
  // alcance do braço
  ctx.strokeStyle='rgba(224,176,74,.18)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(S.x,S.y,reach,-1.2,1.2);ctx.stroke();ctx.setLineDash([]);
  for(const d of debris){
    if(d.mode==='free'){
      if(inReach(d)&&d!==arm.target){ctx.strokeStyle='rgba(224,176,74,.4)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(d.x,d.y,d.sz*s*1.3+6*s,0,6.283);ctx.stroke();ctx.setLineDash([])}
      drawDebris(d);
    }
  }
  if(arm.target&&arm.target.mode==='free'){reticle(arm.target)}
  drawShip();drawArm();
  const m=status();if($('st').textContent!==m)$('st').textContent=m;
  $('sC').textContent=collected;$('sO').textContent=debris.length;$('sM').textContent=mass.toLocaleString('pt-PT');
}
function status(){
  if(flash>0)return flashMsg;
  if(!debris.length)return 'Órbita limpa. Missão cumprida.';
  return{idle:manual?'Em espera. Escolhe um detrito.':'A procurar alvo…',approach:'A aproximar-se do alvo',grab:'A capturar o detrito',return:'A levar o detrito para o compartimento',store:'A armazenar'}[arm.state];
}

/* ---------- controlos ---------- */
cv.addEventListener('pointerdown',e=>{
  const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let b=null,bd=1e9;
  for(const d of debris){if(d.mode!=='free')continue;const k=Math.hypot(d.x-x,d.y-y);if(k<d.sz*s*1.6+16&&k<bd){bd=k;b=d}}
  if(!b)return;
  if(!inReach(b)){flash=1.8;flashMsg='Fora de alcance. Espera que se aproxime.';return}
  if(arm.state==='idle'||arm.state==='approach'){arm.target=b;arm.state='approach'}
});
$('bP').onclick=()=>{paused=!paused;$('bP').textContent=paused?'Retomar':'Pausar'};
$('bM').onclick=()=>{manual=!manual;$('bM').textContent=manual?'Modo manual':'Modo automático'};
$('sp').oninput=e=>speed=+e.target.value;
$('bR').onclick=init;
addEventListener('resize',()=>{resize();geom()});
resize();init();
if(matchMedia('(prefers-reduced-motion: reduce)').matches){paused=true;$('bP').textContent='Retomar'}
let last=performance.now();
(function loop(n){
  const rd=Math.min(.05,(n-last)/1000);last=n;flash=Math.max(0,flash-rd);
  if(!paused)update(rd*speed);
  draw();requestAnimationFrame(loop);
})
(last);