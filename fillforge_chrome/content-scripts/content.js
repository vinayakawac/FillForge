var content=(function(){var e=Object.defineProperty,t=(e,t)=>()=>(e&&(t=e(e=0)),t),n=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};function r(e){return e}function i(e,t){return/myworkday\.com|wd\d\.myworkday\.com/.test(e)?`workday`:/greenhouse\.io|boards\.greenhouse\.io/.test(e)?`greenhouse`:/lever\.co/.test(e)?`lever`:/icims\.com/.test(e)?`icims`:/taleo\.net/.test(e)?`taleo`:/smartrecruiters\.com/.test(e)?`smartrecruiters`:/jobvite\.com/.test(e)?`jobvite`:/ashbyhq\.com/.test(e)?`ashby`:/rippling\.com/.test(e)?`rippling`:`generic`}var a={firstName:[`first name`,`given name`,`first`,`fname`,`forename`],lastName:[`last name`,`surname`,`last`,`lname`,`family name`],fullName:[`full name`,`name`,`your name`,`candidate name`,`applicant name`],email:[`email`,`e-mail`,`email address`],phone:[`phone`,`mobile`,`telephone`,`cell`,`contact number`,`phone number`],city:[`city`,`town`,`municipality`],state:[`state`,`province`,`region`],zip:[`zip`,`postal`,`postcode`,`pin code`,`zip code`,`postal code`],country:[`country`,`nation`],street:[`street`,`address`,`street address`,`address line 1`,`address line`],linkedin:[`linkedin`,`linked in`,`linkedin url`,`linkedin profile`],github:[`github`,`git hub`,`github url`,`github profile`],portfolio:[`portfolio`,`personal website`,`website url`,`portfolio url`],website:[`website`,`web site`,`personal site`,`url`],company:[`company`,`employer`,`organization`,`organisation`,`current employer`,`current company`],title:[`title`,`position`,`job title`,`role`,`current title`,`current position`],summary:[`summary`,`professional summary`,`about`,`about me`,`bio`,`overview`],gpa:[`gpa`,`grade point average`,`cgpa`],degree:[`degree`,`qualification`,`education level`],school:[`school`,`university`,`institution`,`college`,`alma mater`],major:[`major`,`field of study`,`specialization`,`concentration`,`field`],salary:[`salary`,`desired salary`,`salary expectation`,`expected salary`,`compensation`]},o=[`cover letter`,`coverletter`,`cover_letter`,`additional information`,`additional_information`,`additionalinfo`,`how did you hear`,`how_did_you_hear`,`howdidyouhear`,`referral source`,`ssn`,`social security`,`social_security_number`,`passport`,`passport number`,`passport_number`,`government id`,`government_id`,`national id`,`national_id`,`drivers license`,`driver_license`,`driving_licence`],s=[`gender`,`sex`,`race`,`ethnicity`,`ethnic`,`veteran`,`disability`,`disabled`,`sexual orientation`,`pronoun`,`pronouns`];function c(e,t){switch(t){case`firstName`:return e.personal.firstName;case`lastName`:return e.personal.lastName;case`fullName`:return e.personal.fullName||`${e.personal.firstName} ${e.personal.lastName}`.trim();case`email`:return e.personal.email;case`phone`:return e.personal.phone;case`city`:return e.personal.address.city;case`state`:return e.personal.address.state||e.personal.address.stateCode;case`zip`:return e.personal.address.zip;case`country`:return e.personal.address.country||e.personal.address.countryCode;case`street`:return e.personal.address.street;case`linkedin`:return e.personal.linkedin;case`github`:return e.personal.github;case`portfolio`:return e.personal.portfolio;case`website`:return e.personal.website||e.personal.portfolio;case`company`:return e.work[0]?.company??``;case`title`:return e.work[0]?.title??``;case`summary`:return e.summary;case`gpa`:return e.education[0]?.gpa??``;case`degree`:return e.education[0]?.degree??``;case`school`:return e.education[0]?.institution??``;case`major`:return e.education[0]?.field??``;case`salary`:return e.preferences.desiredSalaryMin?`${e.preferences.desiredSalaryMin}${e.preferences.desiredSalaryMax?`-`+e.preferences.desiredSalaryMax:``}`:``;default:return``}}function l(e,t){return t?e===`email`?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t):e===`phone`?/[\d\s()+\-]{7,}/.test(t):e===`linkedin`?/linkedin\.com/i.test(t)||t.startsWith(`http`):e===`github`?/github\.com/i.test(t)||t.startsWith(`http`):e===`zip`?/^[\d\s\-A-Z]{3,10}$/i.test(t):!0:!0}function u(e){let t=e.toLowerCase().trim();return o.some(e=>t.includes(e)||e.includes(t))}function d(e){let t=e.toLowerCase().trim();return s.some(e=>t.includes(e))}function f(e,t){e.focus();let n=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),`value`);n?.set?n.set.call(e,t):e.value=t,e.dispatchEvent(new Event(`input`,{bubbles:!0,cancelable:!0})),e.dispatchEvent(new Event(`change`,{bubbles:!0,cancelable:!0})),e.dispatchEvent(new KeyboardEvent(`keyup`,{bubbles:!0})),e.blur()}function p(e,t){let n=t.toLowerCase().trim(),r=!1;for(let t of e.options){let i=t.textContent?.trim().toLowerCase()||``,a=t.value.toLowerCase();if(i===n||a===n||i.includes(n)||n.includes(i)){e.value=t.value,e.dispatchEvent(new Event(`change`,{bubbles:!0})),r=!0;break}}return r}function m(e,t=2e3){return new Promise(n=>{let r=document.querySelector(e);if(r){n(r);return}let i=new MutationObserver(()=>{let t=document.querySelector(e);t&&(i.disconnect(),n(t))});i.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{i.disconnect(),n(null)},t)})}async function h(e,t){let n=document.querySelector(`[data-automation-id="${e}"]`);if(!n)return!1;n.click();let r=await m(`[data-automation-id="${e}-listbox"], [role="listbox"]`,2e3);if(!r)return!1;let i=r.querySelectorAll(`[role="option"], li`),a=t.toLowerCase().trim();for(let e of i){let t=e.textContent?.trim().toLowerCase()||``;if(t===a||t.includes(a)||a.includes(t))return e.click(),!0}return document.dispatchEvent(new KeyboardEvent(`keydown`,{key:`Escape`,bubbles:!0})),!1}function g(e){let t=[];for(let n of[`name`,`id`,`placeholder`,`aria-label`,`data-field`,`data-automation-id`,`autocomplete`,`data-testid`]){let r=e.getAttribute(n);r&&t.push(r)}if(e.id){let n=document.querySelector(`label[for="${e.id}"]`);n?.textContent&&t.push(n.textContent)}let n=e.closest(`label`);n?.textContent&&t.push(n.textContent);let r=e.closest(`[class*="field"], [class*="form-group"], [class*="form_field"], [class*="FormField"]`);if(r){let e=r.querySelector(`label, .label, [class*="label"]`);e?.textContent&&t.push(e.textContent)}return t.filter(Boolean).map(e=>e.toLowerCase().trim())}function _(e,t,n){if(e instanceof HTMLInputElement&&e.type===`file`)return{skip:!0,reason:`File input`};if(e instanceof HTMLInputElement&&e.type===`hidden`)return{skip:!0,reason:`Hidden input`};if(e instanceof HTMLInputElement&&e.type===`password`)return{skip:!0,reason:`Password field`};if(n.skipExisting){let t=e.value;if(t&&t.trim()!==``)return{skip:!0,reason:`Field already has content`}}for(let e of t)if(u(e))return{skip:!0,reason:`Blocked field: ${e}`};if(!n.fillEEO){for(let e of t)if(d(e))return{skip:!0,reason:`EEO field (disabled in settings)`}}return{skip:!1}}var v={legalNameSection_firstName:e=>e.personal.firstName,legalNameSection_lastName:e=>e.personal.lastName,preferredName:e=>e.personal.firstName,email:e=>e.personal.email,"phone-number":e=>e.personal.phone,addressSection_addressLine1:e=>e.personal.address.street,addressSection_city:e=>e.personal.address.city,addressSection_postalCode:e=>e.personal.address.zip,linkedin:e=>e.personal.linkedin,websiteURL:e=>e.personal.portfolio||e.personal.website,legalNameSection_middleName:()=>void 0,howDidYouHear:()=>void 0,coverLetter:()=>void 0};function y(e){return{[`workExperienceSection_company-${e}`]:t=>t.work[e]?.company,[`workExperienceSection_jobTitle-${e}`]:t=>t.work[e]?.title,[`workExperienceSection_startDate-${e}`]:t=>{let n=t.work[e];return n?`${n.startMonth} ${n.startYear}`.trim():void 0},[`workExperienceSection_endDate-${e}`]:t=>{let n=t.work[e];if(n)return n.current?`Present`:`${n.endMonth} ${n.endYear}`.trim()},[`workExperienceSection_description-${e}`]:t=>t.work[e]?.bullets?.join(`
`)||t.work[e]?.description}}function b(e){return{[`educationSection_school-${e}`]:t=>t.education[e]?.institution,[`educationSection_degree-${e}`]:t=>t.education[e]?.degree,[`educationSection_field-${e}`]:t=>t.education[e]?.field,[`educationSection_gpa-${e}`]:t=>t.education[e]?.gpa,[`educationSection_startDate-${e}`]:t=>t.education[e]?.startYear,[`educationSection_endDate-${e}`]:t=>t.education[e]?.endYear}}function x(e,t){let n=[],r={...v};for(let t=0;t<Math.min(e.work.length,10);t++)Object.assign(r,y(t));for(let t=0;t<Math.min(e.education.length,5);t++)Object.assign(r,b(t));for(let[i,a]of Object.entries(r)){if(t.has(i))continue;let r=a(e);if(r==null){n.push({field:i,selector:`[data-automation-id="${i}"]`,value:``,method:`skipped`,confidence:1,filled:!1,reason:`No value mapped`});continue}let o=document.querySelector(`[data-automation-id="${i}"]`);if(!o)continue;if(o.value&&o.value.trim()!==``){n.push({field:i,selector:`[data-automation-id="${i}"]`,value:o.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(i);continue}let s=String(r);o.tagName===`SELECT`||o.getAttribute(`role`)===`listbox`?h(i,s).then(e=>{e||n.push({field:i,selector:`[data-automation-id="${i}"]`,value:s,method:`skipped`,confidence:1,filled:!1,reason:`No matching dropdown option`})}):(o instanceof HTMLInputElement||o instanceof HTMLTextAreaElement)&&(f(o,s),n.push({field:i,selector:`[data-automation-id="${i}"]`,value:s,method:`exact-map`,confidence:1,filled:!0})),t.add(i)}for(let r=0;r<e.work.length;r++){let i=`workExperienceSection_currentlyWorkHere-${r}`;if(t.has(i))continue;let a=document.querySelector(`[data-automation-id="${i}"]`);a&&e.work[r]?.current&&(a.checked||a.click(),n.push({field:i,selector:`[data-automation-id="${i}"]`,value:`true`,method:`exact-map`,confidence:1,filled:!0}),t.add(i))}return n}var ee={"#first_name":e=>e.personal.firstName,"#last_name":e=>e.personal.lastName,"#email":e=>e.personal.email,"#phone":e=>e.personal.phone,'input[name="job_application[location]"]':e=>[e.personal.address.city,e.personal.address.state].filter(Boolean).join(`, `),'input[autocomplete="organization"]':e=>e.work[0]?.company||``,"#job_application_linkedin_url":e=>e.personal.linkedin,"#job_application_website":e=>e.personal.portfolio||e.personal.website};function S(e,t){let n=[];for(let[r,i]of Object.entries(ee)){let a=r;if(t.has(a))continue;let o=i(e);if(!o)continue;let s=document.querySelector(r);if(s){if(s.value&&s.value.trim()!==``){n.push({field:a,selector:r,value:s.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(a);continue}if(s instanceof HTMLSelectElement){let e=p(s,o);n.push({field:a,selector:r,value:o,method:e?`exact-map`:`skipped`,confidence:1,filled:e,reason:e?void 0:`No matching option`})}else (s instanceof HTMLInputElement||s instanceof HTMLTextAreaElement)&&(f(s,o),n.push({field:a,selector:r,value:o,method:`exact-map`,confidence:1,filled:!0}));t.add(a)}}return n}var C={'input[name="name"]':e=>e.personal.fullName||`${e.personal.firstName} ${e.personal.lastName}`.trim(),'input[name="email"]':e=>e.personal.email,'input[name="phone"]':e=>e.personal.phone,'input[name="org"]':e=>e.work[0]?.company||``,'input[name="urls[LinkedIn]"]':e=>e.personal.linkedin,'input[name="urls[GitHub]"]':e=>e.personal.github,'input[name="urls[Portfolio]"]':e=>e.personal.portfolio,'input[name="urls[Twitter]"]':e=>e.personal.twitter,'input[name="urls[Other]"]':e=>e.personal.website,'textarea[name="comments"]':()=>``};function w(e,t){let n=[];for(let[r,i]of Object.entries(C)){let a=r;if(t.has(a))continue;let o=i(e);if(!o)continue;let s=document.querySelector(r);if(s){if(s.value&&s.value.trim()!==``){n.push({field:a,selector:r,value:s.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(a);continue}f(s,o),n.push({field:a,selector:r,value:o,method:`exact-map`,confidence:1,filled:!0}),t.add(a)}}return n}var T={'input[id*="FirstName"], input[name*="firstName"]':e=>e.personal.firstName,'input[id*="LastName"], input[name*="lastName"]':e=>e.personal.lastName,'input[id*="Email"], input[name*="email"], input[type="email"]':e=>e.personal.email,'input[id*="Phone"], input[name*="phone"], input[type="tel"]':e=>e.personal.phone,'input[id*="Address"], input[name*="address"]':e=>e.personal.address.street,'input[id*="City"], input[name*="city"]':e=>e.personal.address.city,'input[id*="Zip"], input[name*="zip"], input[name*="postal"]':e=>e.personal.address.zip,'input[id*="LinkedIn"], input[name*="linkedin"]':e=>e.personal.linkedin};function E(e,t){let n=[];for(let[r,i]of Object.entries(T)){let a=r.split(`, `);for(let r of a){let a=r.trim();if(t.has(a))continue;let o=i(e);if(!o)continue;let s=document.querySelector(a);if(s){if(s.value&&s.value.trim()!==``){n.push({field:a,selector:a,value:s.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(a);continue}if(s instanceof HTMLSelectElement){let e=p(s,o);n.push({field:a,selector:a,value:o,method:e?`exact-map`:`skipped`,confidence:1,filled:e,reason:e?void 0:`No matching option`})}else f(s,o),n.push({field:a,selector:a,value:o,method:`exact-map`,confidence:1,filled:!0});t.add(a);break}}}return n}var D={'input[id*="FirstName"], input[name*="FirstName"]':e=>e.personal.firstName,'input[id*="LastName"], input[name*="LastName"]':e=>e.personal.lastName,'input[id*="Email"], input[name*="Email"], input[type="email"]':e=>e.personal.email,'input[id*="Phone"], input[name*="Phone"], input[type="tel"]':e=>e.personal.phone,'input[id*="Address"], input[name*="Address"]':e=>e.personal.address.street,'input[id*="City"], input[name*="City"]':e=>e.personal.address.city,'input[id*="ZipCode"], input[name*="ZipCode"], input[name*="PostalCode"]':e=>e.personal.address.zip};function O(e,t){let n=[];for(let[r,i]of Object.entries(D)){let a=r.split(`, `);for(let r of a){let a=r.trim();if(t.has(a))continue;let o=i(e);if(!o)continue;let s=document.querySelector(a);if(s){if(s.value&&s.value.trim()!==``){n.push({field:a,selector:a,value:s.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(a);continue}if(s instanceof HTMLSelectElement){let e=p(s,o);n.push({field:a,selector:a,value:o,method:e?`exact-map`:`skipped`,confidence:1,filled:e})}else f(s,o),n.push({field:a,selector:a,value:o,method:`exact-map`,confidence:1,filled:!0});t.add(a);break}}}return n}var te={'input[name="firstName"], input[id*="firstName"]':e=>e.personal.firstName,'input[name="lastName"], input[id*="lastName"]':e=>e.personal.lastName,'input[name="email"], input[id*="email"], input[type="email"]':e=>e.personal.email,'input[name="phoneNumber"], input[id*="phone"], input[type="tel"]':e=>e.personal.phone,'input[name="location"], input[id*="location"]':e=>[e.personal.address.city,e.personal.address.state].filter(Boolean).join(`, `),'input[name="linkedin"], input[id*="linkedin"]':e=>e.personal.linkedin,'input[name="website"], input[id*="website"]':e=>e.personal.portfolio||e.personal.website};function k(e,t){let n=[];for(let[r,i]of Object.entries(te)){let a=r.split(`, `);for(let r of a){let a=r.trim();if(t.has(a))continue;let o=i(e);if(!o)continue;let s=document.querySelector(a);if(s){if(s.value&&s.value.trim()!==``){n.push({field:a,selector:a,value:s.value,method:`skipped`,confidence:1,filled:!1,reason:`Field already has content`}),t.add(a);continue}s instanceof HTMLSelectElement?p(s,o):f(s,o),n.push({field:a,selector:a,value:o,method:`exact-map`,confidence:1,filled:!0}),t.add(a);break}}}return n}var A=.7;function j(e,t,n){let r=[],i=document.querySelectorAll(`input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="image"]), textarea, select`);for(let o of i){let i=o.getAttribute(`data-automation-id`)||o.name||o.id||o.getAttribute(`aria-label`)||``;if(!i||t.has(i))continue;let s=g(o),u=_(o,s,n);if(u.skip){r.push({field:i,selector:i,value:``,method:`skipped`,confidence:0,filled:!1,reason:u.reason}),t.add(i);continue}let d=null,m=0;for(let[e,t]of Object.entries(a))for(let n of s)for(let r of t){let t=0;n===r?t=1:n.includes(r)?t=.8:r.includes(n)&&n.length>3&&(t=.7),t>m&&(m=t,d=e)}if(m>=A&&d){let t=c(e,d);if(t&&l(d,t))if(o instanceof HTMLSelectElement){let e=p(o,t);r.push({field:i,selector:i,value:t,method:e?`scored`:`skipped`,confidence:m,filled:e,reason:e?void 0:`No matching dropdown option`})}else f(o,t),r.push({field:i,selector:i,value:t,method:`scored`,confidence:m,filled:!0});else r.push({field:i,selector:i,value:t||``,method:`skipped`,confidence:m,filled:!1,reason:t?`Type validation failed`:`No profile value for match`})}else d&&m>0&&r.push({field:i,selector:i,value:``,method:`skipped`,confidence:m,filled:!1,reason:`Low confidence (${(m*100).toFixed(0)}%) for "${d}"`});t.add(i)}return r}var M=class{platform;profile;settings;filled=new Set;observer;allResults=[];onUpdate;constructor(e,t,n,r){this.platform=e,this.profile=t,this.settings=n,this.onUpdate=r,this.observer=new MutationObserver(this.onMutation.bind(this)),this.observer.observe(document.body,{childList:!0,subtree:!0,attributes:!1}),this.scanAndFill()}onMutation(e){e.some(e=>e.addedNodes.length>0)&&setTimeout(()=>this.scanAndFill(),100)}scanAndFill(){let e={fillEEO:this.settings.fillEEO,skipExisting:this.settings.skipExistingContent},t=[];switch(this.platform){case`workday`:t=x(this.profile,this.filled);break;case`greenhouse`:t=S(this.profile,this.filled);break;case`lever`:t=w(this.profile,this.filled);break;case`icims`:t=E(this.profile,this.filled);break;case`taleo`:t=O(this.profile,this.filled);break;case`smartrecruiters`:t=k(this.profile,this.filled);break;default:t=j(this.profile,this.filled,e);break}if(this.platform!==`generic`&&t.length>0){let n=j(this.profile,this.filled,e);t=[...t,...n]}t.length>0&&(this.allResults=[...this.allResults,...t],this.onUpdate(this.allResults))}getResults(){return this.allResults}getFilledCount(){return this.allResults.filter(e=>e.filled).length}getSkippedCount(){return this.allResults.filter(e=>!e.filled).length}destroy(){this.observer.disconnect()}},N=`fillforge-overlay-root`,P=`
  :host {
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    pointer-events: none;
  }

  .ff-bar {
    background: #0f0f0f;
    border-bottom: 1px solid #2e2e2e;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #e8e8e8;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-100%);
    transition: opacity 150ms ease, transform 150ms ease;
  }

  .ff-bar.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .ff-bar .ff-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ff-bar .ff-logo {
    font-weight: 600;
    color: #6b7cff;
  }

  .ff-bar .ff-message {
    color: #e8e8e8;
  }

  .ff-bar .ff-toggle {
    cursor: pointer;
    color: #888888;
    font-size: 12px;
    text-decoration: underline;
    border: none;
    background: none;
    font-family: inherit;
  }

  .ff-bar .ff-toggle:hover {
    color: #8b9aff;
  }

  .ff-details {
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    max-height: 200px;
    overflow-y: auto;
    display: none;
    pointer-events: auto;
  }

  .ff-details.expanded {
    display: block;
  }

  .ff-detail-row {
    padding: 4px 16px;
    font-size: 12px;
    border-bottom: 1px solid #232323;
    display: flex;
    gap: 12px;
  }

  .ff-detail-row .ff-field {
    color: #888888;
    min-width: 140px;
  }

  .ff-detail-row .ff-value {
    color: #e8e8e8;
    flex: 1;
  }

  .ff-detail-row.filled .ff-field::before {
    content: '✓ ';
    color: #4caf82;
  }

  .ff-detail-row.skipped .ff-field::before {
    content: '— ';
    color: #e8a838;
  }

  .ff-success { color: #4caf82; }
  .ff-warning { color: #e8a838; }
`,F=null,I=null,L=null;function R(){if(!F){F=document.createElement(`div`),F.id=N,I=F.attachShadow({mode:`closed`});let e=document.createElement(`style`);e.textContent=P,I.appendChild(e);let t=document.createElement(`div`);t.className=`ff-bar`,t.innerHTML=`
      <div class="ff-status">
        <span class="ff-logo">FillForge</span>
        <span class="ff-message">Initializing...</span>
      </div>
      <button class="ff-toggle">Details</button>
    `,I.appendChild(t);let n=document.createElement(`div`);n.className=`ff-details`,I.appendChild(n),t.querySelector(`.ff-toggle`).addEventListener(`click`,()=>{n.classList.toggle(`expanded`),L&&=(clearTimeout(L),null)}),document.body.appendChild(F)}return{bar:I.querySelector(`.ff-bar`),details:I.querySelector(`.ff-details`)}}function z(e){let{bar:t}=R(),n=t.querySelector(`.ff-message`);n.textContent=`filling ${e} fields...`,t.classList.add(`visible`)}function B(e){let{bar:t,details:n}=R(),r=e.filter(e=>e.filled).length,i=e.filter(e=>!e.filled).length,a=t.querySelector(`.ff-message`);a.innerHTML=`<span class="ff-success">✓ ${r} filled</span>, <span class="ff-warning">${i} skipped</span>`,t.classList.add(`visible`),n.innerHTML=e.map(e=>`
      <div class="ff-detail-row ${e.filled?`filled`:`skipped`}">
        <span class="ff-field">${e.field}</span>
        <span class="ff-value">${e.filled?e.value:e.reason||`Skipped`}</span>
      </div>
    `).join(``),L&&clearTimeout(L),L=setTimeout(()=>{t.classList.remove(`visible`),n.classList.remove(`expanded`)},4e3)}var V=n({closeUI:()=>W,openUI:()=>U,toggleUI:()=>H});function H(){G?W():U()}function U(){G||(G=document.createElement(`div`),G.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 40px);
    z-index: 2147483647;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
    background: transparent;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  `,K=G.attachShadow({mode:`closed`}),q=document.createElement(`iframe`),q.src=chrome.runtime.getURL(`/ui.html`),q.style.cssText=`
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    border-radius: 12px;
  `,K.appendChild(q),document.body.appendChild(G),requestAnimationFrame(()=>{G&&(G.style.opacity=`1`,G.style.transform=`translateY(0)`)}))}function W(){G&&(G.style.opacity=`0`,G.style.transform=`translateY(-10px)`,setTimeout(()=>{G&&G.parentNode&&G.parentNode.removeChild(G),G=null,K=null,q=null},200))}var G,K,q,J=t((()=>{G=null,K=null,q=null,window.addEventListener(`message`,e=>{e.data&&e.data.type===`CLOSE_UI`&&W()})})),Y=r({matches:[`<all_urls>`],runAt:`document_idle`,main(e){let t=null;chrome.runtime.onMessage.addListener((e,t,r)=>{if(e.type===`TOGGLE_UI`)return Promise.resolve().then(()=>(J(),V)).then(({toggleUI:e})=>{e()}),r({success:!0}),!1;if(e.type===`CLOSE_UI`)return Promise.resolve().then(()=>(J(),V)).then(({closeUI:e})=>{e()}),r({success:!0}),!1;if(e.type===`EXECUTE_FILL`){let{profile:t,settings:i}=e.payload;return n(t,i).then(e=>r({success:!0,results:e})).catch(e=>r({error:e.message})),!0}if(e.type===`PING`)return r({alive:!0}),!1});async function n(e,n){let r=window.location.hostname,a=window.location.pathname,o=i(r,a);return console.log(`[FillForge] Detected ATS platform: ${o} on ${r}`),n.showConfidenceOverlay&&z(0),new Promise(i=>{t&&t.destroy(),t=new M(o,e,n,e=>{n.showConfidenceOverlay&&B(e)}),setTimeout(()=>{let e=t.getResults();chrome.runtime.sendMessage({type:`FILL_RESULT`,payload:{results:e,site:document.title||r,hostname:r,platform:o}}),n.showConfidenceOverlay&&B(e),i(e)},1500)})}}}),X={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},Z=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,Q=class e extends Event{static EVENT_NAME=$(`wxt:locationchange`);constructor(t,n){super(e.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};function $(e){return`${Z?.runtime?.id}:content:${e}`}var ne=typeof globalThis.navigation?.addEventListener==`function`;function re(e){let t,n=!1;return{run(){n||(n=!0,t=new URL(location.href),ne?globalThis.navigation.addEventListener(`navigate`,e=>{let n=new URL(e.destination.url);n.href!==t.href&&(window.dispatchEvent(new Q(n,t)),t=n)},{signal:e.signal}):e.setInterval(()=>{let e=new URL(location.href);e.href!==t.href&&(window.dispatchEvent(new Q(e,t)),t=e)},1e3))}}}var ie=class e{static SCRIPT_STARTED_MESSAGE_TYPE=$(`wxt:content-script-started`);id;abortController;locationWatcher=re(this);constructor(e,t){this.contentScriptName=e,this.options=t,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return Z.runtime?.id??this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener(`abort`,e),()=>this.signal.removeEventListener(`abort`,e)}block(){return new Promise(()=>{})}setInterval(e,t){let n=setInterval(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,t){let n=setTimeout(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){let t=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(e,t){let n=requestIdleCallback((...t)=>{this.signal.aborted||e(...t)},t);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,t,n,r){t===`wxt:locationchange`&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(t.startsWith(`wxt:`)?$(t):t,n,{...r,signal:this.signal})}notifyInvalidated(){this.abort(`Content script context invalidated`),X.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(e.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),this.options?.noScriptStartedPostMessage||window.postMessage({type:e.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},`*`)}verifyScriptStartedEvent(e){let t=e.detail?.contentScriptName===this.contentScriptName,n=e.detail?.messageId===this.id;return t&&!n}listenForNewerScripts(){let t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t))}},ae={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)};return(async()=>{try{let{main:e,...t}=Y;return await e(new ie(`content`,t))}catch(e){throw ae.error(`The content script "content" crashed on startup!`,e),e}})()})();
content;