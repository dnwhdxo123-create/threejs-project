(()=>{
  const form=document.querySelector('.search');
  if(!form)return;
  const input=form.querySelector('input');
  const results=form.querySelector('.search-results');
  const toggle=document.querySelector('.mobile-search');
  const menuButton=document.querySelector('.menu-button');
  const root=location.pathname.includes('/pages/')?'../':'./';
  const pages=Array.from({length:10},(_,i)=>({number:i+1,title:`${i+1}페이지`,keywords:`${i+1} ${String(i+1).padStart(2,'0')} 페이지 IT 정보 technology information`,url:`${root}pages/${i+1}.html?v=6`}));
  let matches=[],active=0;
  const render=()=>{
    const q=input.value.trim().toLowerCase();
    matches=q?pages.filter(page=>page.keywords.toLowerCase().includes(q)):pages;
    active=0;
    results.innerHTML=matches.length?matches.map((page,i)=>`<a class="search-result${i===0?' is-active':''}" role="option" href="${page.url}"><b>${String(page.number).padStart(2,'0')}</b><span>${page.title} · IT INFORMATION</span></a>`).join(''):'<div class="search-empty">검색 결과가 없습니다.</div>';
    results.hidden=false;
  };
  input.addEventListener('focus',render);
  input.addEventListener('input',render);
  input.addEventListener('keydown',event=>{
    if(!matches.length)return;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      active=(active+(event.key==='ArrowDown'?1:-1)+matches.length)%matches.length;
      results.querySelectorAll('.search-result').forEach((item,i)=>item.classList.toggle('is-active',i===active));
    }
    if(event.key==='Enter'){event.preventDefault();location.href=matches[active].url;}
    if(event.key==='Escape'){results.hidden=true;input.blur();form.classList.remove('is-open');}
  });
  form.addEventListener('submit',event=>{event.preventDefault();render();if(matches.length)location.href=matches[0].url;});
  toggle?.addEventListener('click',()=>{const open=form.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>input.focus(),0);});
  menuButton?.addEventListener('click',()=>{
    let menu=document.querySelector('.quick-menu');
    if(!menu){
      menu=document.createElement('nav');
      menu.className='quick-menu';
      menu.setAttribute('aria-label','빠른 페이지 메뉴');
      menu.innerHTML=`<a href="${root}index.html?v=6"><b>HOME</b><span>IT INFORMATION</span></a>${pages.map(page=>`<a href="${page.url}"><b>${String(page.number).padStart(2,'0')}</b><span>${page.title}</span></a>`).join('')}`;
      document.body.append(menu);
    }
    const open=menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('pointerdown',event=>{if(!form.contains(event.target)&&event.target!==toggle)results.hidden=true;});
})();
