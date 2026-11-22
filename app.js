(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toast = (text) => { const el=$('#toast'); el.textContent=text; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2200); };

  // Clock and screen-based lesson navigation.
  const clock=$('#clock');
  function updateClock(){ if(clock){const d=new Date();clock.textContent=d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});} }
  updateClock(); setInterval(updateClock,30000);

  const stageList=[
    {key:'complaint',label:'Жалоба'},
    {key:'departments',label:'Папки отделов'},
    {key:'research',label:'Исследование'},
    {key:'knowledge',label:'Новые понятия'},
    {key:'calculator',label:'Расчёт'},
    {key:'verdict',label:'Вердикт'}
  ];
  const allScreens=['desktop','cover',...stageList.map(x=>x.key)];
  let currentScreen='desktop';
  const nav=$('#stageNavigation');
  const controls=$('#screenControls');
  const progress=$('#scrollProgress');
  const screenElements=$$('.screen-view');
  const navLinks=$$('#stageNavigation [data-screen-target]');
  const stepText=$('#screenStep');
  const stepDots=$$('#screenMiniProgress i');
  const prevButton=$('#screenPrev');
  const nextButton=$('#screenNext');

  function showScreen(key, updateHistory=true){
    if(!allScreens.includes(key)) key='desktop';
    currentScreen=key;
    screenElements.forEach(el=>{
      const active=el.dataset.screen===key;
      el.classList.toggle('is-active',active);
      el.setAttribute('aria-hidden',active?'false':'true');
      if(active) el.scrollTop=0;
    });
    const index=stageList.findIndex(s=>s.key===key);
    const inLesson=index>=0;
    nav?.classList.toggle('is-visible',inLesson);
    controls?.classList.toggle('is-visible',inLesson);
    if(progress) progress.style.width=(inLesson?((index+1)/stageList.length*100):key==='cover'?8:0)+'%';
    navLinks.forEach(a=>{
      const active=a.dataset.screenTarget===key;
      a.classList.toggle('active',active);
      if(active) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current');
    });
    if(stepText){
      stepText.textContent=inLesson?`ЭТАП ${String(index+1).padStart(2,'0')} ИЗ 06 · ${stageList[index].label.toUpperCase()}`:'';
    }
    stepDots.forEach((dot,i)=>dot.classList.toggle('done',inLesson&&i<=index));
    if(prevButton){prevButton.textContent=index<=0?'← К ЗАГЛАВНОЙ':'← НАЗАД';}
    if(nextButton){nextButton.textContent=index===stageList.length-1?'К РАБОЧЕМУ СТОЛУ ↗':'ДАЛЕЕ →';}
    document.body.dataset.screen=key;
    if(updateHistory){
      const hash=key==='desktop'?'desktopHome':key==='cover'?'start':key;
      history.replaceState({screen:key},'',`#${hash}`);
    }
  }
  function goNext(){
    if(currentScreen==='desktop'){showScreen('cover');return;}
    if(currentScreen==='cover'){showScreen('complaint');return;}
    const i=stageList.findIndex(s=>s.key===currentScreen);
    showScreen(i<stageList.length-1?stageList[i+1].key:'desktop');
  }
  function goPrev(){
    if(currentScreen==='cover'){showScreen('desktop');return;}
    const i=stageList.findIndex(s=>s.key===currentScreen);
    if(i===0){showScreen('cover');return;}
    if(i>0) showScreen(stageList[i-1].key);
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-screen-target]');
    if(!link) return;
    e.preventDefault();
    showScreen(link.dataset.screenTarget);
  });
  prevButton?.addEventListener('click',goPrev);
  nextButton?.addEventListener('click',goNext);
  window.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();goNext();}
    if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();goPrev();}
  });
  window.addEventListener('popstate',()=>{
    const raw=location.hash.slice(1);
    const found=raw==='desktopHome'?'desktop':raw==='start'?'cover':raw;
    showScreen(allScreens.includes(found)?found:'desktop',false);
  });
  const initialHash=location.hash.slice(1);
  const initialScreen=initialHash==='desktopHome'?'desktop':initialHash==='start'?'cover':initialHash;
  showScreen(allScreens.includes(initialScreen)?initialScreen:'desktop',false);

  // Selection / Copy / Paste interaction inspired by the supplied text-selection reference.
  const selectedText='и цена';
  $('#selectWord')?.addEventListener('click',()=>$('#copyPopover').classList.toggle('show'));
  $('#copySelected')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(selectedText);toast('ФРАГМЕНТ СКОПИРОВАН');}catch{toast('ВЫДЕЛЕННЫЙ ФРАГМЕНТ: '+selectedText);}});
  $('#pasteSelected')?.addEventListener('click',()=>{const field=$('#hypothesisStatus');field.textContent='В буфер вставлен фрагмент: «'+selectedText+'»';$('#copyPopover').classList.remove('show');toast('ФРАГМЕНТ ДОБАВЛЕН В ЗАМЕТКУ');});
  document.addEventListener('click',e=>{if(!e.target.closest('.selection-wrap')&&!e.target.closest('.copy-popover'))$('#copyPopover')?.classList.remove('show');});

  // Hypothesis choice.
  $$('[data-hypothesis]').forEach(b=>b.addEventListener('click',()=>{$$('[data-hypothesis]').forEach(x=>x.classList.remove('chosen'));b.classList.add('chosen');$('#hypothesisStatus').textContent='✓ Позиция сохранена: «'+b.dataset.hypothesis+'»';toast('ГИПОТЕЗА ЗАФИКСИРОВАНА');}));

  const departments=[
    {file:'Отдел 01 / Производственный аудит',role:'ЭКСПЕРТНЫЙ ОТДЕЛ',name:'Производственный аудит',question:'Как меняется сумма затрат на материалы при изменении количества выпускаемых игрушек?',tasks:['Рассчитайте стоимость материалов на одну фигурку.','Определите затраты на 200 и 400 фигурок.','Сформулируйте вывод о динамике общих расходов.'],result:'РЕЗУЛЬТАТ: РАСЧЁТ + ВЫВОД'},
    {file:'Отдел 02 / Аудит предприятия',role:'ЭКСПЕРТНЫЙ ОТДЕЛ',name:'Аудит предприятия',question:'Все ли расходы предприятия увеличиваются вместе с количеством выпускаемых игрушек?',tasks:['Рассчитайте общую сумму расходов за период.','Сравните долю расходов на одну фигурку при выпуске 200 и 400 штук.','Объясните, почему общая сумма и затраты на единицу ведут себя по-разному.'],result:'РЕЗУЛЬТАТ: СРАВНЕНИЕ + ВЫВОД'},
    {file:'Отдел 03 / Креативно-технологическая экспертиза',role:'ЭКСПЕРТНЫЙ ОТДЕЛ',name:'Креативно-технологическая экспертиза',question:'Может ли создание оригинального дизайна влиять на себестоимость готового товара?',tasks:['Рассчитайте общие расходы на дизайн и прототип.','Определите расходы на одну фигурку при выпуске 200 и 400 штук.','Объясните, почему подготовительную работу нужно учитывать.'],result:'РЕЗУЛЬТАТ: РАСПРЕДЕЛЕНИЕ + ВЫВОД'},
    {file:'Отдел 04 / Экологическая экспертиза',role:'ЭКСПЕРТНЫЙ ОТДЕЛ',name:'Экологическая экспертиза',question:'Всегда ли более экологичное решение обходится производителю дешевле?',tasks:['Сравните стоимость одной упаковки.','Рассчитайте затраты на 200 упаковок для каждого варианта.','Выберите вариант и обоснуйте решение комиссии.'],result:'РЕЗУЛЬТАТ: СРАВНЕНИЕ + РЕКОМЕНДАЦИЯ'},
    {file:'Отдел 05 / Рыночная экспертиза',role:'ЭКСПЕРТНЫЙ ОТДЕЛ',name:'Рыночная и потребительская экспертиза',question:'Можно ли считать цену товара завышенной, если она значительно превышает стоимость материалов?',tasks:['Рассчитайте среднюю цену аналогичных товаров.','Сравните её с ценой исследуемой студии.','Определите, достаточно ли этих данных для оценки цены.'],result:'РЕЗУЛЬТАТ: АНАЛИЗ + ВЫВОД'}
  ];
  const folders=$$('.folder');
  function showDept(i){const d=departments[i];folders.forEach((f,n)=>f.classList.toggle('active',i===n));$('#inspectorFile').textContent=d.file;$('#inspectorNumber').textContent=String(i+1).padStart(2,'0');$('#inspectorRole').textContent=d.role;$('#inspectorName').textContent=d.name;$('#inspectorQuestion').textContent=d.question;$('#inspectorTasks').innerHTML=d.tasks.map(x=>'<span>'+x+'</span>').join('');$('#inspectorResult').textContent=d.result;}
  folders.forEach((f,i)=>f.addEventListener('click',()=>{showDept(i);toast('ОТКРЫТА ПАПКА '+String(i+1).padStart(2,'0'));}));
  showDept(0);

  // Classic Windows-like research timer.
  let seconds=540, interval=null;
  const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
  function drawTimer(){ $('#timerDisplay').textContent=fmt(seconds); $('#timerProgress').style.width=((540-seconds)/540*100)+'%'; }
  function pause(){if(interval){clearInterval(interval);interval=null;}}
  $('#timerStart').addEventListener('click',()=>{if(interval)return;if(seconds<=0)seconds=540;$('#timerStatus').textContent='Сессия запущена. Работайте с карточкой отдела.';interval=setInterval(()=>{seconds=Math.max(0,seconds-1);drawTimer();if(seconds===0){pause();$('#timerStatus').textContent='Время вышло. Подготовьте доклад комиссии.';toast('ВРЕМЯ ИССЛЕДОВАНИЯ ЗАВЕРШЕНО');}},1000);toast('ТАЙМЕР ЗАПУЩЕН');});
  $('#timerPause').addEventListener('click',()=>{pause();$('#timerStatus').textContent='Сессия приостановлена.';toast('ТАЙМЕР НА ПАУЗЕ');});
  $('#timerReset').addEventListener('click',()=>{pause();seconds=540;drawTimer();$('#timerStatus').textContent='Система ожидает запуска сессии.';toast('ТАЙМЕР СБРОШЕН');});

  // Cost calculator with live values.
  const val=id=>Math.max(0,Number($(id).value)||0), fmtRub=n=>Math.round(n).toLocaleString('ru-RU')+' ₽';
  function calculate(){const q=Math.max(1,val('#quantity'));const variableUnit=val('#materials')+val('#packaging');const variableTotal=variableUnit*q;const fixedTotal=val('#maintenance')+val('#design');const total=variableTotal+fixedTotal;const ac=total/q;$('#acResult').textContent=fmtRub(ac);$('#variableUnit').textContent=fmtRub(variableUnit);$('#variableTotal').textContent=fmtRub(variableTotal);$('#fixedTotal').textContent=fmtRub(fixedTotal);$('#totalCost').textContent=fmtRub(total);$('#priceDifference').textContent=fmtRub(390-ac);}
  $('#calculate').addEventListener('click',()=>{calculate();toast('РАСЧЁТ ОБНОВЛЁН');});
  ['#materials','#packaging','#maintenance','#design','#quantity'].forEach(id=>$(id).addEventListener('input',calculate));calculate();

  // Verdict selection.
  const explain={
    'подтверждена':'Эта позиция противоречит расчётам: стоимость материалов не равна полной себестоимости. Проверьте доказательства отделов.',
    'не подтверждена':'Материалы составляют только часть затрат. В учебной модели себестоимость одной фигурки — 270 ₽, цена — 390 ₽. Сравнение только с материалами недостаточно.',
    'данных недостаточно':'Для утверждения о завышении цены данных недостаточно. Комиссия рассчитала себестоимость, но не располагает всеми сведениями о расходах на реализацию и спросе.'
  };
  $$('[data-verdict]').forEach(b=>b.addEventListener('click',()=>{$$('[data-verdict]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#verdictResponse').textContent=explain[b.dataset.verdict];}));
  const finalPaper=$('#finalPaper');
  const closeFinal=()=>{finalPaper?.classList.add('hidden');document.body.classList.remove('show-final-doc');};
  $('#showFinal').addEventListener('click',()=>{finalPaper.classList.remove('hidden');document.body.classList.add('show-final-doc');$('#finalClose')?.focus();});
  $('#finalClose')?.addEventListener('click',closeFinal);
  $('#finalBackdrop')?.addEventListener('click',closeFinal);
  $('#homeworkToggle').addEventListener('click',()=>{$('#homeworkDetails').classList.toggle('show');$('#homeworkToggle').textContent=$('#homeworkDetails').classList.contains('show')?'СКРЫТЬ УСЛОВИЕ':'ОТКРЫТЬ УСЛОВИЕ ↗';});
  $('#homeworkClose')?.addEventListener('click',()=>$('#homeworkDetails').classList.remove('show'));
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeFinal();$('#homeworkDetails')?.classList.remove('show');}});
})();
