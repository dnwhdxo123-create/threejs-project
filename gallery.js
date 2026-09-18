import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const stage=document.querySelector('#stage'),status=document.querySelector('#status'),button=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced,hovered=null,angle=0,targetX=0,targetY=0,lastTime=0,down=null;
button.textContent=paused?'회전 시작':'회전 멈추기';button.setAttribute('aria-pressed',String(paused));
button.onclick=()=>{paused=!paused;button.textContent=paused?'회전 시작':'회전 멈추기';button.setAttribute('aria-pressed',String(paused));};
try{
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);stage.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,3.4,16.5);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x879caa,2.7));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-4,7,8);scene.add(light);
const orbit=new THREE.Group();scene.add(orbit);orbit.rotation.z=-.085;
const palettes=[['#e8d7c6','#9c7359'],['#b6d8e2','#286578'],['#eaedef','#57636f'],['#bdc8ad','#526b45'],['#e2c9b6','#935c47'],['#c4c9dd','#5c608b'],['#dde2d3','#7c8964'],['#b9cdd0','#466f78'],['#d9c2b7','#856f61'],['#d5dce7','#607a9d']];
function texture(i){const c=document.createElement('canvas');c.width=600;c.height=800;const x=c.getContext('2d'),[bg,ink]=palettes[i];x.fillStyle=bg;x.fillRect(0,0,600,800);x.save();x.translate(300,365);x.rotate(i*.36);for(let k=0;k<6;k++){x.strokeStyle=ink;x.globalAlpha=.13+k*.06;x.lineWidth=20;x.beginPath();x.ellipse(0,0,65+k*32,160+k*10,k*.25,0,Math.PI*2);x.stroke();}x.restore();x.globalAlpha=1;x.fillStyle=ink;x.font='500 16px Arial';x.fillText('THREEJS PROJECT',38,52);x.fillText('COLLECTION / 2026',38,756);x.font='20px Arial';x.fillText('↗',540,52);x.font='500 190px Arial';x.fillText(String(i+1).padStart(2,'0'),30,610);x.font='25px Arial';x.fillText(`${i+1}페이지`,40,670);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const cards=[];const geo=new THREE.PlaneGeometry(1.65,2.2,12,1);
const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,.06*Math.pow(x/.825,2));}geo.computeVertexNormals();
for(let i=0;i<10;i++){const group=new THREE.Group();const t=texture(i),mat=new THREE.MeshStandardMaterial({map:t,roughness:.88,side:THREE.FrontSide});const front=new THREE.Mesh(geo,mat);const back=new THREE.Mesh(geo,mat);back.rotation.y=Math.PI;back.position.z=-.012;group.add(front,back);front.userData.index=back.userData.index=i;group.userData={index:i,spin:0,target:0};orbit.add(group);cards.push(group);}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(9,9),meshes=cards.flatMap(c=>c.children);
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w<650?25:12.5;camera.fov=w<650?43:35;camera.lookAt(0,0,0);camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
function point(e){const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);targetX=pointer.x;targetY=pointer.y;}
function pick(){ray.setFromCamera(pointer,camera);return ray.intersectObjects(meshes)[0]?.object.userData.index??null;}
stage.addEventListener('pointermove',e=>{point(e);if(down&&e.pointerType!=='mouse'){const delta=e.clientX-down.last;angle+=delta*.006;down.last=e.clientX;}});
stage.addEventListener('pointerleave',()=>{pointer.set(9,9);targetX=targetY=0;});
stage.addEventListener('pointerdown',e=>{point(e);down={x:e.clientX,y:e.clientY,last:e.clientX,index:pick()};});
stage.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<10&&down.index!==null)location.href=`pages/${down.index+1}.html`;down=null;});stage.addEventListener('pointercancel',()=>down=null);
function frame(ms){requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min((ms-lastTime)/1000,.05);lastTime=ms;if(!paused&&hovered===null)angle+=dt*.095;
orbit.rotation.y=angle;orbit.rotation.x=THREE.MathUtils.damp(orbit.rotation.x,targetY*.055,3,dt);
cards.forEach((c,i)=>{const a=i/10*Math.PI*2; c.position.set(Math.sin(a)*3.35,Math.sin(ms*.0005+i)*.055,Math.cos(a)*3.35);c.rotation.y=a;c.rotation.z=Math.sin(i*2)*.07;
const d=c.userData;d.spin=THREE.MathUtils.damp(d.spin,paused?d.spin:targetX*Math.PI,4,dt);c.rotation.y+=d.spin;});
scene.updateMatrixWorld();const next=pick();if(next!==hovered){document.querySelectorAll('nav a').forEach((a,i)=>a.classList.toggle('active',i===next));hovered=next;stage.style.cursor=next===null?'default':'pointer';status.textContent=next===null?'마우스로 회전 · 클릭하여 페이지 열기':`${next+1}페이지 열기 ↗`;}
renderer.render(scene,camera);}
requestAnimationFrame(frame);
}catch(error){status.textContent='3D 화면을 사용할 수 없습니다. 아래 번호로 페이지를 열어주세요.';button.hidden=true;console.error(error);}