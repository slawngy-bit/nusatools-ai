const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
$('#year').textContent = new Date().getFullYear();

const modal = $('#toolModal'), modalBody = $('#modalBody'), outputWrap = $('#outputWrap'), output = $('#toolOutput'), status = $('#modalStatus');
let currentTool = '', lastOutput = '';
const toolNames = {caption:'Caption Generator',bio:'Bio Generator',username:'Username Generator',prompt:'Prompt Builder',hashtags:'Hashtag Ideas',compress:'Kompres Gambar',pdf:'Gambar ke PDF',rewrite:'Text Rewriter'};
const fields = {
 caption:[['topic','Topik konten','input','Contoh: kopi susu kekinian'],['platform','Platform','select',['Instagram','TikTok','Facebook','LinkedIn']],['tone','Gaya bahasa','select',['Santai','Lucu','Profesional','Inspiratif','Promosi']]],
 bio:[['about','Ceritakan tentang profilmu','input','Contoh: fotografer, suka traveling'],['style','Gaya bio','select',['Minimalis','Aesthetic','Profesional','Lucu']]],
 username:[['keyword','Kata kunci atau nama','input','Contoh: rani, gaming, kopi'],['style','Gaya nama','select',['Aesthetic','Gaming','Profesional','Lucu']]],
 prompt:[['goal','Apa yang ingin AI lakukan?','textarea','Contoh: buat strategi konten untuk bisnis kopi'],['details','Detail tambahan','textarea','Target audiens, gaya bahasa, format hasil...']],
 hashtags:[['topic','Topik konten','input','Contoh: skincare lokal'],['platform','Platform','select',['Instagram','TikTok','YouTube','LinkedIn']]],
 rewrite:[['text','Teks yang ingin dirapikan','textarea','Tempel teks kamu di sini...'],['style','Gaya penulisan','select',['Lebih profesional','Lebih santai','Lebih ringkas','Lebih jelas']]]
};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300);}
function openTool(name){
 currentTool=name; $('#modalTitle').textContent=toolNames[name]||'Tool'; $('#modalEyebrow').textContent=name==='compress'||name==='pdf'?'UTILITAS':'AI & KONTEN';
 outputWrap.hidden=true; status.textContent=''; modalBody.innerHTML='';
 if(name==='compress'||name==='pdf'){
   modalBody.innerHTML=`<div class="field"><label>Pilih gambar${name==='pdf'?' (bisa beberapa)':''}</label><input id="fileInput" type="file" accept="image/*" ${name==='pdf'?'multiple':''}></div>${name==='compress'?'<div class="field"><label>Kualitas kompresi (0.2–1)</label><input id="quality" type="number" min=".2" max="1" step=".1" value=".75"></div><div class="field"><label>Format hasil</label><select id="format"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></div>':''}<div class="form-actions"><button class="button button-primary" id="runTool">Proses gambar</button></div><p class="modal-status" id="fileStatus"></p>`;
   $('#runTool').addEventListener('click',()=>processImage(name)); 
 } else {
   const fs=fields[name]||[];
   modalBody.innerHTML=fs.map(([id,label,type,opts])=>`<div class="field"><label for="f-${id}">${label}</label>${type==='select'?`<select id="f-${id}">${opts.map(o=>`<option>${escapeHtml(o)}</option>`).join('')}</select>`:type==='textarea'?`<textarea id="f-${id}" rows="3" placeholder="${escapeHtml(opts)}"></textarea>`:`<input id="f-${id}" placeholder="${escapeHtml(opts)}">`}</div>`).join('')+`<div class="form-actions"><button class="button button-primary" id="runTool">Buat hasil ✦</button></div>`;
   $('#runTool').addEventListener('click',()=>generate(name));
 }
 modal.hidden=false; document.body.style.overflow='hidden';
}
function closeModal(){modal.hidden=true;document.body.style.overflow='';}
$('#closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$$('.tool-card').forEach(card=>card.addEventListener('click',()=>openTool(card.dataset.tool)));
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filterCards();}));
$('#toolSearch').addEventListener('input',filterCards);
function filterCards(){const q=$('#toolSearch').value.toLowerCase();const cat=$('.filter.active').dataset.filter;let shown=0;$$('.tool-card').forEach(c=>{const ok=(cat==='all'||c.dataset.category===cat)&&c.innerText.toLowerCase().includes(q);c.hidden=!ok;if(ok)shown++;});let empty=$('.empty-state');if(!shown&&!empty){empty=document.createElement('div');empty.className='empty-state';empty.textContent='Tools tidak ditemukan. Coba kata kunci lain.';$('#toolGrid').append(empty)}else if(shown&&empty)empty.remove();}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function generate(name){
 const val=id=>($('#f-'+id)?.value||'').trim();let result='';
 if(name==='caption'){const t=val('topic');if(!t)return status.textContent='Isi topik konten dulu.';const platform=val('platform'),tone=val('tone');const starts={Santai:['Lagi jatuh cinta sama','Siapa yang butuh','POV: kamu nemu'],Lucu:['Katanya cuma lihat-lihat, eh…','Plot twist hari ini:','Jangan salahkan aku kalau'],Profesional:['Kenali lebih dekat','Saatnya meningkatkan kualitas','Solusi yang tepat untuk'],Inspiratif:['Langkah kecil, hasil besar.','Mulai dari sekarang,','Setiap perjalanan dimulai dari']}[tone];result=`${pick(starts)} ${t} ✨\n\n${pick(['Yuk, ceritain pendapat kamu di kolom komentar!','Simpan postingan ini biar nggak lupa.','Tag teman yang wajib tahu ini.','Setuju nggak? Share pengalaman kamu, ya!'])}\n\n#${t.replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean).join(' #')} #${platform.replace(/\s/g,'')} #KontenIndonesia`; }
 if(name==='bio'){const a=val('about');if(!a)return status.textContent='Isi deskripsi profil dulu.';const styles={'Minimalis':[`✦ ${a}`,`${a} | berbagi cerita`,`— ${a}`],'Aesthetic':[`☁︎ ୨ৎ ${a} ✧`,`𓆩♡𓆪 ${a} ⋆｡°✩`,`✿ ${a} • little things, big dreams`],'Profesional':[`${a} | Berbagi insight & karya`,`Membantu kamu mengenal ${a} lebih dekat`,`${a} • Kreativitas • Kolaborasi`],'Lucu':[`CEO of ${a} (katanya)`,`Sibuk jadi ${a} dan cari camilan`,`${a} by day, rebahan by night` ]};result=pick(styles[val('style')]);}
 if(name==='username'){const k=val('keyword').toLowerCase().replace(/[^a-z0-9]/g,'');if(!k)return status.textContent='Isi kata kunci dulu.';const endings={Aesthetic:['.jpg','.diary','moon','cloud','vibes','˚୨୧'],Gaming:['.exe','plays','gg','quest','fps','x'],Profesional:['studio','official','works','digital','hq','creative'],Lucu:['gaksengaja','wkwk','santuy','receh','ngakak','aja']};result=[...new Set(Array.from({length:12},(_,i)=>i%3===0?k+pick(endings[val('style')]):i%3===1?'its'+k+Math.floor(Math.random()*99):k+'_'+pick(endings[val('style')]).replace(/[^a-z0-9]/g,'')))].map((x,i)=>`${i+1}. @${x}`).join('\n');}
 if(name==='prompt'){const g=val('goal');if(!g)return status.textContent='Tulis tujuan prompt dulu.';result=`Bertindaklah sebagai ahli yang berpengalaman dalam bidang yang relevan.\n\nTUGAS:\n${g}\n\nKONTEKS TAMBAHAN:\n${val('details')||'Gunakan asumsi yang wajar dan jelaskan jika ada informasi yang kurang.'}\n\nPANDUAN:\n- Berikan jawaban yang akurat, jelas, dan terstruktur.\n- Gunakan bahasa Indonesia yang natural.\n- Sertakan langkah praktis dan contoh bila membantu.\n- Jika ada ketidakpastian, nyatakan dengan jujur.\n\nFORMAT OUTPUT:\nRingkasan singkat, langkah-langkah utama, lalu contoh yang bisa langsung digunakan.`;}
 if(name==='hashtags'){const t=val('topic');if(!t)return status.textContent='Isi topik dulu.';const words=t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(Boolean);result=[...new Set([...words,...words.map(w=>w+'indonesia'),...words.map(w=>'tips'+w),...words.map(w=>'komunitas'+w), 'fyp','viral','rekomendasi','tipsindonesia','kontenindonesia'])].slice(0,24).map(x=>'#'+x).join(' ')+`\n\nIde ini berupa saran umum. Cek tren dan aturan hashtag terbaru di ${val('platform')}.`;}
 if(name==='rewrite'){const t=val('text');if(!t)return status.textContent='Tempel teks yang ingin dirapikan.';const style=val('style');if(style==='Lebih ringkas')result=t.split(/(?<=[.!?])\s+/).slice(0,3).join(' ');else if(style==='Lebih santai')result=t.replace(/\btidak\b/gi,'nggak').replace(/\bAnda\b/g,'kamu').replace(/\bSaya\b/g,'aku');else if(style==='Lebih profesional')result=t.replace(/\baku\b/gi,'saya').replace(/\bnggak\b/gi,'tidak').replace(/\bgak\b/gi,'tidak').replace(/\bkamu\b/gi,'Anda');else result=t.replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();result+=' \n\nCatatan: ini penyuntingan dasar di browser, bukan model AI generatif.';}
 if(result){lastOutput=result;output.value=result;outputWrap.hidden=false;status.textContent='Hasil berhasil dibuat. Periksa sebelum digunakan.';}
}
async function processImage(name){
 const input=$('#fileInput'), files=[...(input.files||[])], fs=$('#fileStatus');if(!files.length){fs.textContent='Pilih gambar terlebih dahulu.';return;}
 try{
 if(name==='compress'){
  const f=files[0], quality=Math.min(1,Math.max(.2,Number($('#quality').value)||.75)), fmt=$('#format').value;
  const img=new Image(), url=URL.createObjectURL(f);img.src=url;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,fmt,quality));URL.revokeObjectURL(url);if(!blob)throw Error('Format tidak didukung browser.');
  const ext=fmt.split('/')[1].replace('jpeg','jpg'), link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${f.name.replace(/\.[^.]+$/,'')}-compressed.${ext}`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1500);
  fs.textContent=`Selesai! Ukuran awal ${(f.size/1024).toFixed(1)} KB; hasil ${(blob.size/1024).toFixed(1)} KB.`;
 }else{
  if(!window.jspdf){fs.textContent='Library PDF belum termuat. Periksa koneksi internet lalu muat ulang.';return;}
  const {jsPDF}=window.jspdf;const doc=new jsPDF();let first=true;
  for(const f of files){const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});const im=new Image();im.src=data;await im.decode();if(!first)doc.addPage();first=false;const pageW=doc.internal.pageSize.getWidth(),pageH=doc.internal.pageSize.getHeight(),scale=Math.min(pageW/im.width,pageH/im.height);const w=im.width*scale,h=im.height*scale;doc.addImage(data,f.type.includes('png')?'PNG':'JPEG',(pageW-w)/2,(pageH-h)/2,w,h);}
  doc.save('nusatools-images.pdf');fs.textContent=`Berhasil menggabungkan ${files.length} gambar ke PDF.`;
 }
 }catch(e){fs.textContent='Gagal memproses gambar: '+e.message;}
}
$('#copyOutput').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);showToast('Hasil disalin!')}catch{output.select();document.execCommand('copy');showToast('Hasil disalin!')}});
$('#downloadOutput').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));a.download=`nusatools-${currentTool}.txt`;a.click();URL.revokeObjectURL(a.href)});
const chatMessages=$('#chatMessages');
function addMessage(text,role){const d=document.createElement('div');d.className='message '+role;d.textContent=text;chatMessages.append(d);chatMessages.scrollTop=chatMessages.scrollHeight;return d;}
$$('.suggestions button').forEach(b=>b.addEventListener('click',()=>{$('#chatInput').value=b.textContent;$('#chatInput').focus()}));
$('#chatForm').addEventListener('submit',async e=>{
 e.preventDefault();const input=$('#chatInput'),q=input.value.trim();if(!q)return;input.value='';$$('.suggestions').forEach(s=>s.remove());addMessage(q,'user');const waiting=addMessage('Sedang menyusun jawaban…','assistant');
 try{
  const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});
  if(!r.ok)throw Error('AI backend belum aktif');const data=await r.json();waiting.textContent=data.reply||'Belum ada jawaban.';
 }catch{
  waiting.textContent='Mode demo lokal: aku bisa bantu mengembangkan ide ini setelah API AI dihubungkan. Untuk sekarang, coba gunakan Prompt Builder agar mendapatkan prompt yang siap dipakai di layanan AI pilihanmu. Ikuti README proyek untuk mengaktifkan jawaban AI sungguhan.';
 }
});
$('#shareBtn').addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:'NusaTools AI',text:'Coba tools online dan AI workspace ini!',url:location.href});else{await navigator.clipboard.writeText(location.href);showToast('Link website disalin!')}}catch{}});
// Load jsPDF only for image-to-PDF feature; PDF processing happens locally in the browser.
const pdfScript=document.createElement('script');pdfScript.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';pdfScript.async=true;document.head.append(pdfScript);
