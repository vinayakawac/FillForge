var background=(function(){function e(e){return e==null||typeof e==`function`?{main:e}:e}function t(){return{personal:{firstName:``,lastName:``,fullName:``,email:``,phone:``,phoneAlt:``,linkedin:``,github:``,portfolio:``,twitter:``,website:``,address:{street:``,city:``,state:``,stateCode:``,zip:``,country:``,countryCode:``}},summary:``,objective:``,work:[],education:[],skills:[],skillsByCategory:{},certifications:[],languages:[],projects:[],publications:[],awards:[],volunteer:[],demographics:{authorizedToWork:``,requiresSponsorship:``,veteranStatus:``,disabilityStatus:``,gender:``,ethnicity:``,pronouns:``},preferences:{desiredSalaryMin:``,desiredSalaryMax:``,salaryCurrency:``,salaryType:``,noticePeriod:``,willingToRelocate:``,remotePreference:``,desiredJobTypes:[]}}}function n(){return{selectedProvider:`gemini`,providers:{gemini:{type:`gemini`,apiKey:``,model:`gemini-2.5-flash`,enabled:!0},groq:{type:`groq`,apiKey:``,enabled:!1},"ollama-local":{type:`ollama-local`,apiKey:``,enabled:!1},"ollama-cloud":{type:`ollama-cloud`,apiKey:``,enabled:!1},openrouter:{type:`openrouter`,apiKey:``,enabled:!1}},providerOrder:[`gemini`,`groq`,`openrouter`,`ollama-cloud`,`ollama-local`],fillEEO:!1,skipExistingContent:!0,showConfidenceOverlay:!0}}var r=`AES-GCM`,i=256,a=12,o=`fillforge-key-salt-`;function s(){let e=o+(typeof chrome<`u`&&chrome.runtime?.id?chrome.runtime.id:`fillforge-dev-mode`);return new TextEncoder().encode(e)}async function c(){let e=s(),t=await crypto.subtle.importKey(`raw`,e,`PBKDF2`,!1,[`deriveKey`]);return crypto.subtle.deriveKey({name:`PBKDF2`,salt:e,iterations:1e5,hash:`SHA-256`},t,{name:r,length:i},!1,[`encrypt`,`decrypt`])}async function l(e){if(!e)return``;let t=await c(),n=crypto.getRandomValues(new Uint8Array(a)),i=new TextEncoder().encode(e),o=await crypto.subtle.encrypt({name:r,iv:n},t,i),s=new Uint8Array(a+o.byteLength);return s.set(n,0),s.set(new Uint8Array(o),a),btoa(String.fromCharCode(...s))}async function u(e){if(!e)return``;try{let t=await c(),n=Uint8Array.from(atob(e),e=>e.charCodeAt(0)),i=n.slice(0,a),o=n.slice(a),s=await crypto.subtle.decrypt({name:r,iv:i},t,o);return new TextDecoder().decode(s)}catch{return console.error(`[FillForge] Failed to decrypt key — may be corrupted or from different extension ID`),``}}async function d(e,t){let n=await u(e.apiKey),r=e.model||`gemini-2.0-flash`,i=`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${n}`,a=[],o={system_instruction:{parts:[{text:t.systemPrompt}]},contents:[{parts:a}],generationConfig:{temperature:.1,maxOutputTokens:8192}};t.pdfBase64&&a.push({inline_data:{mime_type:`application/pdf`,data:t.pdfBase64}}),t.imageBase64&&t.imageMimeType&&a.push({inline_data:{mime_type:t.imageMimeType,data:t.imageBase64}}),a.push({text:t.userPrompt});let s=await fetch(i,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(o)});if(s.status===429)return{text:``,provider:`gemini`,model:r,rateLimited:!0,error:`Rate limited`};if(!s.ok){let e=await s.text();return{text:``,provider:`gemini`,model:r,error:`Gemini API error ${s.status}: ${e}`}}return{text:(await s.json())?.candidates?.[0]?.content?.parts?.[0]?.text||``,provider:`gemini`,model:r}}async function f(e,t,n,r,i,a){let o=e.apiKey?await u(e.apiKey):``,s=e.model||r,c={"Content-Type":`application/json`,...a};o&&(c.Authorization=`Bearer ${o}`);let l={model:s,messages:[{role:`system`,content:t.systemPrompt},{role:`user`,content:t.userPrompt}],temperature:.1,max_tokens:500},d=await fetch(n,{method:`POST`,headers:c,body:JSON.stringify(l)});if(d.status===429)return{text:``,provider:i,model:s,rateLimited:!0,error:`Rate limited`};if(!d.ok){let e=await d.text();return{text:``,provider:i,model:s,error:`${i} error ${d.status}: ${e}`}}return{text:(await d.json())?.choices?.[0]?.message?.content||``,provider:i,model:s}}async function p(e,t){return f(e,t,`https://api.groq.com/openai/v1/chat/completions`,`llama-3.3-70b-versatile`,`groq`)}async function m(e,t){let n=e.model||`llama3.2`;try{let e=await fetch(`http://localhost:11434/api/generate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({model:n,prompt:`${t.systemPrompt}\n\n${t.userPrompt}`,stream:!1,options:{temperature:.1}})});if(!e.ok){let t=await e.text();return{text:``,provider:`ollama-local`,model:n,error:`Ollama error ${e.status}: ${t}`}}return{text:(await e.json()).response||``,provider:`ollama-local`,model:n}}catch{return{text:``,provider:`ollama-local`,model:n,error:`Cannot connect to Ollama at localhost:11434. Make sure Ollama is running.`}}}async function h(e,t){return f(e,t,`https://ollama.com/v1/chat/completions`,`llama3.2`,`ollama-cloud`)}async function g(e,t){return f(e,t,`https://openrouter.ai/api/v1/chat/completions`,`google/gemini-2.5-flash`,`openrouter`,{"HTTP-Referer":`fillforge-extension`,"X-Title":`FillForge`})}var _={gemini:d,groq:p,"ollama-local":m,"ollama-cloud":h,openrouter:g};async function v(e,t){let n=_[e.type];if(!n)return{text:``,provider:e.type,model:``,error:`Unknown provider: ${e.type}`};try{return await n(e,t)}catch(t){return{text:``,provider:e.type,model:e.model||``,error:`Provider ${e.type} threw: ${t instanceof Error?t.message:String(t)}`}}}async function y(e,t,n,r){let i=[],a=[n,...t.filter(e=>e!==n)];for(let t of a){let n=e[t];if(!n)continue;if(t!==`ollama-local`&&!n.apiKey){i.push({type:t,error:`API key not configured`});continue}let a=await v(n,r);if(i.push({type:t,error:a.error}),!a.error&&!a.rateLimited&&a.text)return{...a,triedProviders:i};console.warn(`[FillForge] Provider ${t} failed:`,a.error||`rate limited`)}return{text:``,provider:n,model:``,error:`All providers failed. Details: ${i.map(e=>`${e.type} (${e.error})`).join(` | `)}`,triedProviders:i}}var ee={alabama:`AL`,alaska:`AK`,arizona:`AZ`,arkansas:`AR`,california:`CA`,colorado:`CO`,connecticut:`CT`,delaware:`DE`,florida:`FL`,georgia:`GA`,hawaii:`HI`,idaho:`ID`,illinois:`IL`,indiana:`IN`,iowa:`IA`,kansas:`KS`,kentucky:`KY`,louisiana:`LA`,maine:`ME`,maryland:`MD`,massachusetts:`MA`,michigan:`MI`,minnesota:`MN`,mississippi:`MS`,missouri:`MO`,montana:`MT`,nebraska:`NE`,nevada:`NV`,"new hampshire":`NH`,"new jersey":`NJ`,"new mexico":`NM`,"new york":`NY`,"north carolina":`NC`,"north dakota":`ND`,ohio:`OH`,oklahoma:`OK`,oregon:`OR`,pennsylvania:`PA`,"rhode island":`RI`,"south carolina":`SC`,"south dakota":`SD`,tennessee:`TN`,texas:`TX`,utah:`UT`,vermont:`VT`,virginia:`VA`,washington:`WA`,"west virginia":`WV`,wisconsin:`WI`,wyoming:`WY`,"district of columbia":`DC`,"puerto rico":`PR`,guam:`GU`,"american samoa":`AS`,"u.s. virgin islands":`VI`,"northern mariana islands":`MP`},b={"united states":`US`,"united states of america":`US`,usa:`US`,us:`US`,canada:`CA`,"united kingdom":`GB`,uk:`GB`,"great britain":`GB`,england:`GB`,australia:`AU`,india:`IN`,germany:`DE`,france:`FR`,spain:`ES`,italy:`IT`,japan:`JP`,china:`CN`,brazil:`BR`,mexico:`MX`,"south korea":`KR`,netherlands:`NL`,sweden:`SE`,norway:`NO`,denmark:`DK`,finland:`FI`,switzerland:`CH`,austria:`AT`,belgium:`BE`,ireland:`IE`,portugal:`PT`,poland:`PL`,"czech republic":`CZ`,czechia:`CZ`,romania:`RO`,hungary:`HU`,greece:`GR`,turkey:`TR`,russia:`RU`,ukraine:`UA`,israel:`IL`,"south africa":`ZA`,nigeria:`NG`,kenya:`KE`,egypt:`EG`,morocco:`MA`,singapore:`SG`,malaysia:`MY`,thailand:`TH`,vietnam:`VN`,philippines:`PH`,indonesia:`ID`,taiwan:`TW`,"hong kong":`HK`,"new zealand":`NZ`,argentina:`AR`,colombia:`CO`,chile:`CL`,peru:`PE`,pakistan:`PK`,bangladesh:`BD`,"sri lanka":`LK`,nepal:`NP`,uae:`AE`,"united arab emirates":`AE`,"saudi arabia":`SA`,qatar:`QA`,kuwait:`KW`,bahrain:`BH`,oman:`OM`,jordan:`JO`,lebanon:`LB`,luxembourg:`LU`,iceland:`IS`,malta:`MT`,cyprus:`CY`,estonia:`EE`,latvia:`LV`,lithuania:`LT`,slovakia:`SK`,slovenia:`SI`,croatia:`HR`,serbia:`RS`,bulgaria:`BG`,bosnia:`BA`,albania:`AL`,"north macedonia":`MK`,montenegro:`ME`,"costa rica":`CR`,panama:`PA`,uruguay:`UY`,ecuador:`EC`,venezuela:`VE`,"dominican republic":`DO`,jamaica:`JM`,trinidad:`TT`,"trinidad and tobago":`TT`,ghana:`GH`,ethiopia:`ET`,tanzania:`TZ`,uganda:`UG`,cameroon:`CM`,"ivory coast":`CI`,senegal:`SN`,tunisia:`TN`,myanmar:`MM`,cambodia:`KH`,laos:`LA`,mongolia:`MN`,uzbekistan:`UZ`,kazakhstan:`KZ`,georgia:`GE`,armenia:`AM`,azerbaijan:`AZ`};function x(e){if(!e)return``;let t=e.toLowerCase().trim();return/^[A-Z]{2}$/.test(e.trim())?e.trim().toUpperCase():ee[t]||``}function S(e){if(!e)return``;let t=e.toLowerCase().trim();return/^[A-Z]{2}$/.test(e.trim())?e.trim().toUpperCase():b[t]||``}var C=`You are a precise resume parser. Extract ALL information from the resume text provided. 
Return ONLY a single valid JSON object. No markdown fences. No explanation. No preamble. No trailing text.
If a field is not found, use empty string "" for strings, empty array [] for arrays, false for booleans.
Never hallucinate or infer data not explicitly present in the resume.
Dates: preserve exactly as written in resume (e.g. "Jan 2022", "2022-01", "January 2022", "2022").
Phone: preserve exactly as written including country code if present.`,w=`Extract from this resume into the following JSON schema exactly:
{
  "personal": {
    "firstName": "",
    "lastName": "",
    "fullName": "",
    "email": "",
    "phone": "",
    "phoneAlt": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "twitter": "",
    "website": "",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "stateCode": "",
      "zip": "",
      "country": "",
      "countryCode": ""
    }
  },
  "summary": "",
  "objective": "",
  "work": [
    {
      "company": "",
      "title": "",
      "department": "",
      "location": "",
      "locationType": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": [],
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "degreeType": "",
      "field": "",
      "minor": "",
      "gpa": "",
      "maxGpa": "",
      "startYear": "",
      "endYear": "",
      "location": "",
      "honors": "",
      "coursework": []
    }
  ],
  "skills": [],
  "skillsByCategory": {},
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueMonth": "",
      "issueYear": "",
      "expiryMonth": "",
      "expiryYear": "",
      "credentialId": "",
      "url": ""
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "url": "",
      "github": "",
      "tech": [],
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": []
    }
  ],
  "publications": [
    {
      "title": "",
      "publisher": "",
      "date": "",
      "url": "",
      "description": ""
    }
  ],
  "awards": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "description": ""
    }
  ],
  "volunteer": [
    {
      "organization": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "demographics": {
    "authorizedToWork": "",
    "requiresSponsorship": "",
    "veteranStatus": "",
    "disabilityStatus": "",
    "gender": "",
    "ethnicity": "",
    "pronouns": ""
  },
  "preferences": {
    "desiredSalaryMin": "",
    "desiredSalaryMax": "",
    "salaryCurrency": "",
    "salaryType": "",
    "noticePeriod": "",
    "willingToRelocate": "",
    "remotePreference": "",
    "desiredJobTypes": []
  }
}

RESUME TEXT:
`;function T(e){let t=e.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,``);return t=t.replace(/\n{3,}/g,`

`),t.trim()}function E(e){return Math.ceil(e.length/4)}function D(e){let t=e.trim();t=t.replace(/^```(?:json)?\s*\n?/i,``).replace(/\n?```\s*$/i,``),t=t.trim();let n=t.indexOf(`{`),r=t.lastIndexOf(`}`);return n!==-1&&r!==-1&&r>n&&(t=t.substring(n,r+1)),t}function O(e){return e&&e.split(/\s+/).map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(` `)}function k(e){let t=structuredClone(e);if(t.personal.phone&&(t.personal.phone=t.personal.phone.replace(/[^\d+\-() ]/g,``).trim()),t.personal.phoneAlt&&(t.personal.phoneAlt=t.personal.phoneAlt.replace(/[^\d+\-() ]/g,``).trim()),t.personal.firstName&&(t.personal.firstName=O(t.personal.firstName)),t.personal.lastName&&(t.personal.lastName=O(t.personal.lastName)),t.personal.fullName&&(t.personal.fullName=O(t.personal.fullName)),t.personal.fullName&&(!t.personal.firstName||!t.personal.lastName)){let e=t.personal.fullName.trim().split(/\s+/);e.length>=2?(t.personal.firstName||(t.personal.firstName=e[0]),t.personal.lastName||(t.personal.lastName=e.slice(1).join(` `))):e.length===1&&(t.personal.firstName||(t.personal.firstName=e[0]))}!t.personal.fullName&&(t.personal.firstName||t.personal.lastName)&&(t.personal.fullName=`${t.personal.firstName} ${t.personal.lastName}`.trim()),t.personal.address.state&&!t.personal.address.stateCode&&(t.personal.address.stateCode=x(t.personal.address.state)),t.personal.address.country&&!t.personal.address.countryCode&&(t.personal.address.countryCode=S(t.personal.address.country));for(let e of t.work)!e.endYear&&!e.endMonth&&(e.current=!0);return Array.isArray(t.skills)||(t.skills=[]),Array.isArray(t.work)||(t.work=[]),Array.isArray(t.education)||(t.education=[]),Array.isArray(t.certifications)||(t.certifications=[]),Array.isArray(t.languages)||(t.languages=[]),Array.isArray(t.projects)||(t.projects=[]),Array.isArray(t.publications)||(t.publications=[]),Array.isArray(t.awards)||(t.awards=[]),Array.isArray(t.volunteer)||(t.volunteer=[]),t.skillsByCategory||={},t.demographics||={authorizedToWork:``,requiresSponsorship:``,veteranStatus:``,disabilityStatus:``,gender:``,ethnicity:``,pronouns:``},t.preferences||={desiredSalaryMin:``,desiredSalaryMax:``,salaryCurrency:``,salaryType:``,noticePeriod:``,willingToRelocate:``,remotePreference:``,desiredJobTypes:[]},t}function te(e,t,n){let r=structuredClone(t);for(let t of Object.keys(n)){if(!n[t])continue;let i=ne(e,t);i!==void 0&&re(r,t,i)}return r}function ne(e,t){return t.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`)return e[t]},e)}function re(e,t,n){let r=t.split(`.`),i=e;for(let e=0;e<r.length-1;e++)(!(r[e]in i)||typeof i[r[e]]!=`object`)&&(i[r[e]]={}),i=i[r[e]];i[r[r.length-1]]=n}async function ie(e,n,r,i){let a=[],{resumeText:o,pdfBase64:s,imageBase64:c,imageMimeType:l,category:u}=e;if(u===`image`&&n.selectedProvider!==`gemini`&&a.push(`Image resumes require Gemini provider for vision support. Switch to Gemini for best results.`),o=T(o),!o&&!c&&!s)return{profile:r||t(),provider:n.selectedProvider,rawResponse:``,error:`No text could be extracted from the file.`,warnings:a};let d=w+o,f=E(o),p;f<=6e3||s||c?p={systemPrompt:C,userPrompt:d,pdfBase64:s,imageBase64:c,imageMimeType:l}:(p={systemPrompt:C,userPrompt:d},a.push(`Resume is long (~${f} tokens). Sending full text to LLM.`));let m=await y(n.providers,n.providerOrder,n.selectedProvider,p);if(m.error&&!m.text)return{profile:r||t(),provider:m.provider,rawResponse:m.text,error:m.error,warnings:a};let h;try{let e=D(m.text);h=JSON.parse(e)}catch{a.push(`First parse returned malformed JSON. Retrying with stricter prompt...`);let e={systemPrompt:C+`
CRITICAL: Return ONLY raw JSON. No markdown code fences. No backticks. No text before or after the JSON object.`,userPrompt:d,pdfBase64:s,imageBase64:c,imageMimeType:l},i=await y(n.providers,n.providerOrder,n.selectedProvider,e);try{let e=D(i.text);h=JSON.parse(e)}catch{return{profile:r||t(),provider:i.provider,rawResponse:i.text,error:`Failed to parse LLM response as JSON after 2 attempts.`,warnings:a}}}if(h=k(h),!h.personal.email&&!h.personal.firstName){a.push(`Email and firstName are empty — triggering auto-retry...`);let e={systemPrompt:C+`
IMPORTANT: Make sure to extract the email address and first name. These fields must not be empty if present in the resume.`,userPrompt:d,pdfBase64:s,imageBase64:c,imageMimeType:l},t=await y(n.providers,n.providerOrder,n.selectedProvider,e);try{let e=D(t.text),n=k(JSON.parse(e));(n.personal.email||n.personal.firstName)&&(h=n)}catch{}}return r&&Object.keys(i).length>0&&(h=te(r,h,i)),{profile:h,provider:m.provider,rawResponse:m.text,warnings:a}}var A={profile:`fillforge_profile`,settings:`fillforge_settings`,locks:`fillforge_locks`,history:`fillforge_history`,debugLLM:`fillforge_debug_llm_response`,debugFill:`fillforge_debug_fill_log`,resumeFilename:`fillforge_resume_filename`,parseProvider:`fillforge_parse_provider`},j=20;async function M(){return(await chrome.storage.local.get(A.profile))[A.profile]||t()}async function N(e){await chrome.storage.local.set({[A.profile]:e})}async function P(e,t){let n=await M();ce(n,e,t),await N(n)}var F={"gemini-1.5-flash":`gemini-2.5-flash`,"gemini-1.5-pro":`gemini-2.5-flash`,"gemini-pro":`gemini-2.5-flash`};async function I(){let e=(await chrome.storage.local.get(A.settings))[A.settings]||n(),t=!1;for(let n of Object.keys(e.providers)){let r=e.providers[n].model;r&&F[r]&&(e.providers[n].model=F[r],t=!0)}return t&&await chrome.storage.local.set({[A.settings]:e}),e}async function L(e){await chrome.storage.local.set({[A.settings]:e})}async function R(e,t){let n=await I();n.providers[e].apiKey=await l(t),await L(n)}async function z(){return(await chrome.storage.local.get(A.locks))[A.locks]||{}}async function B(e,t){let n=await z();t?n[e]=!0:delete n[e],await chrome.storage.local.set({[A.locks]:n})}async function V(){return(await chrome.storage.local.get(A.history))[A.history]||[]}async function H(e){let t=await V();t.unshift(e),t.length>j&&(t.length=j),await chrome.storage.local.set({[A.history]:t})}async function U(e){await chrome.storage.local.set({[A.debugLLM]:e})}async function W(){return(await chrome.storage.local.get(A.debugLLM))[A.debugLLM]||``}async function G(e){await chrome.storage.local.set({[A.debugFill]:e})}async function K(){return(await chrome.storage.local.get(A.debugFill))[A.debugFill]||[]}async function q(e){await chrome.storage.local.set({[A.resumeFilename]:e})}async function J(){return(await chrome.storage.local.get(A.resumeFilename))[A.resumeFilename]||``}async function ae(e){await chrome.storage.local.set({[A.parseProvider]:e})}async function oe(){return(await chrome.storage.local.get(A.parseProvider))[A.parseProvider]||null}async function se(){await chrome.storage.local.remove(Object.values(A))}function ce(e,t,n){let r=t.split(`.`),i=e;for(let e=0;e<r.length-1;e++){let t=r[e];(!(t in i)||typeof i[t]!=`object`||i[t]===null)&&(i[t]={}),i=i[t]}i[r[r.length-1]]=n}var le=e(()=>{console.log(`[FillForge] Background service worker started`),chrome.action.onClicked.addListener(async e=>{if(e.id){try{await chrome.scripting.executeScript({target:{tabId:e.id},files:[`content-scripts/content.js`]})}catch(e){console.error(`Failed to inject script:`,e)}chrome.tabs.sendMessage(e.id,{type:`TOGGLE_UI`}).catch(()=>{console.log(`Could not send TOGGLE_UI message to tab`)})}}),chrome.runtime.onMessage.addListener((e,t,n)=>(ue(e).then(n).catch(e=>{console.error(`[FillForge] Message handler error:`,e),n({error:e.message||String(e)})}),!0))});async function ue(e){switch(e.type){case`PARSE_RESUME`:{let{fileData:t,fileName:n}=e.payload,r=await ie(t,await I(),await M(),await z());return await N(r.profile),await U(r.rawResponse),await q(n),await ae(r.provider),{success:!r.error,profile:r.profile,provider:r.provider,error:r.error,warnings:r.warnings}}case`GET_PROFILE`:return{profile:await M(),filename:await J(),parseProvider:await oe()};case`UPDATE_PROFILE`:{let{path:t,value:n}=e.payload;return await P(t,n),{success:!0}}case`LOCK_FIELD`:{let{path:t,locked:n}=e.payload;return await B(t,n),{success:!0}}case`GET_LOCKS`:return{locks:await z()};case`FILL_PAGE`:{let[e]=await chrome.tabs.query({active:!0,currentWindow:!0});if(!e?.id)return{error:`No active tab found`};let t=await M(),n=await I();try{await chrome.scripting.executeScript({target:{tabId:e.id},files:[`content-scripts/content.js`]})}catch{}return new Promise(r=>{chrome.tabs.sendMessage(e.id,{type:`EXECUTE_FILL`,payload:{profile:t,settings:n}},e=>{r(e||{error:`No response from content script`})})})}case`FILL_RESULT`:{let{results:t,site:n,hostname:r,platform:i}=e.payload,a={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),site:n,hostname:r,platform:i,date:Date.now(),results:t,filledCount:t.filter(e=>e.filled).length,skippedCount:t.filter(e=>!e.filled).length};return await H(a),await G(t),{success:!0,entry:a}}case`GET_SETTINGS`:return{settings:await I()};case`UPDATE_SETTINGS`:{let t=e.payload;return t.settings&&await L(t.settings),{success:!0}}case`SET_PROVIDER_KEY`:{let{provider:t,key:n}=e.payload;return await R(t,n),{success:!0}}case`GET_HISTORY`:return{history:await V()};case`GET_DEBUG`:return{llmResponse:await W(),fillLog:await K()};case`CLEAR_ALL_DATA`:return await se(),{success:!0};default:return{error:`Unknown message type: ${e.type}`}}}globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome;var Y=class{constructor(e){if(e===`<all_urls>`)this.isAllUrls=!0,this.protocolMatches=[...Y.PROTOCOLS],this.hostnameMatch=`*`,this.pathnameMatch=`*`;else{let t=/(.*):\/\/(.*?)(\/.*)/.exec(e);if(t==null)throw new Z(e,`Incorrect format`);let[n,r,i,a]=t;Q(e,r),de(e,i),this.protocolMatches=r===`*`?[`http`,`https`]:[r],this.hostnameMatch=i,this.pathnameMatch=a}}includes(e){if(this.isAllUrls)return!0;let t=typeof e==`string`?new URL(e):e instanceof Location?new URL(e.href):e;return!!this.protocolMatches.find(e=>{if(e===`http`)return this.isHttpMatch(t);if(e===`https`)return this.isHttpsMatch(t);if(e===`file`)return this.isFileMatch(t);if(e===`ftp`)return this.isFtpMatch(t);if(e===`urn`)return this.isUrnMatch(t)})}isHttpMatch(e){return e.protocol===`http:`&&this.isHostPathMatch(e)}isHttpsMatch(e){return e.protocol===`https:`&&this.isHostPathMatch(e)}isHostPathMatch(e){if(!this.hostnameMatch||!this.pathnameMatch)return!1;let t=[this.convertPatternToRegex(this.hostnameMatch),this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./,``))],n=this.convertPatternToRegex(this.pathnameMatch);return!!t.find(t=>t.test(e.hostname))&&n.test(e.pathname)}isFileMatch(e){throw Error(`Not implemented: file:// pattern matching. Open a PR to add support`)}isFtpMatch(e){throw Error(`Not implemented: ftp:// pattern matching. Open a PR to add support`)}isUrnMatch(e){throw Error(`Not implemented: urn:// pattern matching. Open a PR to add support`)}convertPatternToRegex(e){let t=this.escapeForRegex(e).replace(/\\\*/g,`.*`);return RegExp(`^${t}$`)}escapeForRegex(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}},X=Y;X.PROTOCOLS=[`http`,`https`,`file`,`ftp`,`urn`];var Z=class extends Error{constructor(e,t){super(`Invalid match pattern "${e}": ${t}`)}};function Q(e,t){if(!X.PROTOCOLS.includes(t)&&t!==`*`)throw new Z(e,`${t} not a valid protocol (${X.PROTOCOLS.join(`, `)})`)}function de(e,t){if(t.includes(`:`))throw new Z(e,`Hostname cannot include a port`);if(t.includes(`*`)&&t.length>1&&!t.startsWith(`*.`))throw new Z(e,`If using a wildcard (*), it must go at the start of the hostname`)}var fe={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},$;try{$=le.main(),$ instanceof Promise&&console.warn(`The background's main() function return a promise, but it must be synchronous`)}catch(e){throw fe.error(`The background crashed on startup!`),e}return $})();