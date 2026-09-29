import {env} from 'cloudflare:workers';
const recent=new Map<string,number>();
const reply=(message:string,status:number)=>Response.json({message},{status});
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin || origin!==new URL(request.url).origin)return reply('Недопустимый источник запроса.',403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply('Некорректный формат заявки.',415);
 const raw=await request.text();if(raw.length>8000)return reply('Слишком длинная заявка.',413);
 let data:Record<string,unknown>;try{data=JSON.parse(raw);}catch{return reply('Некорректная заявка.',400);}
 if(!data||typeof data!=='object'||Array.isArray(data))return reply('Некорректная заявка.',400);
 const fields:Record<string,number>={name:80,phone:25,social:180,rider:120,comment:1500,size:80,color:20,method:30,website:200};
 for(const [key,max] of Object.entries(fields)){if(data[key]!==undefined&&(typeof data[key]!=='string'||(data[key] as string).length>max))return reply('Проверьте заполненные поля.',400);}
 const clean=(key:string)=>String(data[key]??'').trim();
 if(clean('website'))return reply('Не удалось отправить заявку.',400);
 if(!clean('name')||!/^\+?[0-9()\s-]{10,25}$/.test(clean('phone'))||clean('phone').replace(/\D/g,'').length<10)return reply('Укажите имя и корректный номер телефона.',400);
 if(!['Звонок','Telegram','ВКонтакте'].includes(clean('method'))||!['Серый','Чёрный'].includes(clean('color'))||!['1200 × 300 мм','1300 × 300 мм','Индивидуальный размер'].includes(clean('size')))return reply('Проверьте параметры заказа.',400);
 if(clean('method')!=='Звонок'&&!clean('social'))return reply('Укажите ссылку или ник, чтобы мы связались с вами выбранным способом.',400);
 const config=env as unknown as Record<string,string>;
 if(!config.TELEGRAM_BOT_TOKEN||!config.TELEGRAM_CHAT_ID)return reply('Приём заявок через форму пока недоступен. Напишите Сергею в Telegram или позвоните: +7 906 203-60-89.',503);
 const key=request.headers.get('cf-connecting-ip')||clean('phone');const now=Date.now();
 for(const [k,time] of recent)if(now-time>60000)recent.delete(k);
 if(recent.has(key))return reply('Подождите минуту перед повторной отправкой.',429);recent.set(key,now);
 const text=['Новая заявка — Кантователь',...Object.entries({name:'Имя',phone:'Телефон',social:'Соцсеть',method:'Способ связи',rider:'Райдер',size:'Размер',color:'Цвет',comment:'Комментарий'}).map(([k,label])=>label+': '+(clean(k)||'—'))].join('\n');
 try{const response=await fetch('https://api.telegram.org/bot'+config.TELEGRAM_BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:config.TELEGRAM_CHAT_ID,text,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(12000)});const result=await response.json() as {ok?:boolean};if(!response.ok||!result.ok){recent.delete(key);return reply('Telegram не принял заявку. Попробуйте позже или свяжитесь с Сергеем напрямую.',502);}return reply('Заявка отправлена. Сергей свяжется с вами выбранным способом.',200);}catch{recent.delete(key);return reply('Не удалось подтвердить доставку. Свяжитесь с Сергеем напрямую.',502);}
}
