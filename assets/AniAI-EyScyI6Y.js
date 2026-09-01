import{ah as w,X as A,U as z,g as y,z as V,H as O,u as R,aa as T,ac as H,C as U,W as N,ad as X,ae as j,D as Y,af as K}from"./index-BprHykqP.js";import{G}from"./GLTFLoader-XNbSxZhP.js";import{_ as W}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as q,o as Z,a as M}from"./app-DTB_g3fU.js";class J{constructor(){this.loader=new G}load(t,e){return new Promise((i,s)=>{this.loader.load(t,o=>{i({gltf:o,scene:o.scene,skeletons:o.skins||[],animations:o.animations||[]})},e,s)})}}class Q{parse(t){const e=[];t.traverse(l=>{l.isSkinnedMesh&&e.push(l)});const i=new Set;for(const l of e){const u=l.skeleton;if(u&&Array.isArray(u.bones))for(const p of u.bones)p&&p.isBone&&i.add(p)}const s=new Map,o=new Map;for(const l of i)s.set(l.name,l),o.set(l.name,{position:l.position.clone(),rotation:l.rotation.clone(),scale:l.scale.clone()});const r=[];for(const l of i)i.has(l.parent)||r.push(l);const d=r.map(l=>this._buildTreeNode(l,i));return{hasSkeleton:i.size>0,bones:s,restPose:o,tree:d,roots:r,skinnedMeshes:e}}_buildTreeNode(t,e){const i={name:t.name,bone:t,children:[]};for(const s of t.children)e.has(s)&&i.children.push(this._buildTreeNode(s,e));return i}}class tt{constructor(t={}){this._bones=t.bones||new Map,this._restPose=t.restPose||new Map,this._tree=t.tree||[],this._roots=t.roots||[]}get size(){return this._bones.size}get hasSkeleton(){return this._bones.size>0}get(t){return this._bones.get(t)||null}find(t){const e=String(t).toLowerCase(),i=[];for(const[s,o]of this._bones)s.toLowerCase().includes(e)&&i.push(o);return i}names(){return Array.from(this._bones.keys())}list(){return Array.from(this._bones.values())}tree(){return this._tree}roots(){return this._roots}restPose(t){return t?this._restPose.get(t)||null:this._restPose}reset(t){if(t){const e=this._bones.get(t),i=this._restPose.get(t);e&&i&&this._applyRest(e,i);return}for(const[e,i]of this._bones){const s=this._restPose.get(e);s&&this._applyRest(i,s)}}_applyRest(t,e){t.position.copy(e.position),t.rotation.copy(e.rotation),t.scale.copy(e.scale)}}class et{constructor(t={}){this.target=t.target||(typeof window<"u"?window:null),this.bindings=new Map,this._capture=null,this._enabled=!0,this._onKeyDown=this._onKeyDown.bind(this),this._onKeyUp=this._onKeyUp.bind(this),this._attach()}bind(t,e,i="press"){const s=this._normalize(t);if(!e)return console.warn(`[AniAI] bindKey("${t}")：指令为空`),!1;const o=this.bindings.get(s);return o&&o.command.stop(),this.bindings.set(s,{command:e,mode:i,active:!1}),!0}unbind(t){const e=this._normalize(t),i=this.bindings.get(e);i&&(i.command.stop(),this.bindings.delete(e))}getBinding(t){return this.bindings.get(this._normalize(t))||null}getBindings(){return Array.from(this.bindings.entries()).map(([t,e])=>({key:t,command:e.command,mode:e.mode,active:e.active}))}captureNext(t){this._capture={callback:t}}cancelCapture(){this._capture=null}setEnabled(t){this._enabled=t}dispose(){this._detach();for(const[,t]of this.bindings)t.command.stop();this.bindings.clear(),this._capture=null}_attach(){this.target&&(this.target.addEventListener("keydown",this._onKeyDown,!0),this.target.addEventListener("keyup",this._onKeyUp,!0))}_detach(){this.target&&(this.target.removeEventListener("keydown",this._onKeyDown,!0),this.target.removeEventListener("keyup",this._onKeyUp,!0))}_onKeyDown(t){if(this._capture){const s=this._capture.callback;this._capture=null,t.preventDefault(),s(this._fromEvent(t),t);return}if(!this._enabled||t.repeat||this._isEditableTarget(t.target))return;const e=this._fromEvent(t),i=this.bindings.get(e);if(i)switch(i.mode){case"press":t.preventDefault(),i.command.execute();break;case"hold":i.active||(t.preventDefault(),i.active=!0,i.command.execute());break;case"toggle":t.preventDefault(),i.active?(i.active=!1,i.command.stop()):(i.active=!0,i.command.execute());break}}_onKeyUp(t){if(this._capture)return;const e=this._fromEvent(t),i=this.bindings.get(e);i&&i.mode==="hold"&&i.active&&(i.active=!1,i.command.stop())}_fromEvent(t){return this._normalize(t.key)}_normalize(t){return typeof t!="string"?t:t.length===1?t.toLowerCase():t}_isEditableTarget(t){if(!t)return!1;const e=t.tagName;return e==="INPUT"||e==="TEXTAREA"||e==="SELECT"||t.isContentEditable}}class g{constructor(t="command"){this.name=t,this._tween=null,this.animated=!1}execute(){throw new Error(`Command「${this.name}」未实现 execute()`)}stop(){this._tween&&(this._tween.kill(),this._tween=null)}_track(t){return this._tween=t,t}}const I=["x","y","z"];class it extends g{constructor(t,e,i={}){super("setRotation"),this.bone=t,this.rest=e,this.offset=i}execute(){this.stop();for(const t of I)this.offset[t]!==void 0&&(this.bone.rotation[t]=this.rest.rotation[t]+this.offset[t])}}class st extends g{constructor(t,e,i={}){super("setPosition"),this.bone=t,this.rest=e,this.offset=i}execute(){this.stop();for(const t of I)this.offset[t]!==void 0&&(this.bone.position[t]=this.rest.position[t]+this.offset[t])}}class nt extends g{constructor(t,e){super("resetBone"),this.bone=t,this.rest=e}execute(){this.stop(),this.bone.position.copy(this.rest.position),this.bone.rotation.copy(this.rest.rotation),this.bone.scale.copy(this.rest.scale)}}class ot extends g{constructor(t){super("resetAll"),this.registry=t}execute(){var t;this.stop(),(t=this.registry)==null||t.reset()}}const B=["x","y","z"];function rt(n,t="y"){if(n.axis)return n.axis;for(const e of B)if(n[e]!==void 0)return e;return t}class lt extends g{constructor(t,e,i={},s={}){super("rotate"),this.animated=!0,this.bone=t,this.rest=e,this.offset=i,this.duration=s.duration??.3,this.ease=s.ease??"power2.out"}execute(){this.stop();const t={};for(const e of B)this.offset[e]!==void 0&&(t[e]=this.rest.rotation[e]+this.offset[e]);return Object.keys(t).length===0?null:this._track(w.to(this.bone.rotation,{...t,duration:this.duration,ease:this.ease}))}}class at extends g{constructor(t,e,i={}){super("sway"),this.animated=!0,this.bone=t,this.rest=e,this.axis=rt(i,"y"),this.angle=i.angle??i[this.axis]??.3,this.speed=i.speed??2,this.loops=i.loops??-1}execute(){this.stop();const t=this.rest.rotation[this.axis];if(t===void 0)return null;const e=this.speed>0?1/this.speed:.5;return this._track(w.fromTo(this.bone.rotation,{[this.axis]:t-this.angle},{[this.axis]:t+this.angle,duration:e,ease:"sine.inOut",yoyo:!0,repeat:this.loops}))}}class ht extends g{constructor(t,e,i={}){super("bounce"),this.animated=!0,this.model=t,this.modelRest=e,this.factor=i.factor??1.05,this.duration=i.duration??.15}execute(){this.stop();const t=this.modelRest.scale;return this._track(w.to(this.model.scale,{x:t.x*this.factor,y:t.y*this.factor,z:t.z*this.factor,duration:this.duration,yoyo:!0,repeat:1,ease:"power1.out"}))}}class dt{constructor(){this.poses=new Map}has(t){return this.poses.has(t)}names(){return Array.from(this.poses.keys())}get(t){return this.poses.get(t)||null}delete(t){return this.poses.delete(t)}save(t,e){const i=new Map;for(const s of e.names()){const o=e.get(s);o&&i.set(s,o.rotation.clone())}return this.poses.set(t,i),i}}class ct extends g{constructor(t,e,i){super("savePose"),this.poseStore=t,this.registry=e,this.poseName=i}execute(){const t=this.poseStore.save(this.poseName,this.registry);return console.log(`[AniAI] 已保存姿态「${this.poseName}」（${t.size} 根骨骼）`),null}}class ut extends g{constructor(t,e,i,s={}){super("applyPose"),this.animated=!0,this.poseStore=t,this.registry=e,this.poseName=i,this.duration=s.duration??.5,this.ease=s.ease??"power2.inOut"}execute(){this.stop();const t=this.poseStore.get(this.poseName);if(!t)return console.warn(`[AniAI] 姿态「${this.poseName}」不存在，可先 ai.pose.save('${this.poseName}')`),null;const e=w.timeline();let i=!1;for(const[s,o]of t){const r=this.registry.get(s);r&&(e.to(r.rotation,{x:o.x,y:o.y,z:o.z,duration:this.duration,ease:this.ease},0),i=!0)}return i?this._track(e):null}}class pt extends g{constructor(t=[]){super("parallel"),this.animated=!0,this.commands=t.filter(Boolean)}execute(){this.stop();const t=w.timeline();for(const e of this.commands)if(e.animated){const i=e.execute();i&&typeof i.totalDuration=="function"&&t.add(i,0)}else t.call(()=>e.execute(),null,0);return t.getChildren().length===0?null:this._track(t)}stop(){super.stop();for(const t of this.commands)t.stop()}}class mt extends g{constructor(t=[]){super("sequence"),this.animated=!0,this.commands=t.filter(Boolean)}execute(){this.stop();const t=w.timeline();let e=0;for(const i of this.commands)if(i.animated){const s=i.execute();if(s&&typeof s.totalDuration=="function"){const o=s.totalDuration();isFinite(o)?(t.add(s,e),e+=o):(s.kill(),console.warn("[AniAI] sequence 跳过无限循环动画（请改用 loop 或单独绑定）"))}}else t.call(()=>i.execute(),null,e);return t.getChildren().length===0?null:this._track(t)}stop(){super.stop();for(const t of this.commands)t.stop()}}class gt extends g{constructor(t,e={}){super("loop"),this.command=t,this._total=e.times??-1,this.times=this._total,this._running=!1}execute(){return this.stop(),this._running=!0,this.times=this._total,this._run(),null}_run(){var e;if(!this._running||!this.command)return;this.times>0&&this.times--;const t=this.command.execute();t&&typeof t.eventCallback=="function"&&isFinite((e=t.totalDuration)==null?void 0:e.call(t))?t.eventCallback("onComplete",()=>{!this._running||this.times===0||this._run()}):this.times!==0&&setTimeout(()=>this._run(),0)}stop(){var t;this._running=!1,(t=this.command)==null||t.stop(),super.stop()}}let D=class{constructor(t={}){this.loader=t.loader||new J,this.input=new et(t.target),this.gltf=null,this.model=null,this.modelRest=null,this.skeletons=[],this.animations=[],this.parseResult=null,this.registry=null,this.poseStore=new dt,this.cmd={setRotation:(e,i)=>this._makeBoneCmd(it,e,i),setPosition:(e,i)=>this._makeBoneCmd(st,e,i),reset:e=>this._makeBoneCmd(nt,e),resetAll:()=>this.registry?new ot(this.registry):null,rotate:(e,i,s)=>this._makeBoneCmd(lt,e,i,s),sway:(e,i)=>this._makeBoneCmd(at,e,i),bounce:e=>this.model&&this.modelRest?new ht(this.model,this.modelRest,e):null,savePose:e=>this.registry?new ct(this.poseStore,this.registry,e):null,applyPose:(e,i)=>this.registry?new ut(this.poseStore,this.registry,e,i):null,sequence:(...e)=>new mt(e.flat().filter(Boolean)),parallel:(...e)=>new pt(e.flat().filter(Boolean)),loop:(e,i)=>e?new gt(e,i):null},this.pose={save:e=>{var i;return(i=this.cmd.savePose(e))==null?void 0:i.execute()},apply:(e,i)=>{var s;return(s=this.cmd.applyPose(e,i))==null?void 0:s.execute()},names:()=>this.poseStore.names(),has:e=>this.poseStore.has(e),delete:e=>this.poseStore.delete(e)}}async loadModel(t,e){const i=await this.loader.load(t,e);return this.gltf=i.gltf,this.model=i.scene,this.skeletons=i.skeletons,this.animations=i.animations,this.modelRest={position:this.model.position.clone(),rotation:this.model.rotation.clone(),scale:this.model.scale.clone()},this.parseResult=new Q().parse(this.model),this.registry=new tt(this.parseResult),this.registry.hasSkeleton||console.warn(`[AniAI] 模型「${t}」未检测到骨骼（无 SkinnedMesh / skeleton）。`),this.registry}bone(t){return!this.registry||!this.registry.get(t)?(console.warn(`[AniAI] 未找到骨骼「${t}」`),null):{name:t,bone:this.registry.get(t),setRotation:e=>{var i;return(i=this.cmd.setRotation(t,e))==null?void 0:i.execute()},setPosition:e=>{var i;return(i=this.cmd.setPosition(t,e))==null?void 0:i.execute()},reset:()=>{var e;return(e=this.cmd.reset(t))==null?void 0:e.execute()},rotate:(e,i)=>{var s;return(s=this.cmd.rotate(t,e,i))==null?void 0:s.execute()},sway:e=>{var i;return(i=this.cmd.sway(t,e))==null?void 0:i.execute()}}}bindKey(t,e,i="press"){return this.input.bind(t,e,i)}unbindKey(t){this.input.unbind(t)}getBindings(){return this.input.getBindings()}reset(){var t;(t=this.registry)==null||t.reset()}dispose(){var t;(t=this.input)==null||t.dispose(),this.input=null}_makeBoneCmd(t,e,...i){if(!this.registry)return console.warn("[AniAI] 尚未加载模型"),null;const s=this.registry.get(e);if(!s)return console.warn(`[AniAI] 未找到骨骼「${e}」`),null;const o=this.registry.restPose(e);return new t(s,o,...i)}showSkeleton(){if(!this.registry){console.warn("[AniAI] 尚未加载模型，请先 await loadModel(url)。");return}console.log(this.describeSkeleton())}describeSkeleton(){if(!this.registry)return"[AniAI] 尚未加载模型";const t=A.radToDeg,e=r=>r.toFixed(1)+"°",i=[],s=(r,d,l,u)=>{const p=this.registry.restPose(r.name),c=p?p.rotation:null,_=l?"":u?"└─ ":"├─ ",x=c?`  rot(${e(t(c.x))}, ${e(t(c.y))}, ${e(t(c.z))})`:"";i.push(`${d}${_}${r.name}${x}`);const v=d+(l?"":u?"   ":"│  ");r.children.forEach((b,k)=>{s(b,v,!1,k===r.children.length-1)})},o=`[AniAI] 骨骼树（共 ${this.registry.size} 根骨骼）`;return this.registry.tree().forEach((r,d)=>{s(r,"",!0,d===this.registry.tree().length-1)}),[o,...i].join(`
`)}};/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.21.0
 * @author George Michael Brower
 * @license MIT
 */class f{constructor(t,e,i,s,o="div"){this.parent=t,this.object=e,this.property=i,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(o),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),f.nextNameID=f.nextNameID||0,this.$name.id=`lil-gui-name-${++f.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",r=>r.stopPropagation()),this.domElement.addEventListener("keyup",r=>r.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(i)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("lil-disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const e=this.parent.add(this.object,this.property,t);return e.name(this._name),this.destroy(),e}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class ft extends f{constructor(t,e,i){super(t,e,i,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function S(n){let t,e;return(t=n.match(/(#|0x)?([a-f0-9]{6})/i))?e=t[2]:(t=n.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?e=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=n.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(e=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),e?"#"+e:!1}const _t={isPrimitive:!0,match:n=>typeof n=="string",fromHexString:S,toHexString:S},$={isPrimitive:!0,match:n=>typeof n=="number",fromHexString:n=>parseInt(n.substring(1),16),toHexString:n=>"#"+n.toString(16).padStart(6,0)},bt={isPrimitive:!1,match:n=>Array.isArray(n)||ArrayBuffer.isView(n),fromHexString(n,t,e=1){const i=$.fromHexString(n);t[0]=(i>>16&255)/255*e,t[1]=(i>>8&255)/255*e,t[2]=(i&255)/255*e},toHexString([n,t,e],i=1){i=255/i;const s=n*i<<16^t*i<<8^e*i<<0;return $.toHexString(s)}},yt={isPrimitive:!1,match:n=>Object(n)===n,fromHexString(n,t,e=1){const i=$.fromHexString(n);t.r=(i>>16&255)/255*e,t.g=(i>>8&255)/255*e,t.b=(i&255)/255*e},toHexString({r:n,g:t,b:e},i=1){i=255/i;const s=n*i<<16^t*i<<8^e*i<<0;return $.toHexString(s)}},vt=[_t,$,bt,yt];function wt(n){return vt.find(t=>t.match(n))}class xt extends f{constructor(t,e,i,s){super(t,e,i,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=wt(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const o=S(this.$text.value);o&&this._setValueFromHexString(o)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const e=this._format.fromHexString(t);this.setValue(e)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class E extends f{constructor(t,e,i){super(t,e,i,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class kt extends f{constructor(t,e,i,s,o,r){super(t,e,i,"lil-number"),this._initInput(),this.min(s),this.max(o);const d=r!==void 0;this.step(d?r:this._getImplicitStep(),d),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,e=!0){return this._step=t,this._stepExplicit=e,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let e=(t-this._min)/(this._max-this._min);e=Math.max(0,Math.min(e,1)),this.$fill.style.width=e*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const e=()=>{let a=parseFloat(this.$input.value);isNaN(a)||(this._stepExplicit&&(a=this._snap(a)),this.setValue(this._clamp(a)))},i=a=>{const m=parseFloat(this.$input.value);isNaN(m)||(this._snapClampSetValue(m+a),this.$input.value=this.getValue())},s=a=>{a.key==="Enter"&&this.$input.blur(),a.code==="ArrowUp"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a))),a.code==="ArrowDown"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a)*-1))},o=a=>{this._inputFocused&&(a.preventDefault(),i(this._step*this._normalizeMouseWheel(a)))};let r=!1,d,l,u,p,c;const _=5,x=a=>{d=a.clientX,l=u=a.clientY,r=!0,p=this.getValue(),c=0,window.addEventListener("mousemove",v),window.addEventListener("mouseup",b)},v=a=>{if(r){const m=a.clientX-d,C=a.clientY-l;Math.abs(C)>_?(a.preventDefault(),this.$input.blur(),r=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(m)>_&&b()}if(!r){const m=a.clientY-u;c-=m*this._step*this._arrowKeyMultiplier(a),p+c>this._max?c=this._max-p:p+c<this._min&&(c=this._min-p),this._snapClampSetValue(p+c)}u=a.clientY},b=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",v),window.removeEventListener("mouseup",b)},k=()=>{this._inputFocused=!0},h=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",e),this.$input.addEventListener("keydown",s),this.$input.addEventListener("wheel",o,{passive:!1}),this.$input.addEventListener("mousedown",x),this.$input.addEventListener("focus",k),this.$input.addEventListener("blur",h)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const t=(h,a,m,C,P)=>(h-a)/(m-a)*(P-C)+C,e=h=>{const a=this.$slider.getBoundingClientRect();let m=t(h,a.left,a.right,this._min,this._max);this._snapClampSetValue(m)},i=h=>{this._setDraggingStyle(!0),e(h.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",o)},s=h=>{e(h.clientX)},o=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",o)};let r=!1,d,l;const u=h=>{h.preventDefault(),this._setDraggingStyle(!0),e(h.touches[0].clientX),r=!1},p=h=>{h.touches.length>1||(this._hasScrollBar?(d=h.touches[0].clientX,l=h.touches[0].clientY,r=!0):u(h),window.addEventListener("touchmove",c,{passive:!1}),window.addEventListener("touchend",_))},c=h=>{if(r){const a=h.touches[0].clientX-d,m=h.touches[0].clientY-l;Math.abs(a)>Math.abs(m)?u(h):(window.removeEventListener("touchmove",c),window.removeEventListener("touchend",_))}else h.preventDefault(),e(h.touches[0].clientX)},_=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",c),window.removeEventListener("touchend",_)},x=this._callOnFinishChange.bind(this),v=400;let b;const k=h=>{if(Math.abs(h.deltaX)<Math.abs(h.deltaY)&&this._hasScrollBar)return;h.preventDefault();const m=this._normalizeMouseWheel(h)*this._step;this._snapClampSetValue(this.getValue()+m),this.$input.value=this.getValue(),clearTimeout(b),b=setTimeout(x,v)};this.$slider.addEventListener("mousedown",i),this.$slider.addEventListener("touchstart",p,{passive:!1}),this.$slider.addEventListener("wheel",k,{passive:!1})}_setDraggingStyle(t,e="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",t),document.body.classList.toggle("lil-dragging",t),document.body.classList.toggle(`lil-${e}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:e,deltaY:i}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(e=0,i=-t.wheelDelta/120,i*=this._stepExplicit?1:10),e+-i}_arrowKeyMultiplier(t){let e=this._stepExplicit?1:10;return t.shiftKey?e*=10:t.altKey&&(e/=10),e}_snap(t){let e=0;return this._hasMin?e=this._min:this._hasMax&&(e=this._max),t-=e,t=Math.round(t/this._step)*this._step,t+=e,t=parseFloat(t.toPrecision(15)),t}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class At extends f{constructor(t,e,i,s){super(t,e,i,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(s)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(e=>{const i=document.createElement("option");i.textContent=e,this.$select.appendChild(i)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),e=this._values.indexOf(t);return this.$select.selectedIndex=e,this.$display.textContent=e===-1?t:this._names[e],this}}class $t extends f{constructor(t,e,i){super(t,e,i,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var Ct=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function Et(n){const t=document.createElement("style");t.innerHTML=n;const e=document.querySelector("head link[rel=stylesheet], head style");e?document.head.insertBefore(t,e):document.head.appendChild(t)}let F=!1;class L{constructor({parent:t,autoPlace:e=t===void 0,container:i,width:s,title:o="Controls",closeFolders:r=!1,injectStyles:d=!0,touchStyles:l=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(o),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),l&&this.domElement.classList.add("lil-allow-touch-styles"),!F&&d&&(Et(Ct),F=!0),i?i.appendChild(this.domElement):e&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=r}add(t,e,i,s,o){if(Object(i)===i)return new At(this,t,e,i);const r=t[e];switch(typeof r){case"number":return new kt(this,t,e,i,s,o);case"boolean":return new ft(this,t,e);case"string":return new $t(this,t,e);case"function":return new E(this,t,e)}console.error(`gui.add failed
	property:`,e,`
	object:`,t,`
	value:`,r)}addColor(t,e,i=1){return new xt(this,t,e,i)}addFolder(t){const e=new L({parent:this,title:t});return this.root._closeFolders&&e.close(),e}load(t,e=!0){return t.controllers&&this.controllers.forEach(i=>{i instanceof E||i._name in t.controllers&&i.load(t.controllers[i._name])}),e&&t.folders&&this.folders.forEach(i=>{i._title in t.folders&&i.load(t.folders[i._title])}),this}save(t=!0){const e={controllers:{},folders:{}};return this.controllers.forEach(i=>{if(!(i instanceof E)){if(i._name in e.controllers)throw new Error(`Cannot save GUI with duplicate property "${i._name}"`);e.controllers[i._name]=i.save()}}),t&&this.folders.forEach(i=>{if(i._title in e.folders)throw new Error(`Cannot save GUI with duplicate folder "${i._title}"`);e.folders[i._title]=i.save()}),e}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const e=this.$children.clientHeight;this.$children.style.height=e+"px",this.domElement.classList.add("lil-transition");const i=o=>{o.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",i))};this.$children.addEventListener("transitionend",i);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(i=>i.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(e=>{t=t.concat(e.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(e=>{t=t.concat(e.foldersRecursive())}),t}}class St{constructor(t,e){this.aniai=t,this.gui=e,this.folder=e.addFolder("键位 Key Bindings"),this.slots=new Map,this._capturing=!1}register(t,e,i,s="press",o=null){const r={mode:s},d=this.folder.addFolder(e),l={id:t,label:e,makeCommand:i,mode:s,key:null,folder:d,state:r};d.add(r,"mode",["press","hold","toggle"]).name("触发方式").onChange(u=>{l.mode=u,l.key&&this._bind(l,l.key)}),d.add({bind:()=>this._startCapture(l)},"bind").name("绑定按键"),d.add({clear:()=>this._clear(l)},"clear").name("解绑"),this.slots.set(t,l),o&&this._bind(l,o),this._refreshTitle(l)}_startCapture(t){this._capturing||(this._capturing=!0,console.log(`[AniAI] 正在为「${t.label}」设置按键，请按下任意键（Esc 取消）…`),this.aniai.input.captureNext(e=>{if(this._capturing=!1,e==="Escape"){console.log("[AniAI] 已取消绑定");return}this._bind(t,e)}))}_bind(t,e){const i=this.aniai.input.getBinding(e);i&&i.command!==t._boundCommand&&console.warn(`[AniAI] 按键「${e}」已被占用，覆盖旧绑定`);const s=t.makeCommand();this.aniai.bindKey(e,s,t.mode),t.key=e,t._boundCommand=s,this._refreshTitle(t)}_clear(t){t.key&&(this.aniai.unbindKey(t.key),t.key=null,t._boundCommand=null),this._refreshTitle(t)}_refreshTitle(t){t.folder.title(`${t.label}  [${t.key||"未绑定"}]`)}}class Lt{constructor(t,e={}){this.scene=t,this.color=e.color??57599,this.highlightColor=e.highlightColor??16722474,this.highlighted=null,this.entries=new Map,this.group=new z,this.group.visible=!1,t.add(this.group),this._p=new y,this._pp=new y}get visible(){return this.group.visible}build(t){if(this._clearLines(),!!t)for(const e of t.names()){const i=t.get(e);if(!i)continue;const s=i.parent;if(!s||!s.isBone)continue;const o=new V().setFromPoints([new y,new y]),r=new O(o,this._makeMaterial(!1));r.frustumCulled=!1,r.renderOrder=900,r.userData.boneName=e,this.group.add(r),this.entries.set(e,{bone:i,line:r})}}_makeMaterial(t){return new R({color:t?this.highlightColor:this.color,transparent:!0,opacity:t?1:.6,depthTest:!1,depthWrite:!1})}setVisible(t){this.group.visible=t}highlight(t){this.highlighted=t;for(const[e,{line:i}]of this.entries){const s=e===t;i.material.color.set(s?this.highlightColor:this.color),i.material.opacity=s?1:.6}}clearHighlight(){this.highlighted=null;for(const{line:t}of this.entries.values())t.material.color.set(this.color),t.material.opacity=.6}update(){for(const{bone:t,line:e}of this.entries.values()){t.getWorldPosition(this._p),t.parent.getWorldPosition(this._pp);const i=e.geometry.attributes.position;i.setXYZ(0,this._pp.x,this._pp.y,this._pp.z),i.setXYZ(1,this._p.x,this._p.y,this._p.z),i.needsUpdate=!0}}_clearLines(){for(const{line:t}of this.entries.values())this.group.remove(t),t.geometry.dispose(),t.material.dispose();this.entries.clear(),this.highlighted=null}dispose(){this._clearLines(),this.scene.remove(this.group)}}class Mt{constructor(t,e={},i={}){var s;this.aniai=t,this.context=e,this.handlers=i,this.gui=new L({title:"AniAI 控制面板"}),this._skeletonCtrls=null,this.skeletonLines=null,e.scene&&(this.skeletonLines=new Lt(e.scene),this.skeletonLines.build(this.aniai.registry)),e.camera&&(this.homeCamera=e.camera.position.clone()),this.homeTarget=(s=e.controls)!=null&&s.target?e.controls.target.clone():new y,this._buildModel(),this._buildSkeleton(),this._buildPose(),this.keyBindings=new St(t,this.gui),this._buildPresetBindings()}dispose(){var t,e;(t=this._fileInput)==null||t.remove(),this._fileInput=null,(e=this.skeletonLines)==null||e.dispose(),this.gui.destroy()}update(){var t;(t=this.skeletonLines)==null||t.update()}_buildModel(){const t=this.gui.addFolder("模型 Model"),e={url:this.aniai.modelName||(this.aniai.model?"已加载":"未加载"),showSkeleton:!1,resetView:()=>this._resetView()};this._modelState=e,t.add(e,"url").name("模型").disable(),this._showSkeletonCtrl=t.add(e,"showSkeleton").name("显示骨骼").onChange(i=>this._toggleSkeleton(i)),t.add(e,"resetView").name("重置视角"),this.handlers.onImport&&(this._fileInput=document.createElement("input"),this._fileInput.type="file",this._fileInput.accept=".glb,.gltf",this._fileInput.style.display="none",this._fileInput.addEventListener("change",()=>{var s;const i=(s=this._fileInput.files)==null?void 0:s[0];this._fileInput.value="",i&&this.handlers.onImport(i)}),document.body.appendChild(this._fileInput),t.add({importModel:()=>this._fileInput.click()},"importModel").name("导入 GLB"))}_toggleSkeleton(t){!this.context.scene||!this.skeletonLines||this.skeletonLines.setVisible(t)}_resetView(){this.context.camera&&this.homeCamera&&this.context.camera.position.copy(this.homeCamera),this.context.controls&&(this.context.controls.target.copy(this.homeTarget),this.context.controls.update())}_buildSkeleton(){const t=this.gui.addFolder("骨骼 Skeleton");if(!this.aniai.registry||!this.aniai.registry.hasSkeleton){t.add({msg:"该模型无骨骼"},"msg").name("提示").disable();return}const e=this.aniai.registry.names(),i={bone:e[0],rx:0,ry:0,rz:0,resetBone:()=>this._resetBone(),resetAll:()=>this.aniai.reset()};this._skeletonState=i,t.add(i,"bone",e).name("选择骨骼").onChange(()=>{this._syncBoneSliders(),this._highlightBone()});const s=t.add(i,"rx",-180,180,1).name("绕X旋转°").onChange(()=>this._applyBone()),o=t.add(i,"ry",-180,180,1).name("绕Y旋转°").onChange(()=>this._applyBone()),r=t.add(i,"rz",-180,180,1).name("绕Z旋转°").onChange(()=>this._applyBone());this._skeletonCtrls={rx:s,ry:o,rz:r},t.add(i,"resetBone").name("复位此骨骼"),t.add(i,"resetAll").name("复位全部骨骼"),this._syncBoneSliders(),this._highlightBone()}_syncBoneSliders(){if(!this._skeletonState||!this._skeletonCtrls)return;const t=this._skeletonState.bone,e=this.aniai.registry.get(t),i=this.aniai.registry.restPose(t);if(!e||!i)return;const s=A.radToDeg;this._skeletonState.rx=s(e.rotation.x-i.rotation.x),this._skeletonState.ry=s(e.rotation.y-i.rotation.y),this._skeletonState.rz=s(e.rotation.z-i.rotation.z),this._skeletonCtrls.rx.updateDisplay(),this._skeletonCtrls.ry.updateDisplay(),this._skeletonCtrls.rz.updateDisplay()}_applyBone(){var e;if(!this._skeletonState)return;const t={x:A.degToRad(this._skeletonState.rx),y:A.degToRad(this._skeletonState.ry),z:A.degToRad(this._skeletonState.rz)};(e=this.aniai.cmd.setRotation(this._skeletonState.bone,t))==null||e.execute()}_resetBone(){var t;this._skeletonState&&((t=this.aniai.cmd.reset(this._skeletonState.bone))==null||t.execute(),this._syncBoneSliders())}_highlightBone(){var t;!this.skeletonLines||!this._skeletonState||(this.skeletonLines.visible||(this.skeletonLines.setVisible(!0),this._modelState&&(this._modelState.showSkeleton=!0),(t=this._showSkeletonCtrl)==null||t.updateDisplay()),this.skeletonLines.highlight(this._skeletonState.bone))}_buildPose(){const t=this.gui.addFolder("姿态 Pose");if(!this.aniai.registry){t.add({msg:"未加载模型"},"msg").name("提示").disable();return}const e={poseName:"idle",save:()=>this.aniai.pose.save(e.poseName),apply:()=>this.aniai.pose.apply(e.poseName,{duration:.5}),saved:""};t.add(e,"poseName").name("姿态名"),t.add(e,"save").name("保存当前姿态"),t.add(e,"apply").name("应用姿态"),t.add(e,"saved").name("已保存").disable(),t.add({refresh:()=>e.saved=this.aniai.pose.names().join(", ")||"(无)"},"refresh").name("刷新列表"),e.saved=this.aniai.pose.names().join(", ")||"(无)"}_buildPresetBindings(){var e,i;const t=this.aniai;this.keyBindings.register("reset","复位全部",()=>t.cmd.resetAll(),"press","r"),this.keyBindings.register("bounce","弹跳",()=>t.cmd.bounce({factor:1.08}),"press","b"),(e=t.registry)!=null&&e.get("EarL_Armature")&&this.keyBindings.register("ear-left","左耳摆动",()=>t.cmd.sway("EarL_Armature",{axis:"z",angle:.3,speed:3}),"toggle","t"),(i=t.registry)!=null&&i.get("Tail_Armature")&&this.keyBindings.register("tail","尾巴摇摆",()=>t.cmd.sway("Tail_Armature",{axis:"y",angle:.5,speed:4}),"hold","d")}}const Dt={name:"AniAI",data(){return{modelUrl:"/models/mimikyu.glb"}},mounted(){this.init()},beforeUnmount(){var n,t,e,i,s;cancelAnimationFrame(this.rafId),window.removeEventListener("resize",this.onResize),(n=this.guiPanel)==null||n.dispose(),(t=this.ai)==null||t.dispose(),window.aniAI=null,(e=this.controls)==null||e.dispose(),this._disposeModel((i=this.ai)==null?void 0:i.model),(s=this.renderer)==null||s.dispose()},methods:{async init(){this.canvas=this.$refs.canvas;const n=this.canvas.clientWidth||1,t=this.canvas.clientHeight||1;this.scene=new H,this.scene.background=new U(1710638),this.camera=new N(50,n/t,.1,1e3),this.camera.position.set(0,1,5),this.renderer=new X({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setSize(n,t),this.renderer.setPixelRatio(window.devicePixelRatio),this.scene.add(new j(16777215,1.2));const e=new Y(16777215,2);e.position.set(2,4,3),this.scene.add(e),this.controls=new K(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,window.addEventListener("resize",this.onResize),this.ai=new D;try{await this.ai.loadModel(this.modelUrl),this.scene.add(this.ai.model),this.ai.showSkeleton(),window.aniAI=this.ai,console.log("[AniAI] 骨骼名列表：",this.ai.registry.names()),this.guiPanel=this._buildPanel(),console.log("[AniAI] 已加载 GUI 面板，默认键位：r=复位 b=弹跳 t=左耳摆动 d=尾巴(按住)")}catch(i){console.error("[AniAI] 模型加载失败",i)}this.animate()},animate(){var n,t,e;this.rafId=requestAnimationFrame(this.animate),(n=this.controls)==null||n.update(),(t=this.guiPanel)==null||t.update(),(e=this.renderer)==null||e.render(this.scene,this.camera)},onResize(){const n=this.canvas.clientWidth,t=this.canvas.clientHeight;this.camera.aspect=n/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(n,t)},_disposeModel(n){n&&n.traverse(t=>{var e,i;t.isMesh&&((e=t.geometry)==null||e.dispose(),Array.isArray(t.material)?t.material.forEach(s=>s.dispose()):(i=t.material)!=null&&i.isMaterial&&t.material.dispose())})},_buildPanel(){return new Mt(this.ai,{scene:this.scene,camera:this.camera,controls:this.controls},{onImport:n=>this.reloadModel(n)})},_fitCameraToModel(){var r;const n=(r=this.ai)==null?void 0:r.model;if(!n)return;const t=new T().setFromObject(n);if(t.isEmpty())return;const e=t.getCenter(new y),i=t.getSize(new y),s=Math.max(i.x,i.y,i.z)||1,o=s/2/Math.tan(this.camera.fov*Math.PI/360);this.camera.position.copy(e).add(new y(0,s*.2,o*1.5)),this.camera.near=Math.max(.01,s/100),this.camera.far=s*100,this.camera.updateProjectionMatrix(),this.controls&&(this.controls.target.copy(e),this.controls.update())},async reloadModel(n){var t,e,i;if(!this._loading){this._loading=!0;try{(t=this.guiPanel)==null||t.dispose(),this.guiPanel=null;const s=(e=this.ai)==null?void 0:e.model;(i=this.ai)==null||i.dispose(),s&&(this.scene.remove(s),this._disposeModel(s));const o=URL.createObjectURL(n);let r;try{r=new D,await r.loadModel(o)}finally{URL.revokeObjectURL(o)}r.modelName=n.name,this.ai=r,this.scene.add(this.ai.model),window.aniAI=this.ai,this.guiPanel=this._buildPanel(),this._fitCameraToModel(),console.log(`[AniAI] 已导入「${n.name}」，骨骼：`,this.ai.registry.names())}catch(s){console.error("[AniAI] 导入模型失败",s)}finally{this._loading=!1}}}}},Ft={class:"aniai-container"},It={ref:"canvas",class:"aniai-canvas"};function Bt(n,t,e,i,s,o){return Z(),q("div",Ft,[M("canvas",It,null,512),t[0]||(t[0]=M("div",{class:"aniai-hint"},"右侧面板设置键位 · 默认：r=复位 b=弹跳 t=左耳摆动 d=尾巴(按住)",-1))])}const Tt=W(Dt,[["render",Bt],["__scopeId","data-v-3b5c90ad"]]);export{Tt as default};
