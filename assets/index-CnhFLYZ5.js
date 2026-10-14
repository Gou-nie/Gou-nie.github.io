/*!
 * ONNX Runtime Web v1.30.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var Un=Object.defineProperty,Zm=Object.getOwnPropertyDescriptor,Qm=Object.getOwnPropertyNames,Ym=Object.prototype.hasOwnProperty,Jm=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),U=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(i){throw r=[i],i}},Kt=(e,t)=>{for(var r in t)Un(e,r,{get:t[r],enumerable:!0})},eg=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Qm(t))!Ym.call(e,n)&&n!==r&&Un(e,n,{get:()=>t[n],enumerable:!(i=Zm(t,n))||i.enumerable});return e},mr=e=>eg(Un({},"__esModule",{value:!0}),e),er,ht,Gt,lo,Yd,Jd=U(()=>{"use strict";er=new Map,ht=[],Gt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=er.get(e);if(i===void 0)er.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let n=ht.indexOf(e);n!==-1&&ht.splice(n,1);for(let a=0;a<ht.length;a++)if(er.get(ht[a]).priority<=r){ht.splice(a,0,e);return}ht.push(e)}return}throw new TypeError("not a valid backend")},lo=async e=>{let t=er.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Yd=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?ht:r,n,a=[],s=new Set;for(let l of i){let p=await lo(l);typeof p=="string"?a.push({name:l,err:p}):(n||(n=p),n===p&&s.add(l))}if(!n)throw new Error(`no available backend found. ERR: ${a.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:p}of a)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${p}`);let u=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[n,new Proxy(e,{get:(l,p)=>p==="executionProviders"?u:Reflect.get(l,p)})]}}),tg=U(()=>{"use strict";Jd()}),e0,rg=U(()=>{"use strict";e0="1.30.0"}),$i,Be,t0=U(()=>{"use strict";rg(),$i="warning",Be={wasm:{},webgl:{},webgpu:{},versions:{common:e0},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);$i=e}},get logLevel(){return $i}},Object.defineProperty(Be,"logLevel",{enumerable:!0})}),xe,ig=U(()=>{"use strict";t0(),xe=Be}),r0,i0,ng=U(()=>{"use strict";r0=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let n,a;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[3]):(n=e.dims[3],a=e.dims[2]);let s=t?.format!==void 0?t.format:"RGB",u=t?.norm,l,p;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let c=a*n,f=0,g=c,b=c*2,v=-1;s==="RGBA"?(f=0,g=c,b=c*2,v=c*3):s==="RGB"?(f=0,g=c,b=c*2):s==="RBG"&&(f=0,b=c,g=c*2);for(let _=0;_<a;_++)for(let A=0;A<n;A++){let $=(e.data[f++]-p[0])*l[0],y=(e.data[g++]-p[1])*l[1],S=(e.data[b++]-p[2])*l[2],k=v===-1?255:(e.data[v++]-p[3])*l[3];i.fillStyle="rgba("+$+","+y+","+S+","+k+")",i.fillRect(A,_,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},i0=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let n,a,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[1],s=e.dims[3]):(n=e.dims[3],a=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t?.norm,p,c;l===void 0||l.mean===void 0?p=[255,255,255,255]:typeof l.mean=="number"?p=[l.mean,l.mean,l.mean,l.mean]:(p=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(p[3]=l.mean[3])),l===void 0||l.bias===void 0?c=[0,0,0,0]:typeof l.bias=="number"?c=[l.bias,l.bias,l.bias,l.bias]:(c=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(c[3]=l.bias[3]));let f=a*n;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,b=0,v=1,_=2,A=3,$=0,y=f,S=f*2,k=-1;u==="RGBA"?($=0,y=f,S=f*2,k=f*3):u==="RGB"?($=0,y=f,S=f*2):u==="RBG"&&($=0,S=f,y=f*2),i=r.createImageData(n,a);for(let T=0;T<a*n;b+=g,v+=g,_+=g,A+=g,T++)i.data[b]=(e.data[$++]-c[0])*p[0],i.data[v]=(e.data[y++]-c[1])*p[1],i.data[_]=(e.data[S++]-c[2])*p[2],i.data[A]=k===-1?255:(e.data[k++]-c[3])*p[3]}else throw new Error("Can not access image data");return i}}),Ir,n0,a0,s0,o0,u0,ag=U(()=>{"use strict";Ln(),Ir=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,n=t.norm??{mean:255,bias:0},a,s;typeof n.mean=="number"?a=[n.mean,n.mean,n.mean,n.mean]:a=[n.mean[0],n.mean[1],n.mean[2],n.mean[3]??255],typeof n.bias=="number"?s=[n.bias,n.bias,n.bias,n.bias]:s=[n.bias[0],n.bias[1],n.bias[2],n.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,c=l==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),f=4,g=0,b=1,v=2,_=3,A=0,$=p,y=p*2,S=-1;u==="RGB"&&(f=3,g=0,b=1,v=2,_=-1),l==="RGBA"?S=p*3:l==="RBG"?(A=0,y=p,$=p*2):l==="BGR"&&(y=0,$=p,A=p*2);for(let k=0;k<p;k++,g+=f,v+=f,b+=f,_+=f)c[A++]=(e[g]+s[0])/a[0],c[$++]=(e[b]+s[1])/a[1],c[y++]=(e[v]+s[2])/a[2],S!==-1&&_!==-1&&(c[S++]=(e[_]+s[3])/a[3]);return l==="RGBA"?new Re("float32",c,[1,4,r,i]):new Re("float32",c,[1,3,r,i])},n0=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,n=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,a=typeof e=="string",s,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=c=>typeof HTMLCanvasElement<"u"&&c instanceof HTMLCanvasElement||c instanceof OffscreenCanvas?c.getContext("2d"):null;if(r){let c=l();c.width=e.width,c.height=e.height;let f=p(c);if(f!=null){let g=e.height,b=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,b=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=b}else u.tensorFormat="RGBA",u.height=g,u.width=b;f.drawImage(e,0,0),s=f.getImageData(0,0,b,g).data}else throw new Error("Can not access image data")}else if(i){let c,f;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(c=t.resizedHeight,f=t.resizedWidth):(c=e.height,f=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=c,u.width=f,t!==void 0){let g=l();g.width=f,g.height=c;let b=p(g);if(b!=null)b.putImageData(e,0,0),s=b.getImageData(0,0,f,c).data;else throw new Error("Can not access image data")}else s=e.data}else if(n){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let c=l();c.width=e.width,c.height=e.height;let f=p(c);if(f!=null){let g=e.height,b=e.width;return f.drawImage(e,0,0,b,g),s=f.getImageData(0,0,b,g).data,u.height=g,u.width=b,Ir(s,u)}else throw new Error("Can not access image data")}else{if(a)return new Promise((c,f)=>{let g=l(),b=p(g);if(!e||!b)return f();let v=new Image;v.crossOrigin="Anonymous",v.src=e,v.onload=()=>{g.width=v.width,g.height=v.height,b.drawImage(v,0,0,g.width,g.height);let _=b.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,c(Ir(_.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Ir(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},a0=(e,t)=>{let{width:r,height:i,download:n,dispose:a}=t,s=[1,i,r,4];return new Re({location:"texture",type:"float32",texture:e,dims:s,download:n,dispose:a})},s0=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new Re({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:n,dispose:a})},o0=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new Re({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:n,dispose:a})},u0=(e,t,r)=>new Re({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),It,pr,Ai,l0,sg=U(()=>{"use strict";It=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),pr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Ai=!1,l0=()=>{if(!Ai){Ai=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(It.set("int64",BigInt64Array),pr.set(BigInt64Array,"int64")),t&&(It.set("uint64",BigUint64Array),pr.set(BigUint64Array,"uint64")),i?(It.set("float16",r),pr.set(r,"float16")):It.set("float16",Uint16Array)}}}),d0,p0,og=U(()=>{"use strict";Ln(),d0=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},p0=(e,t)=>{switch(e.location){case"cpu":return new Re(e.type,e.data,t);case"cpu-pinned":return new Re({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Re({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Re({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Re({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Re,Ln=U(()=>{"use strict";ng(),ag(),sg(),og(),Re=class{constructor(e,t,r){l0();let i,n;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,n=e.dims,e.location){case"cpu-pinned":{let s=It.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=It.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=pr.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");n=u,this.cpuData=s,this.dataLocation="cpu"}let a=d0(n);if(this.cpuData&&a!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(a/2)===this.cpuData.length))throw new Error(`Tensor's size(${a}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=n,this.size=a}static async fromImage(e,t){return n0(e,t)}static fromTexture(e,t){return a0(e,t)}static fromGpuBuffer(e,t){return s0(e,t)}static fromMLTensor(e,t){return o0(e,t)}static fromPinnedBuffer(e,t,r){return u0(e,t,r)}toDataURL(e){return r0(this,e)}toImageData(e){return i0(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return p0(this,e)}}}),Ze,c0=U(()=>{"use strict";Ln(),Ze=Re}),Wr,ki,rt,Qe,Ct,Bt,f0=U(()=>{"use strict";t0(),Wr=(e,t)=>{(typeof Be.trace>"u"?!Be.wasm.trace:!Be.trace)||console.timeStamp(`${e}::ORT::${t}`)},ki=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let a=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(a+=`::${t}`),Wr("CPU",a);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},rt=e=>{(typeof Be.trace>"u"?!Be.wasm.trace:!Be.trace)||ki("BEGIN",e)},Qe=e=>{(typeof Be.trace>"u"?!Be.wasm.trace:!Be.trace)||ki("END",e)},Ct=e=>{(typeof Be.trace>"u"?!Be.wasm.trace:!Be.trace)||console.time(`ORT::${e}`)},Bt=e=>{(typeof Be.trace>"u"?!Be.wasm.trace:!Be.trace)||console.timeEnd(`ORT::${e}`)}}),h0,ug=U(()=>{"use strict";Jd(),c0(),f0(),h0=class m0{constructor(t){this.handler=t}async run(t,r,i){rt(),Ct("InferenceSession.run");let n={},a={};if(typeof t!="object"||t===null||t instanceof Ze||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ze)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);n[p]=null}if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,c=Object.getOwnPropertyNames(r);for(let f of this.outputNames)if(c.indexOf(f)!==-1){let g=r[f];(g===null||g instanceof Ze)&&(p=!0,s=!1,n[f]=g)}if(p){if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else a=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(s)for(let p of this.outputNames)n[p]=null;let u=await this.handler.run(t,n,a),l={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let c=u[p];c instanceof Ze?l[p]=c:l[p]=new Ze(c.type,c.data,c.dims)}return Bt("InferenceSession.run"),Qe(),l}async release(){return this.handler.dispose()}static async create(t,r,i,n){rt(),Ct("InferenceSession.create");let a,s={};if(typeof t=="string"){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let c=t,f=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(f=r,!Number.isSafeInteger(f))throw new RangeError("'byteOffset' must be an integer.");if(f<0||f>=c.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${c.byteLength}).`);if(g=t.byteLength-f,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||f+g>c.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${c.byteLength-f}].`);if(typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");a=new Uint8Array(c,f,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await Yd(s),p=await u.createInferenceSessionHandler(a,l);return Bt("InferenceSession.create"),Qe(),new m0(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Fn,lg=U(()=>{"use strict";ug(),Fn=h0}),dg=U(()=>{"use strict"}),pg=U(()=>{"use strict"}),cg=U(()=>{"use strict"}),fg=U(()=>{"use strict"}),hg={};Kt(hg,{InferenceSession:()=>Fn,TRACE:()=>Wr,TRACE_EVENT_BEGIN:()=>Ct,TRACE_EVENT_END:()=>Bt,TRACE_FUNC_BEGIN:()=>rt,TRACE_FUNC_END:()=>Qe,Tensor:()=>Ze,env:()=>xe,registerBackend:()=>Gt});var Le=U(()=>{"use strict";tg(),ig(),lg(),c0(),dg(),pg(),f0(),cg(),fg()}),Gn=U(()=>{"use strict"}),g0={};Kt(g0,{default:()=>v0});var Si,Ti,v0,mg=U(()=>{"use strict";Sf(),Rt(),Wn(),Si="ort-wasm-proxy-worker",Ti=globalThis.self?.name===Si,Ti&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":Vn(r.wasm).then(()=>{la(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:n}=r;da(n,i).then(()=>{postMessage({type:t})},a=>{postMessage({type:t,err:a})});break}case"copy-from":{let{buffer:i}=r,n=Yr(i);postMessage({type:t,out:n});break}case"create":{let{model:i,options:n}=r;pa(i,n).then(a=>{postMessage({type:t,out:a})},a=>{postMessage({type:t,err:a})});break}case"release":ca(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:n,inputs:a,outputIndices:s,options:u}=r;fa(i,n,a,s,new Array(s.length).fill(null),u).then(l=>{l.some(p=>p[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:l},ma([...a,...l]))},l=>{postMessage({type:t,err:l})});break}case"end-profiling":ha(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),v0=Ti?null:e=>new Worker(e??Me,{type:"module",name:Si})}),b0={};Kt(b0,{default:()=>y0});async function po(e={}){var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,n=i&&self.name?.startsWith("em-pthread");t.mountExternalData=(o,d)=>{o.startsWith("./")&&(o=o.substring(2)),(t.ad||(t.ad=new Map)).set(o,d)},t.unmountExternalData=()=>{delete t.ad,delete t.Yd,delete t.Xd,delete t.be},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let a=o=>async(...d)=>{try{if(t.$c)throw Error("Session already started");let m=t.$c={Nd:d[0],errors:[]},h=await o(...d);if(t.$c!==m)throw Error("Session mismatch");t.hd?.flush();let x=m.errors;if(0<x.length){let E=await Promise.all(x);if(E=E.filter(j=>j),0<E.length)throw Error(E.join(`
`))}return h}finally{t.$c=null}};t.jsepInit=(o,d)=>{if(o==="webgpu"){[t.hd,t.Dd,t.Hd,t.jd,t.Gd,t.bc,t.Id,t.Kd,t.Ed,t.Fd,t.Jd]=d;let m=t.hd;t.jsepRegisterBuffer=(h,x,E,j)=>m.registerBuffer(h,x,E,j),t.jsepGetBuffer=h=>m.getBuffer(h),t.jsepCreateDownloader=(h,x,E)=>m.createDownloader(h,x,E),t.jsepOnCreateSession=h=>{m.onCreateSession(h)},t.jsepOnReleaseSession=h=>{m.onReleaseSession(h)},t.jsepOnRunStart=h=>m.onRunStart(h),t.Ld=(h,x)=>{m.upload(h,x)}}else if(o==="webnn"){let m=d[0];[t.Vd,t.vd,t.webnnEnsureTensor,t.wd,t.webnnDownloadTensor,t.Ud,t.webnnEnableTraceEvent]=d.slice(1),t.webnnReleaseTensorId=t.vd,t.webnnUploadTensor=t.wd,t.webnnRegisterMLContext=t.Ud,t.webnnOnRunStart=h=>m.onRunStart(h),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=h=>{m.onReleaseSession(h)},t.webnnCreateMLTensorDownloader=(h,x)=>m.createMLTensorDownloader(h,x),t.webnnRegisterMLTensor=(h,x,E,j)=>m.registerMLTensor(h,x,E,j),t.webnnCreateMLContext=h=>m.createMLContext(h),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let s=()=>{let o=d=>(...m)=>{let h=Je;return m=d(...m),Je!=h?new Promise((x,E)=>{di={resolve:x,reject:E}}):m};(()=>{for(let d of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[d]=o(t[d])})(),a!==void 0&&(t._OrtRun=a(t._OrtRun),t._OrtRunWithBinding=a(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s?.()};var u,l,p=(o,d)=>{throw d},c=import.meta.url,f="";if(r||i){try{f=new URL(".",c).href}catch{}i&&(l=o=>{var d=new XMLHttpRequest;return d.open("GET",o,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),u=async o=>{if(z(o))return new Promise((m,h)=>{var x=new XMLHttpRequest;x.open("GET",o,!0),x.responseType="arraybuffer",x.onload=()=>{x.status==200||x.status==0&&x.response?m(x.response):h(x.status)},x.onerror=h,x.send(null)});var d=await fetch(o,{credentials:"same-origin"});if(d.ok)return d.arrayBuffer();throw Error(d.status+" : "+d.url)}}var g,b,v,_,A,$,y=console.log.bind(console),S=console.error.bind(console),k=y,T=S,I=!1,z=o=>o.startsWith("file://");function w(){dt.buffer!=M.buffer&&J()}if(n){let o=function(d){try{var m=d.data,h=m.Vc;if(h==="load"){let x=[];self.onmessage=E=>x.push(E),$=()=>{postMessage({Vc:"loaded"});for(let E of x)o(E);self.onmessage=o};for(let E of m.Ad)t[E]&&!t[E].proxy||(t[E]=(...j)=>{postMessage({Vc:"callHandler",yd:E,args:j})},E=="print"&&(k=t[E]),E=="printErr"&&(T=t[E]));dt=m.Rd,J(),b=m.Sd,Ee(),Er()}else if(h==="run"){(function(x){var E=(w(),N)[x+52>>>2>>>0];x=(w(),N)[x+56>>>2>>>0],bs(E,E-x),pe(E)})(m.Uc),mi(m.Uc,0,0,1,0,0),ba(),oi(m.Uc),O||(cs(),O=!0);try{Uf(m.Pd,m.ed)}catch(x){if(x!="unwind")throw x}}else m.target!=="setimmediate"&&(h==="checkMailbox"?O&&xr():h&&(T(`worker: received unknown command ${h}`),T(m)))}catch(x){throw fs(),x}};var O=!1;self.onunhandledrejection=d=>{throw d.reason||d},self.onmessage=o}var M,F,G,L,C,N,V,X,te,re,ae,q=!1;function J(){var o=dt.buffer;t.HEAP8=M=new Int8Array(o),G=new Int16Array(o),t.HEAPU8=F=new Uint8Array(o),L=new Uint16Array(o),t.HEAP32=C=new Int32Array(o),t.HEAPU32=N=new Uint32Array(o),V=new Float32Array(o),X=new Float64Array(o),te=new BigInt64Array(o),re=new BigUint64Array(o)}function Y(){q=!0,n?$():nt.ub()}function H(o){throw T(o="Aborted("+o+")"),I=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),A?.(o),o}function Te(){return{a:{ma:dm,hb:lm,g:Lf,J:Ff,f:Gf,o:Wf,i:Vf,$:Hf,b:Kf,S:Xf,Ha:Aa,n:Zf,aa:Ea,Ya:Ia,Da:za,Fa:ja,Za:Ca,Wa:Ba,Pa:Oa,Va:Da,ka:Ma,Ea:Ra,Ba:Na,Xa:qa,Ca:Pa,cb:Qf,fa:Yf,wa:Jf,ua:th,ea:ih,N:nh,H:ah,va:sh,_:fh,xa:hh,Sa:mh,za:vh,Ia:bh,sa:yh,ga:_h,Ra:oi,$a:xh,Q:kh,r:zh,c:ai,ib:jh,y:Ch,M:Bh,D:Oh,l:Dh,s:Ka,jb:Mh,I:Rh,R:Nh,j:qh,u:Ph,q:Uh,k:Lh,Ma:Fh,Na:Gh,Oa:Wh,Ka:Ya,La:Ja,ta:es,eb:Hh,bb:Xh,v:Zh,ba:Qh,ha:Yh,ab:Kh,V:Jh,_a:em,Aa:tm,F:Vh,U:rm,la:Sr,ya:nm,gb:im,fb:am,Ta:ns,Ua:as,Ga:ei,T:ss,Ja:os,ja:us,Qa:ls,ia:ds,lb:Hm,na:Lm,mb:Vm,oa:Um,G:zm,e:hm,t:cm,w:pm,B:Am,nb:Nm,Z:Rm,x:vm,pa:qm,X:Fm,ca:Mm,ob:Dm,pb:Om,O:km,qb:Cm,qa:Bm,rb:jm,L:Em,Y:Pm,d:fm,A:gm,m:mm,kb:Km,p:ym,z:_m,C:bm,E:xm,K:Sm,ra:Im,P:Gm,da:Tm,W:Wm,sb:$m,tb:wm,h:om,a:dt,db:qt}}}async function Ee(){function o(h,x){var E=nt=h.exports;h={};for(let[j,R]of Object.entries(E))typeof R=="function"?(E=wh(R),h[j]=E):h[j]=R;return nt=h,nt=function(){var j=nt,R=K=>de=>K(de)>>>0,W=K=>()=>K()>>>0;return(j=Object.assign({},j)).vb=R(j.vb),j.Zb=W(j.Zb),j.$b=R(j.$b),j.nc=R(j.nc),j.oc=W(j.oc),j.sc=R(j.sc),j}(),ga.push(nt.ac),ps=(h=nt).vb,cs=h.wb,t._OrtInit=h.xb,t._OrtGetLastError=h.yb,t._OrtCreateSessionOptions=h.zb,t._OrtAppendExecutionProvider=h.Ab,t._OrtAddFreeDimensionOverride=h.Bb,t._OrtAddSessionConfigEntry=h.Cb,t._OrtReleaseSessionOptions=h.Db,t._OrtCreateSession=h.Eb,t._OrtReleaseSession=h.Fb,t._OrtGetInputOutputCount=h.Gb,t._OrtGetInputOutputMetadata=h.Hb,t._OrtFree=h.Ib,t._OrtCreateTensor=h.Jb,t._OrtGetTensorData=h.Kb,t._OrtReleaseTensor=h.Lb,t._OrtCreateRunOptions=h.Mb,t._OrtAddRunConfigEntry=h.Nb,t._OrtReleaseRunOptions=h.Ob,t._OrtCreateBinding=h.Pb,t._OrtBindInput=h.Qb,t._OrtBindOutput=h.Rb,t._OrtClearBoundOutputs=h.Sb,t._OrtReleaseBinding=h.Tb,t._OrtRunWithBinding=h.Ub,t._OrtRun=h.Vb,t._OrtEndProfiling=h.Wb,t._JsepOutput=h.Xb,t._JsepGetNodeName=h.Yb,Tr=h.Zb,et=t._free=h._b,Yt=t._malloc=h.$b,mi=h.cc,fs=h.dc,hs=h.ec,ms=h.fc,gi=h.gc,gs=h.hc,vs=h.ic,fe=h.jc,Jt=h.kc,bs=h.lc,pe=h.mc,vi=h.nc,ce=h.oc,ys=h.pc,bi=h.qc,_s=h.rc,xs=h.sc,ws=h.tc,yi=h.uc,$s=h.vc,As=h.wc,ks=h.xc,Ss=h.yc,Ts=h.zc,Es=h.Ac,Is=h.Bc,zs=h.Cc,js=h.Dc,Cs=h.Ec,Bs=h.Fc,Os=h.Gc,Ds=h.Hc,Ms=h.Ic,Rs=h.Jc,Ns=h.Kc,qs=h.Lc,Ps=h.Mc,Us=h.Nc,Ls=h.Oc,Fs=h.Pc,Gs=h.Qc,Ws=h.Sc,Vs=h.Tc,Hs=h.cd,Ks=h.dd,Xs=h.id,Zs=h.nd,Qs=h.od,Ys=h.pd,Js=h.qd,eo=h.rd,to=h.sd,ro=h.td,io=h.ud,no=h.zd,ao=h.Zd,so=h._d,oo=h.$d,uo=h.ae,b=x,nt}var d,m=Te();return t.instantiateWasm?new Promise(h=>{t.instantiateWasm(m,(x,E)=>{h(o(x,E))})}):n?o(new WebAssembly.Instance(b,Te()),b):(ae??=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",f):f+"ort-wasm-simd-threaded.jsep.wasm":new URL("/assets/ort-wasm-simd-threaded.jsep-MDYUKy93.wasm",import.meta.url).href,d=await async function(h){var x=ae;if(!g&&!z(x))try{var E=fetch(x,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(E,h)}catch(j){T(`wasm streaming compile failed: ${j}`),T("falling back to ArrayBuffer instantiation")}return async function(j,R){try{var W=await async function(K){if(!g)try{var de=await u(K);return new Uint8Array(de)}catch{}if(K==ae&&g)K=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";K=l(K)}return K}(j);return await WebAssembly.instantiate(W,R)}catch(K){T(`failed to asynchronously prepare wasm: ${K}`),H(K)}}(x,h)}(m),o(d.instance,d.module))}class P{name="ExitStatus";constructor(d){this.message=`Program terminated with exit(${d})`,this.status=d}}var ie=o=>{o.terminate(),o.onmessage=()=>{}},se=[],le=0,me=null,qe=o=>{lt.length==0&&(_a(),ya(lt[0]));var d=lt.pop();if(!d)return 6;Zt.push(d),xt[o.Uc]=d,d.Uc=o.Uc;var m={Vc:"run",Pd:o.Od,ed:o.ed,Uc:o.Uc};return d.postMessage(m,o.md),0},Ie=0,_e=(o,d,...m)=>{var h,x=16*m.length,E=ce(),j=vi(x),R=j>>>3;for(h of m)typeof h=="bigint"?((w(),te)[R++>>>0]=1n,(w(),te)[R++>>>0]=h):((w(),te)[R++>>>0]=0n,(w(),X)[R++>>>0]=h);return o=hs(o,0,x,j,d),pe(E),o};function qt(o){if(n)return _e(0,1,o);if(v=o,!(0<Ie)){for(var d of Zt)ie(d);for(d of lt)ie(d);lt=[],Zt=[],xt={},I=!0}p(0,new P(o))}function Xt(o){if(n)return _e(1,0,o);ei(o)}var ei=o=>{if(v=o,n)throw Xt(o),"unwind";qt(o)},lt=[],Zt=[],ga=[],xt={},va=o=>{var d=o.Uc;delete xt[d],lt.push(o),Zt.splice(Zt.indexOf(o),1),o.Uc=0,ms(d)};function ba(){ga.forEach(o=>o())}var ya=o=>new Promise(d=>{o.onmessage=x=>{var E=x.data;if(x=E.Vc,E.bd&&E.bd!=Tr()){var j=xt[E.bd];j?j.postMessage(E,E.md):T(`Internal error! Worker sent a message "${x}" to target pthread ${E.bd}, but that thread no longer exists!`)}else x==="checkMailbox"?xr():x==="spawnThread"?qe(E):x==="cleanupThread"?_r(()=>{va(xt[E.Qd])}):x==="loaded"?(o.loaded=!0,d(o)):E.target==="setimmediate"?o.postMessage(E):x==="uncaughtException"?o.onerror(E.error):x==="callHandler"?t[E.yd](...E.args):x&&T(`worker sent an unknown command ${x}`)},o.onerror=x=>{throw T(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var m,h=[];for(m of[])t.propertyIsEnumerable(m)&&h.push(m);o.postMessage({Vc:"load",Ad:h,Rd:dt,Sd:b})});function _a(){var o=new Worker((()=>{let d=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new d("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});lt.push(o)}var dt,Uf=(o,d)=>{Ie=0,o=yi(o,d),0<Ie?v=o:gi(o)},vr=[],br=0;function Lf(o){var d=new ti(o>>>=0);return(w(),M)[d.Wc+12>>>0]==0&&(xa(d,!0),br--),wa(d,!1),vr.push(d),xs(o)}var Pt=0,Ff=()=>{fe(0,0);var o=vr.pop();ys(o.gd),Pt=0};function xa(o,d){d=d?1:0,(w(),M)[o.Wc+12>>>0]=d}function wa(o,d){d=d?1:0,(w(),M)[o.Wc+13>>>0]=d}class ti{constructor(d){this.gd=d,this.Wc=d-24}}var ri=o=>{var d=Pt;if(!d)return Jt(0),0;var m=new ti(d);(w(),N)[m.Wc+16>>>2>>>0]=d;var h=(w(),N)[m.Wc+4>>>2>>>0];if(!h)return Jt(0),d;for(var x of o){if(x===0||x===h)break;if(_s(x,h,m.Wc+16))return Jt(x),d}return Jt(h),d};function Gf(){return ri([])}function Wf(o){return ri([o>>>0])}function Vf(o,d,m,h){return ri([o>>>0,d>>>0,m>>>0,h>>>0])}var Hf=()=>{var o=vr.pop();o||H("no exception to throw");var d=o.gd;throw(w(),M)[o.Wc+13>>>0]==0&&(vr.push(o),wa(o,!0),xa(o,!1),br++),bi(d),Pt=d};function Kf(o,d,m){var h=new ti(o>>>=0);throw d>>>=0,m>>>=0,(w(),N)[h.Wc+16>>>2>>>0]=0,(w(),N)[h.Wc+4>>>2>>>0]=d,(w(),N)[h.Wc+8>>>2>>>0]=m,bi(o),br++,Pt=o}var Xf=()=>br;function $a(o,d,m,h){return n?_e(2,1,o,d,m,h):Aa(o,d,m,h)}function Aa(o,d,m,h){if(o>>>=0,d>>>=0,m>>>=0,h>>>=0,!globalThis.SharedArrayBuffer)return 6;var x=[];return n&&x.length===0?$a(o,d,m,h):(o={Od:m,Uc:o,ed:h,md:x},n?(o.Vc="spawnThread",postMessage(o,x),0):qe(o))}function Zf(o){throw Pt||=o>>>0,Pt}var ka=globalThis.TextDecoder&&new TextDecoder,Sa=(o,d,m,h)=>{if(m=d+m,h)return m;for(;o[d]&&!(d>=m);)++d;return d},Ta=(o,d=0,m,h)=>{if(16<(m=Sa(o,d>>>=0,m,h))-d&&o.buffer&&ka)return ka.decode(o.buffer instanceof ArrayBuffer?o.subarray(d,m):o.slice(d,m));for(h="";d<m;){var x=o[d++];if(128&x){var E=63&o[d++];if((224&x)==192)h+=String.fromCharCode((31&x)<<6|E);else{var j=63&o[d++];65536>(x=(240&x)==224?(15&x)<<12|E<<6|j:(7&x)<<18|E<<12|j<<6|63&o[d++])?h+=String.fromCharCode(x):(x-=65536,h+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else h+=String.fromCharCode(x)}return h},ze=(o,d,m)=>(o>>>=0)?Ta((w(),F),o,d,m):"";function Ea(o,d,m){return n?_e(3,1,o,d,m):0}function Ia(o,d){if(n)return _e(4,1,o,d)}function za(o,d){if(n)return _e(5,1,o,d)}function ja(o,d,m){if(n)return _e(6,1,o,d,m)}function Ca(o,d,m){return n?_e(7,1,o,d,m):0}function Ba(o,d){if(n)return _e(8,1,o,d)}function Oa(o,d,m){if(n)return _e(9,1,o,d,m)}function Da(o,d,m,h){if(n)return _e(10,1,o,d,m,h)}function Ma(o,d,m,h){if(n)return _e(11,1,o,d,m,h)}function Ra(o,d,m,h){if(n)return _e(12,1,o,d,m,h)}function Na(o){if(n)return _e(13,1,o)}function qa(o,d){if(n)return _e(14,1,o,d)}function Pa(o,d,m){if(n)return _e(15,1,o,d,m)}var Qf=()=>H(""),Ye=o=>{o>>>=0;for(var d="";;){var m=(w(),F)[o++>>>0];if(!m)return d;d+=String.fromCharCode(m)}},ii={},ni={},Ut=class extends Error{constructor(o){super(o),this.name="BindingError"}};function it(o,d,m={}){return function(h,x,E={}){var j=x.name;if(!h)throw new Ut(`type "${j}" must have a positive integer typeid pointer`);if(ni.hasOwnProperty(h)){if(E.Bd)return;throw new Ut(`Cannot register type '${j}' twice`)}ni[h]=x,ii.hasOwnProperty(h)&&(x=ii[h],delete ii[h],x.forEach(R=>R()))}(o,d,m)}var Ua=(o,d,m)=>{switch(d){case 1:return m?h=>(w(),M)[h>>>0]:h=>(w(),F)[h>>>0];case 2:return m?h=>(w(),G)[h>>>1>>>0]:h=>(w(),L)[h>>>1>>>0];case 4:return m?h=>(w(),C)[h>>>2>>>0]:h=>(w(),N)[h>>>2>>>0];case 8:return m?h=>(w(),te)[h>>>3>>>0]:h=>(w(),re)[h>>>3>>>0];default:throw new TypeError(`invalid integer width (${d}): ${o}`)}};function Yf(o,d,m,h,x){o>>>=0,m>>>=0,d=Ye(d>>>0);let E=j=>j;if(h=h===0n){let j=8*m;E=R=>BigInt.asUintN(j,R),x=E(x)}it(o,{name:d,Rc:E,Yc:(j,R)=>(typeof R=="number"&&(R=BigInt(R)),R),Xc:Ua(d,m,!h),Zc:null})}function Jf(o,d,m,h){it(o>>>=0,{name:d=Ye(d>>>0),Rc:function(x){return!!x},Yc:function(x,E){return E?m:h},Xc:function(x){return this.Rc((w(),F)[x>>>0])},Zc:null})}var La=[],wt=[0,1,,1,null,1,!0,1,!1,1];function ai(o){9<(o>>>=0)&&--wt[o+1]===0&&(wt[o]=void 0,La.push(o))}var Pe=o=>{if(!o)throw new Ut(`Cannot use deleted val. handle = ${o}`);return wt[o]},Fe=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let d=La.pop()||wt.length;return wt[d]=o,wt[d+1]=1,d}};function si(o){return this.Rc((w(),N)[o>>>2>>>0])}var eh={name:"emscripten::val",Rc:o=>{var d=Pe(o);return ai(o),d},Yc:(o,d)=>Fe(d),Xc:si,Zc:null};function th(o){return it(o>>>0,eh)}var rh=(o,d)=>{switch(d){case 4:return function(m){return this.Rc((w(),V)[m>>>2>>>0])};case 8:return function(m){return this.Rc((w(),X)[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${d}): ${o}`)}};function ih(o,d,m){m>>>=0,it(o>>>=0,{name:d=Ye(d>>>0),Rc:h=>h,Yc:(h,x)=>x,Xc:rh(d,m),Zc:null})}function nh(o,d,m,h,x){o>>>=0,m>>>=0,d=Ye(d>>>0);let E=R=>R;if(h===0){var j=32-8*m;E=R=>R<<j>>>j,x=E(x)}it(o,{name:d,Rc:E,Yc:(R,W)=>W,Xc:Ua(d,m,h!==0),Zc:null})}function ah(o,d,m){function h(E){var j=(w(),N)[E>>>2>>>0];return E=(w(),N)[E+4>>>2>>>0],new x((w(),M).buffer,E,j)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][d];it(o>>>=0,{name:m=Ye(m>>>0),Rc:h,Xc:h},{Bd:!0})}var pt=(o,d,m)=>{var h=(w(),F);if(d>>>=0,0<m){var x=d;m=d+m-1;for(var E=0;E<o.length;++E){var j=o.codePointAt(E);if(127>=j){if(d>=m)break;h[d++>>>0]=j}else if(2047>=j){if(d+1>=m)break;h[d++>>>0]=192|j>>6,h[d++>>>0]=128|63&j}else if(65535>=j){if(d+2>=m)break;h[d++>>>0]=224|j>>12,h[d++>>>0]=128|j>>6&63,h[d++>>>0]=128|63&j}else{if(d+3>=m)break;h[d++>>>0]=240|j>>18,h[d++>>>0]=128|j>>12&63,h[d++>>>0]=128|j>>6&63,h[d++>>>0]=128|63&j,E++}}h[d>>>0]=0,o=d-x}else o=0;return o},yr=o=>{for(var d=0,m=0;m<o.length;++m){var h=o.charCodeAt(m);127>=h?d++:2047>=h?d+=2:55296<=h&&57343>=h?(d+=4,++m):d+=3}return d};function sh(o,d){it(o>>>=0,{name:d=Ye(d>>>0),Rc(m){var h=(w(),N)[m>>>2>>>0];return h=ze(m+4,h,!0),et(m),h},Yc(m,h){h instanceof ArrayBuffer&&(h=new Uint8Array(h));var x=typeof h=="string";if(!(x||ArrayBuffer.isView(h)&&h.BYTES_PER_ELEMENT==1))throw new Ut("Cannot pass non-string to std::string");var E=x?yr(h):h.length,j=Yt(4+E+1),R=j+4;return(w(),N)[j>>>2>>>0]=E,x?pt(h,R,E+1):(w(),F).set(h,R>>>0),m!==null&&m.push(et,j),j},Xc:si,Zc(m){et(m)}})}var Fa=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,oh=(o,d,m)=>{if(o>>>=1,16<(d=Sa((w(),L),o,d/2,m))-o&&Fa)return Fa.decode((w(),L).slice(o,d));for(m="";o<d;++o){var h=(w(),L)[o>>>0];m+=String.fromCharCode(h)}return m},uh=(o,d,m)=>{if(m??=2147483647,2>m)return 0;var h=d;m=(m-=2)<2*o.length?m/2:o.length;for(var x=0;x<m;++x){var E=o.charCodeAt(x);(w(),G)[d>>>1>>>0]=E,d+=2}return(w(),G)[d>>>1>>>0]=0,d-h},lh=o=>2*o.length,dh=(o,d,m)=>{var h="";o>>>=2;for(var x=0;!(x>=d/4);x++){var E=(w(),N)[o+x>>>0];if(!E&&!m)break;h+=String.fromCodePoint(E)}return h},ph=(o,d,m)=>{if(d>>>=0,m??=2147483647,4>m)return 0;var h=d;m=h+m-4;for(var x=0;x<o.length;++x){var E=o.codePointAt(x);if(65535<E&&x++,(w(),C)[d>>>2>>>0]=E,(d+=4)+4>m)break}return(w(),C)[d>>>2>>>0]=0,d-h},ch=o=>{for(var d=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,d+=4;return d};function fh(o,d,m){if(o>>>=0,d>>>=0,m=Ye(m>>>=0),d===2)var h=oh,x=uh,E=lh;else h=dh,x=ph,E=ch;it(o,{name:m,Rc:j=>{var R=(w(),N)[j>>>2>>>0];return R=h(j+4,R*d,!0),et(j),R},Yc:(j,R)=>{if(typeof R!="string")throw new Ut(`Cannot pass non-string to C++ string type ${m}`);var W=E(R),K=Yt(4+W+d);return(w(),N)[K>>>2>>>0]=W/d,x(R,K+4,W+d),j!==null&&j.push(et,K),K},Xc:si,Zc(j){et(j)}})}function hh(o,d){it(o>>>=0,{Cd:!0,name:d=Ye(d>>>0),Rc:()=>{},Yc:()=>{}})}function mh(o){mi(o>>>0,!i,1,!r,131072,!1),ba()}var _r=o=>{if(!I)try{if(o(),!(0<Ie))try{n?Tr()&&gi(v):ei(v)}catch(d){d instanceof P||d=="unwind"||p(0,d)}}catch(d){d instanceof P||d=="unwind"||p(0,d)}},gh=!Atomics.waitAsync||globalThis.navigator?.userAgent&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function oi(o){o>>>=0,gh||(Atomics.waitAsync((w(),C),o>>>2,o).value.then(xr),o+=128,Atomics.store((w(),C),o>>>2,1))}var xr=()=>_r(()=>{var o=Tr();o&&(oi(o),vs())});function vh(o,d){(o>>>=0)==d>>>0?setTimeout(xr):n?postMessage({bd:o,Vc:"checkMailbox"}):(o=xt[o])&&o.postMessage({Vc:"checkMailbox"})}var ui=[];function bh(o,d,m,h,x){for(d>>>=0,x>>>=0,ui.length=0,m=x>>>3,h=x+h>>>3;m<h;){var E;E=(w(),te)[m++>>>0]?(w(),te)[m++>>>0]:(w(),X)[m++>>>0],ui.push(E)}return(d?_i[d]:um[o])(...ui)}var yh=()=>{Ie=0};function _h(o){o>>>=0,n?postMessage({Vc:"cleanupThread",Qd:o}):va(xt[o])}function xh(o){}var wr=o=>{try{o()}catch(d){H(d)}};function wh(o){var d=(...m)=>{$r.push(o);try{return o(...m)}finally{I||($r.pop(),Je&&ct===1&&$r.length===0&&(ct=0,Ie+=1,wr(so),typeof Fibers<"u"&&Fibers.de()))}};return Va.set(o,d),d}var ct=0,Je=null,Ga=0,$r=[],li=new Map,Wa=new Map,Va=new Map,$h=0,di=null,Ah=[],Ha=o=>function(d){if(!I){if(ct===0){var m=!1,h=!1;d((x=0)=>{if(!I&&(Ga=x,m=!0,h)){ct=2,wr(()=>oo(Je)),typeof MainLoop<"u"&&MainLoop.xd&&MainLoop.resume(),x=!1;try{var E=function(){var W=(w(),C)[Je+8>>>2>>>0];return W=Wa.get(W),W=Va.get(W),--Ie,W()}()}catch(W){E=W,x=!0}var j=!1;if(!Je){var R=di;R&&(di=null,(x?R.reject:R.resolve)(E),j=!0)}if(x&&!j)throw E}}),h=!0,m||(ct=1,Je=function(){var x=Yt(65548),E=x+12;if((w(),N)[x>>>2>>>0]=E,(w(),N)[x+4>>>2>>>0]=E+65536,E=$r[0],!li.has(E)){var j=$h++;li.set(E,j),Wa.set(j,E)}return E=li.get(E),(w(),C)[x+8>>>2>>>0]=E,x}(),typeof MainLoop<"u"&&MainLoop.xd&&MainLoop.pause(),wr(()=>ao(Je)))}else ct===2?(ct=0,wr(uo),et(Je),Je=null,Ah.forEach(_r)):H(`invalid state: ${ct}`);return Ga}}(d=>{o().then(d)});function kh(o){return o>>>=0,Ha(async()=>{var d=await Pe(o);return Fe(d)})}var pi=[],Sh=o=>{var d=pi.length;return pi.push(o),d},Th=(o,d)=>{for(var m=Array(o),h=0;h<o;++h){var x=h,E=(w(),N)[d+4*h>>>2>>>0],j=ni[E];if(j===void 0)throw o=`parameter ${h}`,E=ps(E),d=Ye(E),et(E),new Ut(`${o} has unknown type ${d}`);m[x]=j}return m},Eh=(o,d,m)=>{var h=[];return o=o(h,m),h.length&&((w(),N)[d>>>2>>>0]=Fe(h)),o},Ih={},Ar=o=>{var d=Ih[o];return d===void 0?Ye(o):d};function zh(o,d,m){var[h,...x]=Th(o,d>>>0);d=h.Yc.bind(h);var E=x.map(W=>W.Xc.bind(W));o--;var j={toValue:Pe};switch(o=E.map((W,K)=>{var de=`argFromPtr${K}`;return j[de]=W,`${de}(args${K?"+"+8*K:""})`}),m){case 0:var R="toValue(handle)";break;case 2:R="new (toValue(handle))";break;case 3:R="";break;case 1:j.getStringOrSymbol=Ar,R="toValue(handle)[getStringOrSymbol(methodName)]"}return R+=`(${o})`,h.Cd||(j.toReturnWire=d,j.emval_returnValue=Eh,R=`return emval_returnValue(toReturnWire, destructorsRef, ${R})`),R=`return function (handle, methodName, destructorsRef, args) {
  ${R}
  }`,m=new Function(Object.keys(j),R)(...Object.values(j)),R=`methodCaller<(${x.map(W=>W.name)}) => ${h.name}>`,Sh(Object.defineProperty(m,"name",{value:R}))}function jh(o,d){return d>>>=0,(o=Pe(o>>>0))==Pe(d)}function Ch(o){return(o>>>=0)?(o=Ar(o),Fe(globalThis[o])):Fe(globalThis)}function Bh(o){return o=Ar(o>>>0),Fe(t[o])}function Oh(o,d){return d>>>=0,o=Pe(o>>>0),d=Pe(d),Fe(o[d])}function Dh(o){9<(o>>>=0)&&(wt[o+1]+=1)}function Ka(o,d,m,h,x){return pi[o>>>0](d>>>0,m>>>0,h>>>0,x>>>0)}function Mh(o,d,m,h,x){return Ka(o>>>0,d>>>0,m>>>0,h>>>0,x>>>0)}function Rh(){return Fe([])}function Nh(o){o=Pe(o>>>0);for(var d=Array(o.length),m=0;m<o.length;m++)d[m]=o[m];return Fe(d)}function qh(o){return Fe(Ar(o>>>0))}function Ph(){return Fe({})}function Uh(o){for(var d=Pe(o>>>=0);d.length;){var m=d.pop();d.pop()(m)}ai(o)}function Lh(o,d,m){d>>>=0,m>>>=0,o=Pe(o>>>0),d=Pe(d),m=Pe(m),o[d]=m}function Fh(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(w(),C)[d>>>2>>>0]=o.getUTCSeconds(),(w(),C)[d+4>>>2>>>0]=o.getUTCMinutes(),(w(),C)[d+8>>>2>>>0]=o.getUTCHours(),(w(),C)[d+12>>>2>>>0]=o.getUTCDate(),(w(),C)[d+16>>>2>>>0]=o.getUTCMonth(),(w(),C)[d+20>>>2>>>0]=o.getUTCFullYear()-1900,(w(),C)[d+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(w(),C)[d+28>>>2>>>0]=o}var Xa=o=>o%4==0&&(o%100!=0||o%400==0),Za=[0,31,60,91,121,152,182,213,244,274,305,335],Qa=[0,31,59,90,120,151,181,212,243,273,304,334];function Gh(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(w(),C)[d>>>2>>>0]=o.getSeconds(),(w(),C)[d+4>>>2>>>0]=o.getMinutes(),(w(),C)[d+8>>>2>>>0]=o.getHours(),(w(),C)[d+12>>>2>>>0]=o.getDate(),(w(),C)[d+16>>>2>>>0]=o.getMonth(),(w(),C)[d+20>>>2>>>0]=o.getFullYear()-1900,(w(),C)[d+24>>>2>>>0]=o.getDay();var m=(Xa(o.getFullYear())?Za:Qa)[o.getMonth()]+o.getDate()-1|0;(w(),C)[d+28>>>2>>>0]=m,(w(),C)[d+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var h=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=h&&o.getTimezoneOffset()==Math.min(h,m)),(w(),C)[d+32>>>2>>>0]=o}function Wh(o){o>>>=0;var d=new Date((w(),C)[o+20>>>2>>>0]+1900,(w(),C)[o+16>>>2>>>0],(w(),C)[o+12>>>2>>>0],(w(),C)[o+8>>>2>>>0],(w(),C)[o+4>>>2>>>0],(w(),C)[o>>>2>>>0],0),m=(w(),C)[o+32>>>2>>>0],h=d.getTimezoneOffset(),x=new Date(d.getFullYear(),6,1).getTimezoneOffset(),E=new Date(d.getFullYear(),0,1).getTimezoneOffset(),j=Math.min(E,x);return 0>m?(w(),C)[o+32>>>2>>>0]=+(x!=E&&j==h):0<m!=(j==h)&&(x=Math.max(E,x),d.setTime(d.getTime()+6e4*((0<m?j:x)-h))),(w(),C)[o+24>>>2>>>0]=d.getDay(),m=(Xa(d.getFullYear())?Za:Qa)[d.getMonth()]+d.getDate()-1|0,(w(),C)[o+28>>>2>>>0]=m,(w(),C)[o>>>2>>>0]=d.getSeconds(),(w(),C)[o+4>>>2>>>0]=d.getMinutes(),(w(),C)[o+8>>>2>>>0]=d.getHours(),(w(),C)[o+12>>>2>>>0]=d.getDate(),(w(),C)[o+16>>>2>>>0]=d.getMonth(),(w(),C)[o+20>>>2>>>0]=d.getYear(),o=d.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function Ya(o,d,m,h,x,E,j){return n?_e(16,1,o,d,m,h,x,E,j):-52}function Ja(o,d,m,h,x,E){if(n)return _e(17,1,o,d,m,h,x,E)}var Qt={},Vh=()=>performance.timeOrigin+performance.now();function es(o,d){if(n)return _e(18,1,o,d);if(Qt[o]&&(clearTimeout(Qt[o].id),delete Qt[o]),!d)return 0;var m=setTimeout(()=>{delete Qt[o],_r(()=>gs(o,performance.timeOrigin+performance.now()))},d);return Qt[o]={id:m,ce:d},0}function Hh(o,d,m,h){o>>>=0,d>>>=0,m>>>=0,h>>>=0;var x=new Date().getFullYear(),E=new Date(x,0,1).getTimezoneOffset();x=new Date(x,6,1).getTimezoneOffset();var j=Math.max(E,x);(w(),N)[o>>>2>>>0]=60*j,(w(),C)[d>>>2>>>0]=+(E!=x),o=(d=R=>{var W=Math.abs(R);return`UTC${0<=R?"-":"+"}${String(Math.floor(W/60)).padStart(2,"0")}${String(W%60).padStart(2,"0")}`})(E),d=d(x),x<E?(pt(o,m,17),pt(d,h,17)):(pt(o,h,17),pt(d,m,17))}var Kh=()=>Date.now();function Xh(o,d,m){return m>>>=0,0<=o&&3>=o?(o===0?o=Date.now():o=performance.timeOrigin+performance.now(),o=Math.round(1e6*o),(w(),te)[m>>>3>>>0]=BigInt(o),0):28}var ci=[],ts=(o,d)=>{ci.length=0;for(var m;m=(w(),F)[o++>>>0];){var h=m!=105;d+=(h&=m!=112)&&d%8?4:0,ci.push(m==112?(w(),N)[d>>>2>>>0]:m==106?(w(),te)[d>>>3>>>0]:m==105?(w(),C)[d>>>2>>>0]:(w(),X)[d>>>3>>>0]),d+=h?8:4}return ci};function Zh(o,d,m){return o>>>=0,d=ts(d>>>0,m>>>0),_i[o](...d)}function Qh(o,d,m){return o>>>=0,d=ts(d>>>0,m>>>0),_i[o](...d)}var Yh=()=>{};function Jh(o,d){return T(ze(o>>>0,d>>>0))}var em=()=>{throw Ie+=1,"unwind"};function tm(){return 4294901760}var rm=()=>navigator.hardwareConcurrency,$t={},kr=o=>{var d;return(d=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+d[1]:(d=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+d[1]:0},rs=o=>{for(var d of o)(o=kr(d))&&($t[o]=d)};function im(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),rs(o),$t.kd=kr(o[3]),$t.Md=o,$t.kd}function Sr(o){if(!(o=$t[o>>>0]))return 0;var d;if(d=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=d[1];else if(d=/^\s+at (.*) \(.*\)$/.exec(o))o=d[1];else{if(!(d=/^(.+?)@/.exec(o)))return 0;o=d[1]}et(Sr.ld??0),d=yr(o)+1;var m=Yt(d);return m&&pt(o,m,d),Sr.ld=m,Sr.ld}function nm(o){o>>>=0;var d=(w(),F).length;if(o<=d||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var h=d*(1+.2/m);h=Math.min(h,o+100663296);e:{h=(Math.min(4294901760,65536*Math.ceil(Math.max(o,h)/65536))-dt.buffer.byteLength+65535)/65536|0;try{dt.grow(h),J();var x=1;break e}catch{}x=void 0}if(x)return!0}return!1}function am(o,d,m){if(o>>>=0,d>>>=0,$t.kd==o)var h=$t.Md;else(h=Error().stack.toString().split(`
`))[0]=="Error"&&h.shift(),rs(h);for(var x=3;h[x]&&kr(h[x])!=o;)++x;for(o=0;o<m&&h[o+x];++o)(w(),C)[d+4*o>>>2>>>0]=kr(h[o+x]);return o}var fi,hi={},is=()=>{if(!fi){var o,d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in hi)hi[o]===void 0?delete d[o]:d[o]=hi[o];var m=[];for(o in d)m.push(`${o}=${d[o]}`);fi=m}return fi};function ns(o,d){if(n)return _e(19,1,o,d);o>>>=0,d>>>=0;var m,h=0,x=0;for(m of is()){var E=d+h;(w(),N)[o+x>>>2>>>0]=E,h+=pt(m,E,1/0)+1,x+=4}return 0}function as(o,d){if(n)return _e(20,1,o,d);o>>>=0,d>>>=0;var m=is();for(var h of((w(),N)[o>>>2>>>0]=m.length,o=0,m))o+=yr(h)+1;return(w(),N)[d>>>2>>>0]=o,0}function ss(o){return n?_e(21,1,o):52}function os(o,d,m,h,x){return n?_e(22,1,o,d,m,h,x):52}function us(o,d,m,h){return n?_e(23,1,o,d,m,h):52}function ls(o,d,m,h){return n?_e(24,1,o,d,m,h):70}var sm=[null,[],[]];function ds(o,d,m,h){if(n)return _e(25,1,o,d,m,h);d>>>=0,m>>>=0,h>>>=0;for(var x=0,E=0;E<m;E++){var j=(w(),N)[d>>>2>>>0],R=(w(),N)[d+4>>>2>>>0];d+=8;for(var W=0;W<R;W++){var K=o,de=(w(),F)[j+W>>>0],ge=sm[K];de===0||de===10?((K===1?k:T)(Ta(ge)),ge.length=0):ge.push(de)}x+=R}return(w(),N)[h>>>2>>>0]=x,0}function om(o){return o>>>0}n||function(){for(var o=t.numThreads-1;o--;)_a();se.push(async()=>{var d=async function(){if(!n)return Promise.all(lt.map(ya))}();le++,await d,--le==0&&me&&(d=me,me=null,d())})}(),n||(dt=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),J()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>ce(),t.stackRestore=o=>pe(o),t.stackAlloc=o=>vi(o),t.setValue=function(o,d,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":(w(),M)[o>>>0]=d;break;case"i16":(w(),G)[o>>>1>>>0]=d;break;case"i32":(w(),C)[o>>>2>>>0]=d;break;case"i64":(w(),te)[o>>>3>>>0]=BigInt(d);break;case"float":(w(),V)[o>>>2>>>0]=d;break;case"double":(w(),X)[o>>>3>>>0]=d;break;case"*":(w(),N)[o>>>2>>>0]=d;break;default:H(`invalid type for setValue: ${m}`)}},t.getValue=function(o,d="i8"){switch(d.endsWith("*")&&(d="*"),d){case"i1":case"i8":return(w(),M)[o>>>0];case"i16":return(w(),G)[o>>>1>>>0];case"i32":return(w(),C)[o>>>2>>>0];case"i64":return(w(),te)[o>>>3>>>0];case"float":return(w(),V)[o>>>2>>>0];case"double":return(w(),X)[o>>>3>>>0];case"*":return(w(),N)[o>>>2>>>0];default:H(`invalid type for getValue: ${d}`)}},t.UTF8ToString=ze,t.stringToUTF8=pt,t.lengthBytesUTF8=yr;var ps,cs,Tr,et,Yt,mi,fs,hs,ms,gi,gs,vs,fe,Jt,bs,pe,vi,ce,ys,bi,_s,xs,ws,yi,$s,As,ks,Ss,Ts,Es,Is,zs,js,Cs,Bs,Os,Ds,Ms,Rs,Ns,qs,Ps,Us,Ls,Fs,Gs,Ws,Vs,Hs,Ks,Xs,Zs,Qs,Ys,Js,eo,to,ro,io,no,ao,so,oo,uo,nt,um=[qt,Xt,$a,Ea,Ia,za,ja,Ca,Ba,Oa,Da,Ma,Ra,Na,qa,Pa,Ya,Ja,es,ns,as,ss,os,us,ls,ds],_i={1086876:(o,d,m,h,x)=>{if(t===void 0||!t.ad)return 1;if((o=ze(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.ad.get(o)))return 2;if(d=Number(d>>>0),m=Number(m>>>0),h=Number(h>>>0),d+m>o.byteLength)return 3;try{let E=o.subarray(d,d+m);switch(x){case 0:(w(),F).set(E,h>>>0);break;case 1:t.Td?t.Td(h,E):t.Ld(h,E);break;default:return 4}return 0}catch{return 4}},1087700:(o,d,m)=>{t.wd(o,(w(),F).subarray(d>>>0,d+m>>>0))},1087764:()=>t.Vd(),1087806:o=>{t.vd(o)},1087843:()=>{t.Ed()},1087874:()=>{t.Fd()},1087903:()=>{t.Jd()},1087928:o=>t.Dd(o),1087961:o=>t.Hd(o),1087993:(o,d,m)=>{t.jd(Number(o),Number(d),Number(m),!0)},1088056:(o,d,m)=>{t.jd(Number(o),Number(d),Number(m))},1088113:()=>typeof wasmOffsetConverter<"u",1088170:o=>{t.bc("Abs",o,void 0)},1088221:o=>{t.bc("Neg",o,void 0)},1088272:o=>{t.bc("Floor",o,void 0)},1088325:o=>{t.bc("Ceil",o,void 0)},1088377:o=>{t.bc("Reciprocal",o,void 0)},1088435:o=>{t.bc("Sqrt",o,void 0)},1088487:o=>{t.bc("Exp",o,void 0)},1088538:o=>{t.bc("Erf",o,void 0)},1088589:o=>{t.bc("Sigmoid",o,void 0)},1088644:(o,d,m)=>{t.bc("HardSigmoid",o,{alpha:d,beta:m})},1088723:o=>{t.bc("HardSwish",o,void 0)},1088780:o=>{t.bc("Log",o,void 0)},1088831:o=>{t.bc("Sin",o,void 0)},1088882:o=>{t.bc("Cos",o,void 0)},1088933:o=>{t.bc("Tan",o,void 0)},1088984:o=>{t.bc("Asin",o,void 0)},1089036:o=>{t.bc("Acos",o,void 0)},1089088:o=>{t.bc("Atan",o,void 0)},1089140:o=>{t.bc("Sinh",o,void 0)},1089192:o=>{t.bc("Cosh",o,void 0)},1089244:o=>{t.bc("Asinh",o,void 0)},1089297:o=>{t.bc("Acosh",o,void 0)},1089350:o=>{t.bc("Atanh",o,void 0)},1089403:o=>{t.bc("Tanh",o,void 0)},1089455:o=>{t.bc("Not",o,void 0)},1089506:(o,d,m)=>{t.bc("Clip",o,{min:d,max:m})},1089575:o=>{t.bc("Clip",o,void 0)},1089627:(o,d)=>{t.bc("Elu",o,{alpha:d})},1089685:o=>{t.bc("Gelu",o,void 0)},1089737:o=>{t.bc("Relu",o,void 0)},1089789:(o,d)=>{t.bc("LeakyRelu",o,{alpha:d})},1089853:(o,d)=>{t.bc("ThresholdedRelu",o,{alpha:d})},1089923:(o,d)=>{t.bc("Cast",o,{to:d})},1089981:o=>{t.bc("Add",o,void 0)},1090032:o=>{t.bc("Sub",o,void 0)},1090083:o=>{t.bc("Mul",o,void 0)},1090134:o=>{t.bc("Div",o,void 0)},1090185:o=>{t.bc("Pow",o,void 0)},1090236:o=>{t.bc("Equal",o,void 0)},1090289:o=>{t.bc("Greater",o,void 0)},1090344:o=>{t.bc("GreaterOrEqual",o,void 0)},1090406:o=>{t.bc("Less",o,void 0)},1090458:o=>{t.bc("LessOrEqual",o,void 0)},1090517:(o,d,m,h,x)=>{t.bc("ReduceMean",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1090692:(o,d,m,h,x)=>{t.bc("ReduceMax",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1090866:(o,d,m,h,x)=>{t.bc("ReduceMin",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091040:(o,d,m,h,x)=>{t.bc("ReduceProd",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091215:(o,d,m,h,x)=>{t.bc("ReduceSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091389:(o,d,m,h,x)=>{t.bc("ReduceL1",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091562:(o,d,m,h,x)=>{t.bc("ReduceL2",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091735:(o,d,m,h,x)=>{t.bc("ReduceLogSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1091912:(o,d,m,h,x)=>{t.bc("ReduceSumSquare",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1092092:(o,d,m,h,x)=>{t.bc("ReduceLogSumExp",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1092272:o=>{t.bc("Where",o,void 0)},1092325:(o,d,m)=>{t.bc("Transpose",o,{perm:d?Array.from((w(),C).subarray(Number(d)>>>0,Number(m)>>>0)):[]})},1092449:(o,d,m,h)=>{t.bc("DepthToSpace",o,{blocksize:d,mode:ze(m),format:h?"NHWC":"NCHW"})},1092582:(o,d,m,h)=>{t.bc("DepthToSpace",o,{blocksize:d,mode:ze(m),format:h?"NHWC":"NCHW"})},1092715:(o,d,m,h)=>{t.bc("DFT",o,{axis:d,inverse:m,onesided:h})},1092807:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae,ft)=>{t.bc("ConvTranspose",o,{format:W?"NHWC":"NCHW",autoPad:d,dilations:[m],group:h,kernelShape:[x],pads:[E,j],strides:[R],wIsConst:()=>!!(w(),M)[K>>>0],outputPadding:de?Array.from((w(),C).subarray(Number(de)>>>0,Number(ge)>>>0)):[],outputShape:we?Array.from((w(),C).subarray(Number(we)>>>0,Number(Ae)>>>0)):[],activation:ze(ft)})},1093240:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("ConvTranspose",o,{format:R?"NHWC":"NCHW",autoPad:d,dilations:Array.from((w(),C).subarray(Number(m)>>>0,(Number(m)>>>0)+2>>>0)),group:h,kernelShape:Array.from((w(),C).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((w(),C).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((w(),C).subarray(Number(j)>>>0,(Number(j)>>>0)+2>>>0)),wIsConst:()=>!!(w(),M)[W>>>0],outputPadding:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],outputShape:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[],activation:ze(Ae)})},1093901:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae,ft)=>{t.bc("ConvTranspose",o,{format:W?"NHWC":"NCHW",autoPad:d,dilations:[m],group:h,kernelShape:[x],pads:[E,j],strides:[R],wIsConst:()=>!!(w(),M)[K>>>0],outputPadding:de?Array.from((w(),C).subarray(Number(de)>>>0,Number(ge)>>>0)):[],outputShape:we?Array.from((w(),C).subarray(Number(we)>>>0,Number(Ae)>>>0)):[],activation:ze(ft)})},1094334:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("ConvTranspose",o,{format:R?"NHWC":"NCHW",autoPad:d,dilations:Array.from((w(),C).subarray(Number(m)>>>0,(Number(m)>>>0)+2>>>0)),group:h,kernelShape:Array.from((w(),C).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((w(),C).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((w(),C).subarray(Number(j)>>>0,(Number(j)>>>0)+2>>>0)),wIsConst:()=>!!(w(),M)[W>>>0],outputPadding:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],outputShape:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[],activation:ze(Ae)})},1094995:(o,d)=>{t.bc("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1095086:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("AveragePool",o,{format:Ae?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:h,storage_order:x,dilations:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[],kernel_shape:R?Array.from((w(),C).subarray(Number(R)>>>0,Number(W)>>>0)):[],pads:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],strides:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[]})},1095565:(o,d)=>{t.bc("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1095656:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("AveragePool",o,{format:Ae?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:h,storage_order:x,dilations:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[],kernel_shape:R?Array.from((w(),C).subarray(Number(R)>>>0,Number(W)>>>0)):[],pads:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],strides:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[]})},1096135:(o,d)=>{t.bc("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1096222:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("MaxPool",o,{format:Ae?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:h,storage_order:x,dilations:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[],kernel_shape:R?Array.from((w(),C).subarray(Number(R)>>>0,Number(W)>>>0)):[],pads:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],strides:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[]})},1096697:(o,d)=>{t.bc("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1096784:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae)=>{t.bc("MaxPool",o,{format:Ae?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:h,storage_order:x,dilations:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[],kernel_shape:R?Array.from((w(),C).subarray(Number(R)>>>0,Number(W)>>>0)):[],pads:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],strides:ge?Array.from((w(),C).subarray(Number(ge)>>>0,Number(we)>>>0)):[]})},1097259:(o,d,m,h,x)=>{t.bc("Gemm",o,{alpha:d,beta:m,transA:h,transB:x})},1097363:o=>{t.bc("MatMul",o,void 0)},1097417:(o,d,m,h)=>{t.bc("ArgMax",o,{keepDims:!!d,selectLastIndex:!!m,axis:h})},1097525:(o,d,m,h)=>{t.bc("ArgMin",o,{keepDims:!!d,selectLastIndex:!!m,axis:h})},1097633:(o,d)=>{t.bc("Softmax",o,{axis:d})},1097696:(o,d)=>{t.bc("Concat",o,{axis:d})},1097756:(o,d,m,h,x)=>{t.bc("Split",o,{axis:d,numOutputs:m,splitSizes:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1097912:o=>{t.bc("Expand",o,void 0)},1097966:(o,d)=>{t.bc("Gather",o,{axis:Number(d)})},1098037:(o,d)=>{t.bc("GatherElements",o,{axis:Number(d)})},1098116:(o,d)=>{t.bc("GatherND",o,{batch_dims:Number(d)})},1098195:(o,d,m,h,x,E,j,R,W,K,de)=>{t.bc("Resize",o,{antialias:d,axes:m?Array.from((w(),C).subarray(Number(m)>>>0,Number(h)>>>0)):[],coordinateTransformMode:ze(x),cubicCoeffA:E,excludeOutside:j,extrapolationValue:R,keepAspectRatioPolicy:ze(W),mode:ze(K),nearestMode:ze(de)})},1098557:(o,d,m,h,x,E,j)=>{t.bc("Slice",o,{starts:d?Array.from((w(),C).subarray(Number(d)>>>0,Number(m)>>>0)):[],ends:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[],axes:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[]})},1098821:o=>{t.bc("Tile",o,void 0)},1098873:(o,d,m)=>{t.bc("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},1098987:(o,d,m)=>{t.bc("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},1099101:o=>{t.bc("Range",o,void 0)},1099154:(o,d)=>{t.bc("Einsum",o,{equation:ze(d)})},1099235:(o,d,m,h,x)=>{t.bc("Pad",o,{mode:d,value:m,pads:h?Array.from((w(),C).subarray(Number(h)>>>0,Number(x)>>>0)):[]})},1099378:(o,d,m,h,x,E)=>{t.bc("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!x,trainingMode:!!h,format:E?"NHWC":"NCHW"})},1099547:(o,d,m,h,x,E)=>{t.bc("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!x,trainingMode:!!h,format:E?"NHWC":"NCHW"})},1099716:(o,d,m)=>{t.bc("CumSum",o,{exclusive:Number(d),reverse:Number(m)})},1099813:(o,d,m)=>{t.bc("DequantizeLinear",o,{axis:d,blockSize:m})},1099903:(o,d,m,h,x)=>{t.bc("GridSample",o,{align_corners:d,mode:ze(m),padding_mode:ze(h),format:x?"NHWC":"NCHW"})},1100073:(o,d,m,h,x)=>{t.bc("GridSample",o,{align_corners:d,mode:ze(m),padding_mode:ze(h),format:x?"NHWC":"NCHW"})},1100243:(o,d)=>{t.bc("ScatterND",o,{reduction:ze(d)})},1100328:(o,d,m,h,x,E,j,R,W)=>{t.bc("Attention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:h,scale:x,doRotary:E,qkvHiddenSizes:j?Array.from((w(),C).subarray(Number(R)>>>0,Number(R)+j>>>0)):[],pastPresentShareBuffer:!!W})},1100600:o=>{t.bc("BiasAdd",o,void 0)},1100655:o=>{t.bc("BiasSplitGelu",o,void 0)},1100716:o=>{t.bc("FastGelu",o,void 0)},1100772:(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae,ft,xi)=>{t.bc("Conv",o,{format:ge?"NHWC":"NCHW",auto_pad:d,dilations:m?Array.from((w(),C).subarray(Number(m)>>>0,Number(h)>>>0)):[],group:x,kernel_shape:E?Array.from((w(),C).subarray(Number(E)>>>0,Number(j)>>>0)):[],pads:R?Array.from((w(),C).subarray(Number(R)>>>0,Number(W)>>>0)):[],strides:K?Array.from((w(),C).subarray(Number(K)>>>0,Number(de)>>>0)):[],w_is_const:()=>!!(w(),M)[Number(we)>>>0],activation:ze(Ae),activation_params:ft?Array.from((w(),V).subarray(Number(ft)>>>0,Number(xi)>>>0)):[]})},1101356:o=>{t.bc("Gelu",o,void 0)},1101408:(o,d,m,h,x,E,j,R,W)=>{t.bc("GroupQueryAttention",o,{numHeads:d,kvNumHeads:m,scale:h,softcap:x,doRotary:E,rotaryInterleaved:j,smoothSoftmax:R,localWindowSize:W})},1101625:(o,d,m,h)=>{t.bc("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!h})},1101736:(o,d,m,h)=>{t.bc("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!h})},1101847:(o,d,m,h,x,E)=>{t.bc("MatMulNBits",o,{k:d,n:m,accuracyLevel:h,bits:x,blockSize:E})},1101974:(o,d,m,h,x,E)=>{t.bc("MultiHeadAttention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:h,scale:x,doRotary:E})},1102133:(o,d)=>{t.bc("QuickGelu",o,{alpha:d})},1102197:(o,d,m,h,x)=>{t.bc("RotaryEmbedding",o,{interleaved:!!d,numHeads:m,rotaryEmbeddingDim:h,scale:x})},1102336:(o,d,m)=>{t.bc("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},1102438:(o,d,m)=>{t.bc("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},1102540:(o,d,m,h)=>{t.bc("GatherBlockQuantized",o,{gatherAxis:d,quantizeAxis:m,blockSize:h})},1102661:o=>{t.Id(o)},1102695:(o,d)=>t.Kd(Number(o),Number(d),t.$c.Nd,t.$c.errors)};function lm(o,d,m){return Ha(async()=>{await t.Gd(Number(o),Number(d),Number(m))})}function dm(){return typeof wasmOffsetConverter<"u"}function pm(o,d,m,h){var x=ce();try{return zs(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function cm(o,d,m){var h=ce();try{return Ss(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;fe(1,0)}}function fm(o){var d=ce();try{$s(o)}catch(m){if(pe(d),m!==m+0)throw m;fe(1,0)}}function hm(o,d){var m=ce();try{return yi(o,d)}catch(h){if(pe(m),h!==h+0)throw h;fe(1,0)}}function mm(o,d,m){var h=ce();try{ws(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;fe(1,0)}}function gm(o,d){var m=ce();try{js(o,d)}catch(h){if(pe(m),h!==h+0)throw h;fe(1,0)}}function vm(o,d,m,h,x,E,j){var R=ce();try{return Es(o,d,m,h,x,E,j)}catch(W){if(pe(R),W!==W+0)throw W;fe(1,0)}}function bm(o,d,m,h,x,E){var j=ce();try{As(o,d,m,h,x,E)}catch(R){if(pe(j),R!==R+0)throw R;fe(1,0)}}function ym(o,d,m,h){var x=ce();try{Is(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function _m(o,d,m,h,x){var E=ce();try{ks(o,d,m,h,x)}catch(j){if(pe(E),j!==j+0)throw j;fe(1,0)}}function xm(o,d,m,h,x,E,j){var R=ce();try{Bs(o,d,m,h,x,E,j)}catch(W){if(pe(R),W!==W+0)throw W;fe(1,0)}}function wm(o,d,m,h,x,E,j){var R=ce();try{Os(o,d,m,h,x,E,j)}catch(W){if(pe(R),W!==W+0)throw W;fe(1,0)}}function $m(o,d,m,h,x,E,j,R){var W=ce();try{Ns(o,d,m,h,x,E,j,R)}catch(K){if(pe(W),K!==K+0)throw K;fe(1,0)}}function Am(o,d,m,h,x){var E=ce();try{return Cs(o,d,m,h,x)}catch(j){if(pe(E),j!==j+0)throw j;fe(1,0)}}function km(o,d,m){var h=ce();try{return qs(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;fe(1,0)}}function Sm(o,d,m,h,x,E,j,R){var W=ce();try{Ps(o,d,m,h,x,E,j,R)}catch(K){if(pe(W),K!==K+0)throw K;fe(1,0)}}function Tm(o,d,m,h,x,E,j,R,W,K,de,ge){var we=ce();try{Ds(o,d,m,h,x,E,j,R,W,K,de,ge)}catch(Ae){if(pe(we),Ae!==Ae+0)throw Ae;fe(1,0)}}function Em(o,d,m){var h=ce();try{return Us(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;return fe(1,0),0n}}function Im(o,d,m,h,x,E,j,R,W){var K=ce();try{Ts(o,d,m,h,x,E,j,R,W)}catch(de){if(pe(K),de!==de+0)throw de;fe(1,0)}}function zm(o){var d=ce();try{return Ls(o)}catch(m){if(pe(d),m!==m+0)throw m;fe(1,0)}}function jm(o,d){var m=ce();try{return no(o,d)}catch(h){if(pe(m),h!==h+0)throw h;return fe(1,0),0n}}function Cm(o,d,m,h){var x=ce();try{return Fs(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function Bm(o){var d=ce();try{return Gs(o)}catch(m){if(pe(d),m!==m+0)throw m;return fe(1,0),0n}}function Om(o,d,m,h){var x=ce();try{return Zs(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function Dm(o,d,m,h,x){var E=ce();try{return Qs(o,d,m,h,x)}catch(j){if(pe(E),j!==j+0)throw j;fe(1,0)}}function Mm(o,d,m,h,x,E){var j=ce();try{return Ys(o,d,m,h,x,E)}catch(R){if(pe(j),R!==R+0)throw R;fe(1,0)}}function Rm(o,d,m,h,x,E){var j=ce();try{return Ms(o,d,m,h,x,E)}catch(R){if(pe(j),R!==R+0)throw R;fe(1,0)}}function Nm(o,d,m,h,x,E){var j=ce();try{return Js(o,d,m,h,x,E)}catch(R){if(pe(j),R!==R+0)throw R;fe(1,0)}}function qm(o,d,m,h,x,E,j,R){var W=ce();try{return Rs(o,d,m,h,x,E,j,R)}catch(K){if(pe(W),K!==K+0)throw K;fe(1,0)}}function Pm(o,d,m,h,x){var E=ce();try{return eo(o,d,m,h,x)}catch(j){if(pe(E),j!==j+0)throw j;return fe(1,0),0n}}function Um(o,d,m,h){var x=ce();try{return to(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function Lm(o,d,m,h){var x=ce();try{return ro(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function Fm(o,d,m,h,x,E,j,R,W,K,de,ge){var we=ce();try{return io(o,d,m,h,x,E,j,R,W,K,de,ge)}catch(Ae){if(pe(we),Ae!==Ae+0)throw Ae;fe(1,0)}}function Gm(o,d,m,h,x,E,j,R,W,K,de){var ge=ce();try{Ks(o,d,m,h,x,E,j,R,W,K,de)}catch(we){if(pe(ge),we!==we+0)throw we;fe(1,0)}}function Wm(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae,ft,xi){var Xm=ce();try{Xs(o,d,m,h,x,E,j,R,W,K,de,ge,we,Ae,ft,xi)}catch(wi){if(pe(Xm),wi!==wi+0)throw wi;fe(1,0)}}function Vm(o,d,m){var h=ce();try{return Ws(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;fe(1,0)}}function Hm(o,d,m){var h=ce();try{return Vs(o,d,m)}catch(x){if(pe(h),x!==x+0)throw x;fe(1,0)}}function Km(o,d,m,h){var x=ce();try{Hs(o,d,m,h)}catch(E){if(pe(x),E!==E+0)throw E;fe(1,0)}}function Er(){if(0<le)me=Er;else if(n)_?.(t),Y();else{for(var o=se;0<o.length;)o.shift()(t);0<le?me=Er:(t.calledRun=!0,I||(Y(),_?.(t)))}}return n||(nt=await Ee(),Er()),t.PTR_SIZE=4,q?t:new Promise((o,d)=>{_=o,A=d})}var y0,co,gg=U(()=>{"use strict";y0=po,co=globalThis.self?.name?.startsWith("em-pthread"),co&&po()}),Ei,kn,fo,Me,_0,zr,ho,mo,Ii,go,zi,x0,ji,w0,Wn=U(()=>{"use strict";Gn(),Ei=typeof location>"u"?void 0:location.origin,kn=import.meta.url>"file:"&&import.meta.url<"file;",fo=()=>{if(kn){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,Ei).href}return import.meta.url},Me=fo(),_0=()=>{if(Me&&!Me.startsWith("blob:"))return Me.substring(0,Me.lastIndexOf("/")+1)},zr=(e,t)=>{try{let r=t??Me;return(r?new URL(e,r):new URL(e)).origin===Ei}catch{return!1}},ho=(e,t)=>{let r=t??Me;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},mo=(e,t)=>`${t??"./"}${e}`,Ii=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},go=async e=>(await import(e)).default,zi=(mg(),mr(g0)).default,x0=async()=>{if(!Me)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(zr(Me))return[void 0,zi()];let e=await Ii(Me);return[e,zi(e)]},ji=(gg(),mr(b0)).default,w0=async(e,t,r,i)=>{let n=ji&&!(e||t);if(n)if(Me)n=zr(Me)||i&&!r;else if(i&&!r)n=!0;else throw new Error("cannot determine the script source URL.");if(n)return[void 0,ji];{let a="ort-wasm-simd-threaded.jsep.mjs",s=e??ho(a,t),u=r&&s&&!zr(s,t),l=u?await Ii(s):s??mo(a,t);return[u?l:void 0,await go(l)]}}}),Ci,jr,tr,Bi,vo,bo,yo,Vn,$e,Rt=U(()=>{"use strict";Wn(),jr=!1,tr=!1,Bi=!1,vo=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},bo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},yo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Vn=async e=>{if(jr)return Promise.resolve();if(tr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Bi)throw new Error("previous call to 'initializeWebAssembly()' failed.");tr=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!yo())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!bo())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=vo();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let n=e.wasmPaths,a=typeof n=="string"?n:void 0,s=n?.mjs,u=s?.href??s,l=n?.wasm,p=l?.href??l,c=e.wasmBinary,[f,g]=await w0(u,a,r>1,!!c||!!p),b=!1,v=[];if(t>0&&v.push(new Promise(_=>{setTimeout(()=>{b=!0,_()},t)})),v.push(new Promise((_,A)=>{let $={numThreads:r};if(c)$.wasmBinary=c,$.locateFile=y=>y;else if(p||a)$.locateFile=y=>p??a+y;else if(u&&u.indexOf("blob:")!==0)$.locateFile=y=>new URL(y,u).href;else if(f){let y=_0();y&&($.locateFile=S=>y+S)}g($).then(y=>{tr=!1,jr=!0,Ci=y,_(),f&&URL.revokeObjectURL(f)},y=>{tr=!1,Bi=!0,A(y)})})),await Promise.race(v),b)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},$e=()=>{if(jr&&Ci)return Ci;throw new Error("WebAssembly is not initialized yet.")}}),Xe,Vr,ye,Hn=U(()=>{"use strict";Rt(),Xe=(e,t)=>{let r=$e(),i=r.lengthBytesUTF8(e)+1,n=r._malloc(i);return r.stringToUTF8(e,n,i),t.push(n),n},Vr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([n,a])=>{let s=t?t+n:n;if(typeof a=="object")Vr(a,s+".",r,i);else if(typeof a=="string"||typeof a=="number")i(s,a.toString());else if(typeof a=="boolean")i(s,a?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof a}`)})},ye=e=>{let t=$e(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetLastError(n,n+i);let a=Number(t.getValue(n,i===4?"i32":"i64")),s=t.getValue(n+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${a}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),$0,vg=U(()=>{"use strict";Rt(),Hn(),$0=e=>{let t=$e(),r=0,i=[],n=e||{};try{if(e?.logSeverityLevel===void 0)n.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)n.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(n.terminate=!1);let a=0;return e?.tag!==void 0&&(a=Xe(e.tag,i)),r=t._OrtCreateRunOptions(n.logSeverityLevel,n.logVerbosityLevel,!!n.terminate,a),r===0&&ye("Can't create run options."),e?.extra!==void 0&&Vr(e.extra,"",new WeakSet,(s,u)=>{let l=Xe(s,i),p=Xe(u,i);t._OrtAddRunConfigEntry(r,l,p)!==0&&ye(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(a){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),a}}}),_o,xo,wo,At,$o,A0,bg=U(()=>{"use strict";Rt(),Hn(),_o=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},xo=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},wo=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},At=(e,t,r,i)=>{let n=Xe(t,i),a=Xe(r,i);$e()._OrtAddSessionConfigEntry(e,n,a)!==0&&ye(`Can't set a session config entry: ${t} - ${r}.`)},$o=async(e,t,r)=>{let i=t.executionProviders;for(let n of i){let a=typeof n=="string"?n:n.name,s=[];switch(a){case"webnn":if(a="WEBNN",At(e,"session.disable_quant_qdq","1",r),At(e,"session.disable_qdq_constant_folding","1",r),typeof n!="string"){let f=n?.deviceType;f&&At(e,"deviceType",f,r)}break;case"webgpu":if(a="JS",typeof n!="string"){let f=n;if(f?.preferredLayout){if(f.preferredLayout!=="NCHW"&&f.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);At(e,"preferredLayout",f.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${a}`)}let u=Xe(a,r),l=s.length,p=0,c=0;if(l>0){p=$e()._malloc(l*$e().PTR_SIZE),r.push(p),c=$e()._malloc(l*$e().PTR_SIZE),r.push(c);for(let f=0;f<l;f++)$e().setValue(p+f*$e().PTR_SIZE,s[f][0],"*"),$e().setValue(c+f*$e().PTR_SIZE,s[f][1],"*")}await $e()._OrtAppendExecutionProvider(e,u,p,c,l)!==0&&ye(`Can't append execution provider: ${a}.`)}},A0=async e=>{let t=$e(),r=0,i=[],n=e||{};wo(n);try{let a=_o(n.graphOptimizationLevel??"all"),s=xo(n.executionMode??"sequential"),u=typeof n.logId=="string"?Xe(n.logId,i):0,l=n.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let p=n.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let c=typeof n.optimizedModelFilePath=="string"?Xe(n.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(a,!!n.enableCpuMemArena,!!n.enableMemPattern,s,!!n.enableProfiling,0,u,l,p,c),r===0&&ye("Can't create session options."),n.executionProviders&&await $o(r,n,i),n.enableGraphCapture!==void 0){if(typeof n.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${n.enableGraphCapture}`);At(r,"enableGraphCapture",n.enableGraphCapture.toString(),i)}if(n.freeDimensionOverrides)for(let[f,g]of Object.entries(n.freeDimensionOverrides)){if(typeof f!="string")throw new Error(`free dimension override name must be a string: ${f}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let b=Xe(f,i);t._OrtAddFreeDimensionOverride(r,b,g)!==0&&ye(`Can't set a free dimension override: ${f} - ${g}.`)}return n.extra!==void 0&&Vr(n.extra,"",new WeakSet,(f,g)=>{At(r,f,g,i)}),[r,i]}catch(a){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&ye("Can't release session options."),i.forEach(s=>t._free(s)),a}}}),zt,ot,jt,Jr,Hr,Kn,Xn,Sn,ne=U(()=>{"use strict";zt=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ot=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},jt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((n,a)=>n*a,1);return r>0?Math.ceil(i*r):void 0},Jr=e=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Hr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Kn=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Xn=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Sn=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Zn,k0=U(()=>{"use strict";Gn(),Zn=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let n=t.body.getReader(),a;try{a=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let l=Math.ceil(i/65536);a=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let s=0;for(;;){let{done:u,value:l}=await n.read();if(u)break;let p=l.byteLength;new Uint8Array(a,s,p).set(l),s+=p}return new Uint8Array(a,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Ao,ko,So,To,Qn,Eo,he,ut=U(()=>{"use strict";ne(),Ao=["V","I","W","E","F"],ko=(e,t)=>{console.log(`[${Ao[e]},${new Date().toISOString()}]${t}`)},Qn=(e,t)=>{So=e,To=t},Eo=(e,t)=>{let r=Hr(e),i=Hr(So);r>=i&&ko(r,typeof t=="function"?t():t)},he=(...e)=>{To&&Eo(...e)}}),Io,Vt,B,Kr,S0,T0,E0,oe=U(()=>{"use strict";Io=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Vt=class{static calcShape(e,t,r=!1){let i=e.length,n=t.length;if(i===0)return t;if(n===0)return e;let a=Math.max(e.length,t.length),s=new Array(a);if(r){if(i<2||n<2)return;let u=Io.calcMatMulShape([e[i-2],e[i-1]],[t[n-2],t[n-1]]);if(u===void 0)return;[s[a-2],s[a-1]]=u}for(let u=r?3:1;u<=a;u++){let l=i-u<0?1:e[i-u],p=n-u<0?1:t[n-u];if(l!==p&&l>1&&p>1)return;let c=Math.max(l,p);if(l&&p)s[a-u]=Math.max(l,p);else{if(c>1)return;s[a-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let n=1;n<=r;n++)if(e[r-n]!==1&&e[r-n]!==t[i-n])return!1;return!0}},B=class Fr{static size(t){return Fr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let n=new Array(i),a=i-1;for(;a>=0;){if(t[a]%r===0){n[a]=t[a]/r;break}if(r%t[a]!==0)throw new Error("cannot convert shape");n[a]=1,r/=t[a],a--}for(a--;a>=0;a--)n[a]=t[a];return n}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Fr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Fr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let n=1;for(let a=r;a<i;a++){if(t[a]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");n*=Number(t[a])}return n}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let n=r-3;n>=0;--n)i[n]=i[n+1]*t[n+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((n,a)=>n+r[a]+r[a+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,n)=>i===r[n])}},Kr=class bt{static adjustPoolAttributes(t,r,i,n,a,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("strides should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("dilations should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,n,a,s,u){if(u){if(a.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(n.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)bt.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],n[l],a,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,i,n,a,s,u,l=0){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let p=[r[0],r[1]];return bt.computeShapeHelper(t,r,p,i,n,a,s,u,l),p}static computeConvOutputShape(t,r,i,n,a,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return bt.computeShapeHelper(!1,t,l,i,n,a,s,u),l}static computeShapeHelper(t,r,i,n,a,s,u,l,p=0){if(t)for(let c=0;c<r.length-2;c++)i.push(1);else for(let c=0;c<r.length-2;c++)i.push(bt.adjustPadAndReturnShape(r[c+2],n[c],a[c],s[c],u,c,c+r.length-2,l,p))}static computeOutputSize(t,r,i,n,a){let s=Math.floor(t/r)+1;return a===1&&(s=Math.ceil(t/r)+1,(s-1)*r>=i+n&&(s-=1)),s}static adjustPadAndReturnShape(t,r,i,n,a,s,u,l,p=0){let c=i*(n-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return a[s]=0,a[u]=0,bt.computeOutputSize(t-c,r,t,0,p);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let f=(Math.floor((t+r-1)/r)-1)*r+n-t;return a[s]=Math.floor(l==="SAME_LOWER"?(f+1)/2:f/2),a[u]=f-a[s],bt.computeOutputSize(t+a[s]+a[u]-c,r,t,a[s],p)}default:throw new Error("Unsupported AutoPad type")}else return bt.computeOutputSize(t+a[s]+a[u]-c,r,t,a[s],p)}},S0=class{static getShapeOfGemmResult(e,t,r,i,n){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let a,s,u;t?(a=e[1],s=e[0]):(a=e[0],s=e[1]);let l=-1;if(i?(u=r[0],l=1):(u=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(a<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(n&&!Vt.isValidBroadcast(n,[a,u]))throw new Error("gemm: invalid bias shape for broadcast");return[a,u,s]}},T0=-34028234663852886e22,E0=34028234663852886e22}),Yn,I0=U(()=>{"use strict";ne(),Yn=(e,t)=>new(Jr(t))(e)}),Oi,zo,Di,jo,Mi,Co,Ri,Ni,qi,Bo,z0,yg=U(()=>{"use strict";ne(),ut(),Oi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),zo=(e,t)=>{if(t==="int32")return e;let r=Oi.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let n=e.byteLength/i,a=new(Jr(t))(e.buffer,e.byteOffset,n);switch(t){case"int64":case"uint64":{let s=new Int32Array(n);for(let u=0;u<n;u++){let l=a[u];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&a.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(a,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Di=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let n=BigInt64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"uint64":{if(i.some(a=>a<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let n=BigUint64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"int8":{if(i.some(a=>a<-128||a>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let n=Int8Array.from(i,Number);return new Uint8Array(n.buffer)}case"uint8":{if(i.some(n=>n<0||n>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(a=>a<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let n=Uint32Array.from(i,Number);return new Uint8Array(n.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},jo=1,Mi=()=>jo++,Co=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Ri=(e,t)=>{let r=Oi.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,n)=>i*n)*r/8):0},Ni=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:n,shape:a,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=n,this.tensorShape=a,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Ri(this.dataType,this.tensorShape)}destroy(){he("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Di(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,n)=>i===r[n])}setIsDataConverted(e){this.isDataConverted=e}},qi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let n=this.tensorManager.getMLContext(e),a=this.tensorManager.getMLOpSupportLimits(e),s;if(!a?.input.dataTypes.includes(t)){if(s=Co.get(t),!s||!a?.input.dataTypes.includes(s))throw new Error(`WebNN backend does not support data type: ${t}`);he("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(n,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Ri(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=zo(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else he("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Di(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Bo=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Mi();return this.tensorTrackersById.set(e,new qi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,n){he("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${n}}`);let a=this.tensorTrackersById.get(t);if(!a)throw new Error("Tensor not found.");return a.ensureTensor(e,r,i,n)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){he("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let n=this.getMLContext(e),a=Mi(),s=new Ni({sessionId:e,context:n,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(a,new qi(this,s)),this.externalTensors.add(s),a}async getCachedTensor(e,t,r,i,n,a,s){let u=this.getMLContext(e);for(let[p,c]of this.freeTensors.entries())if(c.canReuseTensor(u,t,r)){he("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let f=this.freeTensors.splice(p,1)[0];return f.sessionId=e,f}he("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:n,readable:a});return new Ni({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},z0=(...e)=>new Bo(...e)}),rr,Oo,j0,_g=U(()=>{"use strict";ne(),Rt(),I0(),yg(),ut(),rr=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Oo=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((n,a)=>n===i[a]&&e[n]===t[n])},j0=class{constructor(e){this.tensorManager=z0(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Qn(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){he("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){he("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)he("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Oo(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(n=>n.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){he("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,n){let a=rr.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,a,i,n)}async createTemporaryTensor(e,t,r){he("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=rr.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let n=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,n,i,r,!1);let a=this.temporarySessionTensorIds.get(e);return a?a.push(n):this.temporarySessionTensorIds.set(e,[n]),n}uploadTensor(e,t){if(!$e().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");he("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Yn(r,t)}}registerMLTensor(e,t,r,i){let n=rr.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);let a=this.tensorManager.registerTensor(e,t,n,i);return he("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${n}, dimensions: ${i}} -> {tensorId: ${a}}`),a}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=rr.get(zt(t)),n=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!n?.input.dataTypes.includes(i):!!n?.output.dataTypes.includes(i)}flush(){}}}),Jn=U(()=>{"use strict"}),Pi,Cr,Br,Do,Mo,Ui,Tn,Ro,C0,xg=U(()=>{"use strict";ut(),Jn(),Pi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Cr=[],Br=e=>Math.ceil(Number(e)/16)*16,Do=e=>{for(let t=0;t<Cr.length;t++){let r=Cr[t];if(e<=r)return r}return Math.ceil(e/16)*16},Mo=1,Ui=()=>Mo++,Tn=async(e,t,r,i)=>{let n=Br(r),a=e.device.createBuffer({size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,a,0,n),e.flush(),await a.mapAsync(GPUMapMode.READ);let u=a.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{a.destroy()}},Ro=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Pi)Cr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,n=t.byteLength,a=Br(n),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==n)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${n}`);if(a===n&&i%4===0)this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,r,i,n);else{let u=new Uint8Array(a);u.set(t),this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,u,0,a)}he("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let n=Br(r.originalSize),a=this.backend.getCommandEncoder();this.backend.endComputePass(),a.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,n)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return he("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Ui();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),he("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),he("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Do(e),i,n=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,a=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(n||a){let u=(n?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Ui(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),he("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return he("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Tn(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Pi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(he("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},C0=(...e)=>new Ro(...e)}),No,be,Se=U(()=>{"use strict";No=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},be=e=>new No(e)}),Ht,Or,Ce,je,ee,ke,En,Wt,yt,Q,ir,D,Z,B0,ea,qo,O0,ue=U(()=>{"use strict";ne(),oe(),Ht=64,Or=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},Ce=(e,t=1)=>{let r=Or(e,t);return typeof r=="string"?r:r[0]},je=(e,t=1)=>{let r=Or(e,t);return typeof r=="string"?r:r[1]},ee=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:B.computeStrides(r)})}),t},ke=e=>e%4===0?4:e%2===0?2:1,En=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Wt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,yt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Q=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ir=(e,t,r,i,n)=>{let a=typeof r=="number",s=a?r:r.length,u=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=Or(t,n),c=typeof p=="string"?p:p[1],f=typeof p=="string"?p:p[0],g={indices:l,value:c,storage:f,tensor:t},b=q=>typeof q=="string"?q:`${q}u`,v={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},_=a?"uniforms.":"",A=`${_}${e}_shape`,$=`${_}${e}_strides`,y="";for(let q=0;q<s-1;q++)y+=`
    let dim${q} = current / ${Q($,q,s)};
    let rest${q} = current % ${Q($,q,s)};
    indices[${q}] = dim${q};
    current = rest${q};
    `;y+=`indices[${s-1}] = current;`;let S=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${y}
    return indices;
  }`,k=q=>(v.offsetToIndices=!0,s<2?q:`o2i_${e}(${q})`),T=[];if(s>=2)for(let q=s-1;q>=0;q--)T.push(`${Q($,q,s)} * (indices[${q}])`);let I=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${T.join("+")};
  }`,z=q=>(v.indicesToOffset=!0,s<2?q:`i2o_${e}(${q})`),w=(...q)=>s===0?"0u":`${g.indices}(${q.map(b).join(",")})`,O=(q,J)=>s<2?`${q}`:`${Q(q,J,s)}`,M=(q,J,Y)=>s<2?`${q}=${Y};`:`${Q(q,J,s)}=${Y};`,F={},G=(q,J)=>{v.broadcastedIndicesToOffset=!0;let Y=`${J.name}broadcastedIndicesTo${e}Offset`;if(Y in F)return`${Y}(${q})`;let H=[];for(let Te=s-1;Te>=0;Te--){let Ee=J.indicesGet("outputIndices",Te+J.rank-s);H.push(`${O($,Te)} * (${Ee} % ${O(A,Te)})`)}return F[Y]=`fn ${Y}(outputIndices: ${J.type.indices}) -> u32 {
             return ${H.length>0?H.join("+"):"0u"};
           }`,`${Y}(${q})`},L=(q,J)=>(()=>{if(g.storage===g.value)return`${e}[${q}]=${J};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${q}]=vec2<u32>(u32(${J}), select(0u, 0xFFFFFFFFu, ${J} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${q}]=vec2<u32>(u32(${J}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${q}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${J}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),C=q=>(()=>{if(g.storage===g.value)return`${e}[${q}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${q}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${q}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${q}] & 0xFFu), bool(${e}[${q}] & 0xFF00u), bool(${e}[${q}] & 0xFF0000u), bool(${e}[${q}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),N=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${c} {
    return ${C(`i2o_${e}(indices)`)};
  }`,V=s<2?"":(()=>{let q=u.map(Y=>`d${Y}: u32`).join(", "),J=u.map(Y=>`d${Y}`).join(", ");return`
  fn get_${e}(${q}) -> ${c} {
    return get_${e}ByIndices(${w(J)});
  }`})(),X=(...q)=>{if(q.length!==s)throw new Error(`indices length must be ${s}`);let J=q.map(b).join(",");return s===0?C("0u"):s===1?C(J[0]):(v.get=!0,v.getByIndices=!0,v.indicesToOffset=!0,`get_${e}(${J})`)},te=q=>s<2?C(q):(v.getByIndices=!0,v.indicesToOffset=!0,`get_${e}ByIndices(${q})`),re=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${c}) {
    ${L(`i2o_${e}(indices)`,"value")}
  }`,ae=s<2?"":(()=>{let q=u.map(Y=>`d${Y}: u32`).join(", "),J=u.map(Y=>`d${Y}`).join(", ");return`
  fn set_${e}(${q}, value: ${c}) {
    set_${e}ByIndices(${w(J)}, value);
  }`})();return{impl:()=>{let q=[],J=!1;return v.offsetToIndices&&(q.push(S),J=!0),v.indicesToOffset&&(q.push(I),J=!0),v.broadcastedIndicesToOffset&&(Object.values(F).forEach(Y=>q.push(Y)),J=!0),v.set&&(q.push(ae),J=!0),v.setByIndices&&(q.push(re),J=!0),v.get&&(q.push(V),J=!0),v.getByIndices&&(q.push(N),J=!0),!a&&J&&q.unshift(`const ${A} = ${g.indices}(${r.join(",")});`,`const ${$} = ${g.indices}(${B.computeStrides(r).join(",")});`),q.join(`
`)},type:g,offsetToIndices:k,indicesToOffset:z,broadcastedIndicesToOffset:G,indices:w,indicesGet:O,indicesSet:M,set:(...q)=>{if(q.length!==s+1)throw new Error(`indices length must be ${s}`);let J=q[s];if(typeof J!="string")throw new Error("value must be string");let Y=q.slice(0,s).map(b).join(",");return s===0?L("0u",J):s===1?L(Y[0],J):(v.set=!0,v.setByIndices=!0,v.indicesToOffset=!0,`set_${e}(${Y}, ${J})`)},setByOffset:L,setByIndices:(q,J)=>s<2?L(q,J):(v.setByIndices=!0,v.indicesToOffset=!0,`set_${e}ByIndices(${q}, ${J});`),get:X,getByOffset:C,getByIndices:te,usage:i,name:e,strides:$,shape:A,rank:s}},D=(e,t,r,i=1)=>ir(e,t,r,"input",i),Z=(e,t,r,i=1)=>ir(e,t,r,"output",i),B0=(e,t,r)=>ir(e,t,r,"atomicOutput",1),ea=(e,t,r,i=1)=>ir(e,t,r,"internal",i),qo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Ht){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let n=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,a=n?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=n?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${a}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let n=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${n}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},O0=(e,t)=>new qo(e,t)}),Po,Li,Uo,Lo,Fo,Go,Ne,D0,M0,_t=U(()=>{"use strict";ne(),oe(),Se(),ue(),Po=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Li=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Uo=(e,t)=>B.sortBasedOnPerm(e,Li(e.length,t)),Lo=(e,t,r,i)=>{let n=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let a=0;a<t;++a)n+=`a[${e[a]}]=i[${a}];`;return n+="return a;}"},Fo=(e,t)=>{let r=[],i=[];for(let n=0;n<e.length;++n)e[n]!==1&&r.push(e[n]),e[t[n]]!==1&&i.push(t[n]);return{newShape:r,newPerm:i}},Go=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Ne=(e,t)=>{let r=e.dataType,i=e.dims.length,n=Li(i,t),a=Uo(e.dims,n),s=e.dims,u=a,l=i<2||Go(n,e.dims),p;if(l)return p=v=>{let _=D("input",r,s,4),A=Z("output",r,u,4);return`
  ${v.registerUniform("output_size","u32").declareVariables(_,A)}
  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let v=B.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(v/64/4)},programUniforms:[{type:12,data:Math.ceil(v/4)}]}},getShaderSource:p};let{newShape:c,newPerm:f}=Fo(e.dims,n),g=B.areEqual(f,[2,3,1]),b=B.areEqual(f,[3,1,2]);if(c.length===2||g||b){s=g?[c[0],c[1]*c[2]]:b?[c[0]*c[1],c[2]]:c,u=[s[1],s[0]];let v=16;return p=_=>{let A=D("a",r,s.length),$=Z("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(A,$)}
  var<workgroup> tile : array<array<${$.type.value}, ${v+1}>, ${v}>;
  ${_.mainStart([v,v,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${v} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${v}u + local_id.x;
    let input_row = workgroup_id_x * ${v}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${A.getByIndices(`${A.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${v}u + local_id.x;
    let output_row = workgroup_id_y * ${v}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${$.setByIndices(`${$.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=B.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/v),y:Math.ceil(u[0]/v)},programUniforms:[{type:12,data:_},...ee(s,u)]}},getShaderSource:p}}return p=v=>{let _=D("a",r,s.length),A=Z("output",r,u.length);return`
  ${v.registerUniform("output_size","u32").declareVariables(_,A)}

  ${Lo(n,i,_,A)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${A.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${A.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let v=B.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:[{type:12,data:v},...ee(s,u)]}},getShaderSource:p}},D0=(e,t)=>{Po(e.inputs,t.perm),e.compute(Ne(e.inputs[0],t.perm))},M0=e=>be({perm:e.perm})}),Wo,Vo,Ho,Ko,Xo,Zo,Qo,Yo,Jo,eu,Ge,R0,N0,q0,P0,U0,L0,F0,G0,W0,V0,wg=U(()=>{"use strict";ne(),oe(),ue(),ta(),_t(),Wo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},Vo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Ho={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},Ko={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Xo=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Zo=(e,t)=>{let r=[],i=e.length;for(let a=0;a<i;a++)t.indexOf(a)===-1&&r.push(e[a]);let n=t.map(a=>e[a]);return[r,n]},Qo=(e,t)=>{let r=e.length+t.length,i=[],n=0;for(let a=0;a<r;a++)t.indexOf(a)===-1?i.push(e[n++]):i.push(1);return i},Yo=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Jo=(e,t)=>{let r=[];if(!Yo(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},eu=(e,t,r,i,n,a,s)=>{let u=r[0].dims,l=B.size(a),p=B.size(s),c=D("_A",r[0].dataType,u),f=Z("output",n,a),g=64;l===1&&(g=256);let b=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,v=_=>`
        ${_.registerUniform("reduceSize","u32").declareVariables(c,f)}
        ${b}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${_.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Ho[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${c.getByOffset("offset + k")});
           bestValue = ${Wo[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${Vo[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${f.setByOffset("outputIndex",`${i==="mean"?`${f.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${f.type.storage}(${Ko[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:v,getRunData:()=>({outputs:[{dims:a,dataType:n}],dispatchGroup:{x:l},programUniforms:[{type:12,data:p}]})}},Ge=(e,t,r,i)=>{let n=e.inputs.length===1?r:In(e.inputs,r),a=n.axes;a.length===0&&!n.noopWithEmptyAxes&&(a=e.inputs[0].dims.map((b,v)=>v));let s=B.normalizeAxes(a,e.inputs[0].dims.length),u=s,l=e.inputs[0],p=Jo(u,e.inputs[0].dims.length);p.length>0&&(l=e.compute(Ne(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=Xo(u.length,l.dims.length));let[c,f]=Zo(l.dims,u),g=c;n.keepDims&&(g=Qo(c,s)),e.compute(eu(t,n.cacheKey,[l],i,e.inputs[0].dataType,g,f),{inputs:[l]})},R0=(e,t)=>{Ge(e,"ReduceMeanShared",t,"mean")},N0=(e,t)=>{Ge(e,"ReduceL1Shared",t,"l1")},q0=(e,t)=>{Ge(e,"ReduceL2Shared",t,"l2")},P0=(e,t)=>{Ge(e,"ReduceLogSumExpShared",t,"logSumExp")},U0=(e,t)=>{Ge(e,"ReduceMaxShared",t,"max")},L0=(e,t)=>{Ge(e,"ReduceMinShared",t,"min")},F0=(e,t)=>{Ge(e,"ReduceProdShared",t,"prod")},G0=(e,t)=>{Ge(e,"ReduceSumShared",t,"sum")},W0=(e,t)=>{Ge(e,"ReduceSumSquareShared",t,"sumSquare")},V0=(e,t)=>{Ge(e,"ReduceLogSumShared",t,"logSum")}}),We,tu,Xr,In,Ve,ru,iu,nu,au,su,ou,uu,lu,du,pu,He,H0,K0,X0,Z0,Q0,Y0,J0,ep,tp,rp,ta=U(()=>{"use strict";ne(),oe(),Se(),ue(),wg(),We=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},tu=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Xr=(e,t,r,i,n,a,s=!1,u=!1)=>{let l=[],p=r[0].dims,c=p.length,f=B.normalizeAxes(n,c),g=!u&&f.length===0;p.forEach((_,A)=>{g||f.indexOf(A)>=0?s&&l.push(1):l.push(_)});let b=l.length,v=B.size(l);return{name:e,shaderCache:t,getShaderSource:_=>{let A=[],$=D("_A",r[0].dataType,c),y=Z("output",a,b),S=i($,y,f),k=S[2];for(let T=0,I=0;T<c;T++)g||f.indexOf(T)>=0?(s&&I++,k=`for(var j${T}: u32 = 0; j${T} < ${p[T]}; j${T}++) {
                  ${S[2].includes("last_index")?`let last_index = j${T};`:""}
                  ${$.indicesSet("input_indices",T,`j${T}`)}
                  ${k}
                }`):(A.push(`${$.indicesSet("input_indices",T,y.indicesGet("output_indices",I))};`),I++);return`

        ${_.registerUniform("output_size","u32").declareVariables($,y)}

        ${_.mainStart()}
          ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${$.type.indices};
          let output_indices = ${y.offsetToIndices("global_idx")};

          ${A.join(`
`)}
          ${S[0]}       // init ops for reduce max/min
          ${S[1]}
          ${k}
          ${S[3]}
          ${S.length===4?y.setByOffset("global_idx","value"):S.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:a}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:[{type:12,data:v},...ee(p,l)]})}},In=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),be({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Ve=(e,t,r,i)=>{let n=e.inputs,a=n.length===1?r:In(n,r);e.compute(Xr(t,{hint:a.cacheKey,inputDependencies:["rank"]},[n[0]],a.noopWithEmptyAxes&&a.axes.length===0?tu:i,a.axes,n[0].dataType,a.keepDims,a.noopWithEmptyAxes),{inputs:[0]})},ru=(e,t)=>{We(e.inputs),Ve(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},iu=(e,t)=>{We(e.inputs),Ve(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},nu=(e,t)=>{We(e.inputs),Ve(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},au=(e,t)=>{We(e.inputs),Ve(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},su=(e,t)=>{We(e.inputs),Ve(e,"ReduceMax",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(r.indicesSet("input_indices",s,0));return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},ou=(e,t)=>{We(e.inputs),Ve(e,"ReduceMean",t,(r,i,n)=>{let a=1;for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&(a*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${a});`]})},uu=(e,t)=>{We(e.inputs),Ve(e,"ReduceMin",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(`input_indices[${s}] = 0;`);return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},lu=(e,t)=>{We(e.inputs),Ve(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},du=(e,t)=>{We(e.inputs),Ve(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},pu=(e,t)=>{We(e.inputs),Ve(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},He=(e,t,r)=>{if(t.length===0)return r;let i=1,n=1;for(let a=0;a<t.length;a++)t.indexOf(a)===-1?i*=e[a]:n*=e[a];return n<32&&i>1024},H0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ou(e,t):R0(e,t)},K0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?iu(e,t):N0(e,t)},X0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?nu(e,t):q0(e,t)},Z0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?au(e,t):P0(e,t)},Q0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?su(e,t):U0(e,t)},Y0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?uu(e,t):L0(e,t)},J0=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?lu(e,t):F0(e,t)},ep=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?du(e,t):G0(e,t)},tp=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?pu(e,t):W0(e,t)},rp=(e,t)=>{He(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ru(e,t):V0(e,t)}}),Fi,ip,np,zn,$g=U(()=>{"use strict";ne(),Se(),ta(),Fi=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},ip=(e,t)=>{Fi(e.inputs);let r=(i,n,a)=>{let s=[];for(let u=0;u<i.rank;u++)(a.indexOf(u)>=0||a.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(Xr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},np=(e,t)=>{Fi(e.inputs);let r=(i,n,a)=>{let s=[];for(let u=0;u<i.rank;u++)(a.indexOf(u)>=0||a.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(Xr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},zn=e=>be(e)}),cu,Dr,fu,hu,mu,gr,gu,ap,ra=U(()=>{"use strict";ne(),oe(),Jn(),ue(),cu=(e,t)=>{let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],p=r.dims[1],c=r.dims[2];if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==c)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(n.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let f=n.dims[0]/3,g=f,b=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let S of t.qkvHiddenSizes)if(S%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");f=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],b=t.qkvHiddenSizes[2]}let v=p;if(f!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(n.dims[0]!==f+g+b)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let _=0;if(s){if(g!==b)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(_=s.dims[3])}let A=v+_,$=-1,y=0;if(a)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==A)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:p,pastSequenceLength:_,kvSequenceLength:v,totalSequenceLength:A,maxSequenceLength:$,inputHiddenSize:c,hiddenSize:f,vHiddenSize:b,headSize:Math.floor(f/t.numHeads),vHeadSize:Math.floor(b/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Dr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,fu=(e,t,r,i,n,a,s,u)=>{let l=ke(s?1:a),p=64,c=a/l;c<p&&(p=32);let f=Math.ceil(a/l/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:n},{type:12,data:c},{type:12,data:f}],b=Ce(e.dataType,l),v=je(1,l),_=["type"];s&&_.push("type"),u&&_.push("type");let A=$=>{let y=Z("x",e.dataType,e.dims,l),S=[y],k=s?D("seq_lens",s.dataType,s.dims):void 0;k&&S.push(k);let T=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;T&&S.push(T);let I=je(e.dataType),z=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${$.registerUniforms(z).declareVariables(...S)}
  ${$.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Dr(k,T,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${v}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${v}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${v}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${v}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${y.type.value}(${I}(1.0) / ${I}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${v}(x[offset + i]);
        x[offset + i] = ${y.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${y.type.value}(${I}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${b};${l}`,inputDependencies:_},getShaderSource:A,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:n,z:t*r},programUniforms:g})}},hu=(e,t,r,i,n,a,s,u,l)=>{let p=s+a.kvSequenceLength,c=[a.batchSize,a.numHeads,a.sequenceLength,p],f=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,b=f?[a.batchSize,g,p,a.headSize]:void 0,v=a.nReps?a.nReps:1,_=a.scale===0?1/Math.sqrt(a.headSize):a.scale,A=ke(a.headSize),$=a.headSize/A,y=12,S={x:Math.ceil(p/y),y:Math.ceil(a.sequenceLength/y),z:a.batchSize*a.numHeads},k=[{type:12,data:a.sequenceLength},{type:12,data:$},{type:12,data:p},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:1,data:_},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:v}],T=f&&i&&B.size(i.dims)>0,I=["type","type"];T&&I.push("type"),n&&I.push("type"),u&&I.push("type"),l&&I.push("type");let z=[{dims:c,dataType:t.dataType,gpuDataType:0}];f&&z.push({dims:b,dataType:t.dataType,gpuDataType:0});let w=O=>{let M=D("q",t.dataType,t.dims,A),F=D("key",r.dataType,r.dims,A),G=[M,F];if(T){let re=D("past_key",i.dataType,i.dims,A);G.push(re)}n&&G.push(D("attention_bias",n.dataType,n.dims));let L=u?D("seq_lens",u.dataType,u.dims):void 0;L&&G.push(L);let C=l?D("total_sequence_length_input",l.dataType,l.dims):void 0;C&&G.push(C);let N=Z("output",t.dataType,c),V=[N];f&&V.push(Z("present_key",t.dataType,b,A));let X=je(1,A),te=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${y}u;

  var<workgroup> tileQ: array<${M.type.storage}, ${y*y}>;
  var<workgroup> tileK: array<${M.type.storage}, ${y*y}>;
  ${O.registerUniforms(te).declareVariables(...G,...V)}
  ${O.mainStart([y,y,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${v===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${v===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Dr(L,C,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${T&&f?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${f?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${X}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${T&&f?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${f?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${X}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(A){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${A}`)}})()};
        output[outputIdx] = ${N.type.value} (sum * uniforms.alpha) + ${n?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${A};${n!==void 0};${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:z,dispatchGroup:S,programUniforms:k}),getShaderSource:w}},mu=(e,t,r,i,n,a,s=void 0,u=void 0)=>{let l=a+n.kvSequenceLength,p=n.nReps?n.nReps:1,c=n.vHiddenSize*p,f=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,b=f?[n.batchSize,g,l,n.headSize]:void 0,v=[n.batchSize,n.sequenceLength,c],_=12,A={x:Math.ceil(n.vHeadSize/_),y:Math.ceil(n.sequenceLength/_),z:n.batchSize*n.numHeads},$=[{type:12,data:n.sequenceLength},{type:12,data:l},{type:12,data:n.vHeadSize},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:12,data:c},{type:12,data:a},{type:12,data:n.kvSequenceLength},{type:12,data:p}],y=f&&i&&B.size(i.dims)>0,S=["type","type"];y&&S.push("type"),s&&S.push("type"),u&&S.push("type");let k=[{dims:v,dataType:t.dataType,gpuDataType:0}];f&&k.push({dims:b,dataType:t.dataType,gpuDataType:0});let T=I=>{let z=D("probs",t.dataType,t.dims),w=D("v",r.dataType,r.dims),O=[z,w];y&&O.push(D("past_value",i.dataType,i.dims));let M=s?D("seq_lens",s.dataType,s.dims):void 0;s&&O.push(M);let F=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;u&&O.push(F);let G=[Z("output",t.dataType,v)];f&&G.push(Z("present_value",t.dataType,b));let L=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${_}u;
  var<workgroup> tileQ: array<${z.type.value}, ${_*_}>;
  var<workgroup> tileV: array<${z.type.value}, ${_*_}>;
  ${I.registerUniforms(L).declareVariables(...O,...G)}
  ${I.mainStart([_,_,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Dr(M,F,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${y&&f?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${f?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${z.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${y&&f?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${f?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:S},getRunData:()=>({outputs:k,dispatchGroup:A,programUniforms:$}),getShaderSource:T}},gr=(e,t,r,i,n,a,s,u,l,p,c=void 0,f=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),b=g>1?s:void 0,v=g>1?u:void 0,_=g>1?p.pastSequenceLength:0,A=_+p.kvSequenceLength,$=l&&B.size(l.dims)>0?l:void 0,y=[t,r];b&&B.size(b.dims)>0&&y.push(b),$&&y.push($),c&&y.push(c),f&&y.push(f);let S=e.compute(hu(g,t,r,b,$,p,_,c,f),{inputs:y,outputs:g>1?[-1,1]:[-1]})[0];e.compute(fu(S,p.batchSize,p.numHeads,_,p.sequenceLength,A,c,f),{inputs:c&&f?[S,c,f]:[S],outputs:[]});let k=[S,i];v&&B.size(v.dims)>0&&k.push(v),c&&k.push(c),f&&k.push(f),e.compute(mu(g,S,i,v,p,_,c,f),{inputs:k,outputs:g>1?[0,2]:[0]})},gu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,n=t.inputHiddenSize,a=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:n},{type:12,data:a},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],c=f=>{let g=Z("output_q",l[0].dataType,r),b=Z("output_k",l[0].dataType,r),v=Z("output_v",l[0].dataType,r),_=D("input",l[0].dataType,l[0].dims),A=D("weight",l[1].dataType,l[1].dims),$=D("bias",l[2].dataType,l[2].dims),y=_.type.storage,S=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${y}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${y}, ${s*s}>;
  var<workgroup> tileWeightK: array<${y}, ${s*s}>;
  var<workgroup> tileWeightV: array<${y}, ${s*s}>;
  ${f.registerUniforms(S).declareVariables(_,A,$,g,b,v)}
  ${f.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${y}(0);
    var valueK = ${y}(0);
    var valueV = ${y}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:c},{inputs:l,outputs:[-1,-1,-1]})},ap=(e,t)=>{let r=cu(e.inputs,t),[i,n,a]=gu(e,r);return gr(e,i,n,a,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),vu,bu,yu,sp,Ag=U(()=>{"use strict";Le(),ne(),oe(),Se(),ue(),vu=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,n,a)=>{let s=n.length;if(s!==i.length)throw new Error(`${a}: num dimensions != ${s}`);n.forEach((u,l)=>{if(u!==i[l])throw new Error(`${a}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},bu=(e,t)=>{let{epsilon:r,spatial:i,format:n}=t,a=e[0].dims,s=i?ke(a[a.length-1]):1,u=n==="NHWC"&&a.length>1?s:1,l=B.size(a)/s,p=i,c=p?a.length:a,f=D("x",e[0].dataType,e[0].dims,s),g=D("scale",e[1].dataType,e[1].dims,u),b=D("bias",e[2].dataType,e[2].dims,u),v=D("inputMean",e[3].dataType,e[3].dims,u),_=D("inputVar",e[4].dataType,e[4].dims,u),A=Z("y",e[0].dataType,c,s),$=()=>{let S="";if(i)S=`let cOffset = ${a.length===1?"0u":n==="NHWC"?`outputIndices[${a.length-1}] / ${s}`:"outputIndices[1]"};`;else if(n==="NCHW")S=`
            ${A.indicesSet("outputIndices","0","0")}
            let cOffset = ${A.indicesToOffset("outputIndices")};`;else{S=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${a.length-1}];`;for(let k=1;k<g.rank;k++)S+=`cIndices[${k}] = outputIndices[${k}];`;S+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return S},y=S=>`
  const epsilon = ${r};
  ${S.registerUniform("outputSize","u32").declareVariables(f,g,b,v,_,A)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${A.offsetToIndices(`global_idx * ${s}`)};
    ${$()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${b.getByOffset("cOffset")};
    let inputMean = ${v.getByOffset("cOffset")};
    let inputVar = ${_.getByOffset("cOffset")};
    let x = ${f.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${A.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:y,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p?[{type:12,data:l},...ee(a)]:[{type:12,data:l}]})}},yu=e=>be(e),sp=(e,t)=>{let{inputs:r,outputCount:i}=e,n=yu({...t,outputCount:i});if(xe.webgpu.validateInputContent&&vu(r,n),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(bu(r,n))}}),_u,xu,op,kg=U(()=>{"use strict";oe(),ue(),_u=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},xu=e=>{let t=e[0].dims,r=e[0].dims[2],i=B.size(t)/4,n=e[0].dataType,a=D("input",n,t,4),s=D("bias",n,[r],4),u=D("residual",n,t,4),l=Z("output",n,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(a,s,u,l)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${a.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},op=e=>{_u(e.inputs),e.compute(xu(e.inputs))}}),wu,ve,up,lp,dp,pp,cp,fp,hp,mp,gp,$u,vp,bp,yp,_p,cr,xp,Gr,wp,$p,Ap,kp,Sp,Tp,Ep,Ip,zp,jp,Cp,Bp,Op,Dp,Mp,Rp,Np,Gi,qp,jn,Cn,Pp,Up,Lp,Au,ku,Fp,ia=U(()=>{"use strict";ne(),oe(),Se(),ue(),wu=(e,t,r,i,n,a,s)=>{let u=Math.ceil(t/4),l="";typeof n=="string"?l=`${n}(a)`:l=n("a");let p=D("inputData",r,[u],4),c=Z("outputData",i,[u],4),f=[{name:"vec_size",type:"u32"}];return s&&f.push(...s),`
      ${e.registerUniforms(f).declareVariables(p,c)}

  ${a??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${c.setByOffset("global_idx",l)}
  }`},ve=(e,t,r,i,n,a=e.dataType,s,u)=>{let l=[{type:12,data:Math.ceil(B.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:n,inputDependencies:["type"]},getShaderSource:p=>wu(p,B.size(e.dims),e.dataType,a,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:a}],dispatchGroup:{x:Math.ceil(B.size(p[0].dims)/64/4)},programUniforms:l})}},up=e=>{e.compute(ve(e.inputs[0],"Abs","abs"))},lp=e=>{e.compute(ve(e.inputs[0],"Acos","acos"))},dp=e=>{e.compute(ve(e.inputs[0],"Acosh","acosh"))},pp=e=>{e.compute(ve(e.inputs[0],"Asin","asin"))},cp=e=>{e.compute(ve(e.inputs[0],"Asinh","asinh"))},fp=e=>{e.compute(ve(e.inputs[0],"Atan","atan"))},hp=e=>{e.compute(ve(e.inputs[0],"Atanh","atanh"))},mp=e=>be(e),gp=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ve(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},$u=e=>{let t,r,i=e.length>=2&&e[1].data!==0,n=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=n?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=n?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return be({min:t,max:r})},vp=(e,t)=>{let r=t||$u(e.inputs),i=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"Clip",n=>`clamp(${n}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},bp=e=>{e.compute(ve(e.inputs[0],"Ceil","ceil"))},yp=e=>{e.compute(ve(e.inputs[0],"Cos","cos"))},_p=e=>{e.compute(ve(e.inputs[0],"Cosh","cosh"))},cr=e=>be(e),xp=(e,t)=>{let r=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Gr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,wp=e=>{let t=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Gr(t)))},$p=e=>{e.compute(ve(e.inputs[0],"Exp","exp"))},Ap=e=>{e.compute(ve(e.inputs[0],"Floor","floor"))},kp=e=>{let t=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Gr(t)))},Sp=(e,t)=>{let r=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Tp=e=>{e.compute(ve(e.inputs[0],"Not",t=>`!${t}`))},Ep=e=>{e.compute(ve(e.inputs[0],"Neg",t=>`-${t}`))},Ip=e=>{e.compute(ve(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},zp=e=>{let t=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},jp=e=>{e.compute(ve(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Cp=e=>be(e),Bp=(e,t)=>{let r=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Op=e=>{let t=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"HardSwish",r=>`${r} * max(vec4<${t}>(0.0), min(vec4<${t}>(1.0), vec4<${t}>(${t}(1.0 / 6.0)) * ${r} + vec4<${t}>(0.5)))`))},Dp=e=>{e.compute(ve(e.inputs[0],"Sin","sin"))},Mp=e=>{e.compute(ve(e.inputs[0],"Sinh","sinh"))},Rp=e=>{e.compute(ve(e.inputs[0],"Sqrt","sqrt"))},Np=e=>{e.compute(ve(e.inputs[0],"Tan","tan"))},Gi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,qp=e=>{e.compute(ve(e.inputs[0],"Tanh",Gi))},jn=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Gi("v")};
}
`,Cn=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Pp=e=>{let t=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"FastGelu",Cn,jn(t),void 0,e.inputs[0].dataType))},Up=(e,t)=>{let r=je(e.inputs[0].dataType);return e.compute(ve(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Lp=e=>{e.compute(ve(e.inputs[0],"Log","log"))},Au=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,ku=e=>`quick_gelu_impl(${e})`,Fp=(e,t)=>{let r=je(e.inputs[0].dataType);e.compute(ve(e.inputs[0],"QuickGelu",ku,Au(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Su,Tu,Gp,Sg=U(()=>{"use strict";oe(),ue(),ia(),Su=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Tu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=D("input",e[0].dataType,e[0].dims,4),i=D("bias",e[0].dataType,[e[0].dims[2]],4),n=Z("output",e[0].dataType,t,4),a=B.size(t)/4,s=Ce(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,n)}

  ${Gr(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(a)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${n.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Gp=e=>{Su(e.inputs),e.compute(Tu(e.inputs))}}),Eu,Iu,Ke,Wp,Vp,Hp,Kp,Xp,Zp,Qp,Yp,Jp,ec,Tg=U(()=>{"use strict";ne(),oe(),ue(),Eu=(e,t,r,i,n,a,s,u,l,p,c,f)=>{let g,b;typeof u=="string"?g=b=(y,S)=>`${u}((${y}),(${S}))`:typeof u=="function"?g=b=u:(g=u.scalar,b=u.vector);let v=Z("outputData",c,i.length,4),_=D("aData",l,t.length,4),A=D("bData",p,r.length,4),$;if(n)if(a){let y=B.size(t)===1,S=B.size(r)===1,k=t.length>0&&t[t.length-1]%4===0,T=r.length>0&&r[r.length-1]%4===0;y||S?$=v.setByOffset("global_idx",b(y?`${_.type.value}(${_.getByOffset("0")}.x)`:_.getByOffset("global_idx"),S?`${A.type.value}(${A.getByOffset("0")}.x)`:A.getByOffset("global_idx"))):$=`
            let outputIndices = ${v.offsetToIndices("global_idx * 4u")};
            let offsetA = ${_.broadcastedIndicesToOffset("outputIndices",v)};
            let offsetB = ${A.broadcastedIndicesToOffset("outputIndices",v)};
            ${v.setByOffset("global_idx",b(s||k?_.getByOffset("offsetA / 4u"):`${_.type.value}(${_.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||T?A.getByOffset("offsetB / 4u"):`${A.type.value}(${A.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else $=v.setByOffset("global_idx",b(_.getByOffset("global_idx"),A.getByOffset("global_idx")));else{if(!a)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let y=(S,k,T="")=>{let I=`aData[indexA${k}][componentA${k}]`,z=`bData[indexB${k}][componentB${k}]`;return`
            let outputIndices${k} = ${v.offsetToIndices(`global_idx * 4u + ${k}u`)};
            let offsetA${k} = ${_.broadcastedIndicesToOffset(`outputIndices${k}`,v)};
            let offsetB${k} = ${A.broadcastedIndicesToOffset(`outputIndices${k}`,v)};
            let indexA${k} = offsetA${k} / 4u;
            let indexB${k} = offsetB${k} / 4u;
            let componentA${k} = offsetA${k} % 4u;
            let componentB${k} = offsetB${k} % 4u;
            ${S}[${k}] = ${T}(${g(I,z)});
          `};c===9?$=`
            var data = vec4<u32>(0);
            ${y("data",0,"u32")}
            ${y("data",1,"u32")}
            ${y("data",2,"u32")}
            ${y("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:$=`
            ${y("outputData[global_idx]",0)}
            ${y("outputData[global_idx]",1)}
            ${y("outputData[global_idx]",2)}
            ${y("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(_,A,v)}

        ${f??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${$}
      }`},Iu=(e,t,r,i,n,a,s=r.dataType)=>{let u=r.dims.map(Number),l=i.dims.map(Number),p=!B.areEqual(u,l),c=u,f=B.size(u),g=!1,b=!1,v=[p];if(p){let _=Vt.calcShape(u,l,!1);if(!_)throw new Error("Can't perform binary op on the given tensors");c=_.slice(),f=B.size(c);let A=B.size(u)===1,$=B.size(l)===1,y=u.length>0&&u[u.length-1]%4===0,S=l.length>0&&l[l.length-1]%4===0;v.push(A),v.push($),v.push(y),v.push(S);let k=1;for(let T=1;T<c.length;T++){let I=u[u.length-T],z=l[l.length-T];if(I===z)k*=I;else break}k%4===0?(b=!0,g=!0):(A||$||y||S)&&(g=!0)}else g=!0;return v.push(g),{name:e,shaderCache:{hint:t+v.map(_=>_.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:_=>Eu(_,u,l,c,g,p,b,n,r.dataType,i.dataType,s,a),getRunData:()=>({outputs:[{dims:c,dataType:s}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(B.size(c)/4)},...ee(u,l,c)]})}},Ke=(e,t,r,i,n,a)=>{e.compute(Iu(t,n??"",e.inputs[0],e.inputs[1],r,i,a))},Wp=e=>{Ke(e,"Add",(t,r)=>`${t}+${r}`)},Vp=e=>{Ke(e,"Div",(t,r)=>`${t}/${r}`)},Hp=e=>{Ke(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Kp=e=>{Ke(e,"Mul",(t,r)=>`${t}*${r}`)},Xp=e=>{let t=D("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ke(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Zp=e=>{Ke(e,"Sub",(t,r)=>`${t}-${r}`)},Qp=e=>{Ke(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Yp=e=>{Ke(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Jp=e=>{Ke(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},ec=e=>{Ke(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),zu,ju,Cu,Bu,tc,rc,Eg=U(()=>{"use strict";ne(),oe(),Se(),ue(),zu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],n=i.dataType,a=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==n)throw new Error("input tensors should be one type");if(s.dims.length!==a)throw new Error("input tensors should have the same shape");s.dims.forEach((l,p)=>{if(p!==t&&l!==i.dims[p])throw new Error("non concat dimensions must match")})}})},ju=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,Cu=(e,t)=>{let r=e.length,i=[];for(let n=0;n<r;++n){let a=t.setByOffset("global_idx",e[n].getByIndices("indices"));r===1?i.push(a):n===0?i.push(`if (inputIndex == ${n}u) { ${a} }`):n===r-1?i.push(`else { ${a} }`):i.push(`else if (inputIndex == ${n}) { ${a} }`)}return i.join(`
`)},Bu=(e,t,r,i)=>{let n=B.size(r),a=new Array(e.length),s=new Array(e.length),u=0,l=[],p=[],c=[{type:12,data:n}];for(let _=0;_<e.length;++_)u+=e[_].dims[t],a[_]=u,p.push(e[_].dims.length),s[_]=D(`input${_}`,i,p[_]),l.push("rank"),c.push({type:12,data:a[_]});for(let _=0;_<e.length;++_)c.push(...ee(e[_].dims));c.push(...ee(r));let f=Z("output",i,r.length),g=f.indicesGet("indices",t),b=Array.from(Array(a.length).keys()).map(_=>`uniforms.sizeInConcatAxis${_}`).join(","),v=_=>`

  ${(()=>{_.registerUniform("outputSize","u32");for(let A=0;A<e.length;A++)_.registerUniform(`sizeInConcatAxis${A}`,"u32");return _.declareVariables(...s,f)})()}

  ${ju(a.length,b)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${f.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${a.length}u>(${b});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${Cu(s,f)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:c}),getShaderSource:v}},tc=(e,t)=>{let r=e.inputs,i=r[0].dims,n=B.normalizeAxis(t.axis,i.length);zu(r,n);let a=i.slice();a[n]=r.reduce((u,l)=>u+(l.dims.length>n?l.dims[n]:0),0);let s=r.filter(u=>B.size(u.dims)>0);e.compute(Bu(s,n,a,r[0].dataType),{inputs:s})},rc=e=>be({axis:e.axis})}),Ot,Dt,Mt,na,Nt=U(()=>{"use strict";ne(),oe(),Ot=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Dt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Mt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},na=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[T0,E0];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Oe,ic,aa=U(()=>{"use strict";Oe=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},ic=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),nc,Ig=U(()=>{"use strict";nc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),hr,sa,oa=U(()=>{"use strict";ne(),oe(),ue(),Nt(),hr=(e,t,r,i,n)=>{let a=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Q(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Q(n,u+a,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},sa=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,u=e[1].dims,l=s[s.length-2],p=u[u.length-1],c=s[s.length-1],f=ke(p),g=ke(c),b=ke(l),v=B.size(r)/f/b,_=e.length>2,A=i?i.slice(0,-2):r.slice(0,-2),$=[B.size(A),l,p],y=[{type:12,data:v},{type:12,data:l},{type:12,data:p},{type:12,data:c}];Dt(t,y),y.push(...ee(A,s,u)),_&&y.push(...ee(e[2].dims)),y.push(...ee($));let S=k=>{let T=ea("batch_dims",e[0].dataType,A.length),I=D("a",e[0].dataType,s.length,g),z=D("b",e[1].dataType,u.length,f),w=Z("output",e[0].dataType,$.length,f),O=Ce(w.type.tensor),M=Ot(t,w.type.value,O),F=[I,z],G="";if(_){let N=n?f:1;F.push(D("bias",e[2].dataType,e[2].dims.length,N)),G=`${n?`value += bias[col / ${N}];`:`value += ${w.type.value}(bias[row + i]);`}`}let L=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Mt(t,L);let C=()=>{let N=`var a_data: ${I.type.value};`;for(let V=0;V<g;V++)N+=`
              let b_data${V} = b[(b_offset + (k + ${V}) * uniforms.N + col) / ${f}];`;for(let V=0;V<b;V++){N+=`a_data = a[(a_offset + (row + ${V}) * uniforms.K + k) / ${g}];`;for(let X=0;X<g;X++)N+=`
            values[${V}] = fma(${z.type.value}(a_data${g===1?"":`[${X}]`}), b_data${X}, values[${V}]);
`}return N};return`
  ${k.registerUniforms(L).registerInternalVariables(T).declareVariables(...F,w)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${f})) * ${f};
    var index1 = global_idx / (uniforms.N / ${f});
    let stride1 = uniforms.M / ${b};
    let row = (index1 % stride1) * ${b};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${T.offsetToIndices("batch")};`}

    var a_indices: ${I.type.indices};
    ${hr("a_indices",I,I.rank-2,T.rank,"batch_indices")}
    ${I.indicesSet("a_indices",I.rank-2,0)}
    ${I.indicesSet("a_indices",I.rank-1,0)}
    let a_offset = ${I.indicesToOffset("a_indices")};

    var b_indices: ${z.type.indices};
    ${hr("b_indices",z,z.rank-2,T.rank,"batch_indices")}
    ${z.indicesSet("b_indices",z.rank-2,0)}
    ${z.indicesSet("b_indices",z.rank-1,0)}
    let b_offset = ${z.indicesToOffset("b_indices")};
    var values: array<${w.type.value}, ${b}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${C()}
    }
    for (var i = 0u; i < ${b}u; i++) {
      var value = values[i];
      ${G}
      ${M}
      let cur_indices = ${w.type.indices}(batch, row + i, col);
      let offset = ${w.indicesToOffset("cur_indices")};
      ${w.setByOffset(`offset / ${f}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${f};${g};${b};${n}`,inputDependencies:_?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:y}),getShaderSource:S}}}),Ou,Du,Bn,Wi,Mu,On,Ru,Zr,ua=U(()=>{"use strict";ne(),oe(),ue(),Nt(),oa(),aa(),Ou=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Du=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Bn=(e,t,r="f32",i,n=!1,a=32,s=!1,u=32)=>{let l=t[1]*e[1],p=t[0]*e[0],c=n?l:a,f=n?a:l,g=c/t[0],b=a/t[1];if(!((n&&g===4&&e[1]===4||!n&&(g===3||g===4))&&c%t[0]===0&&a%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${n} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}. tileInner ${a} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${c/g}>, ${f}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${a}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(u/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${b};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Ou(n,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Du(n,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Wi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Mu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",On=(e,t,r="f32",i,n=!1,a=32,s=!1,u=32,l=!1)=>{let p=e[1]*t[1],c=e[0]*t[0],f=n?p:a,g=n?a:p;if(!(g%t[1]===0&&f%t[0]===0&&a%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}, tileInner ${a} must be divisible by workgroupSize[1]${t[1]}`);let b=g/t[1],v=f/t[0],_=a/t[1],A=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${c};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          ${Wi(n,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${a}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${n?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${b};
let tileColA = i32(localId.x) * ${v};
let tileRowB = i32(localId.y) * ${_};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${v}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Wi(n,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Mu(n)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${f}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${c}>, ${a}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${A}
  }
`},Ru=(e,t,r,i,n=!1)=>{let[a,s,u,l]=i,p=Ce(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,p)} {
      var value = ${Oe(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${hr("aIndices",s,s.rank-2,a.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,p)} {
      var value = ${Oe(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${hr("bIndices",u,u.rank-2,a.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Oe(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${n?"bias[colIn]":`${Oe(e,p)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Zr=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,u=e[1].dims,l=s.slice(0,-2),p=u.slice(0,-2),c=i?i.slice(0,-2):r.slice(0,-2),f=B.size(c),g=s[s.length-2],b=s[s.length-1],v=u[u.length-1],_=b%4===0&&v%4===0,A=g<=8?[4,1,1]:[4,4,1],$=[8,8,1],y=[Math.ceil(v/$[0]/A[0]),Math.ceil(g/$[1]/A[1]),Math.ceil(f/$[2]/A[2])],S=_?4:1,k=[...l,g,b/S],T=k.length,I=[...p,b,v/S],z=I.length,w=[f,g,v/S],O=[{type:6,data:g},{type:6,data:v},{type:6,data:b}];Dt(t,O),O.push(...ee(c,k,I));let M=["rank","rank"],F=e.length>2;F&&(O.push(...ee(e[2].dims)),M.push("rank")),O.push(...ee(w));let G=L=>{let C=c.length,N=ea("batchDims",e[0].dataType,C,1),V=Ce(e[0].dataType),X=D("a",e[0].dataType,T,S),te=D("b",e[1].dataType,z,S),re=Z("result",e[0].dataType,w.length,S),ae=[X,te];if(F){let Te=n?S:1;ae.push(D("bias",e[2].dataType,e[2].dims.length,Te))}let q=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Mt(t,q);let J=Ce(re.type.tensor),Y=Ot(t,re.type.value,J),H=Ru(S,F,Y,[N,X,te,re],n);return`
  ${L.registerUniforms(q).registerInternalVariables(N).declareVariables(...ae,re)}
  ${H}
  ${_?Bn(A,$,V,N):On(A,$,V,N)}
                   `};return{name:"MatMul",shaderCache:{hint:`${A};${t.activation};${_};${n}`,inputDependencies:M},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:y[0],y:y[1],z:y[2]},programUniforms:O}),getShaderSource:G}}}),Nu,ac,zg=U(()=>{"use strict";ne(),ut(),ue(),Nt(),aa(),Ig(),ua(),Nu=(e,t,r,i,n=!1,a,s=4,u=4,l=4,p="f32")=>{let c=O=>{switch(O){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${O} is not supported.`)}},f=O=>{switch(O){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${O} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,b=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,v=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",_=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",A=e?"row":"col",$=e?"col":"row",y=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${A} / outWidth;
    let outCol = ${A} % outWidth;

    let WRow = ${$} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${$} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${$} % inChannels;
    var resData = ${Oe(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${v} && xCol >= 0 && xCol < ${_}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${c(s)}
    }
    return resData;`,S=e?t&&i?`
    let col = colIn * ${s};
    ${y}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${y}
    }
    return ${Oe(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${y}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${y}
    }
    return ${Oe(s,p)}(0.0);`,k=e?i&&r?f(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${f(u)}
    }
    return ${Oe(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${f(u)}
    }
    return ${Oe(u,p)}(0.0);`,T=Oe(l,p),I=Oe(e?s:u,p),z=Oe(e?u:s,p),w=Ot(a,T,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${I} {
      ${e?S:k}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${z} {
      ${e?k:S}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${T}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${b}
      ${ic(n)}
      ${w}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},ac=(e,t,r,i,n,a,s,u,l)=>{let p=t.format==="NHWC",c=p?e[0].dims[3]:e[0].dims[1],f=r[0],g=p?r[2]:r[3],b=p?r[1]:r[2],v=p?r[3]:r[1],_=p&&(c%4===0||c%3===0)&&v%4===0,A=p?v:g*b,$=p?g*b:v,y=[8,8,1],S=i<=8?[4,1,1]:[4,4,1],k=[Math.ceil(A/y[0]/S[0]),Math.ceil($/y[1]/S[1]),Math.ceil(f/y[2]/S[2])];he("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${k}`);let T=_?p&&c%4!==0?3:4:1,I=y[1]*S[1],z=y[0]*S[0],w=Math.max(y[0]*T,y[1]),O=i%I===0,M=n%z===0,F=a%w===0,G=_?[T,4,4]:[1,1,1],L=[{type:6,data:i},{type:6,data:n},{type:6,data:a},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Dt(t,L),L.push(...ee(e[0].dims,e[1].dims));let C=["rank","rank"];s&&(L.push(...ee(e[2].dims)),C.push("rank")),L.push(...ee(r));let N=V=>{let X=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Mt(t,X);let te=_?4:1,re=Ce(e[0].dataType),ae=`
      fn setOutputAtIndex(flatIndex : i32, value : ${_?`vec4<${re}>`:re}) {
        result[flatIndex] = ${_?`vec4<${re}>`:re}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${_?`vec4<${re}>`:re}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${_?"/ 4":""}, value);
      }`,q=D("x",e[0].dataType,e[0].dims.length,T===3?1:T),J=D("w",e[1].dataType,e[1].dims.length,te),Y=[q,J],H=Z("result",e[0].dataType,r.length,te);if(s){let Te=D("bias",e[2].dataType,e[2].dims.length,te);Y.push(Te),ae+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${_?`vec4<${re}>`:re} {
          return bias[coords.${p?"w":"y"}${_?"/ 4":""}];
        }`}return`
        ${nc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${V.registerUniforms(X).declareVariables(...Y,H)}
        ${ae}
        ${Nu(p,O,M,F,s,t,G[0],G[1],G[2],re)}
        ${_?Bn(S,y,re,void 0,!p,w):On(S,y,re,void 0,!p,w,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${T};${_};${O};${M};${F};${I};${z};${w}`,inputDependencies:C},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:k[0],y:k[1],z:k[2]},programUniforms:L}),getShaderSource:N}}}),qu,Vi,nr,Pu,Hi,Uu,sc,oc,jg=U(()=>{"use strict";ne(),ut(),oe(),ue(),Nt(),aa(),qu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Vi=e=>typeof e=="number"?[e,e,e]:e,nr=(e,t)=>t<=1?e:e+(e-1)*(t-1),Pu=(e,t,r,i=1)=>{let n=nr(t,i);return Math.floor((e[0]*(r-1)-r+n)/2)},Hi=(e,t,r,i,n)=>{n==null&&(n=Pu(e,t[0],i[0]));let a=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*n>=t[s]&&(a[s]=Math.trunc((e[s]-t[s]+2*n)/i[s]+1));return a},Uu=(e,t,r,i,n,a,s,u,l,p)=>{let c,f,g,b;if(e==="VALID"&&(e=0),typeof e=="number"){c={top:e,bottom:e,left:e,right:e,front:e,back:e};let v=Hi([t,r,i,1],[u,l,p],1,[n,a,s],e);f=v[0],g=v[1],b=v[2]}else if(Array.isArray(e)){if(!e.every((_,A,$)=>_===$[0]))throw Error(`Unsupported padding parameter: ${e}`);c={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let v=Hi([t,r,i,1],[u,l,p],1,[n,a,s],e[0]);f=v[0],g=v[1],b=v[2]}else if(e==="SAME_UPPER"){f=Math.ceil(t/n),g=Math.ceil(r/a),b=Math.ceil(i/s);let v=(f-1)*n+u-t,_=(g-1)*a+l-r,A=(b-1)*s+p-i,$=Math.floor(v/2),y=v-$,S=Math.floor(_/2),k=_-S,T=Math.floor(A/2),I=A-T;c={top:S,bottom:k,left:T,right:I,front:$,back:y}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:c,outDepth:f,outHeight:g,outWidth:b}},sc=(e,t,r,i,n,a=!1,s="channelsLast")=>{let u,l,p,c,f;if(s==="channelsLast")[u,l,p,c,f]=e;else if(s==="channelsFirst")[u,f,l,p,c]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,b,v,_]=t,[A,$,y]=Vi(r),[S,k,T]=Vi(i),I=nr(b,S),z=nr(v,k),w=nr(_,T),{padInfo:O,outDepth:M,outHeight:F,outWidth:G}=Uu(n,l,p,c,A,$,y,I,z,w),L=a?g*f:g,C=[0,0,0,0,0];return s==="channelsFirst"?C=[u,L,M,F,G]:s==="channelsLast"&&(C=[u,M,F,G,L]),{batchSize:u,dataFormat:s,inDepth:l,inHeight:p,inWidth:c,inChannels:f,outDepth:M,outHeight:F,outWidth:G,outChannels:L,padInfo:O,strideDepth:A,strideHeight:$,strideWidth:y,filterDepth:b,filterHeight:v,filterWidth:_,effectiveFilterDepth:I,effectiveFilterHeight:z,effectiveFilterWidth:w,dilationDepth:S,dilationHeight:k,dilationWidth:T,inShape:e,outShape:C,filterShape:t}},oc=(e,t,r,i,n,a)=>{let s=a==="channelsLast",u=s?e[0].dims[3]:e[0].dims[1],l=!1,p=[64,1,1],c={x:r.map((y,S)=>S)},f=[Math.ceil(qu(c.x.map(y=>r[y]))/p[0]),1,1];he("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${f}`);let g=l?s&&u%4!==0?3:4:1,b=B.size(r),v=[{type:12,data:b},{type:12,data:i},{type:12,data:n},{type:12,data:t.strides},{type:12,data:t.dilations}];Dt(t,v),v.push(...ee(e[0].dims,e[1].dims));let _=["rank","rank"],A=e.length===3;A&&(v.push(...ee(e[2].dims)),_.push("rank")),v.push(...ee(r));let $=y=>{let S=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:n.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Mt(t,S);let k=l?4:1,T=Ce(e[0].dataType),I=D("x",e[0].dataType,e[0].dims.length,g===3?1:g),z=D("W",e[1].dataType,e[1].dims.length,k),w=[I,z],O=Z("result",e[0].dataType,r.length,k),M="";if(A){let L=D("bias",e[2].dataType,e[2].dims.length,k);w.push(L),M+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${l?`vec4<${T}>`:T} {
          return bias[${s?Q("coords",4,5):Q("coords",1,5)}${l?"/ 4":""}];
        }`}let F=Oe(g,T),G=Ot(t,F,T);return`
            ${M}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${T} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${I.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${T} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${z.getByIndices("aIndices")};
            }
          ${y.registerUniforms(S).declareVariables(...w,O)}
          ${y.mainStart()}
          ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${O.offsetToIndices("global_idx")};
              let batch = ${Q("coords",0,I.rank)};
              let d2 = ${s?Q("coords",I.rank-1,I.rank):Q("coords",1,I.rank)};
              let xFRCCorner = vec3<u32>(${s?Q("coords",1,I.rank):Q("coords",2,I.rank)},
              ${s?Q("coords",2,I.rank):Q("coords",3,I.rank)},
              ${s?Q("coords",3,I.rank):Q("coords",4,I.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Q("uniforms.x_shape",1,I.rank):Q("uniforms.x_shape",2,I.rank)};
              let xShapeZ = ${s?Q("uniforms.x_shape",2,I.rank):Q("uniforms.x_shape",3,I.rank)};
              let xShapeW = ${s?Q("uniforms.x_shape",3,I.rank):Q("uniforms.x_shape",4,I.rank)};
              let xShapeU = ${s?Q("uniforms.x_shape",4,I.rank):Q("uniforms.x_shape",1,I.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = ${T}(0);
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<${T}>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<${T}>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<${T}>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<${T}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<${T}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<${T}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<${T}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<${T}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<${T}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${A?"value = value + getBiasByOutputCoords(coords)":""};
              ${G}
              result[global_idx] = ${T}(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${g};${A}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:f[0],y:f[1],z:f[2]},programUniforms:v}),getShaderSource:$}}}),uc,lc,Cg=U(()=>{"use strict";ne(),oe(),ue(),Nt(),uc=(e,t,r,i)=>{let n=e.length>2,a=n?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,l=t.format==="NHWC",p=l?r[3]:r[1],c=p/t.group,f=l&&c>=4?ke(p):1,g=B.size(r)/f,b=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:c}];Dt(t,b),b.push(...ee(s,[u[0],u[1],u[2],u[3]/f]));let v=n?["rank","rank","rank"]:["rank","rank"];b.push(...ee([r[0],r[1],r[2],r[3]/f]));let _=A=>{let $=Z("output",e[0].dataType,r.length,f),y=Ce($.type.tensor),S=Ot(t,$.type.value,y),k=D("x",e[0].dataType,s.length),T=D("w",e[1].dataType,u.length,f),I=[k,T];n&&I.push(D("b",e[2].dataType,e[2].dims,f));let z=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Mt(t,z);let w=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${k.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${T.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${k.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${T.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${A.registerUniforms(z).declareVariables(...I,$)}

  ${A.mainStart()}
    ${A.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${$.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${f} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${$.type.value} = ${$.type.value}(0);
    ${w}
    ${a}
    ${S}
    ${$.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${f}`,inputDependencies:v},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:b}),getShaderSource:_}},lc=(e,t,r,i)=>{let n=e.length>2,a=ke(r[3]),s=ke(r[2]),u=B.size(r)/a/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/a],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/a],c=[r[0],r[1],r[2],r[3]/a],f=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Dt(t,f),f.push(...ee(l,p,c));let g=(s-1)*t.strides[1]+p[1],b=v=>{let _=Z("output",e[0].dataType,c.length,a),A=Ce(_.type.tensor),$=Ot(t,_.type.value,A),y=D("x",e[0].dataType,l.length,a),S=D("w",e[1].dataType,p.length,a),k=[y,S];n&&k.push(D("b",e[2].dataType,e[2].dims,a));let T=n?"value += b[output_channel];":"",I=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Mt(t,I),`
  ${v.registerUniforms(I).declareVariables(...k,_)}
  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${y.type.value}, ${g}>;
    var values: array<${_.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${y.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${y.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${S.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${T}
      ${$}
      ${_.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${a};${s};${g};${p[0]};${p[1]}`,inputDependencies:n?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:f}),getShaderSource:b}}}),Lu,Mr,Fu,Rr,Dn,Ki,Gu,Wu,Mn,Bg=U(()=>{"use strict";oe(),zg(),jg(),ua(),Cg(),Nt(),oa(),_t(),Lu=(e,t,r,i,n,a)=>{let s=e[0],u=e.slice(a?1:2,a?3:4),l=u.length,p=t[0],c=t.slice(2).map((g,b)=>g+(g-1)*(r[b]-1)),f=u.map((g,b)=>g+i[b]+i[b+l]).map((g,b)=>Math.floor((g-c[b]+n[b])/n[b]));return f.splice(0,0,s),f.splice(a?3:1,0,p),f},Mr=[2,3,1,0],Fu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Rr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let a=2;a<t[1].dims.length;++a)r[a-2]===0&&(r[a-2]=t[1].dims[a]);let i=e.pads.slice();Kr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let n=Object.assign({},e);return Object.assign(n,{kernelShape:r,pads:i}),n},Dn=e=>{let t=na(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],n=e.dilations,a=e.group,s=e.kernel_shape,u=e.pads,l=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Ki=(e,t,r,i)=>{let n=r.format==="NHWC",a=Lu(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,n);if(r.group!==1){let I=[t[0]];if(n){let z=e.kernelCustomData.wT??e.compute(Ne(t[1],Mr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=z),I.push(z)}else I.push(t[1]);t.length===3&&I.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&n&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(lc(I,r,a,i),{inputs:I}):e.compute(uc(I,r,a,i),{inputs:I});return}let s=t.length===3,u=t[0].dims[n?1:2],l=t[0].dims[n?2:3],p=t[0].dims[n?3:1],c=t[1].dims[2],f=t[1].dims[3],g=a[n?1:2],b=a[n?2:3],v=a[n?3:1],_=n&&c===u&&f===l&&r.pads[0]===0&&r.pads[1]===0;if(_||c===1&&f===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let I=a[0],z,w,O,M=[];if(n){let L=e.kernelCustomData.wT??e.compute(Ne(t[1],Mr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=L),_){let C=u*l*p;z=t[0].reshape([1,I,C]),w=L.reshape([1,C,v]),O=[1,I,v]}else z=t[0].reshape([I,u*l,p]),w=L.reshape([1,p,v]),O=[I,g*b,v];M.push(z),M.push(w)}else z=t[0].reshape([I,p,u*l]),w=t[1].reshape([1,v,p]),O=[I,v,g*b],M.push(w),M.push(z);s&&M.push(t[2]);let F=O[2],G=M[0].dims[M[0].dims.length-1];F<8&&G<8?e.compute(sa(M,r,a,O,n,i),{inputs:M}):e.compute(Zr(M,r,a,O,n,i),{inputs:M});return}let A=!0,$=e.kernelCustomData.wT??e.compute(Ne(t[1],Mr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=$);let y=[t[0],$];s&&y.push(t[2]);let S=n?g*b:v,k=n?v:g*b,T=c*f*p;e.compute(ac(y,r,a,S,k,T,s,A,i),{inputs:y})},Gu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=[0,t.pads[0],0,t.pads[1]],a=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=Rr({...t,pads:n,strides:a,dilations:s,kernelShape:u},i);Ki(e,i,l,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Wu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",n=Rr(r,t),a=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=sc(t[0].dims,t[1].dims,r.strides,r.dilations,a,!1,i);e.compute(oc(t,n,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Mn=(e,t)=>{if(Fu(e.inputs,t),e.inputs[0].dims.length===3)Gu(e,t);else if(e.inputs[0].dims.length===5)Wu(e,e.inputs,t);else{let r=Rr(t,e.inputs);Ki(e,e.inputs,r)}}}),dc,Og=U(()=>{"use strict";ne(),ut(),oe(),ue(),dc=(e,t,r)=>{let i=e.length>2,n=t.outputShape,a=t.format==="NHWC",s=t.group,u=e[1].dims,l=u[2]/s,p=u[3],c=a?ke(l):1,f=a&&p===1&&l>=4,g=f?Math.floor(l/4)*4:Math.floor(l/c)*c,b=l-g,v=a?ke(p):1,_=a?p===1?c:v:1,A=B.size(n)/v,$=[Math.ceil(A/64),1,1];he("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${$}`);let y=["rank","rank"],S=[t.strides[0],t.strides[1]],k=[t.kernelShape[a?1:2],t.kernelShape[a?2:3]],T=[t.dilations[0],t.dilations[1]],I=[k[0]+(t.dilations[0]<=1?0:(t.kernelShape[a?1:2]-1)*(t.dilations[0]-1)),k[1]+(t.dilations[1]<=1?0:(t.kernelShape[a?2:3]-1)*(t.dilations[1]-1))],z=[I[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),I[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],w=[{type:12,data:A},{type:12,data:S},{type:12,data:k},{type:12,data:T},{type:12,data:I},{type:6,data:z},{type:12,data:g},{type:12,data:l},{type:12,data:p},...ee(e[0].dims,e[1].dims)];i&&(w.push(...ee(e[2].dims)),y.push("rank")),w.push(...ee(n));let O=M=>{let F=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:S.length},{name:"filter_dims",type:"u32",length:k.length},{name:"dilations",type:"u32",length:k.length},{name:"effective_filter_dims",type:"u32",length:I.length},{name:"pads",type:"i32",length:z.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],G=Ce(e[0].dataType),L=a?1:2,C=a?2:3,N=a?3:1,V=D("W",e[1].dataType,e[1].dims.length,_),X=D("Dy",e[0].dataType,e[0].dims.length,c),te=[X,V];i&&te.push(D("bias",e[2].dataType,[n[N]].length,v));let re=Z("result",e[0].dataType,n.length,v),ae=()=>{let Y="";if(f)c===4?Y+=`
        let xValue = ${X.getByOffset("x_offset")};
        let wValue = ${V.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:c===2?Y+=`
          dotProd = dotProd + dot(vec4<${G}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}), vec4<${G}>(${V.getByOffset("w_offset")}, ${V.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:c===1&&(Y+=`
          dotProd = dotProd + dot(vec4<${G}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}, ${X.getByOffset("x_offset + 2u")}, ${X.getByOffset("x_offset + 3u")}), vec4<${G}>(${V.getByOffset("w_offset")}, ${V.getByOffset("w_offset + 1u")}, ${V.getByOffset("w_offset + 2u")}, ${V.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(Y+=`
                  let xValue = ${a?X.getByOffset(`${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c}`):X.get("batch","inputChannel","idyR","idyC")};
        `,c===1)Y+=`
          let w_offset = ${V.indicesToOffset(`${V.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${V.getByOffset(`w_offset / ${_}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let H=0;H<c;H++)Y+=`
            let wValue${H} = ${V.getByOffset(`${V.indicesToOffset(`${V.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${H}, wOutChannel)`)} / ${_}`)};
            dotProd = dotProd + xValue[${H}] * wValue${H};`;return Y},q=()=>{if(b===0)return"";if(!f)throw new Error(`packInputAs4 ${f} is not true.`);let Y="";if(c===1){Y+="dotProd = dotProd";for(let H=0;H<b;H++)Y+=`
            + ${X.getByOffset(`x_offset + ${H}`)} * ${V.getByOffset(`w_offset + ${H}`)}`;Y+=";"}else if(c===2){if(b!==2)throw new Error(`Invalid inputChannelsRemainder ${b}.`);Y+=`
          let xValue = ${X.getByOffset("x_offset")};
          let wValue = ${V.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return Y},J=`
            let outputIndices = ${re.offsetToIndices(`global_idx * ${v}`)};
            let batch = ${re.indicesGet("outputIndices",0)};
            let d1 = ${re.indicesGet("outputIndices",N)};
            let r = ${re.indicesGet("outputIndices",L)};
            let c = ${re.indicesGet("outputIndices",C)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${re.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${G}(dyRCorner) + ${G}(wR)) / ${G}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${G}(uniforms.Dy_shape[${L}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${G}(dyCCorner) + ${G}(wC)) / ${G}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${G}(uniforms.Dy_shape[${C}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${f?`
                var x_offset = ${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c};
                var w_offset = ${V.indicesToOffset(`${V.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${_};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${f?4:c}) {
                  ${ae()}
                  inputChannel = inputChannel + ${f?4:c};
                }
                ${q()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${v}]`:""};
            ${re.setByOffset("global_idx","value")};
          `;return`
    ${M.registerUniforms(F).declareVariables(...te,re)}
      ${M.mainStart()}
      ${M.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${J}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${c}${_}${v}${f}${b}`,inputDependencies:y},getRunData:()=>({dispatchGroup:{x:$[0],y:$[1],z:$[2]},outputs:[{dims:r?r(n):n,dataType:e[0].dataType}],programUniforms:w}),getShaderSource:O}}}),Vu,Hu,Ku,Xi,pc,Xu,Zi,Zu,cc,Dg=U(()=>{"use strict";Og(),Nt(),_t(),Vu=(e,t,r,i,n,a)=>(e-1)*t+r+(i-1)*n+1-a,Hu=(e,t,r,i,n)=>{let a=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=a,r[n]=e-a):t==="SAME_LOWER"&&(r[i]=e-a,r[n]=a)},Ku=(e,t,r,i,n,a,s,u,l,p)=>{let c=e.length-2,f=p.length===0;l.length<c&&l.push(...Array(c-l.length).fill(0));let g=e[0],b=t[u?3:1]*n;for(let v=0,_=e.length-c-(u?1:0);v<c;++v,++_){let A=e[_],$=f?A*s[v]:p[v],y=Vu(A,s[v],a[v],t[_],r[v],$);Hu(y,i,a,v,v+c),f&&p.push(s[v]*(A-1)+l[v]+(t[_]-1)*r[v]+1-a[v]-a[v+c])}p.splice(0,0,g),p.splice(u?3:1,0,b)},Xi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((f,g)=>f*g,1)===0){r.length=0;for(let f=2;f<t[1].dims.length;++f)r.push(t[1].dims[f])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let n=e.pads.slice(),a=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;l=new Array(f).fill(1)}let p=e.strides.slice();if(p.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;p=new Array(f).fill(1)}Ku(u,r,l,e.autoPad,e.group,n,p,i,s,a);let c=Object.assign({},e);return Object.assign(c,{kernelShape:r,pads:n,outputPadding:s,outputShape:a,dilations:l,strides:p}),c},pc=e=>{let t=na(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],n=e.dilations,a=e.group??1,s=e.kernelShape,u=e.pads,l=e.strides,p=e.wIsConst(),c=e.outputPadding,f=e.outputShape;return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,outputPadding:c,outputShape:f,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Xu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let n=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==n))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.outputPadding.length!==a&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${a}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Zi=(e,t,r,i)=>{let n=e.kernelCustomData.wT??e.compute(Ne(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=n);let a=[t[0],n];t.length===3&&a.push(t[2]),e.compute(dc(a,r,i),{inputs:a})},Zu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=t.kernelShape;(n.length===0||n[0]===0)&&(n=[e.inputs[1].dims[2]]);let a=t.dilations;(a.length===0||a[0]===0)&&(a=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),a=[1].concat(a),n=[1].concat(n);let l=t.outputPadding;l=[0].concat(l);let p=Xi({...t,pads:u,strides:s,dilations:a,kernelShape:n,outputPadding:l},i);Zi(e,i,p,c=>r?[c[0],c[2],c[3]]:[c[0],c[1],c[3]])},cc=(e,t)=>{if(Xu(e.inputs,t),e.inputs[0].dims.length===3)Zu(e,t);else{let r=Xi(t,e.inputs);Zi(e,e.inputs,r)}}}),Qu,fc,hc,Mg=U(()=>{"use strict";ne(),oe(),Se(),ue(),Qu=(e,t,r,i)=>{let n=B.size(t),a=t.length,s=D("input",e,a),u=Z("output",e,a),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=B.normalizeAxis(l,a),c=f=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,b=Q("uniforms.input_shape","uniforms.axis",a),v=i.reverse?g+(i.exclusive?" + 1":""):"0",_=i.reverse?b:g+(i.exclusive?"":" + 1");return`
                ${f.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${f.mainStart()}
                  ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${v};
                  let last : i32 = ${_};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},{type:12,data:p},...ee(t,t)]}),getShaderSource:c}},fc=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,n=e.inputs[1];e.compute(Qu(i,r,n,t),{inputs:[0]})},hc=e=>{let t=e.exclusive===1,r=e.reverse===1;return be({exclusive:t,reverse:r})}}),Yu,Ju,el,mc,gc,Rg=U(()=>{"use strict";ne(),oe(),Se(),ue(),Yu=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Ju=(e,t,r,i)=>{let n=[];n.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let a=0;a<t;++a)n.push(r.indicesSet("a",e[a],`i[${a}]`));return n.push("return a;}"),n.join(`
`)},el=(e,t)=>{let r,i,n,a,s,u,l=t.format==="NHWC",p=t.blocksize,c=t.mode==="DCR";l?([r,i,n,a]=e.dims,s=c?[r,i,n,p,p,a/p**2]:[r,i,n,a/p**2,p,p],u=c?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,n,a]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=c?[r,p,p,a/p**2,i,n]:[r,a/p**2,p,p,i,n],u=c?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let f=e.reshape(s),g=f.dims.length,b=e.dataType,v=D("a",b,g),_=Z("output",b,g),A=$=>`
  ${$.registerUniform("output_size","u32").declareVariables(v,_)}

  ${Ju(u,g,v,_)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${_.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${_.setByOffset("global_idx",v.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:$=>{let y=l?[r,i*p,n*p,a/p**2]:[r,a/p**2,i*p,n*p],S=B.size(y),k=f.dims,T=B.sortBasedOnPerm(k,u);return{outputs:[{dims:y,dataType:$[0].dataType}],dispatchGroup:{x:Math.ceil(S/64)},programUniforms:[{type:12,data:S},...ee(k,T)]}},getShaderSource:A}},mc=(e,t)=>{Yu(e.inputs),e.compute(el(e.inputs[0],t))},gc=e=>be({blocksize:e.blocksize,mode:e.mode,format:e.format})}),at,ar,Nr,Qi,mt,tl,rl,il,Yi,Ji,en,nl,al,tn,sl,vc,bc,Ng=U(()=>{"use strict";ne(),oe(),Se(),ue(),at=256,ar=512,Nr=2*Math.PI,Qi=e=>{let t=[],r=e;for(let i of[4,2,3,5])for(;r%i===0;)t.push(i),r/=i;return r===1?t:void 0},mt=e=>{let t=e.toPrecision(9);return/[.eE]/.test(t)?t:`${t}.0`},tl=(e,t,r,i,n)=>{let a=r/e,s=ar-i,u=p=>`smem[${s}u + base + ${p*t}u]`,l=`  for (var t = local_idx; t < ${a}u; t += ${at}u) {
`;l+=`    let twiddleIndex = t % ${t}u;
    let angleUnit = f32(twiddleIndex);
`,l+=`    var leg: array<vec2<f32>, 5>;
`;for(let p=0;p<e;p++){let c=`${i}u + t + ${p*a}u`;if(p===0)l+=`    leg[0] = smem[${c}];
`;else{let f=n*Nr*p/(e*t);l+=`    { let a = ${mt(f)} * angleUnit; leg[${p}] = cmul(smem[${c}], vec2<f32>(cos(a), sin(a))); }
`}}if(l+=`    let base = (t / ${t}u) * ${t*e}u + twiddleIndex;
`,e===2)l+=`    ${u(0)} = leg[0] + leg[1];
    ${u(1)} = leg[0] - leg[1];
`;else if(e===4){let p=n<0?"vec2<f32>(oddDiff.y, -oddDiff.x)":"vec2<f32>(-oddDiff.y, oddDiff.x)";l+=`    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`,l+=`    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`,l+=`    let oddRot = ${p};
`,l+=`    ${u(0)} = evenSum + oddSum;
    ${u(1)} = evenDiff + oddRot;
`,l+=`    ${u(2)} = evenSum - oddSum;
    ${u(3)} = evenDiff - oddRot;
`}else for(let p=0;p<e;p++){let c=["leg[0]"];for(let f=1;f<e;f++){let g=n*Nr*(f*p)/e,b=mt(Math.cos(g)),v=mt(Math.sin(g));c.push(`vec2<f32>(leg[${f}].x*${b} - leg[${f}].y*${v}, leg[${f}].x*${v} + leg[${f}].y*${b})`)}l+=`    ${u(p)} = ${c.join(" + ")};
`}return`${l}  }
  workgroupBarrier();
`},rl=(e,t,r)=>{let i="",n=1,a=0;for(let s of e)i+=tl(s,n,t,a,r),n*=s,a=ar-a;return{code:i,resultOffset:a}},il=(e,t,r,i,n)=>{let a=e.dims,s=a.length,u=a[s-1],l=a[t],p=r&&i?(l-1)*2:l;n!==void 0&&(p=n);let c=r&&i?1:2,f=i&&!r?Math.floor(p/2)+1:p,g=a.slice();g[t]=f,g[s-1]=c;let b=1;for(let _=t+1;_<s-1;_++)b*=a[_];let v=B.size(a)/u/l;return{dataType:e.dataType,outputDims:g,length:p,signalLength:l,inner:b,batch:v,inputComponents:u,outputComponents:c,outputLength:f,inverse:r,onesided:i}},Yi=(e,t)=>[t,e.length,e.inputComponents,e.outputComponents,e.inverse,e.onesided].join(";"),Ji=e=>[{type:12,data:e.batch},{type:12,data:e.signalLength},{type:12,data:e.inner},{type:12,data:e.outputLength}],en=(e,t,r)=>e.registerUniform("batch","u32").registerUniform("signalLength","u32").registerUniform("inner","u32").registerUniform("outputLength","u32").declareVariables(t,r),nl=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,u=je(t),l=a?1:-1,p=a?1/r:1,c=Qi(r),f=g=>{let b=D("x",t,[1]),v=Z("y",t,[1]),_=T=>{let I=`inBase + (${T}) * uniforms.inner * ${i}u`,z=`f32(${b.getByOffset(I)})`,w=i===2?`f32(${b.getByOffset(`${I} + 1u`)})`:"0.0";return`vec2<f32>(${z}, ${w})`},A;if(a&&s){let T=Math.floor(r/2)+1,I=r%2===0?`select(provided, provided - 1u, provided == ${T}u)`:"provided";A=`
    let provided = min(uniforms.signalLength, ${T}u);
    for (var i = local_idx; i < ${r}u; i += ${at}u) {
      if (i < provided) { smem[i] = ${_("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${I}; k += ${at}u) {
      let h = smem[k];
      smem[${r}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`}else A=`
    let loadCount = min(uniforms.signalLength, ${r}u);
    for (var i = local_idx; i < ${r}u; i += ${at}u) {
      if (i < loadCount) { smem[i] = ${_("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;let{code:$,resultOffset:y}=rl(c,r,l),S=p===1?`smem[${y}u + i]`:`smem[${y}u + i] * ${mt(p)}`,k=n===2?v.setByOffset("off + 1u",`${u}(v.y)`):"";return`
  ${en(g,b,v)}
  var<workgroup> smem: array<vec2<f32>, ${2*ar}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${g.mainStart(at)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    ${A}
${$}    for (var i = local_idx; i < uniforms.outputLength; i += ${at}u) {
      let v = ${S};
      let off = outBase + i * uniforms.inner * ${n}u;
      ${v.setByOffset("off",`${u}(v.x)`)}
      ${k}
    }
  }`};return{name:"DFT",shaderCache:{hint:Yi(e,"fft"),inputDependencies:["type"]},getShaderSource:f,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:Ji(e),dispatchGroup:{x:e.batch}})}},al=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,u=je(t),l=a?1:-1,p=a?1/r:1,c=f=>{let g=D("x",t,[1]),b=Z("y",t,[1]),v=S=>{let k=`inBase + (${S}) * uniforms.inner * ${i}u`,T=`f32(${g.getByOffset(k)})`,I=i===2?`f32(${g.getByOffset(`${k} + 1u`)})`:"0.0";return`vec2<f32>(${T}, ${I})`},_=a&&s?`fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(r/2)+1}u);
    if (k < provided) { return ${v("k")}; }
    let m = ${r}u - k;
    if (m < provided) {
      let h = ${v("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }`:`fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${v("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`,A=`
      let angle = ${mt(l*Nr)} * f32(knMod) / ${mt(r)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${r}u) { knMod -= ${r}u; }`,$=n===2?b.setByOffset("off + 1u",`${u}(v.y)`):"",y=p===1?"acc":`acc * ${mt(p)}`;return`
  ${en(f,g,b)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${_}
  ${f.mainStart(at)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${at}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${r}u; n++) {${A}
      }
      let v = ${y};
      let off = outBase + k * uniforms.inner * ${n}u;
      ${b.setByOffset("off",`${u}(v.x)`)}
      ${$}
    }
  }`};return{name:"DFT",shaderCache:{hint:Yi(e,"direct"),inputDependencies:["type"]},getShaderSource:c,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:Ji(e),dispatchGroup:{x:e.batch}})}},tn=e=>{if(!e||e.dataType===0)return;if(B.size(e.dims)!==1)throw new Error("DFT optional scalar inputs must have exactly 1 element.");if(e.dataType===6)return e.getInt32Array()[0];let t=Number(e.getBigInt64Array()[0]);if(!Number.isSafeInteger(t))throw new Error("DFT optional scalar inputs are out of JavaScript safe integer range.");return t},sl=e=>{if(!e||e.length<1)throw new Error("DFT requires at least 1 input.");let t=e[0].dims;if(t.length<2)throw new Error("DFT input must have at least 2 dimensions.");let r=t[t.length-1];if(r!==1&&r!==2)throw new Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).")},vc=(e,t)=>{sl(e.inputs);let r=e.inputs[0],i=r.dims.length,n=t.inverse!==0,a=t.onesided!==0,s=tn(e.inputs[1]);if(s!==void 0&&s<=0)throw new Error("dft_length must be greater than zero.");let u=B.normalizeAxis(tn(e.inputs[2])??t.axis,i);if(u===i-1)throw new Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");if(n&&a&&r.dims[i-1]!==2)throw new Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");let l=il(r,u,n,a,s);if(l.length<=0)throw new Error(`Invalid DFT length: ${l.length}`);let p=l.length<=ar&&Qi(l.length)!==void 0?nl(l):al(l);e.compute(p,{inputs:[0]})},bc=e=>be({axis:e.axis??1,inverse:e.inverse??0,onesided:e.onesided??0})}),qr,sr,rn,ol,ul,ll,dl,nn,pl,yc,_c,qg=U(()=>{"use strict";ne(),oe(),Se(),ue(),qr="[a-zA-Z]|\\.\\.\\.",sr="("+qr+")+",rn="^"+sr+"$",ol="("+sr+",)*"+sr,ul="^"+ol+"$",ll=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},dl=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(ul)))throw new Error("Invalid LHS term");if(r.split(",").forEach((n,a)=>{let s=e[a].dims.slice();if(!n.match(RegExp(rn)))throw new Error("Invalid LHS term");let u=this.processTerm(n,!0,s,a);this.lhs.push(u)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,a])=>a.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(sr)))throw new Error("Invalid RHS");i.match(RegExp(qr,"g"))?.forEach(n=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let a=this.symbolToInfo.get(n);if(a===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(a.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let n=r.length,a=!1,s=[],u=0;if(!e.match(RegExp(rn))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(qr,"g")),p=new ll(i);return l?.forEach((c,f)=>{if(c==="..."){if(a)throw new Error("Only one ellipsis is allowed per input term");a=!0;let g=n-l.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let b=0;b<s.length;b++){let v=String.fromCharCode(48+b);p.addSymbol(v,f+b),this.addSymbol(v,r[u++],i)}}else p.addSymbol(c,f+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(c,r[u++],i)}),p}},nn=e=>e+"_max",pl=(e,t,r,i)=>{let n=e.map(p=>p.length).map((p,c)=>D(`input${c}`,t,p)),a=B.size(i),s=Z("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),l=p=>{let c=[],f="var prod = 1.0;",g="var sum = 0.0;",b="sum += prod;",v=[],_=[],A=[],$=[],y=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((k,T)=>{if(r.rhs.symbolToIndices.has(T)){let I=r.rhs.symbolToIndices.get(T)?.[0];I!==void 0&&r.lhs.forEach((z,w)=>{if(k.inputIndices.includes(w)){let O=z.symbolToIndices.get(T);if(O===void 0)throw new Error("Invalid symbol error");O.forEach(M=>{c.push(`${n[w].indicesSet(`input${w}Indices`,M,s.indicesGet("outputIndices",I))}`)})}})}else r.lhs.forEach((I,z)=>{if(k.inputIndices.includes(z)){let w=I.symbolToIndices.get(T);if(w===void 0)throw new Error("Invalid symbol error");w.forEach(O=>{v.push(`${n[z].indicesSet(`input${z}Indices`,O,`${T}`)}`)}),$.push(`prod *= ${n[z].getByIndices(`input${z}Indices`)};`)}}),_.push(`for(var ${T}: u32 = 0; ${T} < uniforms.${nn(T)}; ${T}++) {`),A.push("}")});let S=y?[...c,`let sum = ${n.map((k,T)=>k.getByIndices(`input${T}Indices`)).join(" * ")};`]:[...c,g,..._,...v,f,...$,b,...A];return`
            ${p.registerUniforms(u.map(k=>({name:`${nn(k)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...n,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${n.map((k,T)=>`var input${T}Indices: ${n[T].type.indices};`).join(`
`)}
            ${S.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(f=>r.symbolToInfo.has(f)).map(f=>({type:12,data:r.symbolToInfo.get(f)?.dimValue||0}));p.push({type:12,data:a});let c=e.map((f,g)=>[...ee(f)]).reduce((f,g)=>f.concat(g),p);return c.push(...ee(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:c}},getShaderSource:l}},yc=(e,t)=>{let r=new dl(e.inputs,t.equation),i=r.outputDims,n=e.inputs.map((a,s)=>a.dims);e.compute(pl(n,e.inputs[0].dataType,r,i))},_c=e=>{let t=e.equation.replace(/\s+/g,"");return be({equation:t})}}),cl,an,fl,hl,xc,Pg=U(()=>{"use strict";ne(),oe(),ue(),cl=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,n=t.length<r.length?0:t.length-r.length;for(;i<r.length&&n<t.length;++i,++n)if(r[i]!==t[n]&&r[i]!==1&&t[n]!==1)throw new Error("Expand requires shape to be broadcastable to input")},an=(e,t)=>{let r=e.length-t.length,i=[];for(let n=0;n<r;++n)i.push(e[n]);for(let n=0;n<t.length;++n)i.push(t[n]===1?e[n+r]:t[n]);return i},fl=(e,t)=>e.length>t.length?an(e,t):an(t,e),hl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=fl(t,r),n=e[0].dataType,a=n===9||B.size(t)===1,s=n===9||t.length>0&&t[t.length-1]%4===0?4:1,u=a||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(B.size(i)/u),p=f=>{let g=D("input",n,t.length,s),b=Z("output",n,i.length,u),v;if(n===9){let _=(A,$,y="")=>`
          let outputIndices${$} = ${b.offsetToIndices(`outputOffset + ${$}u`)};
          let offset${$} = ${g.broadcastedIndicesToOffset(`outputIndices${$}`,b)};
          let index${$} = offset${$} / 4u;
          let component${$} = offset${$} % 4u;
          ${A}[${$}] = ${y}(${g.getByOffset(`index${$}`)}[component${$}]);
        `;v=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${_("data",0,"u32")}
        ${_("data",1,"u32")}
        ${_("data",2,"u32")}
        ${_("data",3,"u32")}
        ${b.setByOffset("global_idx","data")}
      }`}else v=`
        let outputIndices = ${b.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",b)};
        let data = ${b.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${b.setByOffset("global_idx","data")}
      }`;return`
    ${f.registerUniform("vec_size","u32").declareVariables(g,b)}
    ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${v}`},c=[{type:12,data:l},...ee(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c})}},xc=e=>{cl(e.inputs),e.compute(hl(e.inputs),{inputs:[0]})}}),ml,wc,Ug=U(()=>{"use strict";ne(),oe(),ue(),ia(),ml=e=>{let t=e[0].dataType,r=B.size(e[0].dims),i=B.size(e[1].dims),n=i%4===0,a=s=>{let u=D("x",t,[1],4),l=D("bias",t,[1],4),p=Z("y",t,[1],4),c=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],f=b=>`
      let bias${b}_offset: u32 = (global_idx * 4 + ${b}) % uniforms.bias_size;
      let bias${b} = ${l.getByOffset(`bias${b}_offset / 4`)}[bias${b}_offset % 4];`,g=n?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${f(0)}${f(1)}${f(2)}${f(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(c).declareVariables(u,l,p)}

    ${jn(je(t))}

    ${s.mainStart(Ht)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",Cn("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${n}`,inputDependencies:["type","type"]},getShaderSource:a,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Ht/4)}})}},wc=e=>{e.inputs.length<2||B.size(e.inputs[1].dims)===0?Pp(e):e.compute(ml(e.inputs))}}),gl,vl,$c,Ac,Lg=U(()=>{"use strict";ne(),oe(),Se(),ue(),gl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},vl=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=B.normalizeAxis(t.axis,n),s=r.slice(0);s.splice(a,1,...i);let u=r[a],l=e[0].dataType===9?4:1,p=Math.ceil(B.size(s)/l),c=[{type:12,data:p},{type:6,data:u},{type:12,data:a},...ee(e[0].dims,e[1].dims,s)],f=g=>{let b=D("data",e[0].dataType,e[0].dims.length,l),v=D("inputIndices",e[1].dataType,e[1].dims.length),_=Z("output",e[0].dataType,s.length,l),A=y=>{let S=i.length,k=`var indicesIndices${y}  = ${v.type.indices}(0);`;for(let T=0;T<S;T++)k+=`${S>1?`indicesIndices${y}[${T}]`:`indicesIndices${y}`} = ${s.length>1?`outputIndices${y}[uniforms.axis + ${T}]`:`outputIndices${y}`};`;k+=`
          var idx${y} = ${v.getByIndices(`indicesIndices${y}`)};
          if (idx${y} < 0) {
            idx${y} = idx${y} + uniforms.axisDimLimit;
          }
          var dataIndices${y} : ${b.type.indices};
        `;for(let T=0,I=0;T<n;T++)T===a?(k+=`${n>1?`dataIndices${y}[${T}]`:`dataIndices${y}`} = u32(idx${y});`,I+=S):(k+=`${n>1?`dataIndices${y}[${T}]`:`dataIndices${y}`} = ${s.length>1?`outputIndices${y}[${I}]`:`outputIndices${y}`};`,I++);return k},$;if(e[0].dataType===9){let y=(S,k,T="")=>`
          let outputIndices${k} = ${_.offsetToIndices(`outputOffset + ${k}u`)};
          ${A(k)};
          let offset${k} = ${b.indicesToOffset(`dataIndices${k}`)};
          let index${k} = offset${k} / 4u;
          let component${k} = offset${k} % 4u;
          ${S}[${k}] = ${T}(${b.getByOffset(`index${k}`)}[component${k}]);
        `;$=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${y("value",0,"u32")}
        ${y("value",1,"u32")}
        ${y("value",2,"u32")}
        ${y("value",3,"u32")}
        ${_.setByOffset("global_idx","value")}
      `}else $=`
      let outputIndices = ${_.offsetToIndices("global_idx")};
      ${A("")};
      let value = ${b.getByIndices("dataIndices")};
      ${_.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(b,v,_)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${$}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:c}),getShaderSource:f}},$c=e=>be({axis:e.axis}),Ac=(e,t)=>{let r=e.inputs;gl(r),e.compute(vl(e.inputs,t))}}),bl,kc,Sc,Fg=U(()=>{"use strict";ne(),oe(),ue(),bl=(e,t,r,i,n,a,s,u,l)=>{let p=[{type:12,data:a},{type:12,data:i},{type:12,data:n},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:l}],c=[a];p.push(...ee(t.dims,c));let f=g=>{let b=D("indices_data",t.dataType,t.dims.length),v=Z("input_slice_offsets_data",12,1,1),_=[b,v],A=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:n.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(A).declareVariables(..._)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${n.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${n.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:c,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:p}),getShaderSource:f},{inputs:[t],outputs:[-1]})[0]},kc=(e,t)=>{let r=e.inputs,i=r[0].dims,n=r[0].dataType,a=r[1].dims,s=a[a.length-1],u=B.sizeToDimension(a,a.length-1),l=B.sizeFromDimension(i,t.batchDims+s),p=B.sizeToDimension(i,t.batchDims),c=B.sizeFromDimension(i,t.batchDims),f=u/p,g=new Array(s),b=l;for(let k=0;k<s;++k)g[s-1-k]=b,b*=i[t.batchDims+s-1-k];let v=bl(e,r[1],g,t.batchDims,i,u,f,c,s),_=t.batchDims+s;if(_>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let A=a.slice(0,-1).concat(i.slice(_)),$=B.size(A),y=[{type:12,data:$},{type:12,data:l},...ee(r[0].dims,v.dims,A)],S=k=>{let T=D("data",r[0].dataType,r[0].dims.length),I=D("slice_offsets",12,v.dims.length),z=Z("output",r[0].dataType,A.length);return`
          ${k.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(T,I,z)}
            ${k.mainStart()}
            ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:A,dataType:n}],dispatchGroup:{x:Math.ceil($/64)},programUniforms:y}),getShaderSource:S},{inputs:[r[0],v]})},Sc=e=>({batchDims:e.batch_dims,cacheKey:""})}),yl,_l,Tc,Ec,Gg=U(()=>{"use strict";ne(),oe(),Se(),ue(),yl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=B.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,n=e[0],a=e[2],s=e.length===4?e[3]:void 0;if(a.dims.length!==n.dims.length||!n.dims.map((u,l)=>l===r?Math.ceil(u/i)===a.dims[l]:u===a.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==n.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==a.dims.length||!s.dims.map((u,l)=>u===a.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},_l=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=B.normalizeAxis(t.gatherAxis,n),s=B.normalizeAxis(t.quantizeAxis,n),u=r.slice(0);u.splice(a,1,...i);let l=B.size(u),p=e[2].dataType,c=e[0].dataType===22,f=[{type:12,data:l},{type:12,data:s},{type:12,data:a},{type:12,data:t.blockSize},...ee(...e.map((b,v)=>b.dims),u)],g=b=>{let v=D("data",e[0].dataType,e[0].dims.length),_=D("inputIndices",e[1].dataType,e[1].dims.length),A=D("scales",e[2].dataType,e[2].dims.length),$=e.length>3?D("zeroPoint",e[3].dataType,e[3].dims.length):void 0,y=Z("output",p,u.length),S=[v,_,A];$&&S.push($);let k=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${b.registerUniforms(k).declareVariables(...S,y)}
        ${b.mainStart()}
        let output_indices = ${y.offsetToIndices("global_idx")};
        var indices_indices = ${_.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${y.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${_.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${y.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${v.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${y.indicesGet("output_indices","i")};
          ${v.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${_.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[a]};
        }
        ${v.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${y.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${v.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${v.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${v.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${A.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${A.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${A.getByIndices("scale_indices")};
        ${$?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${$.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${$.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${je(p)}(quantized_data - zero_point) * scale;
        ${y.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((b,v)=>v!==1).map(b=>b.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(b,v)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:f}),getShaderSource:g}},Tc=(e,t)=>{let r=e.inputs;yl(r,t),e.compute(_l(e.inputs,t))},Ec=e=>be({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),xl,wl,Ic,zc,Wg=U(()=>{"use strict";ne(),oe(),Se(),ue(),xl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},wl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,n=r.length,a=e[1].dims,s=e[1].dataType,u=B.normalizeAxis(t.axis,n),l=r[u],p=a.slice(0),c=B.size(p),f=D("input",i,n),g=D("indicesInput",s,a.length),b=Z("output",i,p.length),v=[{type:12,data:c},{type:6,data:l},{type:12,data:u}];return v.push(...ee(r,a,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:v}),getShaderSource:_=>`
      ${_.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(f,g,b)}
      ${_.mainStart()}
      ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${b.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${f.type.indices}(outputIndices);
      ${f.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${f.getByIndices("inputIndices")};

      ${b.setByOffset("global_idx","value")};
  }`}},Ic=e=>be({axis:e.axis}),zc=(e,t)=>{let r=e.inputs;xl(r),e.compute(wl(e.inputs,t))}}),$l,Al,jc,Cc,Vg=U(()=>{"use strict";ne(),oe(),ue(),$l=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Al=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[n,a,s]=S0.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[n,a];if(!u)throw new Error("Can't use gemm on the given tensors");let l=16,p=Math.ceil(a/l),c=Math.ceil(n/l),f=!0,g=B.size(u),b=[{type:12,data:f?p:g},{type:12,data:n},{type:12,data:a},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],v=["type","type"];e.length===3&&(b.push(...ee(e[2].dims)),v.push("rank")),b.push(...ee(u));let _=$=>{let y="";t.transA&&t.transB?y="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?y="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?y="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(y="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let S=t.alpha===1?"":"value *= uniforms.alpha;",k=D("a",e[0].dataType,e[0].dims),T=D("b",e[1].dataType,e[1].dims),I=k.type.value,z=null,w=[k,T];e.length===3&&(z=D("c",e[2].dataType,e[2].dims.length),w.push(z));let O=Z("output",e[0].dataType,u.length);w.push(O);let M=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${$.registerUniforms(M).declareVariables(...w)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${I}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${y}
    }

    ${S}
    ${z!=null?`let cOffset = ${z.broadcastedIndicesToOffset("vec2(m, n)",O)}; value += ${I}(uniforms.beta) * ${z.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},A=$=>{let y=D("a",e[0].dataType,e[0].dims),S=D("b",e[1].dataType,e[1].dims),k=null,T=[y,S];e.length===3&&(k=D("c",e[2].dataType,e[2].dims.length),T.push(k));let I=Z("output",e[0].dataType,u.length);T.push(I);let z=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],w="",O="";t.transA&&t.transB?(O=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,w="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(O=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,w="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(O=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,w="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(O=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,w="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let M=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${$.registerUniforms(z).declareVariables(...T)}
  var<workgroup> tile_a: array<array<${y.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${S.type.storage}, ${l}>, ${l}>;
  ${$.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${I.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${O}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${w}
      }
      workgroupBarrier();
    }

    ${M}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${k!=null?`let cOffset = ${k.broadcastedIndicesToOffset("vec2(m, n)",I)}; value += ${I.type.value}(uniforms.beta) * ${k.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return f?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:v},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*c},programUniforms:b}),getShaderSource:A}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:v},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:b}),getShaderSource:_}},jc=e=>{let t=e.transA,r=e.transB,i=e.alpha,n=e.beta;return{transA:t,transB:r,alpha:i,beta:n,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Cc=(e,t)=>{$l(e.inputs),e.compute(Al(e.inputs,t))}}),tt,st,kt,St,kl,Sl,Tl,El,Il,zl,jl,Cl,Bc,Oc,Hg=U(()=>{"use strict";ne(),oe(),Se(),ue(),[tt,st,kt,St]=[0,1,2,3],kl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Sl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,Tl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,El=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Il=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,zl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${tt}] = batch;
     indices[${st}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${kt}] = u32(r);
            indices[${St}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${kt}] = u32(clamp(r, 0, H - 1));
          indices[${St}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${kt}] = gs_reflect(r, border[1], border[3]);
          indices[${St}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,jl=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${tt}], indices[${st}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${tt}], indices[${st}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${tt}], indices[${st}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Cl=(e,t)=>{let r=D("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],n=D("grid",e[1].dataType,i.length,2),a=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(a=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[tt,st,kt,St]=[0,3,1,2]);let s=Z("output",e[0].dataType,a.length),u=r.type.value,l=B.size(a),p=[{type:12,data:l},...ee(e[0].dims,i,a)],c=f=>`
  ${f.registerUniform("output_size","u32").declareVariables(r,n,s)}
  ${Sl}
  ${Tl(u)}
  ${El(t)}
  ${Il(t)}
  ${zl(r,u,t)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${kt}]);
      let W_in = i32(uniforms.x_shape[${St}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${tt}], indices[${kt}], indices[${St}]);
      let nxy = ${n.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${jl(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:f=>{let g=B.size(a);return{outputs:[{dims:a,dataType:f[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:c}},Bc=(e,t)=>{kl(e.inputs),e.compute(Cl(e.inputs,t))},Oc=e=>be({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),De,Bl,Dc,sn,Ol,fr,Mc,Rc=U(()=>{"use strict";ne(),oe(),Se(),Jn(),ra(),ue(),_t(),De=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,Bl=(e,t)=>{let r=e[0],i=De(e,1),n=De(e,2),a=De(e,3),s=De(e,4),u=De(e,5),l=De(e,6),p=De(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let c=r.dims[0],f=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],b=f,v=0,_=0,A=Math.floor(g/t.numHeads);if(l&&p&&B.size(l.dims)&&B.size(p.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==c||l.dims[1]!==t.numHeads||l.dims[3]!==A)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==c||p.dims[1]!==t.numHeads||p.dims[3]!==A)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');v=l.dims[2],_=l.dims[2]}else if(l&&B.size(l.dims)||p&&B.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $;if(i&&B.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');$=2,b=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==A)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw new Error('Expect "value" be none when "key" has packed kv format.');$=5,b=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==A)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');$=0,b=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}if(a&&B.size(a.dims)>0){if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let y=v+b,S=0;if(s&&B.size(s.dims)>0){S=8;let z=s.dims;throw z.length===1?z[0]===c?S=1:z[0]===3*c+2&&(S=3):z.length===2&&z[0]===c&&z[1]===y&&(S=5),S===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let k=!1,T=g;if(n&&B.size(n.dims)>0){if(n.dims.length!==3&&n.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(b!==n.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');T=n.dims[2]}else{if(b!==n.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');T=n.dims[1]*n.dims[3],k=!0}}let I=!1;if(s&&B.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&B.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==c||u.dims[1]!==t.numHeads||u.dims[2]!==f||u.dims[3]!==y)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:c,sequenceLength:f,pastSequenceLength:v,kvSequenceLength:b,totalSequenceLength:y,maxSequenceLength:_,inputHiddenSize:0,hiddenSize:g,vHiddenSize:T,headSize:A,vHeadSize:Math.floor(T/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:S,scale:t.scale,broadcastResPosBias:I,passPastInKv:k,qkvFormat:$}},Dc=e=>be({...e}),sn=be({perm:[0,2,1,3]}),Ol=(e,t,r,i,n,a,s)=>{let u=[i,n,a],l=B.size(u),p=[{type:12,data:l},{type:12,data:s},{type:12,data:a}],c=f=>{let g=Z("qkv_with_bias",t.dataType,u),b=D("qkv",t.dataType,u),v=D("bias",r.dataType,u),_=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${f.registerUniforms(_).declareVariables(b,v,g)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:c},{inputs:[t,r],outputs:[-1]})[0]},fr=(e,t,r,i,n,a,s,u)=>{let l=a;if(s&&B.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=Ol(e,a,s,t,i,r*n,u),l=l.reshape([t,i,r,n]),r===1||i===1?l:e.compute(Ne(l,sn.perm),{inputs:[l],outputs:[-1]})[0]}else return a.dims.length===3&&(l=a.reshape([t,i,r,n])),r===1||i===1?l:e.compute(Ne(l,sn.perm),{inputs:[l],outputs:[-1]})[0]},Mc=(e,t)=>{let r=Bl(e.inputs,t),i=e.inputs[0],n=De(e.inputs,1),a=De(e.inputs,2),s=De(e.inputs,3),u=De(e.inputs,4),l=De(e.inputs,5),p=De(e.inputs,6),c=De(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(n?.dims.length===5)throw new Error("Packed KV is not implemented");let f=n&&a&&n.dims.length===4&&a.dims.length===4,g=fr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(f)return gr(e,g,n,a,u,void 0,p,c,l,r);if(!n||!a)throw new Error("key and value must be provided");let b=fr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,n,s,r.hiddenSize),v=fr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,a,s,2*r.hiddenSize);gr(e,g,b,v,u,void 0,p,c,l,r)}}),Dl,Ml,Rl,Nl,Rn,Nc,qc,Pc=U(()=>{"use strict";ne(),oe(),Se(),ue(),Dl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Ml=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(n=>r.push(Number(n))),i=r.length),be({numOutputs:i,axis:t.axis,splitSizes:r})},Rl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Q("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Nl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let n=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(n):i===0?r.push(`if (output_number == ${i}u) { ${n} }`):i===t-1?r.push(`else { ${n} }`):r.push(`else if (output_number == ${i}) { ${n} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Rn=(e,t)=>{let r=e[0].dims,i=B.size(r),n=e[0].dataType,a=B.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=D("input",n,r.length),l=new Array(t.numOutputs),p=[],c=[],f=0,g=[{type:12,data:i}];for(let v=0;v<t.numOutputs;v++){f+=t.splitSizes[v],l[v]=f;let _=r.slice();_[a]=t.splitSizes[v],c.push(_),s[v]=Z(`output${v}`,n,_.length),p.push({dims:c[v],dataType:e[0].dataType})}g.push({type:12,data:l},...ee(r,...c));let b=v=>`
  ${v.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...s)}
  ${Rl(l.length)}
  ${Nl(s)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",a)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Q("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",a,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:b,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},Nc=(e,t)=>{Dl(e.inputs);let r=e.inputs.length===1?t:Ml(e.inputs,t);e.compute(Rn(e.inputs,r),{inputs:[0]})},qc=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return be({axis:t,numOutputs:i,splitSizes:r})}}),ql,Qr,Uc,Lc=U(()=>{"use strict";ne(),oe(),Se(),ue(),ql=(e,t)=>{let[r,i,n,a]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!B.areEqual(i.dims,[])&&!B.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(!B.areEqual(n.dims,a.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],p=r.dims[r.dims.length-2],c=n.dims[0],f=B.sizeFromDimension(r.dims,1)/p,g=u===0?n.dims[1]*2:f/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(p>c)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(g/2!==n.dims[1]&&u/2!==n.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${n.dims[1]}`)},Qr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:n,scale:a}=t,s=e[0].dims[0],u=B.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],p=u/l,c=e[2].dims[1],f=n===0?c*2:p/i,g=new Array(s,l,p/f,f-c),b=B.computeStrides(g),v=[{type:1,data:a},{type:12,data:g},{type:12,data:b},...e[0].dims.length===3?new Array({type:12,data:[u,p,f,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,f,l*f,1]}):[],...ee(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],_=A=>{let $=D("input",e[0].dataType,e[0].dims.length),y=D("position_ids",e[1].dataType,e[1].dims.length),S=D("cos_cache",e[2].dataType,e[2].dims.length),k=D("sin_cache",e[3].dataType,e[3].dims.length),T=Z("output",e[0].dataType,e[0].dims.length);return A.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:b.length},{name:"input_output_strides",type:"u32",length:b.length}]),`
        ${A.declareVariables($,y,S,k,T)}

        ${A.mainStart(Ht)}
          let half_rotary_emb_dim = uniforms.${S.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${A.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${y.broadcastedIndicesToOffset("bsnh.xy",Z("",y.type.tensor,2))};
            let position_id =
                u32(${y.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${$.getByOffset("i")} * ${S.get("position_id","bsnh[3]")} -
                ${$.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${T.setByOffset("i","re")}
            let im = ${$.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} +
                ${$.getByOffset("j")} * ${S.get("position_id","bsnh[3]")};
            ${T.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${T.setByOffset("k",$.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:be({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(g)/Ht)},programUniforms:v})}},Uc=(e,t)=>{ql(e.inputs,t),e.compute(Qr(e.inputs,t))}}),Pl,Ul,on,Ll,Fc,Kg=U(()=>{"use strict";Se(),ne(),ra(),Rc(),Pc(),_t(),Lc(),ue(),Pl=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],p=r.dims[1],c=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],f=p,g=0,b=!i||i.dims.length===0,v=Math.floor(b?c/(t.numHeads+2*t.kvNumHeads):c/t.numHeads);b&&(c=v*t.numHeads);let _=a&&a.dims.length!==0,A=s&&s.dims.length!==0;if(_&&a.dims.length===4&&a.dims[0]===l&&a.dims[1]!==t.kvNumHeads&&a.dims[2]===t.kvNumHeads&&a.dims[3]===v)throw new Error("BSNH pastKey/pastValue is not supported");if(_&&A){if(a.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=a.dims[2]}else if(_||A)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');f=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==v)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw new Error('Expect "value" be none when "key" has packed kv format.');f=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==v)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');f=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}let y=0,S=!1,k=t.kvNumHeads?v*t.kvNumHeads:c;if(n&&n.dims.length>0){if(n.dims.length!==3&&n.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(f!==n.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=n.dims[2]}else{if(f!==n.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');k=n.dims[1]*n.dims[3],S=!0}}let T=e.length>4?e[5]:void 0;if(T){if(T.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let I=T.dims.reduce((z,w)=>z*w,1);if(I!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${I}.`);for(let z=0;z<T.dims.length;z++)if(T.dims[z]!==1&&T.dims[z]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${z}] = ${T.dims[z]}.`)}return{batchSize:l,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:f,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:c,vHiddenSize:k,headSize:v,vHeadSize:Math.floor(k/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:S,qkvFormat:$}},Ul=be({perm:[0,2,1,3]}),on=(e,t,r)=>{let i=t,n=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,n,r.headSize]),i=e.compute(Ne(i,Ul.perm),{inputs:[i],outputs:[-1]})[0]),i},Ll=(e,t,r,i)=>{let n=7,a=["type","type"],s=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=c=>{let f=D("seq_lens",r.dataType,r.dims),g=D("total_seq_lens",i.dataType,i.dims),b=Z("pos_ids",n,s),v=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${c.registerUniforms(v).declareVariables(f,g,b)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${f.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${b.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${b.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${b.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:a},getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:p}},Fc=(e,t)=>{if(e.inputs.length>14&&e.inputs[14]||e.inputs.length>15&&e.inputs[15])throw new Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");let r=Pl(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],n=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,a=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,c=r.kvNumHeads?r.kvNumHeads:r.numHeads,f=be({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,c*r.headSize,c*r.headSize]}),[g,b,v]=!n&&!a?e.compute(Rn([i],f),{inputs:[i],outputs:[-1,-1,-1]}):[i,n,a],_,A;if(t.doRotary){let k=e.compute(Ll(r.batchSize,r.sequenceLength,l,p),{inputs:[l,p],outputs:[-1]})[0],T=e.inputs[7],I=e.inputs[8],z=be({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),w=[g,k,T,I],O=[-1];_=e.compute(Qr(w,z),{inputs:w,outputs:O})[0],w.splice(0,1,b);let M=be({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});A=e.compute(Qr(w,M),{inputs:w,outputs:O})[0]}let $=fr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?_:g,void 0,0),y=on(e,t.doRotary?A:b,r),S=on(e,v,r);gr(e,$,y,S,void 0,void 0,s,u,void 0,r,l,p)}}),un,Fl,Gl,Gc,Xg=U(()=>{"use strict";ne(),oe(),_t(),ue(),un=(e,t,r,i,n,a,s,u)=>{let l=ke(a),p=l===1?"f32":`vec${l}f`,c=l===1?"vec2f":`mat2x${l}f`,f=n*s,g=64;f===1&&(g=256);let b=[n,s,a/l],v=[n,s,2],_=["rank","type","type"],A=[];A.push(...ee(b,v));let $=y=>{let S=D("x",t.dataType,3,l),k=D("scale",r.dataType,r.dims),T=D("bias",i.dataType,i.dims),I=Z("output",1,3,2),z=[S,k,T,I];return`
  var<workgroup> workgroup_shared : array<${c}, ${g}>;
  const workgroup_size = ${g}u;
  ${y.declareVariables(...z)}
  ${y.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${S.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${c}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${yt("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${yt("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:v,dataType:1}],dispatchGroup:{x:f},programUniforms:A}),getShaderSource:$},{inputs:[t,r,i],outputs:[-1]})[0]},Fl=(e,t,r)=>{let i=t[0].dims,n=i,a=2,s=i[0],u=i[1],l=B.sizeFromDimension(i,a),p=ke(l),c=B.size(n)/p,f=un(e,t[0],t[1],t[2],s,l,u,r.epsilon),g=[s,u,l/p],b=[s,u],v=["type","none"],_=A=>{let $=D("x",t[0].dataType,g.length,p),y=D("scale_shift",1,b.length,2),S=Z("output",t[0].dataType,g.length,p),k=[$,y,S];return`
  ${A.registerUniform("output_size","u32").declareVariables(...k)}
  ${A.mainStart()}
  ${A.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${S.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${y.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${$.getByOffset("global_idx")} * ${S.type.value}(scale_shift.x) + ${S.type.value}(scale_shift.y);
      ${S.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:v},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:[{type:12,data:c},...ee(g,b,g)]}),getShaderSource:_},{inputs:[t[0],f]})},Gl=(e,t,r)=>{let i=t[0].dims,n=i,a=i[0],s=i[i.length-1],u=B.sizeFromDimension(i,1)/s,l=ke(s),p=B.size(n)/l,c=[{type:12,data:u},{type:12,data:Math.floor(s/l)}],f=["type","type"],g=!1,b=[0,i.length-1];for(let $=0;$<i.length-2;$++)g=g||i[$+1]!==1,b.push($+1);g=g&&i[i.length-1]!==1;let v=g?e.compute(Ne(e.inputs[0],b),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},($,y)=>i[b[y]])),_=un(e,v,t[1],t[2],a,u,s,r.epsilon),A=$=>{let y=Ce(t[0].dataType),S=l===1?"vec2f":`mat${l}x2f`,k=z=>{let w=z===0?"x":"y",O=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${y}(${O}(scale.${w}))`;case 2:return`vec2<${y}>(${O}(scale[0].${w}, scale[1].${w}))`;case 4:return`vec4<${y}>(${O}(scale[0].${w}, scale[1].${w}, scale[2].${w}, scale[3].${w}))`;default:throw new Error(`Not supported compoents ${l}`)}},T=D("input",t[0].dataType,t[0].dims,l),I=Z("output",t[0].dataType,n,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${T.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${S}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${I.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${$.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${k(0)}, ${k(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:c}),getShaderSource:A},{inputs:[t[0],_]})},Gc=(e,t)=>{t.format==="NHWC"?Gl(e,e.inputs,t):Fl(e,e.inputs,t)}}),Wl,Vl,Wc,Zg=U(()=>{"use strict";ne(),oe(),ue(),Wl=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},Vl=(e,t,r)=>{let i=t.simplified,n=e[0].dims,a=e[1],s=!i&&e[2],u=n,l=B.normalizeAxis(t.axis,n.length),p=B.sizeToDimension(n,l),c=B.sizeFromDimension(n,l),f=B.size(a.dims),g=s?B.size(s.dims):0;if(f!==c||s&&g!==c)throw new Error(`Size of X.shape()[axis:] == ${c}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${f} and bias size of ${g}`);let b=[];for(let T=0;T<n.length;++T)T<l?b.push(n[T]):b.push(1);let v=ke(c),_=["type","type"],A=[{type:12,data:p},{type:1,data:c},{type:12,data:Math.floor(c/v)},{type:1,data:t.epsilon}];s&&_.push("type");let $=r>1,y=r>2,S=T=>{let I=Ce(e[0].dataType),z=[D("x",e[0].dataType,e[0].dims,v),D("scale",a.dataType,a.dims,v)];s&&z.push(D("bias",s.dataType,s.dims,v)),z.push(Z("output",e[0].dataType,u,v)),$&&z.push(Z("mean_data_output",1,b)),y&&z.push(Z("inv_std_output",1,b));let w=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${T.registerUniforms(w).declareVariables(...z)}
  ${T.mainStart()}
    ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${En("f32",v)};
    var mean_square_vector = ${En("f32",v)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Wt(I,v,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${yt("mean_vector",v)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${yt("mean_square_vector",v)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Wt(I,v,"x[j + offset]")};
      let f32scale = ${Wt(I,v,"scale[j]")};
      output[j + offset] = ${z[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Wt(I,v,"bias[j]")}`:""}
      );
    }

    ${$?"mean_data_output[global_idx] = mean":""};
    ${y?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},k=[{dims:u,dataType:e[0].dataType}];return $&&k.push({dims:b,dataType:1}),y&&k.push({dims:b,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${v};${r};${i}`,inputDependencies:_},getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:A}),getShaderSource:S}},Wc=(e,t)=>{Wl(e.inputs),e.compute(Vl(e.inputs,t,e.outputCount))}}),Hl,Vc,Qg=U(()=>{"use strict";oe(),oa(),ua(),Hl=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Vc=e=>{Hl(e.inputs);let t=Vt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(sa(e.inputs,{activation:""},t));else{let n=t[t.length-2],a=B.size(e.inputs[0].dims.slice(0,-2)),s=B.size(e.inputs[1].dims.slice(0,-2));if(a!==1&&n===1&&s===1){let u=e.inputs[0].reshape([1,a,i]),l=e.inputs[1].reshape([1,i,r]),p=[1,a,r],c=[u,l];e.compute(Zr(c,{activation:""},t,p),{inputs:c})}else e.compute(Zr(e.inputs,{activation:""},t))}}}),Kl,Xl,Zl,Hc,Kc,Yg=U(()=>{"use strict";ne(),oe(),Se(),ue(),Kl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let n=Math.floor((t.k+t.blockSize-1)/t.blockSize),a=t.blockSize/8*t.bits,s=e[1];if(!B.areEqual(s.dims,[t.n,n,a]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(B.size(u)!==t.n*n)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,p=t.n*(t.bits===8?n:Math.floor((n*t.bits+7)/8));if(B.size(l)!==p)throw new Error("zeroPoints input size error.")}},Xl=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,u=r.slice(0,i-2),l=B.size(u),p=e[1].dims[2]/4,c=e[0].dataType,f=ke(t.k),g=ke(p),b=ke(s),v=u.concat([n,s]),_=n>1&&s/b%2===0?2:1,A=B.size(v)/b/_,$=64,y=[],S=[l,n,a/f],k=B.convertShape(e[1].dims).slice();k.splice(-1,1,p/g),y.push(...ee(S)),y.push(...ee(k)),y.push(...ee(e[2].dims)),e.length===4&&y.push(...ee(B.convertShape(e[3].dims)));let T=[l,n,s/b];y.push(...ee(T));let I=z=>{let w=S.length,O=D("a",e[0].dataType,w,f),M=D("b",12,k.length,g),F=D("scales",e[2].dataType,e[2].dims.length),G=[O,M,F],L=e.length===4?D("zero_points",12,e[3].dims.length):void 0;L&&G.push(L);let C=T.length,N=Z("output",e[0].dataType,C,b),V=Ce(e[0].dataType),X=(()=>{switch(f){case 1:return`array<${V}, 8>`;case 2:return`mat4x2<${V}>`;case 4:return`mat2x4<${V}>`;default:throw new Error(`${f}-component is not supported.`)}})(),te=Math.floor(32/t.bits),re=Math.floor(te/8),ae=()=>{let Y="";for(let H=0;H<re;H++){let Te=H*t.bits*4,Ee=Te+t.bits;Y+=`
          // reuse a data (pass ${H})
            var input_offset${H>0?H:""} = ${H===0?O.indicesToOffset(`${O.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${H>0?H:""}: ${X};
            for (var j${H>0?H:""}: u32 = 0; j${H>0?H:""} < ${8/f}; j${H>0?H:""}++) {
              a_data${H>0?H:""}[j${H>0?H:""}] = ${O.getByOffset(`input_offset${H>0?H:""}`)};
              input_offset${H>0?H:""}++;
            }
          `;for(let P=0;P<b*_;P++)Y+=`
            b_value = ${g===1?`b${P}_data`:`b${P}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${H*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${Te}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${Ee}u) & b_mask);`}
            b_quantized_values = ${X}(${Array.from({length:4},(ie,se)=>`${V}(b_value_lower[${se}]), ${V}(b_value_upper[${se}])`).join(", ")});
            b_dequantized_values = ${f===1?`${X}(${Array.from({length:8},(ie,se)=>`(b_quantized_values[${se}] - ${L?`zero_point${P}`:"zero_point"}) * scale${P}`).join(", ")});`:`(b_quantized_values - ${X}(${Array(8).fill(`${L?`zero_point${P}`:"zero_point"}`).join(",")})) * scale${P};`};
            workgroup_shared[local_id.x * ${_} + ${Math.floor(P/b)}]${b>1?`[${P%b}]`:""} += ${Array.from({length:8/f},(ie,se)=>`${f===1?`a_data${H>0?H:""}[${se}] * b_dequantized_values[${se}]`:`dot(a_data${H>0?H:""}[${se}], b_dequantized_values[${se}])`}`).join(" + ")};
          `}return Y},q=()=>{let Y=`
            var col_index = col * ${b};
            ${L?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${V}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let H=0;H<b*_;H++)Y+=`
            let scale${H} = ${F.getByOffset("col_index * nBlocksPerCol + block")};
            ${L?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${L.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${H} = ${V}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return Y},J=()=>{let Y=`col_index = col * ${b};`;for(let H=0;H<b*_;H++)Y+=`
            let b${H}_data = ${M.getByIndices(`${M.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return Y+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${X};
            var b_dequantized_values: ${X};`,Y};return`
        var<workgroup> workgroup_shared: array<${N.type.value}, ${_*$}>;
        ${z.declareVariables(...G,N)}
        ${z.mainStart([$,1,1])}
          let output_indices = ${N.offsetToIndices(`(global_idx / ${$}) * ${_}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${$}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/f};
            ${q()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${J()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${ae()}
                word_offset += ${te/f};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${_}) {
            var output_value: ${N.type.value} = ${N.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${$}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${_};
            }
            ${N.setByIndices(`${N.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${f};${g};${b};${_};${$}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:v,dataType:c}],dispatchGroup:{x:A},programUniforms:y}),getShaderSource:I}},Zl=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,u=r.slice(0,i-2),l=B.size(u),p=e[1].dims[2]/4,c=e[0].dataType,f=ke(t.k),g=ke(p),b=u.concat([n,s]),v=128,_=s%8===0?8:s%4===0?4:1,A=v/_,$=Math.floor(32/t.bits),y=A*g*$,S=y/f,k=y/t.blockSize,T=B.size(b)/_,I=[],z=[l,n,a/f],w=B.convertShape(e[1].dims).slice();w.splice(-1,1,p/g),I.push(...ee(z)),I.push(...ee(w)),I.push(...ee(e[2].dims)),e.length===4&&I.push(...ee(B.convertShape(e[3].dims)));let O=[l,n,s];I.push(...ee(O));let M=F=>{let G=z.length,L=D("a",e[0].dataType,G,f),C=D("b",12,w.length,g),N=D("scales",e[2].dataType,e[2].dims.length),V=[L,C,N],X=e.length===4?D("zero_points",12,e[3].dims.length):void 0;X&&V.push(X);let te=O.length,re=Z("output",e[0].dataType,te),ae=Ce(e[0].dataType),q=()=>{switch(f){case 1:return`
          let a_data0 = vec4<${ae}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ae}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ae}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ae}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${f}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${L.type.value}, ${S}>;
        var<workgroup> inter_results: array<array<${re.type.value}, ${A}>, ${_}>;
        ${F.declareVariables(...V,re)}
        ${F.mainStart([A,_,1])}
          let output_indices = ${re.offsetToIndices(`workgroup_index * ${_}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${k} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${S};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${S}; a_offset += ${v})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${L.getByIndices(`${L.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${L.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${k} + local_id.x;
            ${X?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${X.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ae}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ae}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${N.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${C.getByIndices(`${C.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/f};
            for (var i: u32 = 0; i < ${g}; i++) {
              let b_value = ${g===1?"b_data":"b_data[i]"};
              ${(()=>{let J=Math.floor($/8),Y="";for(let H=0;H<J;H++){let Te=H*t.bits*4,Ee=Te+t.bits;Y+=`
              ${q()}
              {${t.bits===2?`
                let half_word = b_value >> ${H*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${Te}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${Ee}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ae}>(${Array.from({length:4},(P,ie)=>`${ae}(b_value_lower[${ie}]), ${ae}(b_value_upper[${ie}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ae}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(P,ie)=>`${`dot(a_data${ie}, b_dequantized_values[${ie}])`}`).join(" + ")};
              }
              word_offset += ${8/f};`}return Y})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${_}) {
            var output_value: ${re.type.value} = ${re.type.value}(0);
            for (var b = 0u; b < ${A}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${re.setByIndices(`${re.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${f};${g};${A};${_}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:b,dataType:c}],dispatchGroup:{x:T},programUniforms:I}),getShaderSource:M}},Hc=(e,t)=>{Kl(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Zl(e.inputs,t)):e.compute(Xl(e.inputs,t))},Kc=e=>be(e)}),Ql,Yl,Jl,ed,td,rd,id,nd,Xc,Jg=U(()=>{"use strict";ne(),oe(),ue(),Ql=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Yl=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
            k = i32(${e.indicesGet("indices",n)}) - ${Q("uniforms.pads",n,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Q("uniforms.x_shape",n,t)})) {
              break;
            }
            offset += k * i32(${Q("uniforms.x_strides",n,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Jl=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Q("uniforms.pads",n,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Q("uniforms.x_shape",n,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Q("uniforms.x_shape",n,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Q("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ed=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Q("uniforms.pads",n,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Q("uniforms.x_shape",n,t)})) {
                  k = i32(${Q("uniforms.x_shape",n,t)}) - 1;
                }
                offset += k * i32(${Q("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},td=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Q("uniforms.pads",n,r)};
                if (k < 0)  {
                  k += i32(${Q("uniforms.x_shape",n,t)}]);
                }
                if (k >= i32(${Q("uniforms.x_shape",n,t)})) {
                  k -= i32(${Q("uniforms.x_shape",n,t)});
                }
                offset += k * i32(${Q("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},rd=(e,t,r)=>{switch(r.mode){case 0:return Yl(e,t,r.pads.length);case 1:return Jl(e,t,r.pads.length);case 2:return ed(e,t,r.pads.length);case 3:return td(e,t,r.pads.length);default:throw new Error("Invalid mode")}},id=(e,t)=>{let r=B.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,n=B.size(r),a=[{type:12,data:n},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&a.push({type:s?e[2].dataType:1,data:t.value}),a.push(...ee(e[0].dims,r));let u=["rank"],l=p=>{let c=Z("output",e[0].dataType,r.length),f=D("x",e[0].dataType,i.length),g=f.type.value,b=rd(c,i.length,t),v=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&v.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(v).declareVariables(f,c)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${c.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${b}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(r)/64)},programUniforms:a}),getShaderSource:l}},nd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,n=e[0].dims.length,a=new Int32Array(2*n).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)a[Number(u[l])]=Number(r[l]),a[Number(u[l])+n]=Number(r[l+u.length])}else r.forEach((u,l)=>a[Number(l)]=Number(u));let s=[];return a.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},Xc=(e,t)=>{Ql(e.inputs);let r=nd(e.inputs,t);e.compute(id(e.inputs,r),{inputs:[0]})}}),or,ln,dn,pn,cn,ad,sd,fn,hn,Zc,Qc,mn,Yc,Jc,gn,ef,tf,rf,nf,ev=U(()=>{"use strict";Le(),ne(),oe(),ue(),or=e=>{if(xe.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},ln=(e,t,r)=>{let i=t.format==="NHWC",n=e.dims.slice();i&&n.splice(1,0,n.pop());let a=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),l=a?t.dilations.slice():[],p=t.pads.slice();Kr.adjustPoolAttributes(r,n,s,u,l,p);let c=Kr.computePoolOutputShape(r,n,u,l,s,p,t.autoPad,t.ceilMode),f=Object.assign({},t);a?Object.assign(f,{kernelShape:s,strides:u,pads:p,dilations:l,cacheKey:t.cacheKey}):Object.assign(f,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=c.slice();return g.push(g.splice(1,1)[0]),[f,i?g:c]},dn=(e,t)=>{let r=t.format==="NHWC",i=B.size(e),n=B.size(t.kernelShape),a=[{type:12,data:i},{type:12,data:n}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],c=t.pads[t.pads.length-1],f=!!(p+c);a.push({type:12,data:u},{type:12,data:l},{type:12,data:p},{type:12,data:c}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let b=t.kernelShape[t.kernelShape.length-2],v=t.strides[t.strides.length-2],_=t.pads[t.pads.length/2-2],A=t.pads[t.pads.length-2];g=!!(_+A),a.push({type:12,data:b},{type:12,data:v},{type:12,data:_},{type:12,data:A}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[a,s,!0,f,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=B.computeStrides(t.kernelShape);a.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((p,c)=>p+c);return[a,s,!!l,!1,!1]}},pn=(e,t,r,i,n,a,s,u,l,p,c,f)=>{let g=n.format==="NHWC",b=t.type.value,v=Z("output",t.type.tensor,i);if(n.kernelShape.length<=2){let _="",A="",$="",y=r-(g?2:1);if(c?_=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${y}] < 0 || xIndices[${y}]
                      >= uniforms.x_shape[${y}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`:_=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`,n.kernelShape.length===2){let S=r-(g?3:2);f?A=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${S}] = indices[${S}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${S}] < 0 || xIndices[${S}] >= uniforms.x_shape[${S}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:A=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${S}] = indices[${S}] * uniforms.sh - uniforms.phStart + j;
                `,$=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,v)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${v.offsetToIndices("global_idx")};
              var xIndices = ${v.offsetToIndices("global_idx")};

              var value = ${b}(${u});
              var pad = 0;
              ${A}
              ${_}
              ${$}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let _=n.kernelShape.length,A=n.pads.length,$="";return p?$=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${a}
              }`:$=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${a}
            `,`
            ${e.registerUniforms(l).declareVariables(t,v)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${v.offsetToIndices("global_idx")};
              var xIndices = ${v.offsetToIndices("global_idx")};

              var offsets: array<u32, ${_}>;

              var value = ${b}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${_-1}u; j++) {
                  offsets[j] = offset / ${Q("uniforms.kernelStrides","j",_)};
                  offset -= offsets[j] * ${Q("uniforms.kernelStrides","j",_)};
                }
                offsets[${_-1}] = offset;

                isPad = false;
                for (var j = ${r-_}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Q("uniforms.strides",`j - ${r-_}u`,_)}
                    + offsets[j - ${r-_}u] - ${Q("uniforms.pads","j - 2u",A)};
                  ${$}
              }
              ${s}

              output[global_idx] = value;
            }`}},cn=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,ad=e=>`${cn(e)};${e.countIncludePad}`,sd=e=>`${cn(e)};${e.storageOrder};${e.dilations}`,fn=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),hn=(e,t,r,i)=>{let[n,a]=ln(t,i,r),s=D("x",t.dataType,t.dims.length),u=s.type.value,l="value += x_val;",p="";n.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[c,f,g,b,v]=dn(a,n);c.push(...ee(t.dims,a));let _=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${b};${v}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(a)/64)},programUniforms:c}),getShaderSource:A=>pn(A,s,t.dims.length,a.length,n,l,p,0,f,g,b,v)}},Zc=e=>{let t=e.count_include_pad!==0,r=fn(e);if(r.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:ad(i)}},Qc=(e,t)=>{or(e.inputs),e.compute(hn("AveragePool",e.inputs[0],!1,t))},mn={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Yc=e=>{let t=e.format;return{format:t,...mn,cacheKey:t}},Jc=(e,t)=>{or(e.inputs),e.compute(hn("GlobalAveragePool",e.inputs[0],!0,t))},gn=(e,t,r,i)=>{let[n,a]=ln(t,i,r),s=`
      value = max(x_val, value);
    `,u="",l=D("x",t.dataType,t.dims.length),p=["rank"],[c,f,g,b,v]=dn(a,n);return c.push(...ee(t.dims,a)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${b};${v}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(a)/64)},programUniforms:c}),getShaderSource:_=>pn(_,l,t.dims.length,a.length,n,s,u,t.dataType===10?-65504:-1e5,f,g,b,v)}},ef=(e,t)=>{or(e.inputs),e.compute(gn("MaxPool",e.inputs[0],!1,t))},tf=e=>{let t=e.storage_order,r=e.dilations,i=fn(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");let n={storageOrder:t,dilations:r,...i,cacheKey:""};return{...n,cacheKey:sd(n)}},rf=e=>{let t=e.format;return{format:t,...mn,cacheKey:t}},nf=(e,t)=>{or(e.inputs),e.compute(gn("GlobalMaxPool",e.inputs[0],!0,t))}}),od,ud,af,sf,tv=U(()=>{"use strict";ne(),oe(),Se(),ue(),od=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((n,a)=>a===t.axis||n===e[0].dims[a]).reduce((n,a)=>n&&a,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},ud=(e,t)=>{let r=B.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,n=i===3,a=e[0].dims,s=e[1].dataType,u=B.size(a),l=i===3||i===2,p=l?[Math.ceil(B.size(e[0].dims)/4)]:e[0].dims,c=e[1].dims,f=e.length>2?e[2]:void 0,g=f?l?[Math.ceil(B.size(f.dims)/4)]:f.dims:void 0,b=c.length===0||c.length===1&&c[0]===1,v=b===!1&&c.length===1,_=ke(u),A=b&&(!l||_===4),$=A?_:1,y=A&&!l?_:1,S=D("input",l?12:i,p.length,y),k=D("scale",s,c.length),T=f?D("zero_point",l?12:i,g.length):void 0,I=Z("output",s,a.length,$),z=[S,k];T&&z.push(T);let w=[p,c];f&&w.push(g);let O=[{type:12,data:u/$},{type:12,data:r},{type:12,data:t.blockSize},...ee(...w,a)],M=F=>{let G=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${F.registerUniforms(G).declareVariables(...z,I)}
      ${F.mainStart()}
          ${F.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${I.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${S.getByOffset("global_idx / 4")};
            let x_vec = ${n?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${$===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${S.getByOffset("global_idx")};`};

          // Set scale input
          ${b?`let scale_value= ${k.getByOffset("0")}`:v?`
            let scale_index = ${I.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${k.getByOffset("scale_index")};`:`
            var scale_indices: ${k.type.indices} = output_indices;
            let index = ${k.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${k.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${k.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${T?b?l?`
                let zero_point_input = ${T.getByOffset("0")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${T.getByOffset("0")}`:v?l?`
                let zero_point_index = ${I.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${T.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${I.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${T.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${k.indicesToOffset("scale_indices")};
                let zero_point_input = ${T.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${T.getByIndices("scale_indices")};`:`let zero_point_value = ${l?n?"i32":"u32":S.type.value}(0);`};
      // Compute and write output
      ${I.setByOffset("global_idx",`${I.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:T?["rank","rank","rank"]:["rank","rank"]},getShaderSource:M,getRunData:()=>({outputs:[{dims:a,dataType:s}],dispatchGroup:{x:Math.ceil(u/$/64),y:1,z:1},programUniforms:O})}},af=(e,t)=>{od(e.inputs,t),e.compute(ud(e.inputs,t))},sf=e=>be({axis:e.axis,blockSize:e.blockSize})}),ld,dd,of,rv=U(()=>{"use strict";Le(),ne(),ue(),ld=(e,t,r)=>{let i=e===t,n=e<t&&r<0,a=e>t&&r>0;if(i||n||a)throw new Error("Range these inputs' contents are invalid.")},dd=(e,t,r,i)=>{let n=Math.abs(Math.ceil((t-e)/r)),a=[n],s=n,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...ee(a)],l=p=>{let c=Z("output",i,a.length),f=c.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:f},{name:"delta",type:f}];return`
        ${p.registerUniforms(g).declareVariables(c)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${f}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:a,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},of=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),xe.webgpu.validateInputContent&&ld(t,r,i),e.compute(dd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),pd,cd,uf,lf,iv=U(()=>{"use strict";ne(),oe(),Se(),ue(),pd=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let n=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,a=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${n}bitcast<${i}>(oldValue) + (${r})${a}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${n}max(bitcast<f32>(oldValue), (${r}))${a}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${n}min(bitcast<${i}>(oldValue), (${r}))${a}`;case"mul":return`${n}(bitcast<${i}>(oldValue) * (${r}))${a}`;default:throw new Error(`Reduction ${e} is not supported.`)}},cd=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r,a=1,s=Math.ceil(B.sizeToDimension(i,i.length-1)/a),u=i[i.length-1],l=B.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:l},...ee(e[1].dims,e[2].dims,n)],c=f=>{let g=D("indices",e[1].dataType,e[1].dims.length),b=D("updates",e[2].dataType,e[2].dims.length,a),v=t.reduction!=="none"&&t.reduction!==""?B0("output",e[0].dataType,n.length):Z("output",e[0].dataType,n.length,a);return`
      ${f.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,b,v)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${pd(t.reduction,"output[data_offset + i]","value",v.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:c}},uf=e=>be({reduction:e.reduction}),lf=(e,t)=>{e.compute(cd(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),fd,hd,md,vn,gd,vd,bd,yd,_d,xd,wd,$d,bn,Ad,kd,Sd,Td,Ed,df,pf,nv=U(()=>{"use strict";ne(),oe(),Se(),ue(),fd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},hd=(e,t,r)=>{t.every(n=>n>=0&&n<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((n,a)=>i[n]=e[a]),i},md=(e,t,r,i,n,a)=>{let[s,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(c=>a.push(c));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(c=>i.push(c)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");fd(i,t),t.axes.length>0&&hd(i,t.axes,p).forEach((c,f)=>i[f]=c)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(c=>n.push(Number(c))),n.length!==0&&n.length!==p&&r>=18&&n.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(n.length!==0&&n.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof n<"u"&&i.length>0&&n.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},vn=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,gd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${vn("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${vn("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",vd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",bd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),n=e.length===0?i:e.slice();return t.length>0?(t.forEach((a,s)=>{i[a]=n[s],i[s+r]=n[t.length+s]}),i):n},yd=(e,t,r,i)=>{let n=[];if(r.length>0)if(i.length>0){if(e.forEach(a=>n.push(a)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((a,s)=>n[a]=r[s])}else r.forEach(a=>n.push(a));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");n=e.map((a,s)=>Math.round(a*t[s]))}return n},_d=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(a=>t[a]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(a=>t[a]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let n=e.slice();return r.axes.length>0?(r.axes.forEach(a=>t[a]=i),r.axes.forEach(a=>n[a]=Math.round(e[a]*t[a]))):(t.fill(i,0,t.length),n.forEach((a,s)=>n[s]=Math.round(a*t[s]))),n},xd=(e,t,r,i,n)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Q("uniforms.scales","i",i)};
        var roi_low = ${Q("uniforms.roi","i",n)};
        var roi_hi = ${Q("uniforms.roi",`i + ${t.length}`,n)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Q("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,wd=(e,t,r,i,n,a,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Q("uniforms.scales","i",n)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Q("uniforms.roi","i",a)};
          var roi_hi = ${Q("uniforms.roi",`i + ${r.length}`,a)};
          var input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,$d=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Q("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,bn=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Ad=(e,t,r,i,n)=>{let[a,s,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${bn(e,l,a,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${n};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${a}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},kd=(e,t,r,i,n,a,s,u,l,p)=>{let c=r.length===2,f=!0,[g,b]=c?[0,1]:f?[2,3]:[1,2],v=e.type.value,_=A=>{let $=A===g?"row":"col";return`
      fn ${$}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${v} {
        var output_index = ${t.indicesGet("output_indices",A)};
        var originalIdx: ${v} = getOriginalCoordinateFromResizedCoordinate(output_index, ${n[A]},
        ${i[A]}, ${r[A]}, ${a[A]}, ${a[A]} + ${r.length});
        var fractOriginalIdx: ${v} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[A]} - 1))) {
          return ${l};
        }
        var data: array<${v}, 4> = array<${v}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${$}: ${v} = originalIdx + ${v}(i);
          if (${$} < 0 || ${$} >= ${r[A]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${$} = max(0, min(${$}, ${r[A]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",A,`u32(${$})`)};
          data[i + 1] = ${A===g?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(g)};
    ${_(b)};
  fn getCubicInterpolationCoefs(s: ${v}) -> array<${v}, 4> {
    var absS = abs(s);
    var coeffs: array<${v}, 4> = array<${v}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${v} = 1.0 - absS;
    var twoMinusAbsS: ${v} = 2.0 - absS;
    var onePlusAbsS: ${v} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${v}, 4>, coefs: array<${v}, 4>) -> ${v} {
    var coefsSum: ${v} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${v} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},Sd=(e,t,r,i,n)=>{let[a,s,u,l,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],c=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${c} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${bn(e,p,a,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${c} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${c} = originalIndices[${s}];
      var height:${c} = originalIndices[${u}];
      var width:${c} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${n};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${a}])`:"0"};

      var x111: ${c} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${c} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${c} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${c} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${c} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${c} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${c} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${c} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${c} = abs(depth - ${c}(depth1));
      var dx2: ${c} = abs(${c}(depth2) - depth);
      var dy1: ${c} = abs(height - ${c}(height1));
      var dy2: ${c} = abs(${c}(height2) - height);
      var dz1: ${c} = abs(width - ${c}(width1));
      var dz2: ${c} = abs(${c}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},Td=(e,t,r,i,n,a)=>{let s=e.dims,u=bd(a,t.axes,s.length),l=yd(s,i,n,t.axes),p=i.slice();i.length===0&&(p=s.map((y,S)=>y===0?1:l[S]/y),t.keepAspectRatioPolicy!=="stretch"&&(l=_d(s,p,t)));let c=Z("output",e.dataType,l.length),f=D("input",e.dataType,s.length),g=B.size(l),b=s.length===l.length&&s.every((y,S)=>y===l[S]),v=t.coordinateTransformMode==="tf_crop_and_resize",_=t.extrapolationValue,A=f.type.value,$=y=>`
      ${b?"":`
      ${gd(t.coordinateTransformMode,A)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${$d(f,s)};
              ${vd(t.nearestMode,r,A)};
              ${wd(f,c,s,l,p.length,u.length,v)};
              `;case"linear":return`
              ${xd(c,s,l,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${Ad(f,c,s,v,_)}`;if(s.length===3||s.length===5)return`${Sd(f,c,s,v,_)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${kd(f,c,s,l,p,u,t.cubicCoeffA,v,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${y.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(f,c)}
      ${y.mainStart()}
        ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${b?"output[global_idx] = input[global_idx];":`
        let output_indices = ${c.offsetToIndices("global_idx")};
        var input_indices: ${f.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${f.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${n.length>0?n:""}|${u.length>0?u:""}|${b}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:$,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...ee(s,l)]})}},Ed=e=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},df=(e,t)=>{let r=[],i=[],n=[],a=Ed(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");md(e.inputs,t,a,r,i,n),e.compute(Td(e.inputs[0],t,a,r,i,n),{inputs:[0]})},pf=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,n=e.cubicCoeffA,a=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return be({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:n,excludeOutside:a,extrapolationValue:s,keepAspectRatioPolicy:u,mode:l,nearestMode:p})}}),Id,zd,cf,av=U(()=>{"use strict";ne(),oe(),ue(),Id=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let n=t.dims[t.dims.length-1],a=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==n)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==a)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==n)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==n)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==n)throw new Error("Bias must have the same hidden size as input")}},zd=(e,t,r,i)=>{let n=t.simplified,a=e[0].dims,s=B.size(a),u=a,l=s,p=a.slice(-1)[0],c=i?a.slice(0,-1).concat(1):[],f=!n&&e.length>3,g=e.length>4,b=i&&r>1,v=i&&r>2,_=r>3,A=64,$=ke(p),y=[{type:12,data:l},{type:12,data:$},{type:12,data:p},{type:1,data:t.epsilon}],S=T=>{let I=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],z=[D("x",e[0].dataType,e[0].dims,$),D("skip",e[1].dataType,e[1].dims,$),D("gamma",e[2].dataType,e[2].dims,$)];f&&z.push(D("beta",e[3].dataType,e[3].dims,$)),g&&z.push(D("bias",e[4].dataType,e[4].dims,$)),z.push(Z("output",e[0].dataType,u,$)),b&&z.push(Z("mean_output",1,c)),v&&z.push(Z("inv_std_output",1,c)),_&&z.push(Z("input_skip_bias_sum",e[0].dataType,u,$));let w=Ce(e[0].dataType),O=Ce(1,$);return`

      ${T.registerUniforms(I).declareVariables(...z)}
      var<workgroup> sum_shared : array<${O}, ${A}>;
      var<workgroup> sum_squared_shared : array<${O}, ${A}>;

      ${T.mainStart([A,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${A};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${A};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${A-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":w+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${_?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Wt(w,$,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${A};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${yt("sum",$)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${yt("square_sum",$)} / f32(uniforms.hidden_size) ${n?"":"- mean * mean"} + uniforms.epsilon);
        ${b?"mean_output[global_idx] = mean;":""}
        ${v?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${n?"":`- ${w}(mean)`}) *
            ${w}(inv_std_dev) * gamma[offset1d + i]
            ${f?"+ beta[offset1d + i]":""};
        }
      }`},k=[{dims:u,dataType:e[0].dataType}];return r>1&&k.push({dims:c,dataType:1}),r>2&&k.push({dims:c,dataType:1}),r>3&&k.push({dims:a,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${$};${b};${v};${_}`,inputDependencies:e.map((T,I)=>"type")},getShaderSource:S,getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(l/p)},programUniforms:y})}},cf=(e,t)=>{Id(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(zd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),jd,ur,Cd,yn,Bd,Od,ff,hf,sv=U(()=>{"use strict";ne(),oe(),Se(),ue(),jd=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},ur=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Cd=(e,t)=>{if(e.length>1){let r=ur(e,1),i=ur(e,2),n=ur(e,3);return n.length===0&&(n=[...Array(e[0].dims.length).keys()]),be({starts:r,ends:i,axes:n})}else return t},yn=(e,t,r,i,n)=>{let a=e;return e<0&&(a+=r[i[t]]),n[t]<0?Math.max(0,Math.min(a,r[i[t]]-1)):Math.max(0,Math.min(a,r[i[t]]))},Bd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
            let steps_i = ${Q("uniforms.steps","i",r.length)};
            let signs_i = ${Q("uniforms.signs","i",r.length)};
            let starts_i = ${Q("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,Od=(e,t)=>{let r=e[0].dims,i=B.size(r),n=t.axes.length>0?B.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],a=ur(e,4);a.forEach($=>$!==0||(()=>{throw new Error("step cannot be 0")})),a.length===0&&(a=Array(n.length).fill(1));let s=t.starts.map(($,y)=>yn($,y,r,n,a)),u=t.ends.map(($,y)=>yn($,y,r,n,a));if(n.length!==s.length||n.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(n.length!==r.length)for(let $=0;$<r.length;++$)n.includes($)||(s.splice($,0,0),u.splice($,0,r[$]),a.splice($,0,1));let l=a.map($=>Math.sign($));a.forEach(($,y,S)=>{if($<0){let k=(u[y]-s[y])/$,T=s[y],I=T+k*a[y];s[y]=I,u[y]=T,S[y]=-$}});let p=r.slice(0);n.forEach(($,y)=>{p[$]=Math.ceil((u[$]-s[$])/a[$])});let c={dims:p,dataType:e[0].dataType},f=Z("output",e[0].dataType,p.length),g=D("input",e[0].dataType,e[0].dims.length),b=B.size(p),v=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:a.length}],_=[{type:12,data:b},{type:12,data:s},{type:6,data:l},{type:12,data:a},...ee(e[0].dims,p)],A=$=>`
      ${$.registerUniforms(v).declareVariables(g,f)}
        ${Bd(g,f,r)}
        ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${f.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${f.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${a.length}`,inputDependencies:["rank"]},getShaderSource:A,getRunData:()=>({outputs:[c],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:_})}},ff=(e,t)=>{jd(e.inputs,t);let r=Cd(e.inputs,t);e.compute(Od(e.inputs,r),{inputs:[0]})},hf=e=>{let t=e.starts,r=e.ends,i=e.axes;return be({starts:t,ends:r,axes:i})}}),Dd,Md,mf,gf,ov=U(()=>{"use strict";ne(),oe(),Se(),_t(),ue(),Dd=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},Md=(e,t)=>{let r=e.inputs[0],i=r.dims,n=B.size(i),a=i.length,s=B.normalizeAxis(t.axis,a),u=s<i.length-1,l,p=[];u?(p=Array.from({length:a},(z,w)=>w),p[s]=a-1,p[a-1]=s,l=e.compute(Ne(r,p),{inputs:[r],outputs:[-1]})[0]):l=r;let c=l.dims,f=c[a-1],g=n/f,b=ke(f),v=f/b,_=64;g===1&&(_=256);let A=(z,w)=>w===4?`max(max(${z}.x, ${z}.y), max(${z}.z, ${z}.w))`:w===2?`max(${z}.x, ${z}.y)`:w===3?`max(max(${z}.x, ${z}.y), ${z}.z)`:z,$=D("x",l.dataType,l.dims,b),y=Z("result",l.dataType,l.dims,b),S=$.type.value,k=Ce(l.dataType)==="f32"?`var threadMax = ${S}(-3.4028234663852886e+38f);`:`var threadMax = ${S}(-65504.0h);`,T=z=>`
      var<workgroup> rowMaxShared : ${S};
      var<workgroup> rowSumShared : ${S};
      var<workgroup> threadShared : array<${S}, ${_}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${S} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${S}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${z.registerUniform("packedCols","i32").declareVariables($,y)}
      ${z.mainStart(_)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${_};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${k}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${S}(${A("threadShared[0]",b)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${S}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${S}(${yt("threadShared[0]",b)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${S}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,I=e.compute({name:"Softmax",shaderCache:{hint:`${b};${_}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:c,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:v}]}),getShaderSource:T},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(Ne(I,p),{inputs:[I]})},mf=(e,t)=>{Dd(e.inputs),Md(e,t)},gf=e=>be({axis:e.axis})}),_n,Rd,Nd,qd,vf,uv=U(()=>{"use strict";ne(),oe(),ue(),_n=e=>Array.from(e.getBigInt64Array(),Number),Rd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(_n(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Nd=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},qd=(e,t)=>{let r=e[0].dims,i=t??_n(e[1]),n=Nd(r,i),a=B.size(n),s=e[0].dataType,u=D("input",s,r.length),l=Z("output",s,n.length),p=c=>`
      const inputShape = ${u.indices(...r)};
      ${c.registerUniform("output_size","u32").declareVariables(u,l)}
      ${c.mainStart()}
      ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},...ee(e[0].dims,n)]}),getShaderSource:p}},vf=e=>{Rd(e.inputs),e.compute(qd(e.inputs),{inputs:[0]})}}),Pd,Ud,bf,lv=U(()=>{"use strict";ne(),oe(),ue(),Pd=(e,t,r,i,n)=>{let a=Z("output_data",n,r.length,4),s=D("a_data",t[1].dataType,t[1].dims.length,4),u=D("b_data",t[2].dataType,t[2].dims.length,4),l=D("c_data",t[0].dataType,t[0].dims.length,4),p,c=(f,g,b)=>`select(${g}, ${f}, ${b})`;if(!i)p=a.setByOffset("global_idx",c(s.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let f=(g,b,v="")=>{let _=`a_data[index_a${b}][component_a${b}]`,A=`b_data[index_b${b}][component_b${b}]`,$=`bool(c_data[index_c${b}] & (0xffu << (component_c${b} * 8)))`;return`
            let output_indices${b} = ${a.offsetToIndices(`global_idx * 4u + ${b}u`)};
            let offset_a${b} = ${s.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let offset_b${b} = ${u.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let offset_c${b} = ${l.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let index_a${b} = offset_a${b} / 4u;
            let index_b${b} = offset_b${b} / 4u;
            let index_c${b} = offset_c${b} / 4u;
            let component_a${b} = offset_a${b} % 4u;
            let component_b${b} = offset_b${b} % 4u;
            let component_c${b} = offset_c${b} % 4u;
            ${g}[${b}] = ${v}(${c(_,A,$)});
          `};n===9?p=`
            var data = vec4<u32>(0);
            ${f("data",0,"u32")}
            ${f("data",1,"u32")}
            ${f("data",2,"u32")}
            ${f("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${f("output_data[global_idx]",0)}
            ${f("output_data[global_idx]",1)}
            ${f("output_data[global_idx]",2)}
            ${f("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,u,a)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Ud=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,n=e[1].dataType,a=!(B.areEqual(t,r)&&B.areEqual(r,i)),s=t,u=B.size(t);if(a){let p=Vt.calcShape(Vt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");s=p,u=B.size(s)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>Pd(p,e,s,a,n),getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...ee(i,t,r,s)]})}},bf=e=>{e.compute(Ud(e.inputs))}}),yf,dv=U(()=>{"use strict";$g(),ra(),Ag(),kg(),Sg(),Tg(),Eg(),Bg(),Dg(),Mg(),Rg(),Ng(),qg(),Pg(),Ug(),Lg(),Fg(),Gg(),Wg(),Vg(),Hg(),Kg(),Xg(),Zg(),Qg(),Yg(),Rc(),Jg(),ev(),tv(),rv(),iv(),ta(),nv(),Lc(),av(),sv(),ov(),Pc(),uv(),_t(),ia(),lv(),yf=new Map([["Abs",[up]],["Acos",[lp]],["Acosh",[dp]],["Add",[Wp]],["ArgMax",[np,zn]],["ArgMin",[ip,zn]],["Asin",[pp]],["Asinh",[cp]],["Atan",[fp]],["Atanh",[hp]],["Attention",[ap]],["AveragePool",[Qc,Zc]],["BatchNormalization",[sp]],["BiasAdd",[op]],["BiasSplitGelu",[Gp]],["Cast",[gp,mp]],["Ceil",[bp]],["Clip",[vp]],["Concat",[tc,rc]],["Conv",[Mn,Dn]],["ConvTranspose",[cc,pc]],["Cos",[yp]],["Cosh",[_p]],["CumSum",[fc,hc]],["DepthToSpace",[mc,gc]],["DequantizeLinear",[af,sf]],["DFT",[vc,bc]],["Div",[Vp]],["Einsum",[yc,_c]],["Elu",[xp,cr]],["Equal",[Hp]],["Erf",[wp]],["Exp",[$p]],["Expand",[xc]],["FastGelu",[wc]],["Floor",[Ap]],["FusedConv",[Mn,Dn]],["Gather",[Ac,$c]],["GatherElements",[zc,Ic]],["GatherBlockQuantized",[Tc,Ec]],["GatherND",[kc,Sc]],["Gelu",[kp]],["Gemm",[Cc,jc]],["GlobalAveragePool",[Jc,Yc]],["GlobalMaxPool",[nf,rf]],["Greater",[Qp]],["GreaterOrEqual",[Jp]],["GridSample",[Bc,Oc]],["GroupQueryAttention",[Fc]],["HardSigmoid",[Bp,Cp]],["HardSwish",[Op]],["InstanceNormalization",[Gc]],["LayerNormalization",[Wc]],["LeakyRelu",[Sp,cr]],["Less",[Yp]],["LessOrEqual",[ec]],["Log",[Lp]],["MatMul",[Vc]],["MatMulNBits",[Hc,Kc]],["MaxPool",[ef,tf]],["Mul",[Kp]],["MultiHeadAttention",[Mc,Dc]],["Neg",[Ep]],["Not",[Tp]],["Pad",[Xc]],["Pow",[Xp]],["QuickGelu",[Fp,cr]],["Range",[of]],["Reciprocal",[Ip]],["ReduceMin",[Y0]],["ReduceMean",[H0]],["ReduceMax",[Q0]],["ReduceSum",[ep]],["ReduceProd",[J0]],["ReduceL1",[K0]],["ReduceL2",[X0]],["ReduceLogSum",[rp]],["ReduceLogSumExp",[Z0]],["ReduceSumSquare",[tp]],["Relu",[zp]],["Resize",[df,pf]],["RotaryEmbedding",[Uc]],["ScatterND",[lf,uf]],["Sigmoid",[jp]],["Sin",[Dp]],["Sinh",[Mp]],["Slice",[ff,hf]],["SkipLayerNormalization",[cf]],["Split",[Nc,qc]],["Sqrt",[Rp]],["Softmax",[mf,gf]],["Sub",[Zp]],["Tan",[Np]],["Tanh",[qp]],["ThresholdedRelu",[Up,cr]],["Tile",[vf]],["Transpose",[D0,M0]],["Where",[bf]]])}),_f,pv=U(()=>{"use strict";Le(),ut(),ue(),_f=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,n){rt(e.programInfo.name);let a=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});n&&u.push({binding:u.length,resource:n});let l=a.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Qe(e.programInfo.name)}dispose(){}build(e,t){rt(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let n=O0(t,this.backend.device.limits),a=e.getShaderSource(n),s=`${i.join(`
`)}
${n.additionalImplementations}
${a}`,u=r.createShaderModule({code:s,label:e.name});he("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return Qe(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:n.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,n=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=n&&r<=n&&i<=n)return[t,r,i];let a=t*r*i,s=Math.ceil(Math.sqrt(a));if(s>n){if(s=Math.ceil(Math.cbrt(a)),s>n)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),xf={};Kt(xf,{WebGpuBackend:()=>wf});var Ld,Fd,Gd,wf,cv=U(()=>{"use strict";Le(),ne(),ut(),I0(),xg(),dv(),pv(),Ld=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let n=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${n}`);break}case"rank":{let a=e[i].dims.length;r.push(`${n};${a}`);break}case"dims":{let a=e[i].dims.join(",");r.push(`${n};${a}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Fd=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Ld(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},Gd=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},wf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},n=u=>t.features.has(u)&&r.push(u)&&!0;n("chromium-experimental-timestamp-query-inside-passes")||n("timestamp-query"),n("shader-f16"),n("subgroups"),this.device=await t.requestDevice(i);let a=t,s=t.info??(typeof a.requestAdapterInfo=="function"?await a.requestAdapterInfo():void 0);this.adapterInfo=new Gd(s),this.gpuDataManager=C0(this),this.programManager=new _f(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Qn(e.logLevel,!!e.debug),this.device.onuncapturederror=u=>{u.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${u.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&this.env?.webgpu&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;rt(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let n=r[i],a=n.kernelId,s=this.kernels.get(a),u=s.kernelType,l=s.kernelName,p=n.programName,c=n.inputTensorViews,f=n.outputTensorViews,g=t[i*2],b=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let v=Number(g-this.queryTimeBase),_=Number(b-this.queryTimeBase);if(!Number.isSafeInteger(v)||!Number.isSafeInteger(_))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:c.map(A=>({dims:A.dims,dataType:ot(A.dataType)})),outputsMetadata:f.map(A=>({dims:A.dims,dataType:ot(A.dataType)})),kernelId:a,kernelType:u,kernelName:l,programName:p,startTime:v,endTime:_});else{let A="";c.forEach((y,S)=>{A+=`input[${S}]: [${y.dims}] | ${ot(y.dataType)}, `});let $="";f.forEach((y,S)=>{$+=`output[${S}]: [${y.dims}] | ${ot(y.dataType)}, `}),console.log(`[profiling] kernel "${a}|${u}|${l}|${p}" ${A}${$}start time: ${v} ns, execution time: ${_-v} ns`)}Wr("GPU",`${p}::${g}::${b}`)}e.unmap(),this.pendingQueries.delete(e)}),Qe()}run(e,t,r,i,n,a){rt(e.name);let s=[];for(let y=0;y<t.length;++y){let S=t[y].data;if(S===0)continue;let k=this.gpuDataManager.get(S);if(!k)throw new Error(`no GPU data for input: ${S}`);s.push(k)}let{outputs:u,dispatchGroup:l,programUniforms:p}=e.getRunData(t),c=r.length===0?u.map((y,S)=>S):r;if(c.length!==u.length)throw new Error(`Output size ${c.length} must be equal to ${u.length}.`);let f=[],g=[];for(let y=0;y<u.length;++y){if(!Number.isInteger(c[y])||c[y]<-3||c[y]>=a)throw new Error(`Invalid output index: ${c[y]}`);if(c[y]===-3)continue;let S=c[y]===-1,k=c[y]===-2,T=S||k?n(u[y].dataType,u[y].dims):i(c[y],u[y].dataType,u[y].dims);if(f.push(T),T.data===0)continue;let I=this.gpuDataManager.get(T.data);if(!I)throw new Error(`no GPU data for output: ${T.data}`);if(S&&this.temporaryData.push(I),k){let z=this.kernelPersistentData.get(this.currentKernelId);z||(z=[],this.kernelPersistentData.set(this.currentKernelId,z)),z.push(I)}g.push(I)}if(s.length!==t.length||g.length!==f.length){if(g.length===0)return Qe(e.name),f;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let b;if(p){let y=0,S=[];p.forEach(z=>{let w=typeof z.data=="number"?[z.data]:z.data;if(w.length===0)return;let O=z.type===10?2:4,M,F;z.type===10?(F=w.length>4?16:w.length>2?8:w.length*O,M=w.length>4?16:O*w.length):(F=w.length<=2?w.length*O:16,M=16),y=Math.ceil(y/F)*F,S.push(y);let G=z.type===10?8:4;y+=w.length>4?Math.ceil(w.length/G)*M:w.length*O});let k=16;y=Math.ceil(y/k)*k;let T=new ArrayBuffer(y);p.forEach((z,w)=>{let O=S[w],M=typeof z.data=="number"?[z.data]:z.data;if(z.type===6)new Int32Array(T,O,M.length).set(M);else if(z.type===12)new Uint32Array(T,O,M.length).set(M);else if(z.type===10)new Uint16Array(T,O,M.length).set(M);else if(z.type===1)new Float32Array(T,O,M.length).set(M);else throw new Error(`Unsupported uniform type: ${ot(z.type)}`)});let I=this.gpuDataManager.create(y,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(I.buffer,0,T,0,y),this.gpuDataManager.release(I.id),b={offset:0,size:y,buffer:I.buffer}}let v=this.programManager.normalizeDispatchGroupSize(l),_=v[1]===1&&v[2]===1,A=Fd(e,t,_),$=this.programManager.getArtifact(A);if($||($=this.programManager.build(e,v),this.programManager.setArtifact(A,$),he("info",()=>`[artifact] key: ${A}, programName: ${e.name}`)),p&&$.uniformVariablesInfo){if(p.length!==$.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${$.uniformVariablesInfo.length}, got ${p.length} in program "${$.programInfo.name}".`);for(let y=0;y<p.length;y++){let S=p[y],k=S.type,T=typeof S.data=="number"?1:S.data.length,[I,z]=$.uniformVariablesInfo[y];if(k!==I||T!==z)throw new Error(`Uniform variable ${y} mismatch: expect type ${I} with size ${z}, got type ${k} with size ${T} in program "${$.programInfo.name}".`)}}if(he("info",()=>`[ProgramManager] run "${e.name}" (key=${A}) with ${v[0]}x${v[1]}x${v[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let y={kernelId:this.currentKernelId,programName:$.programInfo.name,inputTensorViews:t,outputTensorViews:f};this.pendingKernels.push(y),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(y)}return this.programManager.run($,s,g,v,b),Qe(e.name),f}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let n=yf.get(e);if(!n)throw new Error(`kernel not implemented: ${e}`);let a={kernelType:e,kernelName:i,kernelEntry:n[0],attributes:[n[1],r]};this.kernels.set(t,a)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let n=i.kernelType,a=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${n}] ${a}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),he("info",()=>`[WebGPU] Start to run kernel "[${n}] ${a}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${n}] ${a}" failed. ${p}`)),1}finally{l&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${n}] ${a}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let n=this.sessionExternalDataMapping.get(e);n||(n=new Map,this.sessionExternalDataMapping.set(e,n));let a=n.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,a);return n.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Tn(this,e,t);return Yn(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){he("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){he("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){he("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let n=this.getComputePassEncoder(),a=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),n.setPipeline(a.computePipeline),n.setBindGroup(0,a.bindGroup),n.dispatchWorkgroups(...a.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),$f={};Kt($f,{init:()=>Af});var Pr,Wd,Af,fv=U(()=>{"use strict";ne(),ut(),oe(),_g(),Pr=class kf{constructor(t,r,i,n){this.module=t,this.dataType=r,this.data=i,this.dims=n}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(B.size(t)!==B.size(this.dims))throw new Error("Invalid new shape");return new kf(this.module,this.dataType,this.data,t)}},Wd=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,n=r/e.PTR_SIZE,a=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*n++,a));let s=Number(e.getValue(i*n++,a));this.outputCount=Number(e.getValue(i*n++,a)),this.customDataOffset=Number(e.getValue(i*n++,"*")),this.customDataSize=Number(e.getValue(i*n++,a));let u=[];for(let l=0;l<s;l++){let p=Number(e.getValue(i*n++,a)),c=Number(e.getValue(i*n++,"*")),f=Number(e.getValue(i*n++,a)),g=[];for(let b=0;b<f;b++)g.push(Number(e.getValue(i*n++,a)));u.push(new Pr(e,p,c,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(s=>typeof s=="number"?this.inputs[s]:s)??this.inputs,i=t?.outputs??[],n=(s,u,l)=>new Pr(this.module,u,this.output(s,l),l),a=(s,u)=>{let l=jt(s,u);if(!l)throw new Error(`Unsupported data type: ${s}`);let p=l>0?this.backend.gpuDataManager.create(l).id:0;return new Pr(this.module,s,p,u)};return this.backend.run(e,r,i,n,a,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,n=i===4?"i32":"i64",a=this.module.stackAlloc((1+t.length)*i);this.module.setValue(a,t.length,n);for(let s=0;s<t.length;s++)this.module.setValue(a+i*(s+1),t[s],n);return this.module._JsepOutput(this.opKernelContext,e,a)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Af=async(e,t,r,i)=>{let n=t.jsepInit;if(!n)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let a=(cv(),mr(xf)).WebGpuBackend,s=new a;await s.initialize(r,i),n("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,l,p,c=!1)=>{if(c)he("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(p)}`),s.memcpy(Number(u),Number(l));else{he("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(p)}`);let f=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(l),f)}},async(u,l,p)=>{he("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+p)>>>0))},(u,l,p)=>s.createKernel(u,Number(l),p,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),u=>s.releaseKernel(u),(u,l,p,c)=>{he("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${l}`);let f=new Wd(t,s,Number(l));return s.computeKernel(Number(u),f,c)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let a=new j0(r);n("webnn",[a,()=>a.reserveTensorId(),s=>a.releaseTensorId(s),async(s,u,l,p,c)=>a.ensureTensor(s,u,l,p,c),(s,u)=>{a.uploadTensor(s,u)},async(s,u)=>a.downloadTensor(s,u),(s,u)=>a.registerMLContext(s,u),!!r.trace])}}}),Vd,la,da,gt,Hd,xn,Yr,pa,ca,wn,fa,ha,ma,Sf=U(()=>{"use strict";Le(),vg(),bg(),ne(),Rt(),Hn(),k0(),Vd=(e,t)=>{$e()._OrtInit(e,t)!==0&&ye("Can't initialize onnxruntime.")},la=async e=>{Vd(e.wasm.numThreads,Hr(e.logLevel))},da=async(e,t)=>{$e().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let n=e.webgpu.forceFallbackAdapter;if(n!==void 0&&typeof n!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${n}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:n}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let i=(fv(),mr($f)).init;t==="webgpu"&&await i("webgpu",$e(),e,r),t==="webnn"&&await i("webnn",$e(),e)}},gt=new Map,Hd=e=>{let t=$e(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,n,n+i)!==0&&ye("Can't get session input/output count.");let a=i===4?"i32":"i64";return[Number(t.getValue(n,a)),Number(t.getValue(n+i,a))]}finally{t.stackRestore(r)}},xn=(e,t)=>{let r=$e(),i=r.stackSave(),n=0;try{let a=r.PTR_SIZE,s=r.stackAlloc(2*a);r._OrtGetInputOutputMetadata(e,t,s,s+a)!==0&&ye("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));n=Number(r.getValue(s+a,"*"));let l=r.HEAP32[n/4];if(l===0)return[u,0];let p=r.HEAPU32[n/4+1],c=[];for(let f=0;f<p;f++){let g=Number(r.getValue(n+8+f*a,"*"));c.push(g!==0?r.UTF8ToString(g):Number(r.getValue(n+8+(f+p)*a,"*")))}return[u,l,c]}finally{r.stackRestore(i),n!==0&&r._OrtFree(n)}},Yr=e=>{let t=$e(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},pa=async(e,t)=>{let r,i,n=$e();Array.isArray(e)?[r,i]=e:e.buffer===n.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Yr(e);let a=0,s=0,u=0,l=[],p=[],c=[];try{if([s,l]=await A0(t),t?.externalData&&n.mountExternalData){let k=[];for(let T of t.externalData){let I=typeof T=="string"?T:T.path,z=typeof T=="string"?T:T.data;k.push(Zn(z).then(w=>{n.mountExternalData(I,w)}))}await Promise.all(k)}for(let k of t?.executionProviders??[])if((typeof k=="string"?k:k.name)==="webnn"){if(n.shouldTransferToMLTensor=!1,typeof k!="string"){let T=k,I=T?.context,z=T?.gpuDevice,w=T?.deviceType,O=T?.powerPreference;I?n.currentContext=I:z?n.currentContext=await n.webnnCreateMLContext(z):n.currentContext=await n.webnnCreateMLContext({deviceType:w,powerPreference:O})}else n.currentContext=await n.webnnCreateMLContext();break}a=await n._OrtCreateSession(r,i,s),n.webgpuOnCreateSession?.(a),a===0&&ye("Can't create a session."),n.jsepOnCreateSession?.(),n.currentContext&&(n.webnnRegisterMLContext(a,n.currentContext),n.currentContext=void 0,n.shouldTransferToMLTensor=!0);let[f,g]=Hd(a),b=!!t?.enableGraphCapture,v=[],_=[],A=[],$=[],y=[];for(let k=0;k<f;k++){let[T,I,z]=xn(a,k);T===0&&ye("Can't get an input name."),p.push(T);let w=n.UTF8ToString(T);v.push(w),A.push(I===0?{name:w,isTensor:!1}:{name:w,isTensor:!0,type:ot(I),shape:z})}for(let k=0;k<g;k++){let[T,I,z]=xn(a,k+f);T===0&&ye("Can't get an output name."),c.push(T);let w=n.UTF8ToString(T);_.push(w),$.push(I===0?{name:w,isTensor:!1}:{name:w,isTensor:!0,type:ot(I),shape:z});{if(b&&t?.preferredOutputLocation===void 0){y.push("gpu-buffer");continue}let O=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[w]??"cpu",M=n.webnnIsGraphOutput;if(O==="cpu"&&M&&M(a,w)){y.push("ml-tensor-cpu-output");continue}if(O!=="cpu"&&O!=="cpu-pinned"&&O!=="gpu-buffer"&&O!=="ml-tensor")throw new Error(`Not supported preferred output location: ${O}.`);if(b&&O!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${O}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);y.push(O)}}let S=null;return y.some(k=>k==="gpu-buffer"||k==="ml-tensor"||k==="ml-tensor-cpu-output")&&(u=n._OrtCreateBinding(a),u===0&&ye("Can't create IO binding."),S={handle:u,outputPreferredLocations:y,outputPreferredLocationsEncoded:y.map(k=>k==="ml-tensor-cpu-output"?"ml-tensor":k).map(k=>Sn(k))}),gt.set(a,[a,p,c,S,b,!1]),[a,v,_,A,$]}catch(f){throw p.forEach(g=>n._OrtFree(g)),c.forEach(g=>n._OrtFree(g)),u!==0&&n._OrtReleaseBinding(u)!==0&&ye("Can't release IO binding."),a!==0&&n._OrtReleaseSession(a)!==0&&ye("Can't release session."),f}finally{n._free(r),s!==0&&n._OrtReleaseSessionOptions(s)!==0&&ye("Can't release session options."),l.forEach(f=>n._free(f)),n.unmountExternalData?.()}},ca=e=>{let t=$e(),r=gt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,n,a,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&ye("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&ye("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),n.forEach(l=>t._OrtFree(l)),a.forEach(l=>t._OrtFree(l)),t._OrtReleaseSession(i)!==0&&ye("Can't release session."),gt.delete(e)},wn=async(e,t,r,i,n,a,s=!1)=>{if(!e){t.push(0);return}let u=$e(),l=u.PTR_SIZE,p=e[0],c=e[1],f=e[3],g=f,b,v;if(p==="string"&&(f==="gpu-buffer"||f==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&f!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${a} when enableGraphCapture is true.`);if(f==="gpu-buffer"){let $=e[2].gpuBuffer;v=jt(zt(p),c);{let y=u.jsepRegisterBuffer;if(!y)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');b=y(i,a,$,v)}}else if(f==="ml-tensor"){let $=e[2].mlTensor;v=jt(zt(p),c);let y=u.webnnRegisterMLTensor;if(!y)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');b=y(i,$,zt(p),c)}else{let $=e[2];if(Array.isArray($)){v=l*$.length,b=u._malloc(v),r.push(b);for(let y=0;y<$.length;y++){if(typeof $[y]!="string")throw new TypeError(`tensor data at index ${y} is not a string`);u.setValue(b+y*l,Xe($[y],r),"*")}}else{let y=u.webnnIsGraphInput,S=u.webnnIsGraphOutput;if(p!=="string"&&y&&S){let k=u.UTF8ToString(n);if(y(i,k)||S(i,k)){let T=zt(p);v=jt(T,c),g="ml-tensor";let I=u.webnnCreateTemporaryTensor,z=u.webnnUploadTensor;if(!I||!z)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let w=await I(i,T,c);z(w,new Uint8Array($.buffer,$.byteOffset,$.byteLength)),b=w}else v=$.byteLength,b=u._malloc(v),r.push(b),u.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,v),b)}else v=$.byteLength,b=u._malloc(v),r.push(b),u.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,v),b)}}let _=u.stackSave(),A=u.stackAlloc(4*c.length);try{c.forEach((y,S)=>u.setValue(A+S*l,y,l===4?"i32":"i64"));let $=u._OrtCreateTensor(zt(p),b,v,A,c.length,Sn(g));$===0&&ye(`Can't create tensor for input/output. session=${i}, index=${a}.`),t.push($)}finally{u.stackRestore(_)}},fa=async(e,t,r,i,n,a)=>{let s=$e(),u=s.PTR_SIZE,l=gt.get(e);if(!l)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=l[0],c=l[1],f=l[2],g=l[3],b=l[4],v=l[5],_=t.length,A=i.length,$=0,y=[],S=[],k=[],T=[],I=[],z=s.stackSave(),w=s.stackAlloc(_*u),O=s.stackAlloc(_*u),M=s.stackAlloc(A*u),F=s.stackAlloc(A*u);try{[$,y]=$0(a),Ct("wasm prepareInputOutputTensor");for(let N=0;N<_;N++)await wn(r[N],S,T,e,c[t[N]],t[N],b);for(let N=0;N<A;N++)await wn(n[N],k,T,e,f[i[N]],_+i[N],b);Bt("wasm prepareInputOutputTensor");for(let N=0;N<_;N++)s.setValue(w+N*u,S[N],"*"),s.setValue(O+N*u,c[t[N]],"*");for(let N=0;N<A;N++)s.setValue(M+N*u,k[N],"*"),s.setValue(F+N*u,f[i[N]],"*");if(g&&!v){let{handle:N,outputPreferredLocations:V,outputPreferredLocationsEncoded:X}=g;if(c.length!==_)throw new Error(`input count from feeds (${_}) is expected to be always equal to model's input count (${c.length}).`);Ct("wasm bindInputsOutputs");for(let te=0;te<_;te++){let re=t[te];await s._OrtBindInput(N,c[re],S[te])!==0&&ye(`Can't bind input[${te}] for session=${e}.`)}for(let te=0;te<A;te++){let re=i[te];n[te]?.[3]?(I.push(k[te]),s._OrtBindOutput(N,f[re],k[te],0)!==0&&ye(`Can't bind pre-allocated output[${te}] for session=${e}.`)):s._OrtBindOutput(N,f[re],0,X[re])!==0&&ye(`Can't bind output[${te}] to ${V[te]} for session=${e}.`)}Bt("wasm bindInputsOutputs"),gt.set(e,[p,c,f,g,b,!0])}s.jsepOnRunStart?.(p),s.webnnOnRunStart?.(p);let G;g?G=await s._OrtRunWithBinding(p,g.handle,A,M,$):G=await s._OrtRun(p,O,w,_,F,A,M,$),G!==0&&ye("failed to call OrtRun().");let L=[],C=[];Ct("wasm ProcessOutputTensor");for(let N=0;N<A;N++){let V=Number(s.getValue(M+N*u,"*"));if(V===k[N]||I.includes(k[N])){L.push(n[N]),V!==k[N]&&s._OrtReleaseTensor(V)!==0&&ye("Can't release tensor.");continue}let X=s.stackSave(),te=s.stackAlloc(4*u),re=!1,ae,q=0;try{s._OrtGetTensorData(V,te,te+u,te+2*u,te+3*u)!==0&&ye(`Can't access output tensor data on index ${N}.`);let J=u===4?"i32":"i64",Y=Number(s.getValue(te,J));q=s.getValue(te+u,"*");let H=s.getValue(te+u*2,"*"),Te=Number(s.getValue(te+u*3,J)),Ee=[];for(let se=0;se<Te;se++)Ee.push(Number(s.getValue(H+se*u,J)));s._OrtFree(H)!==0&&ye("Can't free memory for tensor dims.");let P=Ee.reduce((se,le)=>se*le,1);ae=ot(Y);let ie=g?.outputPreferredLocations[i[N]];if(ae==="string"){if(ie==="gpu-buffer"||ie==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let se=[];for(let le=0;le<P;le++){let me=s.getValue(q+le*u,"*"),qe=s.getValue(q+(le+1)*u,"*"),Ie=le===P-1?void 0:qe-me;se.push(s.UTF8ToString(me,Ie))}L.push([ae,Ee,se,"cpu"])}else if(ie==="gpu-buffer"&&P>0){let se=s.jsepGetBuffer;if(!se)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let le=se(q),me=jt(Y,P);if(me===void 0||!Kn(ae))throw new Error(`Unsupported data type: ${ae}`);re=!0,L.push([ae,Ee,{gpuBuffer:le,download:s.jsepCreateDownloader(le,me,ae),dispose:()=>{s._OrtReleaseTensor(V)!==0&&ye("Can't release tensor.")}},"gpu-buffer"])}else if(ie==="ml-tensor"&&P>0){let se=s.webnnEnsureTensor,le=s.webnnIsGraphInputOutputTypeSupported;if(!se||!le)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(jt(Y,P)===void 0||!Xn(ae))throw new Error(`Unsupported data type: ${ae}`);if(!le(e,ae,!1))throw new Error(`preferredLocation "ml-tensor" for ${ae} output is not supported by current WebNN Context.`);let me=await se(e,q,Y,Ee,!1);re=!0,L.push([ae,Ee,{mlTensor:me,download:s.webnnCreateMLTensorDownloader(q,ae),dispose:()=>{s.webnnReleaseTensorId(q),s._OrtReleaseTensor(V)}},"ml-tensor"])}else if(ie==="ml-tensor-cpu-output"&&P>0){let se=s.webnnCreateMLTensorDownloader(q,ae)(),le=L.length;re=!0,C.push((async()=>{let me=[le,await se];return s.webnnReleaseTensorId(q),s._OrtReleaseTensor(V),me})()),L.push([ae,Ee,[],"cpu"])}else{let se=Jr(ae),le=new se(P);new Uint8Array(le.buffer,le.byteOffset,le.byteLength).set(s.HEAPU8.subarray(q,q+le.byteLength)),L.push([ae,Ee,le,"cpu"])}}finally{s.stackRestore(X),ae==="string"&&q&&s._free(q),re||s._OrtReleaseTensor(V)}}g&&!b&&(s._OrtClearBoundOutputs(g.handle)!==0&&ye("Can't clear bound outputs."),gt.set(e,[p,c,f,g,b,!1]));for(let[N,V]of await Promise.all(C))L[N][2]=V;return Bt("wasm ProcessOutputTensor"),L}finally{s.webnnOnRunEnd?.(p),s.stackRestore(z),S.forEach(G=>s._OrtReleaseTensor(G)),k.forEach(G=>s._OrtReleaseTensor(G)),T.forEach(G=>s._free(G)),$!==0&&s._OrtReleaseRunOptions($),y.forEach(G=>s._free(G))}},ha=e=>{let t=$e(),r=gt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],n=t._OrtEndProfiling(i);n===0&&ye("Can't get an profile file name."),t._OrtFree(n)},ma=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),vt,Ue,Lt,lr,dr,Ur,$n,Lr,Tt,Et,Kd,Tf,Ef,If,zf,jf,Cf,Bf,Of=U(()=>{"use strict";Le(),Sf(),Rt(),Wn(),vt=()=>!!xe.wasm.proxy&&typeof document<"u",Lt=!1,lr=!1,dr=!1,Lr=new Map,Tt=(e,t)=>{let r=Lr.get(e);r?r.push(t):Lr.set(e,[t])},Et=()=>{if(Lt||!lr||dr||!Ue)throw new Error("worker not ready")},Kd=e=>{switch(e.data.type){case"init-wasm":Lt=!1,e.data.err?(dr=!0,$n[1](e.data.err)):(lr=!0,$n[0]()),Ur&&(URL.revokeObjectURL(Ur),Ur=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Lr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},Tf=async()=>{if(!lr){if(Lt)throw new Error("multiple calls to 'initWasm()' detected.");if(dr)throw new Error("previous call to 'initWasm()' failed.");if(Lt=!0,vt())return new Promise((e,t)=>{Ue?.terminate(),x0().then(([r,i])=>{try{Ue=i,Ue.onerror=a=>t(a),Ue.onmessage=Kd,$n=[e,t];let n={type:"init-wasm",in:xe};!n.in.wasm.wasmPaths&&(r||kn)&&(n.in.wasm.wasmPaths={wasm:new URL("/assets/ort-wasm-simd-threaded.jsep-MDYUKy93.wasm",import.meta.url).href}),Ue.postMessage(n),Ur=r}catch(n){t(n)}},t)});try{await Vn(xe.wasm),await la(xe),lr=!0}catch(e){throw dr=!0,e}finally{Lt=!1}}},Ef=async e=>{if(vt())return Et(),new Promise((t,r)=>{Tt("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:xe}};Ue.postMessage(i)});await da(xe,e)},If=async e=>vt()?(Et(),new Promise((t,r)=>{Tt("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Ue.postMessage(i,[e.buffer])})):Yr(e),zf=async(e,t)=>{if(vt()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Et(),new Promise((r,i)=>{Tt("create",[r,i]);let n={type:"create",in:{model:e,options:{...t}}},a=[];e instanceof Uint8Array&&a.push(e.buffer),Ue.postMessage(n,a)})}else return pa(e,t)},jf=async e=>{if(vt())return Et(),new Promise((t,r)=>{Tt("release",[t,r]);let i={type:"release",in:e};Ue.postMessage(i)});ca(e)},Cf=async(e,t,r,i,n,a)=>{if(vt()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(n.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return Et(),new Promise((s,u)=>{Tt("run",[s,u]);let l=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:i,options:a}};Ue.postMessage(p,ma(l))})}else return fa(e,t,r,i,n,a)},Bf=async e=>{if(vt())return Et(),new Promise((t,r)=>{Tt("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Ue.postMessage(i)});ha(e)}}),An,Xd,Df,hv=U(()=>{"use strict";Le(),Of(),ne(),Gn(),k0(),An=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Xd=e=>{switch(e[3]){case"cpu":return new Ze(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Kn(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:n}=e[2];return Ze.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:n})}case"ml-tensor":{let t=e[0];if(!Xn(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:n}=e[2];return Ze.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:n})}default:throw new Error(`invalid data location: ${e[3]}`)}},Df=class{async fetchModelAndCopyToWasmMemory(e){return If(await Zn(e))}async loadModel(e,t){rt();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await zf(r,t),Qe()}async dispose(){return jf(this.sessionId)}async run(e,t,r){rt();let i=[],n=[];Object.entries(e).forEach(f=>{let g=f[0],b=f[1],v=this.inputNames.indexOf(g);if(v===-1)throw new Error(`invalid input '${g}'`);i.push(b),n.push(v)});let a=[],s=[];Object.entries(t).forEach(f=>{let g=f[0],b=f[1],v=this.outputNames.indexOf(g);if(v===-1)throw new Error(`invalid output '${g}'`);a.push(b),s.push(v)});let u=i.map((f,g)=>An(f,()=>`input "${this.inputNames[n[g]]}"`)),l=a.map((f,g)=>f?An(f,()=>`output "${this.outputNames[s[g]]}"`):null),p=await Cf(this.sessionId,n,u,s,l,r),c={};for(let f=0;f<p.length;f++)c[this.outputNames[s[f]]]=a[f]??Xd(p[f]);return Qe(),c}startProfiling(){}endProfiling(){Bf(this.sessionId)}}}),Mf={};Kt(Mf,{OnnxruntimeWebAssemblyBackend:()=>qn,initializeFlags:()=>Nn,wasmBackend:()=>Rf});var Nn,qn,Rf,mv=U(()=>{"use strict";Le(),Of(),hv(),Nn=()=>{(typeof xe.wasm.initTimeout!="number"||xe.wasm.initTimeout<0)&&(xe.wasm.initTimeout=0);let e=xe.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),xe.wasm.simd=!1),typeof xe.wasm.proxy!="boolean"&&(xe.wasm.proxy=!1),typeof xe.wasm.trace!="boolean"&&(xe.wasm.trace=!1),typeof xe.wasm.numThreads!="number"||!Number.isInteger(xe.wasm.numThreads)||xe.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)xe.wasm.numThreads=1;else{let t=typeof navigator>"u"?Jm("node:os").cpus().length:navigator.hardwareConcurrency;xe.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},qn=class{async init(e){Nn(),await Tf(),await Ef(e)}async createInferenceSessionHandler(e,t){let r=new Df;return await r.loadModel(e,t),r}},Rf=new qn});Le();Le();Le();var gv="1.30.0";{let e=(mv(),mr(Mf)).wasmBackend;Gt("webgpu",e,5),Gt("webnn",e,5),Gt("cpu",e,10),Gt("wasm",e,10)}Object.defineProperty(xe.versions,"web",{value:gv,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Nf(e){let t=0;for(let r of e)for(let i=0;i<r.length;i++){let n=Math.abs(r[i]);n>t&&(t=n)}return t}function qf(e,t){return e.map(r=>{let i=new Float32Array(r.length);for(let n=0;n<r.length;n++)i[n]=r[n]*t;return i})}function vv(e,t,r){let i=Math.max(e.length,t.length),n=Math.max(e[0]?.length??0,t[0]?.length??0),a=[];for(let s=0;s<i;s++){let u=e[s],l=t[s],p=new Float32Array(n);for(let c=0;c<n;c++){let f=u&&c<u.length?u[c]:0,g=l&&c<l.length?l[c]:0;p[c]=f-g*r}a.push(p)}return a}function bv(e,t=1,r){let i=Nf(e),n=1;return i>t?n=t/i:r!==void 0&&i<r&&i>0&&(n=r/i),qf(e,n)}var Ft=function(e){return e.LoadingModel="loading-model",e.Demixing="demixing",e.WritingOutput="writing-output",e}({}),yv=class{constructor(e){this.outputDir=e.outputDir||"./output",this.outputFormat=e.outputFormat||"wav",this.normalizationThreshold=e.normalizationThreshold??.9,this.amplificationThreshold=e.amplificationThreshold??.6,this.logLevel=e.logLevel||"info",this.sampleRate=e.sampleRate||44100,this.onProgress=e.onProgress,this.modelPath=e.modelPath,this.modelData=e.modelData||{},this.modelName=e.modelName,this.modelUrl=e.modelUrl,this.primaryStemName=e.primaryStemName||"vocals",this.secondaryStemName=e.secondaryStemName||"instrumental",this.outputSingleStem=e.outputSingleStem,this.invertUsingSpec=e.invertUsingSpec??!1}log(e,t){this.shouldLog(e)&&console.log(`[${e.toUpperCase()}] ${t}`)}debug(e){this.log("debug",e)}info(e){this.log("info",e)}warning(e){this.log("warning",e)}error(e){this.log("error",e)}shouldLog(e){let t=["error","warning","info","debug"],r=t.indexOf(this.logLevel);return t.indexOf(e)<=r}reportProgress(e){if(this.onProgress)try{this.onProgress(e)}catch(t){this.warning(`onProgress callback threw: ${t}`)}}getStemOutputPath(e,t){return t&&t[e]?t[e]:`${this.outputDir}/${this.modelName}_${e}.${this.outputFormat}`}async prepareMix(e){if(Array.isArray(e))return e;if(e instanceof Float32Array)return[e,e];throw Error("Invalid audio data format (expect 1-D or 2-D Float32Array)")}async normalize(e,t=1,r){return bv(e,t,r)}},Zd=class Pf{static async loadAudioFile(t,r=44100){let i=await(await fetch(t)).arrayBuffer(),n=await new OfflineAudioContext(2,1,r).decodeAudioData(i),a=[];for(let s=0;s<n.numberOfChannels;s++)a.push(n.getChannelData(s));return a.length===1&&a.push(new Float32Array(a[0])),a}static async saveAudioFile(t,r,i){return Pf.createWAVBlob(t,r)}static createWAVBlob(t,r){let i=t[0].length,n=t.length,a=n*2,s=i*a,u=44+s,l=new ArrayBuffer(u),p=new DataView(l),c=(g,b)=>{for(let v=0;v<b.length;v++)p.setUint8(g+v,b.charCodeAt(v))};c(0,"RIFF"),p.setUint32(4,u-8,!0),c(8,"WAVE"),c(12,"fmt "),p.setUint32(16,16,!0),p.setUint16(20,1,!0),p.setUint16(22,n,!0),p.setUint32(24,r,!0),p.setUint32(28,r*a,!0),p.setUint16(32,a,!0),p.setUint16(34,16,!0),c(36,"data"),p.setUint32(40,s,!0);let f=44;for(let g=0;g<i;g++)for(let b=0;b<n;b++){let v=Math.max(-1,Math.min(1,t[b][g])),_=Math.floor(v*32767);p.setInt16(f,_,!0),f+=2}return new Blob([l],{type:"audio/wav"})}static interleaveChannels(t){let r=t[0].length,i=t.length,n=new Float32Array(r*i);for(let a=0;a<r;a++)for(let s=0;s<i;s++)n[a*i+s]=t[s][a];return n}static deinterleaveChannels(t,r){let i=t.length/r,n=[];for(let a=0;a<r;a++){n[a]=new Float32Array(i);for(let s=0;s<i;s++)n[a][s]=t[s*r+a]}return n}};async function _v(e={}){var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope;globalThis.process?.versions?.node&&globalThis.process?.type;var n=import.meta.url;if(r||i)try{new URL(".",n).href}catch{}console.log.bind(console);var a=console.error.bind(console),s,u=!1;function l(P){for(var ie=0,se=P.length,le=new Uint8Array(se),me;ie<se;++ie)me=P.charCodeAt(ie),le[ie]=~me>>8&me;return le}function p(){try{return J.toResizableBuffer()}catch{}return J.buffer}function c(){if(!z?.buffer?.resizable){var P=p();z=new Int8Array(P),t.HEAPU8=w=new Uint8Array(P),t.HEAPF32=new Float32Array(P),new BigInt64Array(P),new BigUint64Array(P)}}function f(){var P=t.preRun;P&&(typeof P=="function"&&(P=[P]),F.push(...P)),O(F)}function g(){Ee.d()}function b(){var P=t.postRun;P&&(typeof P=="function"&&(P=[P]),M.push(...P)),O(M)}function v(P){throw t.onAbort?.(P),P=`Aborted(${P})`,a(P),u=!0,P+=". Build with -sASSERTIONS for more info.",new WebAssembly.RuntimeError(P)}var _;function A(){return l(`\0asm\0\0\0G\f\`\`\0\`\0\`}}\`|}\`\0\`||\`\x07\`}\`\0\`\`\0\0\raa\0ab\0\0\0\0\0\x07\b	
\v\x07\bA°¥\v\x07-\vc\0d\0e\0f\0g\0h\0
i\0\vj\0	k\0\x07l\0m\0\f
ö|#\0Ak"$\0@ \0¼"Aÿÿÿÿ\x07q"AÚ¤úM@ AÌI\r \0»!\0\f\v AÑ§íM@ \0»! AãÛM@ A\0H@ D-DTû!ù? !\0\f\v D-DTû!ù¿ !\0\f\vD-DTû!	ÀD-DTû!	@ A\0N\x1B  !\0\f\v AÕãM@ AßÛ¿M@ \0»! A\0H@ DÒ!3|Ù@ !\0\f\v DÒ!3|ÙÀ !\0\f\vD-DTû!@D-DTû!À A\0H\x1B \0» !\0\f\v Aü\x07O@ \0 \0!\0\f\v \0 A\bj! +\b!@@@@ AqAk\0\v !\0\f\v !\0\f\v !\0\f\v !\0\v Aj$\0 \0\væ|#\0Ak"$\0} \0¼"Aÿÿÿÿ\x07q"AÚ¤úM@C\0\0? AÌI\r \0»\f\v AÑ§íM@ AäÛO@D-DTû!	@D-DTû!	À A\0H\x1B \0» \f\v \0»! A\0H@ D-DTû!ù? \f\vD-DTû!ù? ¡\f\v AÕãM@ AàÛ¿O@D-DTû!@D-DTû!À A\0H\x1B \0» \f\v A\0H@DÒ!3|ÙÀ \0»¡\f\v \0»DÒ!3|ÙÀ \f\v \0 \0 Aü\x07O\r\0 \0 A\bj! +\b!@@@@ AqAk\0\v \f\v \f\v \f\v \v Aj$\0\vK| \0 \0 \0¢"¢"  ¢¢ D§F;ÍÆ>¢DtçÊâù\0*¿ ¢  D²ûn?¢Dw¬ËTUUÅ¿ ¢ \0  ¶\vO| \0 \0¢"\0 \0 \0¢"¢ \0DiPîàBù>¢D'èÀV¿ ¢ DB:áSU¥?¢ \0D^\fýÿÿß¿¢D\0\0\0\0\0\0ð?   ¶\vT~@A°!(\0"­ \0­B\x07|Bøÿÿÿ|"BÿÿÿÿX@ §"\0?\0AtM\r \0\r\vA´!A06\0A\vA°! \x006\0 \vß\v\b@ \0E\r\0 \0A\bk" \0Ak(\0"Axq"\0j!@ Aq\r\0 AqE\r  (\0"k"AÈ!(\0I\r \0 j!\0@@@AÌ!(\0 G@ (\f! AÿM@  (\b"G\rA¸!A¸!(\0A~ Avwq6\0\f\v (!\x07  G@ (\b" 6\f  6\b\f\v (" Aj ("E\r Aj\v!@ ! "Aj! ("\r\0 Aj! ("\r\0\v A\x006\0\f\v ("AqAG\rAÀ! \x006\0  A~q6  \0Ar6  \x006\0\v  6\f  6\b\f\vA\0!\v \x07E\r\0@ ("At"(è# F@ Aè#j 6\0 \rA¼!A¼!(\0A~ wq6\0\f\v@  \x07(F@ \x07 6\f\v \x07 6\v E\r\v  \x076 ("@  6  6\v ("E\r\0  6  6\v  O\r\0 ("AqE\r\0@@@@ AqE@AÐ!(\0 F@AÐ! 6\0AÄ!AÄ!(\0 \0j"\x006\0  \0Ar6 AÌ!(\0G\rAÀ!A\x006\0AÌ!A\x006\0\vAÌ!(\0"\x07 F@AÌ! 6\0AÀ!AÀ!(\0 \0j"\x006\0  \0Ar6 \0 j \x006\0\v Axq \0j!\0 (\f! AÿM@ (\b" F@A¸!A¸!(\0A~ Avwq6\0\f\v  6\f  6\b\f\v (!\b  G@ (\b" 6\f  6\b\f\v (" Aj ("E\r Aj\v!@ ! "Aj! ("\r\0 Aj! ("\r\0\v A\x006\0\f\v  A~q6  \0Ar6 \0 j \x006\0\f\vA\0!\v \bE\r\0@ ("At"(è# F@ Aè#j 6\0 \rA¼!A¼!(\0A~ wq6\0\f\v@  \b(F@ \b 6\f\v \b 6\v E\r\v  \b6 ("@  6  6\v ("E\r\0  6  6\v  \0Ar6 \0 j \x006\0  \x07G\r\0AÀ! \x006\0\v \0AÿM@ \0AøqAà!j!A¸!(\0"A \0Avt"\0qE@A¸! \0 r6\0 \f\v (\b\v!\0  6\b \0 6\f  6\f  \x006\b\vA! \0Aÿÿÿ\x07M@ \0A& \0A\bvg"kvAq AtrA>s!\v  6 B\x007 AtAè#j!@A¼!(\0"A t"qE@A¼!  r6\0  6\0A!A\b\f\v \0A AvkA\0 AG\x1Bt! (\0!@ "(Axq \0F\r Av! At!  Aqj"("\r\0\v  6A! !A\b\v!\0 "\f\v (\b" 6\f  6\bA!\0A\b!A\0\v!  j 6\0  6\f \0 j 6\0AØ!AØ!(\0Ak"\0A \0\x1B6\0\v\v¨\0@ A\bN@ \0D\0\0\0\0\0\0à¢!\0 AÿI@ Aÿ\x07k!\f\v \0D\0\0\0\0\0\0à¢!\0Aý  AýO\x1BAþk!\f\v AxJ\r\0 \0D\0\0\0\0\0\0\`¢!\0 A¸pK@ AÉ\x07j!\f\v \0D\0\0\0\0\0\0\`¢!\0Aðh  AðhM\x1BAj!\v \0 Aÿ\x07j­B4¿¢\v\0 \0@ \0Ak(\0\x07\v\vÁ'\v#\0Ak"
$\0@@@@@@@@@@ \0AôM@A¸!(\0"A \0A\vjAøq \0A\vI\x1B"Av"\0v"Aq@@ AsAq \0j"At"Aà!j"\0 (è!"(\b"F@A¸! A~ wq6\0\f\v  \x006\f \0 6\b\v A\bj!\0  Ar6  j" (Ar6\f\v\v AÀ!(\0"\bM\r @@A \0t"A\0 kr  \0tqh"At"Aà!j" (è!"\0(\b"F@A¸! A~ wq"6\0\f\v  6\f  6\b\v \0 Ar6 \0 j"\x07  k"Ar6 \0 j 6\0 \b@ \bAxqAà!j!AÌ!(\0! A \bAvt"qE@A¸!  r6\0 \f\v (\b\v!  6\b  6\f  6\f  6\b\v \0A\bj!\0AÌ! \x076\0AÀ! 6\0\f\v\vA¼!(\0"\vE\r \vhAt(è#"(Axq k! !@@ ("\0E@ ("\0E\r\v \0(Axq k"   I"\x1B! \0  \x1B! \0!\f\v\v (!	  (\f"\0G@ (\b" \x006\f \0 6\b\f
\v (" Aj ("E\r Aj\v!@ !\x07 "\0Aj! \0("\r\0 \0Aj! \0("\r\0\v \x07A\x006\0\f	\vA! \0A¿K\r\0 \0A\vj"Axq!A¼!(\0"\x07E\r\0A!\bA\0 k! \0Aôÿÿ\x07M@ A& A\bvg"\0kvAq \0AtkA>j!\b\v@@@ \bAt(è#"E@A\0!\0\f\vA\0!\0 A \bAvkA\0 \bAG\x1Bt!@@ (Axq k" O\r\0 ! "\r\0A\0! !\0\f\v \0 ("   AvAqj("F\x1B \0 \x1B!\0 At! \r\0\v\v \0 rE@A\0!A \bt"\0A\0 \0kr \x07q"\0E\r \0hAt(è#!\0\v \0E\r\v@ \0(Axq k" I!   \x1B! \0  \x1B! \0("  \0(\v"\0\r\0\v\v E\r\0 AÀ!(\0 kO\r\0 (!\b  (\f"\0G@ (\b" \x006\f \0 6\b\f\b\v (" Aj ("E\r Aj\v!@ ! "\0Aj! \0("\r\0 \0Aj! \0("\r\0\v A\x006\0\f\x07\v AÀ!(\0"M@AÌ!(\0!\0@  k"AO@ \0 j" Ar6 \0 j 6\0 \0 Ar6\f\v \0 Ar6 \0 j" (Ar6A\0!A\0!\vAÀ! 6\0AÌ! 6\0 \0A\bj!\0\f	\v AÄ!(\0"I@AÄ!  k"6\0AÐ!AÐ!(\0"\0 j"6\0  Ar6 \0 Ar6 \0A\bj!\0\f	\vA\0!\0 A/j"A%(\0@A%(\0\f\vA%B7\0A%B 7\0A% 
A\fjApqAØªÕªs6\0A¤%A\x006\0Aô$A\x006\0A \v"j"A\0 k"\x07q" M\r\bAð$(\0"@Aè$(\0"\b j"	 \bM\r	  	I\r	\v@Aô$-\0\0AqE@@@@@AÐ!(\0"@Aø$!\0@ \0(\0"\b M@  \b \0(jI\r\v \0(\b"\0\r\0\v\vA\0"AF\r !A%(\0"\0Ak" q@  k  jA\0 \0kqj!\v  M\rAð$(\0"\0@Aè$(\0" j"\x07 M\r \0 \x07I\r\v "\0 G\r\f\v  k \x07q"" \0(\0 \0(jF\r !\0\v \0AF\r A0j M@ \0!\f\vA%(\0"  kjA\0 kq"AF\r  j! \0!\f\v AG\r\vAô$Aô$(\0Ar6\0\v !A\0!\0 AF\r \0AF\r \0 M\r \0 k" A(jM\r\vAè$Aè$(\0 j"\x006\0Aì$(\0 \0I@Aì$ \x006\0\v@AÐ!(\0"@Aø$!\0@  \0(\0" \0("jF\r \0(\b"\0\r\0\v\f\vAÈ!(\0"\0A\0 \0 M\x1BE@AÈ! 6\0\vA\0!\0Aü$ 6\0Aø$ 6\0AØ!A6\0AÜ!A%(\x006\0A%A\x006\0@ \0At" Aà!j"6è!  6ì! \0Aj"\0A G\r\0\vAÄ! A(k"\0Ax kA\x07q"k"6\0AÐ!  j"6\0  Ar6 \0 jA(6AÔ!A %(\x006\0\f\v  M\r  K\r \0(\fA\bq\r \0  j6AÐ! Ax kA\x07q"\0j"6\0AÄ!AÄ!(\0 j" \0k"\x006\0  \0Ar6  jA(6AÔ!A %(\x006\0\f\vA\0!\0\f\vA\0!\0\f\vAÈ!(\0 K@AÈ! 6\0\v  j!Aø$!\0@@  \0(\0"G@ \0(\b"\0\r\f\v\v \0-\0\fA\bqE\r\vAø$!\0@@ \0(\0" M@   \0(j"I\r\v \0(\b!\0\f\v\vAÄ! A(k"\0Ax kA\x07q"k"\x076\0AÐ!  j"6\0  \x07Ar6 \0 jA(6AÔ!A %(\x006\0  A' kA\x07qjA/k"\0 \0 AjI\x1B"A\x1B6 A%)\x007 Aø$)\x007\bA% A\bj6\0Aü$ 6\0Aø$ 6\0A%A\x006\0 Aj!\0@ \0A\x076 \0A\bj \0Aj!\0 I\r\0\v  F\r\0  (A~q6   k"Ar6  6\0 AÿM@ AøqAà!j!\0A¸!(\0"A Avt"qE@A¸!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\fA\f!A\b\f\vA!\0 Aÿÿÿ\x07M@ A& A\bvg"\0kvAq \0AtrA>s!\0\v  \x006 B\x007 \0AtAè#j!@@A¼!(\0"A \0t"qE@A¼!  r6\0  6\0\f\v A \0AvkA\0 \0AG\x1Bt!\0 (\0!@ "(Axq F\r \0Av! \0At!\0  Aqj"("\r\0\v  6\v  6A\b! "!\0A\f\f\v (\b"\0 6\f  6\b  \x006\bA\0!\0A!A\f\v j 6\0  j \x006\0\vAÄ!(\0"\0 M\r\0AÄ! \0 k"6\0AÐ!AÐ!(\0"\0 j"6\0  Ar6 \0 Ar6 \0A\bj!\0\f\vA´!A06\0A\0!\0\f\v \0 6\0 \0 \0( j6 Ax kA\x07qj"\b Ar6 Ax kA\x07qj"  \bj"k!\x07@AÐ!(\0 F@AÐ! 6\0AÄ!AÄ!(\0 \x07j"\x006\0  \0Ar6\f\vAÌ!(\0 F@AÌ! 6\0AÀ!AÀ!(\0 \x07j"\x006\0  \0Ar6 \0 j \x006\0\f\v ("\0AqAF@ \0Axq!	 (\f!@ \0AÿM@ (\b" F@A¸!A¸!(\0A~ \0Avwq6\0\f\v  6\f  6\b\f\v (!@  G@ (\b"\0 6\f  \x006\b\f\v@ ("\0 Aj ("\0E\r Aj\v!@ ! \0"Aj! \0("\0\r\0 Aj! ("\0\r\0\v A\x006\0\f\vA\0!\v E\r\0@ ("\0At"(è# F@ Aè#j 6\0 \rA¼!A¼!(\0A~ \0wq6\0\f\v@  (F@  6\f\v  6\v E\r\v  6 ("\0@  \x006 \0 6\v ("\0E\r\0  \x006 \0 6\v \x07 	j!\x07  	j"(!\0\v  \0A~q6  \x07Ar6  \x07j \x076\0 \x07AÿM@ \x07AøqAà!j!\0A¸!(\0"A \x07Avt"qE@A¸!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\f\vA! \x07Aÿÿÿ\x07M@ \x07A& \x07A\bvg"\0kvAq \0AtrA>s!\v  6 B\x007 AtAè#j!\0@@A¼!(\0"A t"qE@A¼!  r6\0 \0 6\0\f\v \x07A AvkA\0 AG\x1Bt! \0(\0!@ "\0(Axq \x07F\r Av! At! \0 Aqj"("\r\0\v  6\v  \x006  6\f  6\b\f\v \0(\b" 6\f \0 6\b A\x006  \x006\f  6\b\v \bA\bj!\0\f\v@ \bE\r\0@ ("At"(è# F@ Aè#j \x006\0 \0\rA¼! \x07A~ wq"\x076\0\f\v@  \b(F@ \b \x006\f\v \b \x006\v \0E\r\v \0 \b6 ("@ \0 6  \x006\v ("E\r\0 \0 6  \x006\v@ AM@   j"\0Ar6 \0 j"\0 \0(Ar6\f\v  Ar6  j" Ar6  j 6\0 AÿM@ AøqAà!j!\0A¸!(\0"A Avt"qE@A¸!  r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\f\vA!\0 Aÿÿÿ\x07M@ A& A\bvg"\0kvAq \0AtrA>s!\0\v  \x006 B\x007 \0AtAè#j!@@ \x07A \0t"qE@A¼!  \x07r6\0  6\0  6\f\v A \0AvkA\0 \0AG\x1Bt!\0 (\0!@ "(Axq F\r \0Av! \0At!\0  Aqj"\x07("\r\0\v \x07 6  6\v  6\f  6\b\f\v (\b"\0 6\f  6\b A\x006  6\f  \x006\b\v A\bj!\0\f\v@ 	E\r\0@ ("At"(è# F@ Aè#j \x006\0 \0\rA¼! \vA~ wq6\0\f\v@  	(F@ 	 \x006\f\v 	 \x006\v \0E\r\v \0 	6 ("@ \0 6  \x006\v ("E\r\0 \0 6  \x006\v@ AM@   j"\0Ar6 \0 j"\0 \0(Ar6\f\v  Ar6  j" Ar6  j 6\0 \b@ \bAxqAà!j!\0AÌ!(\0!A \bAvt"\x07 qE@A¸!  \x07r6\0 \0\f\v \0(\b\v! \0 6\b  6\f  \x006\f  6\b\vAÌ! 6\0AÀ! 6\0\v A\bj!\0\v 
Aj$\0 \0\v* \0AÃ\0j
"\0E@A\0\v \0AÃ\0jA@q"Ak \x006\0 \v\x1B&{}@  F\r\0     F\x1B"F\r\0 ("\bA\0J@ \bAj!' ²!DA!A!	@ \0  Atj(\0"& 	l"(mAt!\b@@@@@@ &Ak\0\v !
  Atj"\x07! \x07 \bAt"\vj"\x07!\f \x07 \vj!\rA\0! \b 	l!	@ \bAG@ 	A\0L\r \bAL\r \bAt! 	A0l! 	At! \bA0l! \bAt! \bAk!\x1B Dý!2@ 
 j! 
 j!  j!  j! 
 	Atj!  \bAt" j!!A\0!\v@  \vAt"\x07j"ý\0!0  \vAr"At"jý\0\0!- \x07 !j""ý\0!. \x07 j"#ý\0!/ \x07 
j  \x07jý\0\0"3 ý\0\0"4ýä"5 "ý\0\0"6 #ý\0\0"7ýä"8ýäý\v\0 
 j - 0ýä"9 / .ýä":ýäý\v\0 \f At"j*\0!E \f \vAt"jý	\0!1 \x07 j" - 0ýå"- 2 6 7ýåýæ"6ýä"0  jý	\0"7ýæ 3 4ýå"3 2 / .ýåýæ".ýä"/ D  j*\0ý"4ýæýäý\v  / 7ýæ 0 4ýæýåý\v\0 \r j*\0!F \r jý	\0!0 \x07 j" 1 9 :ýå"/ýæ 5 8ýå"4 D Eý"5ýæýäý\v  4 1ýæ / 5ýæýåý\v\0 \x07 j"\x07 0 - 6ýå"-ýæ 3 .ýå". D Fý"/ýæýäý\v \x07 . 0ýæ - /ýæýåý\v\0 \vAj"\v \x1BH\r\0\v  j! 
  j!
 \b j" 	H\r\0\v\f\v 	A\0L\r\0 	A0l!\v 	At! Dý!2A\0!\x07 	At!\f@ ý\0@!0 ý\0\0!- ý\0\`!. ý\0 !/ 
 ý\0"1 ý\0P"3ýä"4 ý\0p"5 ý\00"6ýä"7ýäý\v 
 - 0ýä"8 / .ýä"9ýäý\v\0 
 \fj"\r 1 3ýå"1 2 / .ýåýæ".ýäý\v \r - 0ýå"0 2 5 6ýåýæ"-ýäý\v\0 
 j"\r 4 7ýåý\v \r 8 9ýåý\v\0 
 \vj"\r 1 .ýåý\v \r 0 -ýåý\v\0 Aj! 
A j!
 \x07Aj"\x07 	H\r\0\v\v\f\v !
  Atj!A\0!\f \b 	l!	@ \bAN@ 	A\0L\r \bAt! \bAk! Dý!0@ 
 	Atj!  \bAt"j!A\0!\x07@  \x07Ar"Atjý	\0\0!-  \x07Atjý	\0\0!2  \x07At"\vj"\rý\0!.  At"j"ý\0\0!/ 
 \vj  \vjý\0\0"1 \rý\0\0"3ýäý\v\0 
 j ý\0\0 \rý\0ýäý\v\0 \v j"\v 2 / .ýå".ýæ 1 3ýå"/ 0 -ýæ 2ý\r\0\0\0\0"-ýæýäý\v \v / 2ýæ . -ýæýåý\v\0 \x07Aj"\x07 H\r\0\v  j! 
 j!
 \b \fj"\f 	H\r\0\v\f\v 	A\0L\r\0 \bAt!A\0!\v@ 
 ý\0\0  \bAt"\fj"\x07ý\0\0ýäý\v\0 
 	Atj"\r ý\0\0 \x07ý\0\0ýåý\v\0 
 ý\0 \x07ý\0ýäý\v \r ý\0 \x07ý\0ýåý\v  j! 
 \fj!
 \b \vj"\v 	H\r\0\v\v\f\v !
  Atj"\x07!\r \x07 \bAtj!A\0!@ \bAN@ \b 	l"\vA\0J@ \bA0l! \vAt! \bAt! \bAk! DC×³]?ý!2@ 
 j!  j! 
 \vAtj!\x1B  \bAt"j!A\0!	@ 
 	At"\x07j  \x07jý\0\0"- \x07 j"ý\0\0 \x07 j"\fý\0\0ýä".ýäý\v\0 
 	Ar"At"j  jý\0\0"/ ý\0 \fý\0ýä"1ýäý\v\0  	At"jý	\0!0  At"j*\0!E \x07 \x1Bj" / 1ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"/ 2 ý\0\0 \fý\0\0ýåýæ"1ýä"3 \r jý	\0"4ýæ - .ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"- 2 ý\0 \fý\0ýåýæ".ýå"5 D \r j*\0ý"6ýæýäý\v  5 4ýæ 3 6ýæýåý\v\0 \x07 j"\x07 0 / 1ýå"/ýæ - .ýä"- D Eý".ýæýäý\v \x07 - 0ýæ / .ýæýåý\v\0 	Aj"	 H\r\0\v  j! 
 j!
 \b j" \vH\r\0\v\v\f\vAÕ
AÄ	AAä\b\0\0\v\f\vAÝ
AÄ	A\bAø\b\0\0\v 	!
 !	  Atj"\v! \v \bAt"\x07j"\v! \x07 \vj"\v! \x07 \vj!A\0!@ \bAN@ 
A\0J@ \bAÐ\0l! \bA0l! \bAt! \bAt!\x1B \bAk! \b 
l"At! A0l! At! DCy?ý!2 DCqxs?ý!0@ 	 j! 	 j!  	 j!!  j!  j!"  \x1Bj!# 	 Atj!)  \bAt"*j!+A\0!\v@ # \vAt"\x07j"\fý\0!- \x07 +j"\rý\0!. \x07 j"$ý\0!/ \x07 "j"%ý\0!1 \x07 	j  \x07j",ý\0\0 \rý\0\0": \fý\0\0";ýä"3 %ý\0\0"< $ý\0\0"=ýä"4ýäýäý\v\0 	 \vAr"\rAt"\fj . -ýä"5 1 /ýä"6ýä  \fj"$ý\0\0ýäý\v\0  \vAt"\fjý	\0!7  \rAt"\rj*\0!E \f jý	\0!8 \r j*\0!F \f jý	\0!9 \r j*\0!G \x07 )j"% 0 : ;ýå":ýæ 2 < =ýå";ýæýä"< 5ý\fz7>z7>z7>z7>ýæ 6ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýå $ý\0\0"=ýä">ýä"? \f jý	\0"@ýæ 3ý\fz7>z7>z7>z7>ýæ 4ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýå ,ý\0\0"Aýä"B 0 . -ýå"-ýæ 2 1 /ýå".ýæýä"/ýå"1 D \r j*\0ý"Cýæýäý\v % 1 @ýæ ? Cýæýåý\v\0 \x07 !j"\f 9 2 :ýæ 0 ;ýæýå"1 = 6ý\fz7>z7>z7>z7>ýæ 5ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"5ýä"6ýæ A 4ý\fz7>z7>z7>z7>ýæ 3ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"3 2 -ýæ 0 .ýæýå"-ýå". D Gý"4ýæýäý\v \f . 9ýæ 6 4ýæýåý\v\0 \x07  j"\f 8 5 1ýå".ýæ - 3ýä"- D Fý"1ýæýäý\v \f - 8ýæ . 1ýæýåý\v\0 \x07 j"\x07 7 > <ýå"-ýæ / Býä". D Eý"/ýæýäý\v \x07 . 7ýæ - /ýæýåý\v\0 \vAj"\v H\r\0\v  j! 	 *j!	 Aj" 
G\r\0\v\v\f\vAÕ
AÄ	AAÚ\b\0\0\v\v    F"\x1B!   \x1B! \b &Akl j!  'G Aj! (!	\r\0\v\v \vA¹
AÄ	Aò\x07Aø\b\0\0\vÕ{  G@ \0(lE@ \0(\0"
A m!\f@@ @ 
AJ\r  
AtjAà\0k!  
AmAtj"\vAj!\0 \vý\0\0"!\f\v 
A N@  \fAtj!	A\0!@  At"\vj"\r  A\x07tj"\0ý\0\0" \0ý\0"ý\r\b	
\v\x1B\f\rý\v \r  ý\r\0\x07ý\v\0 	 \vj"\v \0ý\0@" \0ý\0P"ý\r\b	
\v\x1B\f\rý\v \v  ý\r\0\x07ý\v\0 Aj" \fG\r\0\v\v  
AmAtjAk"\0 ý\0 " ý\00"ý\r\b	
\v\x1B\f\r"  ý\r\0\x07"ý\r\0\x07\x1Bý\v\0 
AÀ\0H"\rE@ A j!A!\v@ ! \0"	A k"\0 ý\0"\x07 ý\0"\bý\r\b	
\v\x1B\f\r" \x07 \bý\r\0\x07"\x07ý\r\0\x07\x1Bý\v\0 	Ak \x07 ý\r\0\x07\x1Bý\v\0 Aj! \vAj"\v \fG\r\0\v\v \0Ak  ý\r\0\x07\x1Bý\v\0  
AtjAk" ý\0\`" ý\0p"ý\r\b	
\v\x1B\f\r"  ý\r\0\x07"ý\r\0\x07\x1Bý\v\0 \rE@ Aà\0j!A!@ ! "\0A k" ý\0"\x07 ý\0"\bý\r\b	
\v\x1B\f\r" \x07 \bý\r\0\x07"\x07ý\r\0\x07\x1Bý\v\0 \0Ak \x07 ý\r\0\x07\x1Bý\v\0 Aj! Aj" \fG\r\0\v\v Ak  ý\r\0\x07\x1Bý\v\0\v  \fAtj!	A\0!@  A\x07tj"\0  At"\vj"\rý\0\0" \rý\0"ý\r\x07\f\rý\v \0  ý\r\0\b	
\v\x1Bý\v\0 \0 	 \vj"\vý\0\0" \vý\0"ý\r\x07\f\rý\vP \0  ý\r\0\b	
\v\x1Bý\v@ Aj" \fG\r\0\v  
A|qj"	Aj!\0  
AtjAà\0k! 	ý\0\0!A\0!	 
AÀ\0I@ !\f\vA!\v !@ \0ý\0\0"\x07 ý\r\0\x07\x1B!  \0ý\0" \x07ý\r\0\x07\x1B"\x07 ý\r\x07\f\rý\v  \x07 ý\r\0\b	
\v\x1Bý\v\0 Ak! \0A j!\0A!	 \vAj"\v \fG\r\0\v\v   \0ý\0\0"ý\r\0\x07\x1B"  ý\r\0\x07\x1B"ý\r\x07\f\rý\v   ý\r\0\b	
\v\x1Bý\v\0  
AtjA k!  
AlAmAtj"\0Aj! \0ý\0\0!@ 	E@ !\f\vA! !@ ý\0\0"\x07 ý\r\0\x07\x1B!  ý\0" \x07ý\r\0\x07\x1B"\x07 ý\r\x07\f\rý\v  \x07 ý\r\0\b	
\v\x1Bý\v\0 Ak! A j! Aj" \fG\r\0\v\v   ý\0\0"ý\r\0\x07\x1B"  ý\r\0\x07\x1B"ý\r\x07\f\rý\v   ý\r\0\b	
\v\x1Bý\v\0\v \0(!	@ @ 	A\0L\r 	Av!A\0!\0@  \0Atj"
  \0Aq l \0AvjAtj"\fý\0\0" \fý\0"ý\r\x07\f\rý\v 
  ý\r\0\b	
\v\x1Bý\v\0 \0Aj"\0 	G\r\0\v\f\v 	A\0L\r\0 	Av!A\0!\0@  \0Aq l \0AvjAtj"
  \0Atj"\fý\0\0" \fý\0"ý\r\0\x07ý\v\0 
  ý\r\b	
\v\x1B\f\rý\v \0Aj"\0 	G\r\0\v\v\vA¤\bAÄ	A	A	\0\0\v¼|#\0Ak"\v$\0@ \0¼"Aÿÿÿÿ\x07q"AÚ¤îM@  \0»" DÈÉm0_ä?¢D\0\0\0\0\0\x008C D\0\0\0\0\0\x008Ã "D\0\0\0Pû!ù¿¢  Dcba´Q¾¢ "9\0 ü! D\0\0\0\`û!é¿c@   D\0\0\0\0\0\0ð¿ "D\0\0\0Pû!ù¿¢  Dcba´Q¾¢ 9\0 Ak!\f\v D\0\0\0\`û!é?dE\r   D\0\0\0\0\0\0ð? "D\0\0\0Pû!ù¿¢  Dcba´Q¾¢ 9\0 Aj!\f\v Aü\x07O@  \0 \0»9\0A\0!\f\v \v  AvAk"Atk¾»9\b \vA\bj!
#\0A°k"$\0  AkAm"A\0 A\0J\x1B"Ahlj!	A\v(\0"\bA\0N@ \bAj! !@ AÀj Atj A\0H|D\0\0\0\0\0\0\0\0 At( \v·\v9\0 Aj! Aj" G\r\0\v\v 	Ak!\x07A\0! \bA\0 \bA\0J\x1B!@A\0!D\0\0\0\0\0\0\0\0!@ 
 Atj+\0 AÀj  kAtj+\0¢  ! Aj"AG\r\0\v  Atj 9\0  F Aj!E\r\0\vA/ 	k!A0 	k! AtA \vj! \b!@@  Atj+\0!A\0! ! A\0J@@ Aàj Atj D\0\0\0\0\0\0p>¢ü·"D\0\0\0\0\0\0pÁ¢  ü6\0  AtjA\bk+\0  ! Ak! Aj" G\r\0\v\v  \x07\b" D\0\0\0\0\0\0À?¢D\0\0\0\0\0\0 À¢ " ü"\f·¡!@@@ \x07A\0L"E@ At j" (Ü"  u" tk"6Ü  \fj!\f  u\f\v \x07\r At j(ÜAu\v"\rA\0L\r\f\vA!\r D\0\0\0\0\0\0à?f\r\0A\0!\r\f\vA\0!A\0!A! A\0J@@ Aàj Atj"(\0!@  Aÿÿÿ\x07 E\rA\b\v k6\0A!A\0\f\vA\0!A\v! Aj" G\r\0\v\v@ \r\0Aÿÿÿ!@@ \x07Ak\0\vAÿÿÿ!\v At j" (Ü q6Ü\v \fAj!\f \rAG\r\0D\0\0\0\0\0\0ð? ¡!A!\r \r\0 D\0\0\0\0\0\0ð? \x07\b¡!\v D\0\0\0\0\0\0\0\0a@A\0! !@  \bL\r\0@ Aàj Ak"Atj(\0 r!  \bJ\r\0\v E\r\0@ \x07Ak!\x07 Aàj Ak"Atj(\0E\r\0\v\f\vA!@ "Aj! Aàj \b kAtj(\0E\r\0\v  j!@ AÀj Aj"Atj  Atj(\0·9\0A\0!D\0\0\0\0\0\0\0\0!@ 
 Atj+\0 AÀj  kAtj+\0¢  ! Aj"AG\r\0\v  Atj 9\0  H\r\0\v !\f\v\v@ A 	k\b"D\0\0\0\0\0\0pAf@ Aàj Atj D\0\0\0\0\0\0p>¢ü"·D\0\0\0\0\0\0pÁ¢  ü6\0 Aj! 	!\x07\f\v ü!\v Aàj Atj 6\0\vD\0\0\0\0\0\0ð? \x07\b! A\0N@ !@  "Atj  Aàj Atj(\0·¢9\0 Ak! D\0\0\0\0\0\0p>¢! \r\0\v !@@ \b  k"  \bJ\x1B"\x07A\0H@D\0\0\0\0\0\0\0\0!\f\v  Atj!	A\0!D\0\0\0\0\0\0\0\0!@ At"
+ð  	 
j+\0¢  !  \x07G Aj!\r\0\v\v A j Atj 9\0 A\0J Ak!\r\0\v\vD\0\0\0\0\0\0\0\0! A\0N@@ "Ak!  A j Atj+\0 ! \r\0\v\v \v   \r\x1B9\0 A°j$\0 \fA\x07q! \v+\0! A\0H@  9\0A\0 k!\f\v  9\0\v \vAj$\0 \vùr*{	}@#\0Ak"$\0 \0"(\f!\0 A ("At" \x1BAtk""$\0   " \x1B"6\f  "6\b@@@@ "" rAqE@ A\bj!% \0Aq!\0@ E@   \0\x1B!@ (lE@   (x!@   \0\x1B" F\r\0     F\x1B"F\r\0 %("A\0J@ Ak!A!\0 !@   m" %  \0"\x07kAtj(\b"\0Aklk!  \0m!@@@@@@ \0Ak\0\v A\0L\r  Atj" At"\0j"\f \0j"
 \0j!\r  A lj"\bAk!   AslAtj"Ak! Al!\v At!A!\0 At! Al!@ \b \0Al"	Aj lAtj  \0 j lAtjý\0\0"/  \0 j lAtjý\0\0"1  \0 j lAtjý\0\0"3ýä"0  \0 j lAtjý\0\0"4  \0 \vj lAtjý\0\0"6ýä"2ýäýäý\v\0  	Aj lAt"j / 0ý\fz7>z7>z7>z7>ýæ 2ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýäý\v\0 \b j 1 3ýå"1ý\fqxs?qxs?qxs?qxs?ýæ 4 6ýå"3ý\fy?y?y?y?ýæýäý\v\0  	Aj lAt"	j / 2ý\fz7>z7>z7>z7>ýæ 0ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýäý\v\0 \b 	j 1ý\fy?y?y?y?ýæ 3ý\fqxs?qxs?qxs?qxs?ýæýåý\v\0 \0 G \0Aj!\0\r\0\v AF\r AH\r Aj!\x1BA!@   j lAtj!   j lAtj!    j lAtj!!   \vj lAtj!&   j lAtj!'  Al"\0Aj lAtj!(  \0Aj lAtj!)  \0Aj lAtj!*A!\b  \0Aj lAtj!+  \0Aj lAtj!,@ , \bAt"\0j"#Ak \0 j"-Aký\0\0"/ \f \bAt"A\bk"	jý	\0\0"3 \0 &j"$ý\0\0"4ýæ \f A\fk"jý	\0\0"6 $Aký\0\0"5ýæýä": 	 
jý	\0\0"7 \0 !j"$ý\0\0"8ýæ 
 jý	\0\0"9 $Aký\0\0";ýæýä"<ýä"0 	 jý	\0\0"= \0 'j"$ý\0\0">ýæ  jý	\0\0"? $Aký\0\0"@ýæýä"A 	 \rjý	\0\0"B \0  j"	ý\0\0"Cýæ \r jý	\0\0"D 	Aký\0\0"Eýæýä"Fýä"2ýäýäý\v\0 # -ý\0\0"1 3 5ýæ 6 4ýæýå"6 7 ;ýæ 9 8ýæýå"5ýä"3 = @ýæ ? >ýæýå"7 B Eýæ D Cýæýå"8ýä"4ýäýåý\v\0 \0 +j"	Ak / 2ý\fz7>z7>z7>z7>ýæ 0ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"9 6 5ýå"6ý\fy?y?y?y?ýæ 7 8ýå"5ý\fqxs?qxs?qxs?qxs?ýæýä"7ýåý\v\0 * \x1B \bkAt"j"#Ak 7 9ýäý\v\0 	 < :ýå":ý\fy?y?y?y?ýæ F Aýå"7ý\fqxs?qxs?qxs?qxs?ýæýä"8 1 4ý\fz7>z7>z7>z7>ýæ 3ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýå"9ýäý\v\0 # 8 9ýåý\v\0 \0 )j"\0Ak / 0ý\fz7>z7>z7>z7>ýæ 2ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"/ 5ý\fy?y?y?y?ýæ 6ý\fqxs?qxs?qxs?qxs?ýæýå"0ýåý\v\0  (j"	Ak 0 /ýäý\v\0 \0 7ý\fy?y?y?y?ýæ :ý\fqxs?qxs?qxs?qxs?ýæýå"/ 1 3ý\fz7>z7>z7>z7>ýæ 4ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýå"0ýäý\v\0 	 / 0ýåý\v\0 \bAj"\b L\r\0\v  F Aj!E\r\0\v\f\v A\0L\r  Atj" Atj!\b At!	  AtjAk!A\0!\0@  \0Al" lAtj  \0 lAtjý\0\0"/  \0 j lAtjý\0\0"0  \0 	j lAtjý\0\0"2ýä"1ýäý\v\0  Aj lAtj 2 0ýåý\f×³]?×³]?×³]?×³]?ýæý\v\0  Aj lAtj / 1ý\f\0\0\0¿\0\0\0¿\0\0\0¿\0\0\0¿ýæýäý\v\0 \0Aj"\0 G\r\0\vA\0! AH\r@A!\0  	j lAt!  j lAt!  lAt!\f Al"
 lAt!\r 
Aj lAt!\v 
Aj lAt!@  \0Ak"At"
j"\x1B \rj  
j"
 \fjý\0\0"/ 
 jý\0\0"0  \0AtA\bk"jý	\0\0"2ýæ  \0At" j" jý\0\0"1  At"jý	\0\0"3ýæýä"4 
 jý\0\0"6 \b jý	\0\0"5ýæ  jý\0\0": \b jý	\0\0"7ýæýä"8ýä"9ýäý\v\0   j"
 \rj \f jý\0\0"; 1 2ýæ 0 3ýæýå"0 : 5ýæ 6 7ýæýå"2ýä"1ýäý\v\0 \v \x1Bj 0 2ýåý\f×³]?×³]?×³]?×³]?ýæ"0 / 9ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"/ýäý\v\0   \0kAtj j"Ak / 0ýåý\v\0 
 \vj 8 4ýåý\f×³]?×³]?×³]?×³]?ýæ"/ ; 1ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"0ýäý\v\0  / 0ýåý\v\0 \0Aj"\0 H\r\0\v Aj" G\r\0\v\f\v !\0  l"A\0J@A\0!@  Atj \0 Atj"ý\0\0"/  Atjý\0\0"0ýäý\v\0   j"AtjAk / 0ýåý\v\0  H\r\0\v\v  Atj!\b@ AH\r\0 AG@ A\0J@A\0!@  j"At!  Atj!	 \0 Atj!A!@  Ak"\fAt"
j"\rý\0\0!/ 	 At"\vj \v j"\vý\0\0"0 \v At"jý\0\0"2 \b AtjA\bký	\0\0"1ýæ \r jý\0\0"3 \b \fAtjý	\0\0"4ýæýå"6ýäý\v\0   kAtj"\f 6 0ýåý\v\0 	 
j / 2 4ýæ 3 1ýæýä"0ýäý\v\0 \fAk / 0ýåý\v\0 Aj" H\r\0\v " H\r\0\v\v Aq\r\v A\0L\r\0  At"j! \0 j AtjAk!\bA\0!@  Atj"	 \b Atjý\0\0ýáý\v\0 	Ak \0  j"AtjAký\0\0ý\v\0  H\r\0\v\v\f\vAÝ
AÄ	AËAî\b\0\0\v  Atj"\0! \0 At"\bj"	!  l"A\0J@  At"\fj!
 At!\r At!\v A0l! At! !\0 !@ \0 jý\0\0!/ \0 \fjý\0\0!0  \vj"Ak \0ý\0\0"2 \0 jý\0\0"1ýåý\v\0  / 0ýåý\v\0  2 1ýä"2 0 /ýä"/ýäý\v\0  \rj"Ak 2 /ýåý\v\0 \0 Atj"\0 
I\r\0\v\v \b 	j!\f@ AH\r\0@ AG@ A\0L\r A0l! At! Aj!\x1BA\0!\b A0l!
 At!\r@  \bAt"j!	 \x1B \bAtj!\0A!@ 	 Ak"Atj"  \0ý\0\0"/ \0 j"!ý\0\0"0  AtA\bk"\vjý	\0\0"2ýæ !ý\0"1  At"jý	\0\0"3ýæýä"4ýä"6 \0 Atj"!ý\0\0"5 \v jý	\0\0":ýæ !ý\0"7  jý	\0\0"8ýæýä"9 \0 j"!ý\0\0"; \v \fjý	\0\0"<ýæ !ý\0"= \f jý	\0\0">ýæýä"?ýä"@ýäý\v\0   kAt"\vj jAk" 
j 6 @ýåý\v\0 \r  j / 4ýå"/ 7 :ýæ 5 8ýæýå"4 = <ýæ ; >ýæýå"6ýå"5ýäý\v\0  At" j / 5ýåý\v\0 	 Atj" 4 6ýä"/ 1 2ýæ 0 3ýæýå"0 \0ý\0"2ýä"1ýäý\v\0 	 \vj"\v 
j / 1ýåý\v\0 \r j ? 9ýå"/ 2 0ýå"0ýäý\v\0 \v  j / 0ýåý\v\0 \0A j!\0 Aj" H\r\0\v  \bj"\b H\r\0\v AqE\r\f\v A\0L\r\v A0l! At!\b At!	 A0l!  At"Ak"\0j!\f \0 j!
A\0!\0@ 
 \0Atj" 	jý\0\0!/ \f \0At"\rj"\v ý\0\0"0  jý\0\0"2  Atjý\0\0"1ýåý\fó5¿ó5¿ó5¿ó5¿ýæ"3ýäý\v\0 \b \vj 0 3ýåý\v\0  \rj" j 1 2ýäý\fó5¿ó5¿ó5¿ó5¿ýæ"0 /ýåý\v\0  j 0 /ýäý\v\0 \0 j"\0 H\r\0\v\v\v    F"\0\x1B!   \0\x1B! \x07Aj!\0 \x07 G\r\0\v\v \f\vA¹
AÄ	A°Aî\b\0\0\v G"\x1B! (t!   \x1B"\0 G@  AtjAký\0\0!/ ý\0p!2 ý\0\0!0 \0 ý\00"1ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 ý\00"3ý\r\b	
\v\x1B\f\r"4 ý\0"6 ý\0P"5ý\r\b	
\v\x1B\f\r":ý\r\0\x07"7ýæ ý\0 "8ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 ý\0@"9ý\r\b	
\v\x1B\f\r"; ý\0 "< ý\0\`"=ý\r\b	
\v\x1B\f\r">ý\r\0\x07"?ýæýä"@ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 9ý\r\0\x07"9 < =ý\r\0\x07"<ý\r\0\x07"=ýä"A ý\0"Bý\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0 3ý\r\0\x07"3 6 5ý\r\0\x07"6ý\r\b	
\v\x1B\f\r"5ýæ ý\0\0"C 9 <ý\r\b	
\v\x1B\f\r"9ýæýä"< ý\0P"D 4 :ý\r\b	
\v\x1B\f\r"4ýæ ý\0@": ; >ý\r\b	
\v\x1B\f\r";ýæýä">ýä"Eýäý\v \0 3 6ý\r\0\x07"3 8 7ýæ 1 ?ýæýå"1ýå"6 > <ýå"7ýåý\v@ \0 6 7ýäý\v  \0 : 4ýæ D ;ýæýå"4 C 5ýæ B 9ýæýå"6ýå"5 = @ýå":ýåý\v0 \0 1 3ýä"1 6 4ýä"3ýåý\v\` \0 E Aýåý\vp \0 : 5ýäý\vP \0 1 3ýäý\v\0 \0 0ý\0"G 0ý"H"I 0ý"J 0ý"L"M8 \0 G H8@ \0 /ý"G /ý"H"KCó5? /ý\0"N8  \0 G HCó5¿"G /ý"H80 \0 KCó5¿ N8\` \0 G H8p \0 L J8P \0 I M8\0 A\bN@A Am" AL\x1B!A!\x07@ 2  \x07A\x07t"j"ý\00"0ý\r\b	
\v\x1B\f\r!/ 2 0ý\r\0\x07!0 ý\0p!2 \0 j"  \x07Aà\0lj"ý\0"1 0 ý\0"3 ý\0P"4ý\r\0\x07"6ý\r\b	
\v\x1B\f\r"5ýæ ý\0\0": ý\0\0"7 ý\0@"8ý\r\0\x07"9 ý\0 "; ý\0\`"<ý\r\0\x07"=ý\r\b	
\v\x1B\f\r">ýæýä"? ý\0P"@ / 3 4ý\r\b	
\v\x1B\f\r"3ý\r\b	
\v\x1B\f\r"4ýæ ý\0@"A 7 8ý\r\b	
\v\x1B\f\r"7 ; <ý\r\b	
\v\x1B\f\r"8ý\r\b	
\v\x1B\f\r";ýæýä"<ýä"B ý\00"C / 3ý\r\0\x07"/ýæ ý\0 "3 7 8ý\r\0\x07"7ýæýä"8 9 =ý\r\0\x07"9ýä"=ýåý\vp  3 /ýæ C 7ýæýå"/ 0 6ý\r\0\x07"0ýä"3 : 5ýæ 1 >ýæýå"1 A 4ýæ @ ;ýæýå"4ýä"6ýåý\v\`  9 8ýå"5 4 1ýå"1ýäý\vP  0 /ýå"/ < ?ýå"0ýåý\v@  1 5ýåý\v0  / 0ýäý\v   = Býäý\v  3 6ýäý\v\0 \x07Aj"\x07 G\r\0\v\v\f\vA¤\bAÄ	A¼
Aÿ	\0\0\v A\0J@A\0!@  At"j  "jý\0\0"/ " Ar"jý\0\0"0ý\r\0\b	
\v\x1Bý\v\0  j / 0ý\r\x07\f\rý\v\0 Aj" G\r\0\v\v     \0\x1B  (x %A\f  F\r G"\0! AH\r\0 Am!\x07   \x1B! (t!   \0\x1B!A\0!@   A\x07tj"\0ý\0"/ \0ý\0P"0ý\r\0\x07"2 \0ý\00"1 \0ý\0p"3ý\r\0\x07"4ý\r\0\x07"6  Aà\0lj"ý\00"5 \0ý\0\0": \0ý\0@"7ý\r\b	
\v\x1B\f\r"8 \0ý\0 "9 \0ý\0\`";ý\r\b	
\v\x1B\f\r"<ý\r\0\x07"=ýæ ý\0 "> / 0ý\r\b	
\v\x1B\f\r"/ 1 3ý\r\b	
\v\x1B\f\r"0ý\r\0\x07"1ýæýä"3ýå"? ý\0\0"@ : 7ý\r\0\x07": 9 ;ý\r\0\x07"7ý\r\b	
\v\x1B\f\r"9ýæ ý\0"; 2 4ý\r\b	
\v\x1B\f\r"2ýæýå"4 ý\0@"A 8 <ý\r\b	
\v\x1B\f\r"8ýæ ý\0P"< / 0ý\r\b	
\v\x1B\f\r"/ýæýå"0ýå"Býäý\vp  : 7ý\r\0\x07": > =ýæ 5 1ýæýå"1ýå"5 ; 9ýæ @ 2ýæýä"2 < 8ýæ A /ýæýä"/ýå"7ýåý\v\`  3 6ýä"3 2 /ýä"/ýåý\vP  1 :ýä"2 4 0ýä"0ýåý\v@  ? Býåý\v0  5 7ýäý\v   3 /ýäý\v  2 0ýäý\v\0 Aj! Aj" \x07G\r\0\v\v    \x1B A\fj A\bj \x1B(\0A\0\r\f\v  "   "   \0\x1BG \0s"\0\x1B"A\r A\bj \0EAtj(\0!\0 (t! (lE@@ \0 G@ *p!G *\`!H *P!I *@!J *0!L * !M *!K *\0!N \0 ý\0"/ ý\0p"0ýå"2 ý\00"1 ý\0P"3ýå"4ýå"6 4 2ýä"2 ý\0 "4ýæ ý\0\0"5 ý\0\`":ýä"7 ý\0 "8 ý\0@"9ýä";ýå"< ý\00"=ýæýå">ý\r\b	
\v\x1B\f\r"? / 0ýä"/ 8 9ýå"0ýå"8 ý\0\0"9ýæ 5 :ýå"5 1 3ýä"1ýå"3 ý\0":ýæýå"@ 0 /ýä"/ ý\0@"0ýæ 1 5ýä"1 ý\0P"5ýæýå"Aý\r\b	
\v\x1B\f\r"Bý\r\b	
\v\x1B\f\rý\v\` \0 ; 7ýä"7 2 =ýæ < 4ýæýä"2ý\r\b	
\v\x1B\f\r"4 3 9ýæ : 8ýæýä"3 / 5ýæ 1 0ýæýä"/ý\r\b	
\v\x1B\f\r"0ý\r\b	
\v\x1B\f\rý\vP \0 ? Bý\r\0\x07ý\v@ \0 4 0ý\r\0\x07ý\v0 \0 6 >ý\r\0\x07 @ Aý\r\0\x07ý\r\b	
\v\x1B\f\rý\v  \0 7 2ý\r\0\x07 3 /ý\r\0\x07ý\r\b	
\v\x1B\f\rý\v A\x07J@A Am" AL\x1B! \0Ak!\bA!@ \b A\x07t"j"  j"ý\0"/ ý\0p"0ýå"2 ý\00"1 ý\0P"3ýå"4ýå"6 4 2ýä"2  Aà\0lj"\x07ý\0 "4ýæ ý\0\0"5 ý\0\`":ýä"7 ý\0 "8 ý\0@"9ýä";ýå"< \x07ý\00"=ýæýå">ý\r\b	
\v\x1B\f\r"? / 0ýä"/ 8 9ýå"0ýå"8 \x07ý\0\0"9ýæ 5 :ýå"5 1 3ýä"1ýå"3 \x07ý\0":ýæýå"@ 0 /ýä"/ \x07ý\0@"0ýæ 1 5ýä"1 \x07ý\0P"5ýæýå"Aý\r\b	
\v\x1B\f\r"Bý\r\b	
\v\x1B\f\rý\vp  ; 7ýä"7 2 =ýæ < 4ýæýä"2ý\r\b	
\v\x1B\f\r"4 3 9ýæ : 8ýæýä"3 / 5ýæ 1 0ýæýä"/ý\r\b	
\v\x1B\f\r"0ý\r\b	
\v\x1B\f\rý\v\`  ? Bý\r\0\x07ý\vP  4 0ý\r\0\x07ý\v@  6 >ý\r\0\x07"0 @ Aý\r\0\x07"1ý\r\b	
\v\x1B\f\rý\v0  7 2ý\r\0\x07"2 3 /ý\r\0\x07"/ý\r\b	
\v\x1B\f\rý\v   0 1ý\r\0\x07ý\v  2 /ý\r\0\x07ý\v\0 Aj" G\r\0\v\v \0 I I"I N K"O8\f \0 N K"K J J"J8\b \0 O I8 \0 J K8\0 \0 Atj"Ak M H"ICóµ¿ L GCóµ¿"J8\0 A\bk G L"G G8\0 A\fk ICóµ? J8\0 Ak M H"G G8\0\f\vA¤\bAÄ	A\vAÄ\b\0\0\v (x!   \0 F\x1B" \0G@A! %("A\0J@A!@  % "Aj"Atj(\0" "\x07l"m!@@@@@@ Ak\0\v \x07A\0L\r  Atj" At"j" j"\f j!
 \0 A lj"\bAk!   \x07AslAtj"\0Ak! \x07Al!\r \x07At!\v \x07Al!A! \x07At!@ \b Al"Aj lAt"	jý\0\0!/ \b Aj lAt"\x1Bjý\0\0!0 \0  \x07j lAtj \b Aj lAtjý\0\0"2  	jý\0\0"1 1ýä"1  \x1Bjý\0\0"3 3ýä"3ýäýäý\v\0 \0  j lAtj 2 1ý\fz7>z7>z7>z7>ýæ 3ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"4 / /ýä"/ý\fqxs?qxs?qxs?qxs?ýæ 0 0ýä"0ý\fy?y?y?y?ýæýä"6ýåý\v\0 \0  j lAtj 2 3ý\fz7>z7>z7>z7>ýæ 1ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"2 /ý\fy?y?y?y?ýæ 0ý\fqxs?qxs?qxs?qxs?ýæýå"/ýåý\v\0 \0  \vj lAtj / 2ýäý\v\0 \0  \rj lAtj 6 4ýäý\v\0  \x07G Aj!\r\0\v AF\r AH\r Aj!\x1BA!@   \rj lAtj!   \vj lAtj!    j lAtj!!   j lAtj!&   \x07j lAtj!'  Al"\bAj lAtj!(  \bAj lAtj!)  \bAj lAtj!*  \bAj lAtj!+A!\0  \bAj lAtj!,@ , \0At"\bj"ý\0\0!/ + \x1B \0kAt"	j"#ý\0\0!0 \b *j"-ý\0\0!2 	 )j"	ý\0\0!1 \b 'j"$Ak \b (j".Aký\0\0"3 Aký\0\0"? #Aký\0\0"@ýä"4 -Aký\0\0"A 	Aký\0\0"Býä"6ýäýäý\v\0 $ / 0ýå"5 2 1ýå":ýä .ý\0\0"7ýäý\v\0 
 \0At"	A\bk"jý	\0\0!8 
 	A\fk"	jý	\0\0!9 \f jý	\0\0!; 	 \fjý	\0\0!<  jý	\0\0!= 	 jý	\0\0!> \b &j"# 3 4ý\fz7>z7>z7>z7>ýæ 6ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"C / 0ýä"/ý\fqxs?qxs?qxs?qxs?ýæ 2 1ýä"0ý\fy?y?y?y?ýæýä"2ýå"1  jý	\0\0"Dýæ ? @ýå"?ý\fqxs?qxs?qxs?qxs?ýæ A Býå"@ý\fy?y?y?y?ýæýä"A 7 5ý\fz7>z7>z7>z7>ýæ :ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"Býä"E 	 jý	\0\0"Fýæýäý\v\0 #Ak 1 Fýæ E Dýæýåý\v\0 \b !j" = 3 6ý\fz7>z7>z7>z7>ýæ 4ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"1 /ý\fy?y?y?y?ýæ 0ý\fqxs?qxs?qxs?qxs?ýæýå"/ýå"0ýæ > ?ý\fy?y?y?y?ýæ @ý\fqxs?qxs?qxs?qxs?ýæýå"3 7 :ý\fz7>z7>z7>z7>ýæ 5ý\f½\x1BO?½\x1BO?½\x1BO?½\x1BO?ýæýåýä"4ýä"6ýæýäý\v\0 Ak 0 >ýæ 6 =ýæýåý\v\0 \b  j" ; / 1ýä"/ýæ < 4 3ýå"0ýæýäý\v\0 Ak / <ýæ 0 ;ýæýåý\v\0 \b j"\b 8 2 Cýä"/ýæ 9 B Aýå"0ýæýäý\v\0 \bAk / 9ýæ 0 8ýæýåý\v\0 \0Aj"\0 L\r\0\v  \x07F Aj!E\r\0\v\f\v \x07A\0L\r  Atj"\b Atj! \x07At! \0 AtjAk!	A\0!@   lAtj \0 Al" lAtjý\0\0"/ 	 Aj lAtjý\0\0"0 0ýä"0ýäý\v\0   \x07j lAtj / 0ý\f\0\0\0¿\0\0\0¿\0\0\0¿\0\0\0¿ýæýä"/ \0 Aj lAtjý\0\0ý\f×³Ý?×³Ý?×³Ý?×³Ý?ýæ"0ýåý\v\0   j lAtj / 0ýäý\v\0 Aj" \x07G\r\0\vA\0! AH\r@A! Al"	Aj lAt! 	Aj lAt!  	lAt!	  lAt!  \x07j lAt!\f  j lAt!
@  Ak"At"\vj"\r j \0 \vj"\v 	jý\0\0"/ \v jý\0\0"0 \0  kAtj j"\x1BAký\0\0"2ýä"1ýäý\v\0  At"j"\v j \0 j" 	jý\0\0"3  jý\0\0"4 \x1Bý\0\0"6ýå"5ýäý\v\0 \f \rj / 1ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"/ 4 6ýäý\f×³]?×³]?×³]?×³]?ýæ"1ýå"4 \b AtA\bk"\x1Bjý	\0\0"6ýæ 0 2ýåý\f×³]?×³]?×³]?×³]?ýæ"0 3 5ý\f\0\0\0?\0\0\0?\0\0\0?\0\0\0?ýæýå"2ýä"3 \b At"jý	\0\0"5ýæýåý\v\0 \v \fj 4 5ýæ 3 6ýæýäý\v\0 
 \rj / 1ýä"/  \x1Bjý	\0\0"1ýæ 2 0ýå"0  jý	\0\0"2ýæýåý\v\0 
 \vj / 2ýæ 0 1ýæýäý\v\0 Aj" H\r\0\v Aj" \x07G\r\0\v\f\v \0!  \x07l"A\0J@A\0!\0@  \0Atj"\x07  \0Atjý\0\0"/  \0 j"\0AtjAký\0\0"0ýäý\v\0 \x07 Atj / 0ýåý\v\0 \0 H\r\0\v\v  Atj!\b@ AH\r\0 AG@ A\0J@A\0!\0@ \0 j"\x07At!	  \0Atj!  \0Atj!A!\0@  \0At"jý\0\0!/  	 \0kAtj"ý\0\0!0  \0Ak"\fAt"
j"\r 
 jý\0\0"2 Aký\0\0"1ýäý\v\0  j" / 0ýåý\v\0 \r At"j 2 1ýå"2 \b \0AtjA\bký	\0\0"1ýæ / 0ýä"/ \b \fAtjý	\0\0"0ýæýåý\v\0  j 2 0ýæ / 1ýæýäý\v\0 \0Aj"\0 H\r\0\v \x07"\0 H\r\0\v\v Aq\r\v A\0L\r\0  Atj!A\0!\0@  \0Atj"\x07ý\0\0!/  \0 j"\0AtjAk"\b \x07Aký\0\0"0 0ýäý\v\0 \b Atj /ý\f\0\0\0À\0\0\0À\0\0\0À\0\0\0Àýæý\v\0 \0 H\r\0\v\v\f\vAÝ
AÄ	AøA	\0\0\v  Atj"!  At"\bj"!	  \x07l"A\0J@  At"j! A0l!\f At!
 At!\r At!\v \0! !\x07@  \rj"ý\0\0!/ \x07 ý\0\0"0  \vj"Aký\0\0"2ýä"1 Aký\0\0"3 3ýä"3ýäý\v\0 \x07 
j 1 3ýåý\v\0 \x07 j 0 2ýå"0 / /ýä"/ýåý\v\0 \x07 \fj 0 /ýäý\v\0 \x07 Atj"\x07 I\r\0\v\v \b j!@ AH\r\0@ AG@ A\0L\r APl!\v At! At! \0Ak!A\0!\b@  \bAtj" Atj!\x1B  \bAtjAj!A!\x07@   \x07At"\fj"
ý\0\0"/   \x07kAtj"\rý\0\0"0ýä"2 \f \x1Bj"\fý\0\0"1   \x07kAtj"ý\0\0"3ýä"4ýäý\v\0  \fý\0"6 ý\0"5ýå": 
ý\0"7 \rý\0"8ýå"9ýäý\v  At"\fj" / 0ýå"/ 6 5ýä"0ýå"6  \x07At"\rAk"
jý	\0\0"5ýæ 1 3ýå"1 7 8ýä"3ýä"7  \rA\bk"\rjý	\0\0"8ýæýäý\v  6 8ýæ 7 5ýæýåý\v\0  \fj" 2 4ýå"2 	 
jý	\0\0"4ýæ 9 :ýå"6 	 \rjý	\0\0"5ýæýäý\v  2 5ýæ 6 4ýæýåý\v\0  \fj" / 0ýä"/ 
 jý	\0\0"0ýæ 3 1ýå"2 \r jý	\0\0"1ýæýäý\v  / 1ýæ 2 0ýæýåý\v\0  \vjA j! \x07Aj"\x07 H\r\0\v  \bj"\b H\r\0\v AqE\r\f\v A\0L\r\v A0l!\b At! \0 Atj!  AtjAk!	A\0!\x07@  \x07At jAt"j"ý\0\0!/ \0 j"ý\0\0!0 	 \x07Atj" Aký\0\0"2 Aký\0\0"1ýä"3 3ýäý\v\0  Atj 0 /ýä"3 2 1ýå"2ýåý\fóµ¿óµ¿óµ¿óµ¿ýæý\v\0  j / 0ýå"/ /ýäý\v\0  \bj 2 3ýäý\fóµ¿óµ¿óµ¿óµ¿ýæý\v\0  \x07j"\x07 H\r\0\v\v\v    F"\x1B!\0   \x1B! Ak l j!  G\r\0\v\v \0\f\vA¤\bAÄ	AßA	\0\0\v G!\f\v \0 F\r AJ@ Am!A\0! \0!@   A\x07tj"\x07ý\0"/ \x07ý\0P"0ýä"2 \x07ý\00"1 \x07ý\0p"3ýä"4ýä"6 2 4ýå"2  Aà\0lj"ý\0 "4ýæ \x07ý\0\0"5 \x07ý\0@":ýä"7 \x07ý\0 "8 \x07ý\0\`"9ýä";ýå"< ý\00"=ýæýå">ý\r\b	
\v\x1B\f\r"? / 0ýå"/ 8 9ýå"0ýä"8 ý\0\0"9ýæ ý\0"@ 5 :ýå"5 1 3ýå"1ýå"3ýæýå": / 0ýå"/ ý\0@"0ýæ 5 1ýä"1 ý\0P"5ýæýå"Aý\r\b	
\v\x1B\f\r"Bý\r\b	
\v\x1B\f\rý\vp  7 ;ýä"7 2 =ýæ < 4ýæýä"2ý\r\b	
\v\x1B\f\r"4 8 @ýæ 3 9ýæýä"3 / 5ýæ 1 0ýæýä"/ý\r\b	
\v\x1B\f\r"0ý\r\b	
\v\x1B\f\rý\v\`  ? Bý\r\0\x07ý\vP  4 0ý\r\0\x07ý\v@  6 >ý\r\0\x07"0 : Aý\r\0\x07"1ý\r\b	
\v\x1B\f\rý\v0  7 2ý\r\0\x07"2 3 /ý\r\0\x07"/ý\r\b	
\v\x1B\f\rý\v   0 1ý\r\0\x07ý\v  2 /ý\r\0\x07ý\v\0 Aj! Aj" G\r\0\v\v  \0   (x %A\f"\0 G! A\0L\r\0 A\fj A\bj \0 G\x1B(\0!A\0! AG@ Aq Aþÿÿÿ\x07q!A\0!\x07@  Atj"\0 \0ý\0\0"/ \0ý\0"0ý\r\b	
\v\x1B\f\rý\v \0 / 0ý\r\0\x07ý\v\0 \0 \0ý\0 "/ \0ý\00"0ý\r\0\x07ý\v  \0 / 0ý\r\b	
\v\x1B\f\rý\v0 Aj! \x07Aj"\x07 G\r\0\vE\r\v  Atj"\0 \0ý\0\0"/ \0ý\0"0ý\r\b	
\v\x1B\f\rý\v \0 / 0ý\r\0\x07ý\v\0\v  A\bj Atj(\0"\0G@  "G\rA\0! A\0J@@ \0 At"Ar"jý\0\0!/  j \0 jý\0\0ý\v\0  j /ý\v\0 Aj" G\r\0\v\v A\bjA\0A \x1Bj(\0 G\r\v Aj$\0\f\vAß
AÄ	AÇ\vA«	\0\0\vA¤\bAÄ	A¯	Aë	\0\0\vA¤\bAÄ	AÛ	A®\b\0\0\vA\bAÄ	Aô\vA«	\0\0\vA\bAÄ	Aû\vA«	\0\0\v\v\0 \0@ \0(p	 \0\x07\v\vÆ"{
}@@ \0A\0H\r\0@@@@@@@@@@ \0A I@@ E@ \0E\r\r \0AqE\r\f\r\v AG\r\0 \0E\r\f \0Aq\r\f\vAü\0
" 6l  \x006\0  \0 EvAv"6  At\v"6t  6p   ("AlAm"Atj"\v6x A\0J@ \0³!&@  AqAtj AvAà\0lj" ³"%CÛÉÀ &"$8\0  %CäËÁ &"'8P A@k '8\0  %CÛIÁ &"%80  %8   $8 Aj" G\r\0\v\v Aj!\f Aj!\b A\bj! \0Av!\x07@ E@ \x07AF\rA\0!A\0! \x07! \0A\fq\r	 \bA6\0A! \0Av"AF\rA! \0Av"At G@A! !\f
\v \fA6\0 AF\r\bA!  \0A\bv"AtG\r	 A6 AF@A!\f	\v \0A
v"At G@A! !\f
\vA! A6 AF\r\b \0A\fv"At G@A!\f
\v A6  AF@A!\f	\v \0Av"At G@A! !\f
\v A6$ AF@A!\f	\v \0Av"At G@A!\f
\v A6( AF@A\x07!\f	\v \0Av"At G@A\x07! !\f
\v A6, AF@A\b!\f	\v \0Av"At G@A\b!\f
\v A60 AF@A	!\f	\v \0Av"At G@A	! !\f
\v A64 AF@A
!\f	\v \0Av"At G@A
!\f
\v A68 AF@A\v!\f	\v \0Av"At G@A\v! !\f
\v A6< @A\f!\f	\v A6h BÀ\x007\` ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý\vP A@ký\f\0\0\0\0\0\0\0\0\0\0\0\0ý\v\0\f\vA! \x07AF@ B7\b\f\f\v \0An"Al \x07G@ \x07!\f\v \bA6\0 \x07AkAI@A!\f\v \0Aä\0n"Al G@A!\f\v \fA6\0 \x07AkAI@A!\f\v \0Aôn"Al G@A! !\f\v A6 \x07Aý\0kAý\0I@A!\f\v \0AÄn"Al G@A!\f\v A6 \x07AñkAñI@A!\f\vA! \0AÔá\0n"Al G@A! !\f\v A6  \x07AµkAµI\r  \0A¤èn"AlG\r A6$ \x07Aú\0kAú\0I@A!\f\v \0A´n"Al G@A! !\f\v A6( \x07A­âkA­âI@A\x07!\f\v \0A¯ß\0n"Al G@A\x07!\f\v A6, \x07AáëkAáëI@A\b!\f\v \0AëÜn"Al G@A\b! !\f\v A60 \x07Aå÷\0kAå÷\0I@A	!\f\vAA\0 \0AãÐK"\x1B G@A	!\f\v A64 @A
!\f\v A6h ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý\vX ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý\vH ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý\v8\f\r\v  6\f  \x076\b\f	\vAÝ
AÄ	A¯\bA	\0\0\v AF\r@  An"AlG\r AF\r\v  AtjA6\b Aj! Ak !AO\r\0\v\v  6\f  \x076\b\f\v AF\r\0A  AL\x1B! !@ AqE@  F\r
  AtjA6\b Aj"! Av"AG\r\f\v\vA  AL\x1B k!	A\0! !@ Aq\r  	F\r	  AtjA6\b @@ A\0L\r\0  jAt"E\r\0 \f \b ü
\0\0\v \bA6\0\v Aj! Aj! AG Av!\r\0\v\v  6\f  \x076\b A\0L\r\vCÛÉ@ \x07³!&  Atj"A\bj! Aj!\x1BA!\fA!A!@ \x07  \f"Aj"\fAtj(\0" "	l"m!@ AH\r\0 A\0L@ \v AtjAkBü7\0\f\vA At"Ar"\r \rAL\x1BAkAv"Aj!
 AM@ At!A! 
Aüÿÿÿ\x07q"\bAt"Ar!A\0!@ \v At"j"AkBü7\0 &  	j"²!%A!@@ \rAH@A\0!\f\v  \x1Bj" j I@A\0!\f\v  j" j I@A\0!\f\v AJ@A\0!\f\v  j! %ý!"ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@ "  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®ýúýæ"!ý\0"$!' !ý"(!) !ý"*!+ !ý",!-  Atj" $ý (ý  *ý  ,ý "! 'ý )ý  +ý  -ý "#ý\r\b	
\v\x1B\f\rý\v  ! #ý\r\0\x07ý\v  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®!  Aj" \bG\r\0\v ! \b" 
F\r\v@ \v Atj % Aj"³"$8 \v Aj"Atj $8\0  L Aj!\r\0\v\v  Aj"G\r\0\v\f\v At!A! 
Aüÿÿÿ\x07q"\bAt"Ar! \rAH! AJ!A\0!@ \v At"j"\rA\x006\0 & 	 j"²!% \rAkA!@@A\0 \r\0A\0  \x1Bj" j I\r\0A\0  j" j I\r\0A\0 \r\0 Aj!  j! %ý!"ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@ "  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®ýúýæ"!ý\0"$!' !ý"(!) !ý"*!+ !ý",!- \r Atj" $ý (ý  *ý  ,ý "! 'ý )ý  +ý  -ý "#ý\r\b	
\v\x1B\f\rý\v  ! #ý\r\0\x07ý\v "A\bj!  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®!  Aj" \bG\r\0\v \b 
F\r ! \b\v!@ \v Atj % Aj"³"'"$8 \v Aj"Atj" '8\0  L Aj!\r\0\v\f\v \v AtjA\bj! !ý!$\v $8\0 \r *\x008\0 Aj" G\r\0\v\v  G\r\0\v\f\v  6\f  \x076\b\f\vA k! !@@ AqE@  F\r\x07  AtjA6\b @  jAt"	@ \f \b 	ü
\0\0\v \bA6\0\v Aj! Aj! AF Av!E\r\f\v\v AF\r\0A  AL\x1B!@ An"Al F@  F\r\x07  AtjA6\b Aj! Ak !AO\r\f\v\v AF\r\0A  AL\x1B!@  An"AlG\r  F\r  AtjA6\b Aj! Ak !AO\r\0\v\v  6\f  \x076\b AH\r\vCÛÉ@ \x07³!%  AtjAj!A\0!A!A!\b@ \x07  Aj"Atj(\0" \b"l"\bm!	@ AH\r\0 	AH@ 	 Akl j!\f\v 	At!\x1B 	Ak"Aq!  Atj!A!\r Av"At! Aj"Aüÿÿÿq"\fAt!A\0! AI! AÿÿÿÿK!A\0!@ %  j"²!&A\0! !@@ \r\0   \x1Blj" j I\r\0 \r\0  j! \v Atj! &ý!"ý\f\0\0\0\0\0\0\0\0\0\0\0\0\0! @ "  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®ýúýæ"!ý\0"$!' !ý"(!) !ý"*!+ !ý",!-  Atj"
 $ý (ý  *ý  ,ý "! 'ý )ý  +ý  -ý "#ý\r\b	
\v\x1B\f\rý\v 
 ! #ý\r\0\x07ý\v\0  ý\f\0\0\0\0\0\0\0\0\0\0\0\0ý®!  Aj" \fG\r\0\v \f" F\r\v@ @ !\f\v \v Atj"
 & Ar"³"$8 
 $8\0 Aj!\v  F\r\0@ \v Atj"
 & Aj"³"$8\f 
 $8\b 
 & Aj"³"$8 
 $8\0 Aj! !  G\r\0\v\v Aj!  	j! \rAj"\r G\r\0\v\v  G\r\0\v\vA! A\0L\r\0 Aj!A\0! AO@ Aüÿÿÿ\x07q!ý\f\0\0\0\0\0\0\0\0\0\0\0\0! A\0!@  Atjý\0\0  ýµ!  Aj" G\r\0\v      ý\r\b	
\v\f\r\0\0ýµ"     ý\r\x07\0\0\0ýµý\x1B\0!  F\r\v@  Atj(\0 l! Aj" G\r\0\v\v \0Av F@ \v 	 \x07\vA\0\vA¢
AÄ	A\x07A
\0\0\v\0A
\v\0A\v\0\v\v¶\0A\b\vbuff[ib] == voutput\0finput==foutput\0in != out\0pffft_cplx_preprocess\0pffft_real_preprocess\0passf5_ps\0passf3_ps\0rfftf1_ps\0cfftf1_ps\0rfftb1_ps\0pffft_zreorder\0pffft_new_setup\0pffft_transform_internal\0.build/pffft-src/src/pffft_priv_impl.h\0pffft_cplx_finalize\0pffft_real_finalize\0decompose\0NEON\x002 + nf < IFAC_MAX_SIZE\0in != out && work1 != work2\0ido > 2\x000\0VALIGNED(finput) && VALIGNED(foutput)\0A\v\v×\0\0\0\0\0\0\0\0\0\0\0\0ù¢\0DNn\0ü)\0ÑW'\0Ý4õ\0bÛÀ\0<\0AC\0cQþ\0»Þ«\0·aÅ\0:n$\0ÒMB\0Ià\0	ê.\0Ñ\0ëþ\0)±\0è>§\0õ5\0D».\0é\0´&p\0A~_\0Ö9\0S9\0ô9\0_\0(ù½\0ø;\0Þÿ\0\0/ï\0
Z\0mm\0Ï~6\0	Ë'\0FO·\0f?\0-ê_\0º'u\0åëÇ\0={ñ\0÷9\x07\0R\0ûkê\0±_\0\b]\x000V\0{üF\0ð«k\0 ¼Ï\x006ô\0ã©\0^a\0\b\x1Bæ\0e\0 _\0@h\0Øÿ\0'sM\01\0ÊV\0É¨s\0{â\`\0kÀ\0ÄG\0ÍgÃ\0	èÜ\0Y*\0vÄ\0¦\0D¯Ý\0WÑ\0¥>\0\x07ÿ\x003~?\0Â2è\0OÞ\0»}2\0&=Ã\0kï\0ø^\x005:\0òÊ\0ñ\0|!\0j$|\0Õnú\x000-w\0;C\0µÆ\0Ã\0­ÄÂ\0,MA\0\f\0]\0}F\0ãq-\0Æ\x003b\0\0´Ò|\0´§\x007UÕ\0×>ö\0£\0Mvü\0d*\0p×«\0c|ø\0z°W\0ç\0ÀIV\0;ÖÙ\0§8\0$#Ë\0Öw\0ZT#\0\0¹\0ñ
\x1B\0Îß\01ÿ\0fj\0Wa\0¬ûG\0~Ø\0"e·\x002è\0æ¿\`\0ïÄÍ\0l6	\0]?Ô\0Þ×\0X;Þ\0Þ\0Ò"(\0(è\0âXM\0ÆÊ2\0\bã\0à}Ë\0ÀP\0ó§\0à[\0.4\0b\0H\0õ[\0­°\0éò\0HJC\0gÓ\0ªÝØ\0®_B\0jaÎ\0
(¤\0Ó´\0¦ò\0\\w\0£Â\0a<\0sx\0¯Z\0o×½\0-¦c\0ô¿Ë\0ï\0&Ág\0UÊE\0ÊÙ6\0(¨Ò\0Âa\0Éw\0&\0F\0ÄYÄ\0ÈÅD\0M²\0\0ó\0ÔC­\0)Iå\0ýÕ\0\0¾ü\0Ì\0pÎî\0>õ\0ìñ\0³çÃ\0Çø(\0\0Áq>\0.	³\0\vEó\0\0« {\0.µ\0GÂ\0{2/\0\fUm\0r§\0kç\x001Ë\0yJ\0Ayâ\0ôß\0è\0âæ\01\0ík\0__6\0»ý\0H´\0g¤l\0qrB\0]2\0¸\0¼å	\01%\0÷t9\x000\0\r\f\0K\bh\0,îX\0Gª\0tç\0½Ö$\0÷}¦\0nHr\0ï\0¦\0´ö\0ÑSQ\0Ï
ò\0 3\0õK~\0²ch\0Ý>_\0@]\0\0UR)\x007dÀ\0mØ\x002H2\0[Lu\0NqÔ\0ETn\0\v	Á\0*õi\0fÕ\0'\x07\0]P\0´;Û\0êvÅ\0ù\0Ik}\0'º\0i)\0ÆÌ¬\0­T\0âj\0Ù\0,rP\0¤¾\0w\x07\0ó0p\0\0ü'\0êq¨\0fÂI\0dà=\0Ý\0£?\0Cý\0\r\x001AÞ\09\0Ýp\0·ç\0\bß;\07+\0\\ \0Z\0\0èØ\0l¯\0ÛÿK\x008\0Yv\0b¥\0aË»\0Ç¹\0@½\0Òò\0Iu'\0ë¶ö\0Û"»\0
ª\0&/\0dv\0	;3\0\0Q:ª\0£Â\0¯í®\0\\&\0mÂM\0-z\0ÀV\0?\0	ðö\0+@\0m1\x009´\x07\0\f \0ØÃ[\0õÄ\0Æ­K\0NÊ¥\0§7Í\0æ©6\0«\0ÝBh\0cÞ\0vï\0hR\0üÛ7\0®¡«\0ß1\0\0®¡\0\fûÚ\0dMf\0í·\0)e0\0WV¿\0Gÿ:\0jù¹\0u¾ó\0(ß\0«0\0fö\0Ë\0ú"\0Ùä\0=³¤\0W\x1B\x006Í	\0NBé\0¾¤\x003#µ\0ðª\0Oe¨\0ÒÁ¥\0\v?\0[xÍ\0#ùv\0{\0r\0Æ¦S\0onâ\0ïë\0\0JX\0ÄÚ·\0ªfº\0vÏÏ\0Ñ\0±ñ-\0Á\0Ã­w\0HÚ\0÷] \0Æô\0¬ð/\0Ýì\0?\\¼\0ÐÞm\0Ç\0*Û¶\0£%:\0\0¯\0­S\0¶W\0)-´\0K~\0Ú\x07§\0vª\0{Y¡\0*\0Ü·-\0úåý\0Ûþ\0¾ý\0ävl\0©ü\0>p\0n\0ýÿ\0(>\x07\0ag3\0*\0M½ê\0³ç¯\0mn\0g9\x001¿[\0×H\x000ß\0Ç-C\0%a5\0ÉpÎ\x000Ë¸\0¿lý\0¤\0¢\0lä\0ZÝ \0!oG\0bÒ\0¹\\\0paI\0kVà\0R\0PU7\0Õ·\x003ñÄ\0n_\0]0ä\0.©\0²Ã\0¡26\0\b·¤\0ê±Ô\0÷!\0iä\0'ÿw\0\f\0@-\0OÍ \0 ¥\0³¢Ó\0/]
\0´ùB\0ÚË\0}¾Ð\0ÛÁ\0«½\0Ê¢\0\bj\\\0.U\0'\0U\0ð\0á\x07\0\vd\0A\0¾Þ\0Úý*\0k%¶\0{4\0óþ\0¹¿\0hjO\0J*¨\0OÄZ\0-ø¼\0×Z\0ôÇ\0\rM\0 :¦\0¤W_\0?±\08\0Ì \0qÝ\0ÉÞ¶\0¿\`õ\0Me\0\x07k\0°¬\0²ÀÐ\0QUH\0û\0rÃ\0£;\0À@5\0Ü{\0àEÌ\0N)ú\0ÖÊÈ\0èóA\0|dÞ\0dØ\0Ù¾1\0¤Ã\0wXÔ\0iãÅ\0ðÚ\0º:<\0FF\0Uu_\0Ò½õ\0nÆ\0¬.]\0Dí\0>B\0aÄ\0)ýé\0çÖó\0"|Ê\0o5\0\bàÅ\0ÿ×\0njâ\0°ýÆ\0\bÁ\0|]t\0k­²\0Ín\0>r{\0Æj\0÷Ï©\0)sß\0µÉº\0·\0Q\0â²\r\0tº$\0å}\`\0tØ\0\r,\0\f\0~f\0)\0zv\0ýý¾\0VEï\0Ù~6\0ìÙ\0º¹\0Äü\x001¨'\0ñnÃ\0Å6\0Ø¨V\0´¨µ\0ÏÌ\0-\0oW4\0,V\0Îã\0Ö ¹\0k^ª\0>*\0_Ì\0ý\vJ\0áôû\0;m\0â,\0éÔ\0ü´©\0ïîÑ\0.5É\0/9a\x008!D\0\x1BÙÈ\0ü
\0ûJj\0/Ø\0S´\0N\0T"Ì\0*UÜ\0ÀÆÖ\0\v\0p¸\0id\0&Z\`\0?Rî\0\0ôµ\0üËõ\x004¼-\x004¼î\0è]Ì\0Ý^\`\0g\03ï\0É¸\0aX\0áW¼\0QÆ\0Ø>\0ÝqH\0-Ý\0¯¡\0!,F\0Yó×\0Ùz\0TÀ\0Oú\0Vü\0åy®\0"6\x008­"\0gÜ\0Uèª\0&8\0Êç\0Q\r¤\03±\0©×\0iH\0e²ð\0§\0L\0ùÑ6\0!³\0{J\0Ï!\0@Ü\0ÜGU\0át:\0gëB\0þß\0^Ô_\0{g¤\0º¬z\0Uö¢\0+#\0AºU\0Yn\b\0!*\x009G\0ãæ\0åÔ\0Iû@\0ÿVé\0Ê\0ÅY\0ú+\0ÓÁÅ\0ÅÏ\0ÛZ®\0GÅ\0Cb\0!;\0,y\0a\0*L{\0,\0C¿\0&\0x<\0¨Ää\0åÛ{\0Ä:Â\0&ôê\0÷g\0\r¿\0e£+\0=±\0½|\v\0¤QÜ\0'Ýc\0iáÝ\0\0¨)\0hÎ(\0	í´\0D \0NÊ\0pc\0~|#\0¹2\0§õ\0Vç\0!ñ\b\0µ*\0o~M\0¥Q\0µù«\0ßÖ\0Ýa\06\0Ä:\0¢¡\0rím\x009z\0¸©\0k2\\\0F'[\0\x004í\0Ò\0w\0üôU\0YM\0àq\0Aó \v=@û!ù?\0\0\0\0-Dt>\0\0\0Fø<\0\0\0\`QÌx;\0\0\0\x1Bð9\0\0\0@ %z8\0\0\0"ã6\0\0\0\0ói5\0A°!\v°`)}function $(P){return P}async function y(P){return P}async function S(P,ie){try{var se=await y(P);return await WebAssembly.instantiate(se,ie)}catch(le){a(`failed to asynchronously prepare wasm: ${le}`),v(le)}}async function k(P,ie,se){return S(ie,se)}function T(){return{a:H}}async function I(){function P(me){return Ee=me.exports,Y(Ee),c(),Ee}function ie(me){return P(me.instance)}var se=T(),le=t.instantiateWasm;return le?new Promise(me=>{le(se,qe=>me(P(qe)))}):(_??=A(),ie(await k(s,_,se)))}var z,w,O=P=>{for(;P.length>0;)P.shift()(t)},M=[],F=[],G=globalThis.TextDecoder&&new TextDecoder,L=(P,ie,se,le)=>{for(var me=ie+se;P[ie]&&!(ie>=me);)++ie;return ie},C=(P,ie=0,se,le)=>{var me=L(P,ie,se);if(me-ie>16&&P.buffer&&G)return G.decode(P.subarray(ie,me));for(var qe="";ie<me;){var Ie=P[ie++];if(!(Ie&128)){qe+=String.fromCharCode(Ie);continue}var _e=P[ie++]&63;if((Ie&224)==192){qe+=String.fromCharCode((Ie&31)<<6|_e);continue}var qt=P[ie++]&63;if(Ie=(Ie&240)==224?(Ie&15)<<12|_e<<6|qt:(Ie&7)<<18|_e<<12|qt<<6|P[ie++]&63,Ie<65536)qe+=String.fromCharCode(Ie);else{var Xt=Ie-65536;qe+=String.fromCharCode(55296|Xt>>10,56320|Xt&1023)}}return qe},N=(P,ie,se)=>P?C(w,P,ie):"",V=(P,ie,se,le)=>v(`Assertion failed: ${N(P)}, at: `+[ie?N(ie):"unknown filename",se,le?N(le):"unknown function"]),X=()=>2147483648,te=(P,ie)=>Math.ceil(P/ie)*ie,re=P=>{var ie=(P-J.buffer.byteLength+65535)/65536|0;try{return J.grow(ie),c(),1}catch{}},ae=P=>{var ie=w.length;P>>>=0;var se=X();if(P>se)return!1;for(var le=1;le<=4;le*=2){var me=ie*(1+.2/le);if(me=Math.min(me,P+100663296),re(Math.min(se,te(Math.max(P,me),65536))))return!0}return!1};t.noExitRuntime&&t.noExitRuntime,t.print&&t.print,t.printErr&&(a=t.printErr),t.arguments&&t.arguments,t.thisProgram&&t.thisProgram;var q=t.preInit;if(q)for(typeof q=="function"&&(t.preInit=q=[q]);q.length>0;)q.shift()();var J;function Y(P){t._pffft_simd_size=P.e,t._pffft_simd_arch=P.f,t._pffft_new_setup=P.g,t._malloc=P.h,t._pffft_aligned_malloc=P.i,t._pffft_aligned_free=P.j,t._free=P.k,t._pffft_destroy_setup=P.l,t._pffft_transform_ordered=P.m,J=P.c,P.__indirect_function_table}var H={a:V,b:ae};async function Te(){f();var P=t.setStatus;P&&(P("Running..."),await new Promise(ie=>setTimeout(ie,1)),setTimeout(P,1,"")),!u&&(g(),t.onRuntimeInitialized?.(),b())}var Ee=await I();return await Te(),t}var xv=0,wv=1,$v=0,Av=3,kv=class Pn{static{this.modulePromise=null}constructor(t,r,i){if(this.setup=0,this.inPtr=0,this.outPtr=0,this.workPtr=0,this.normEnvelopeCache=new Map,t%32!=0)throw Error(`PffftSTFT: nFft (${t}) must be a multiple of 32 (pffft real-transform requirement)`);this.nFft=t,this.hopLength=r,this.dimF=i,this.hannWindow=new Float32Array(t);for(let n=0;n<t;n++)this.hannWindow[n]=.5*(1-Math.cos(2*Math.PI*n/t));this.frameScratch=new Float32Array(t)}async init(){if(Pn.modulePromise||=_v(),this.mod=await Pn.modulePromise,this.setup=this.mod._pffft_new_setup(this.nFft,$v),this.setup===0)throw Error(`PffftSTFT: pffft_new_setup(${this.nFft}, PFFFT_REAL) failed (returned NULL)`);let t=this.nFft*4;if(this.inPtr=this.mod._pffft_aligned_malloc(t),this.outPtr=this.mod._pffft_aligned_malloc(t),this.workPtr=this.mod._pffft_aligned_malloc(t),!this.inPtr||!this.outPtr||!this.workPtr)throw Error("PffftSTFT: pffft_aligned_malloc failed");let r=this.simdArchString();console.info(`pffft wasm FFT ready (simd_arch=${r})`)}simdArchString(){let t=this.mod._pffft_simd_arch(),r=this.mod.HEAPU8,i="";for(let n=t;r[n]!==0;n++)i+=String.fromCharCode(r[n]);return i}dimTFor(t){let r=this.nFft/2;return Math.floor((t+2*r-this.nFft)/this.hopLength)+1}reflectPadInto(t,r,i,n,a,s){for(let u=0;u<n;u++)a[s+u]=t[r+n-u];for(let u=0;u<i;u++)a[s+n+u]=t[r+u];for(let u=0;u<n;u++)a[s+n+i+u]=t[r+i-2-u]}forward(t,r,i){let{nFft:n,hopLength:a,dimF:s}=this;if(i%a!==0)throw Error(`PffftSTFT.forward: chunkSize (${i}) must be an exact multiple of hopLength (${a})`);let u=n/2,l=this.dimTFor(i),p=i+2*u,c=new Float32Array(r*4*s*l),f=new Float32Array(p),g=this.mod.HEAPF32,b=this.inPtr>>2,v=this.outPtr>>2;for(let _=0;_<r;_++)for(let A=0;A<2;A++){let $=(_*2+A)*i;this.reflectPadInto(t,$,i,u,f,0);let y=2*A+0,S=2*A+1,k=(_*4+y)*s*l,T=(_*4+S)*s*l;for(let I=0;I<l;I++){let z=I*a;for(let O=0;O<n;O++)this.frameScratch[O]=f[z+O]*this.hannWindow[O];g.set(this.frameScratch,b),this.mod._pffft_transform_ordered(this.setup,this.inPtr,this.outPtr,this.workPtr,xv);let w=this.mod.HEAPF32;for(let O=Av;O<s;O++){let M,F;O===0?(M=w[v+0],F=0):(M=w[v+2*O],F=w[v+2*O+1]),c[k+O*l+I]=M,c[T+O*l+I]=F}}}return c}getNormEnvelope(t){let r=this.normEnvelopeCache.get(t);if(r)return r;let{nFft:i,hopLength:n}=this,a=(t-1)*n+i;r=new Float32Array(a);for(let s=0;s<t;s++){let u=s*n;for(let l=0;l<i;l++){let p=this.hannWindow[l];r[u+l]+=p*p}}for(let s=0;s<a;s++)r[s]+=1e-8;return this.normEnvelopeCache.set(t,r),r}inverse(t,r){let{nFft:i,hopLength:n,dimF:a}=this,s=i/2,u=t.length,l=u/(r*4*a);if(!Number.isInteger(l))throw Error(`PffftSTFT.inverse: specData length (${u}) not consistent with batch=${r}, dimF=${a}`);let p=(l-1)*n+i,c=p-2*s,f=i/2,g=new Float32Array(r*2*c),b=new Float32Array(p),v=this.getNormEnvelope(l),_=this.mod.HEAPF32,A=this.inPtr>>2,$=this.outPtr>>2;for(let y=0;y<r;y++)for(let S=0;S<2;S++){b.fill(0);let k=2*S+0,T=2*S+1,I=(y*4+k)*a*l,z=(y*4+T)*a*l;for(let O=0;O<l;O++){this.frameScratch.fill(0),a>0&&(this.frameScratch[0]=t[I+0*l+O]),a>f&&(this.frameScratch[1]=t[I+f*l+O]);let M=Math.min(a,f);for(let L=1;L<M;L++)this.frameScratch[2*L]=t[I+L*l+O],this.frameScratch[2*L+1]=t[z+L*l+O];_.set(this.frameScratch,A),this.mod._pffft_transform_ordered(this.setup,this.inPtr,this.outPtr,this.workPtr,wv);let F=this.mod.HEAPF32,G=O*n;for(let L=0;L<i;L++){let C=F[$+L]/i*this.hannWindow[L];b[G+L]+=C}}let w=(y*2+S)*c;for(let O=0;O<c;O++)g[w+O]=b[s+O]/v[s+O]}return g}},Sv=class extends yv{constructor(e,t){if(super(e),this.nBins=0,this.trim=0,this.chunkSize=0,this.genSize=0,this.timings=new Map,this.segmentSize=t.segmentSize||256,this.overlap=t.overlap||.25,this.batchSize=Math.max(1,t.batchSize??1),this.hopLength=t.hopLength||1024,this.enableDenoise=t.enableDenoise||!1,t.stftBackend!==void 0&&this.warning(`stftBackend (${t.stftBackend}) is deprecated and ignored; STFT/ISTFT always run through PffftSTFT now.`),this.executionProviders=t.executionProviders??["webgpu","wasm"],this.debug(`MDX arch params: batchSize=${this.batchSize}, segmentSize=${this.segmentSize}`),this.debug(`MDX arch params: overlap=${this.overlap}, hopLength=${this.hopLength}, enableDenoise=${this.enableDenoise}`),this.debug(`MDX arch params: executionProviders=${this.executionProviders}`),this.compensate=this.modelData.compensate||1,this.dimF=this.modelData.mdx_dim_f_set||3072,this.dimT=2**(this.modelData.mdx_dim_t_set||8),this.nFft=this.modelData.mdx_n_fft_scale_set||7680,this.configYaml=this.modelData.config_yaml,this.nFft%32!=0)throw Error(`MDXSeparator: nFft (${this.nFft}) must be a multiple of 32 (pffft real-transform requirement)`);this.debug(`MDX arch params: compensate=${this.compensate}, dimF=${this.dimF}, dimT=${this.dimT}, nFft=${this.nFft}`),this.debug(`MDX arch params: configYaml=${this.configYaml}`)}async loadModel(){this.debug("Loading ONNX model for inference..."),this.reportProgress({stage:Ft.LoadingModel,fraction:0}),this.model||await this.downloadModel();let e={executionProviders:this.executionProviders,logSeverityLevel:this.logLevel==="debug"?0:3},t=xe.versions.web;xe.wasm.wasmPaths=`https://cdn.jsdelivr.net/npm/onnxruntime-web@${t}/dist/`;let r=typeof crossOriginIsolated<"u"&&crossOriginIsolated;r&&(xe.wasm.numThreads=Math.min(navigator.hardwareConcurrency||1,4));let i=typeof navigator<"u"&&"gpu"in navigator;this.info(`Backend availability: webgpu=${i?"possible (navigator.gpu present)":"unavailable (no navigator.gpu)"}, crossOriginIsolated=${r}`),this.info(`WASM fallback threads: ${r?xe.wasm.numThreads:"default (single-threaded; serve with COOP/COEP headers to enable multithreading)"}`),this.model=await Fn.create(this.modelPath,e),this.debug("Model loaded successfully using ONNXruntime inferencing session."),this.initializeModelSettings(),await this.stft.init(),this.reportProgress({stage:Ft.LoadingModel,fraction:1})}async downloadModel(){let e=this.modelUrl??"https://huggingface.co/AI4future/RVC/resolve/main/UVR_MDXNET_KARA_2.onnx";this.info(`Downloading ${this.modelName} model from ${e}...`);try{let t=await this.fetchModelWithCache(e);this.modelPath=URL.createObjectURL(new Blob([t])),this.info("Model downloaded successfully")}catch(t){throw this.error(`Error downloading model: ${t}`),t}}async fetchModelWithCache(e){let t;if(typeof caches<"u")try{t=await caches.open("web-demix2-models");let i=await t.match(e);if(i)return this.info("Model cache hit: using cached bytes, skipping network download"),await i.arrayBuffer();this.info("Model cache miss: downloading from network")}catch(i){this.debug(`Cache Storage unavailable, falling back to network: ${i}`),t=void 0}let r=await fetch(e);if(!r.ok)throw Error(`Failed to download model: ${r.statusText}`);if(t)try{await t.put(e,r.clone()),this.info("Model stored in Cache Storage for future runs")}catch(i){this.debug(`Failed to store model in Cache Storage: ${i}`)}return await r.arrayBuffer()}initializeModelSettings(){this.debug("Initializing model settings..."),this.nBins=Math.floor(this.nFft/2)+1,this.trim=Math.floor(this.nFft/2),this.chunkSize=this.hopLength*(this.segmentSize-1),this.genSize=this.chunkSize-2*this.trim,this.stft||=new kv(this.nFft,this.hopLength,this.dimF),this.debug(`Model input params: nFft=${this.nFft} hopLength=${this.hopLength} dimF=${this.dimF}`),this.debug(`Model settings: nBins=${this.nBins}, trim=${this.trim}, chunkSize=${this.chunkSize}, genSize=${this.genSize}`);let e=Math.floor((this.chunkSize-this.nFft)/this.hopLength)+1;this.debug(`Expected frames from chunk size: ${e}, Target: ${this.segmentSize}`)}async separate(e,t){this.audioFilePath=e,this.debug(`Loading audio file ${e}...`);let r=await Zd.loadAudioFile(e,this.sampleRate);this.debug(`Preparing mix for input audio file ${this.audioFilePath}...`);let i=await this.prepareMix(r);this.debug("Normalizing mix before demixing...");let n=Nf(i),a=await this.normalize(i,this.normalizationThreshold,this.amplificationThreshold),s=qf(await this.demix(a),n);this.debug("Demixing completed.");let u=[];if(this.debug("Processing output files..."),this.reportProgress({stage:Ft.WritingOutput,fraction:0}),this.primarySource||=s,!this.secondarySource){if(this.debug("Producing secondary source"),this.invertUsingSpec)throw Error("invertUsingSpec is not implemented");this.debug("Inverting secondary stem by subtracting demixed stem from original mix"),this.secondarySource=vv(a,this.primarySource,this.compensate)}let l=this.outputSingleStem?1:2;if(!this.outputSingleStem||this.outputSingleStem.toLowerCase()===this.secondaryStemName.toLowerCase()){let p=this.getStemOutputPath(this.secondaryStemName,t);this.info(`Saving secondary ${this.secondaryStemName} stem to ${p}...`);let c=await this.saveAudioOutput(p,this.secondarySource,this.secondaryStemName);u.push(c),this.reportProgress({stage:Ft.WritingOutput,fraction:u.length/l})}if(!this.outputSingleStem||this.outputSingleStem.toLowerCase()===this.primaryStemName.toLowerCase()){let p=this.getStemOutputPath(this.primaryStemName,t);this.primarySource||=s,this.info(`Saving primary ${this.primaryStemName} stem to ${p}...`);let c=await this.saveAudioOutput(p,this.primarySource,this.primaryStemName);u.push(c),this.reportProgress({stage:Ft.WritingOutput,fraction:u.length/l})}return u}async prepareMix(e){return this.debug("Preparing mix for input audio..."),super.prepareMix(e)}async normalize(e,t=1,r){return this.debug("Normalizing audio..."),super.normalize(e,t,r)}async demix(e,t=!1){let r=performance.now();this.timings.clear(),this.initializeModelSettings(),this.debug(`Original mix stored. Channels: ${e.length}, samples: ${e[0]?.length}`);let i,n;t?(i=this.hopLength*(this.segmentSize-1),n=.02,this.debug(`Chunk size for matching mix: ${i}, Overlap: ${n}`)):(i=this.chunkSize,n=this.overlap,this.debug(`Standard chunk size: ${i}, Overlap: ${n}`));let a=i-2*this.trim;this.debug(`Generated size calculated: ${a}`);let s=e[0].length,u=a+this.trim-s%a,l=this.trim+s+u,p=new Float32Array(2*l);for(let M=0;M<2;M++){let F=M*l;p.set(e[M],F+this.trim)}this.debugArrayStats(p,"runModel: padded mixture");let c=Math.floor((1-n)*i);this.debug(`Step size for processing chunks: ${c} as overlap is set to ${n}.`);let f=[new Float32Array(l),new Float32Array(l)],g=new Float32Array(l),b=new Map,v=M=>{let F=b.get(M);return F||(F=n===0?new Float32Array(M).fill(1):this.hannWindowCpu(M),b.set(M,F)),F};this.debug(`Initialized CPU result/divider buffers of length ${l}`);let _=0,A=l-i,$=A>0?Math.floor(A/c)+1:1;this.debug(`Mixture length: ${l}, Effective length for stepping: ${A}`),this.debug(`Total chunks to process: ${$} in batches of ${this.batchSize}`);let y=[],S=(M,F)=>{let G=performance.now();for(let L=0;L<y.length;L++){let{start:C,actualChunkSize:N}=y[L],V=v(N);for(let X=0;X<2;X++){let te=(L*2+X)*F,re=f[X];for(let ae=0;ae<N;ae++)re[C+ae]+=M[te+ae]*V[ae]}for(let X=0;X<N;X++)g[C+X]+=V[X]}y.length=0,this.addTiming("overlapAdd",performance.now()-G)},k=0,T=async()=>{let M=y.length;if(M===0)return;let F=performance.now(),G=new Float32Array(M*2*i);for(let C=0;C<M;C++){let{start:N,actualChunkSize:V}=y[C];for(let X=0;X<2;X++){let te=X*l+N;G.set(p.subarray(te,te+V),(C*2+X)*i)}}this.addTiming("chunkPrep",performance.now()-F),this.debug(`Running STFT -> model -> ISTFT on batch of ${M} chunks`);let L=await this.runModel(G,M,i,t);S(L,i),k+=M,this.reportProgress({stage:Ft.Demixing,fraction:Math.min(k/$,1),chunk:k,totalChunks:$})};for(let M=0;M<=A&&M<l;M+=c){_++;let F=M,G=Math.min(M+i,l),L=G-F;if(L<this.nFft){this.debug(`Skipping chunk ${_} - too small (${L} < ${this.nFft})`);break}this.debug(`Collecting chunk ${_}/${$}: Start ${F}, End ${G}, Size ${L}`),y.push({start:F,actualChunkSize:L}),y.length>=this.batchSize&&await T()}await T();let I=performance.now(),z=this.trim;this.debug(`Extracting valid portion: start=${z}, end=${z+s}, length=${s}`);let w=[];for(let M=0;M<2;M++){let F=f[M],G=new Float32Array(s);for(let L=0;L<s;L++)G[L]=F[z+L]/(g[z+L]+1e-8);w.push(G)}this.debug(`Final source channels: ${w.length}, samples: ${w[0].length}`),this.addTiming("demixFinalize",performance.now()-I);let O=performance.now();return console.log(`demix took ${(O-r).toFixed(2)}ms`),this.logTimingSummary(O-r),console.debug("Demixing process completed."),w}hannWindowCpu(e){let t=1-e%2,r=new Float32Array(e);for(let i=0;i<e;++i){let n=2*Math.PI*i/(e+t-1);r[i]=.5-.5*Math.cos(n)}return r}addTiming(e,t){this.timings.set(e,(this.timings.get(e)??0)+t)}async timed(e,t){let r=performance.now(),i=await t();return this.addTiming(e,performance.now()-r),i}logTimingSummary(e){let t=0,r=[];for(let[n,a]of this.timings)t+=a,r.push(`${n}=${a.toFixed(0)}ms(${(a/e*100).toFixed(1)}%)`);let i=e-t;r.push(`other=${i.toFixed(0)}ms(${(i/e*100).toFixed(1)}%)`),console.log(`TIMING_SUMMARY demixTotal=${e.toFixed(0)}ms ${r.join(" ")}`)}async runModel(e,t,r,i){this.debugArrayStats(e,`runModel input (isMatchMix=${i})`);let n=await this.timed("stftForward",()=>this.stft.forward(e,t,r));this.debugArrayStats(n,"STFT output");let a;if(i)a=n,this.debug("isMatchMix: spectrum prediction obtained directly from STFT output.");else{if(this.enableDenoise)throw Error("Denoising mode is not yet implemented");let u=new Ze("float32",n,[t,4,this.dimF,this.dimT]);a=(await this.timed("onnxRun",()=>this.model.run({input:u}))).output.data,this.debug("Model run on the spectrum without denoising.")}let s=await this.timed("istft",()=>this.stft.inverse(a,t));return this.debugArrayStats(s,`runModel output (isMatchMix=${i})`),s}async saveAudioOutput(e,t,r){this.debug(`Saving ${r} to ${e}`);try{this.debug(`Audio data has ${t.length} channels with ${t[0]?.length||0} samples each`);let i=await this.normalize(t,this.normalizationThreshold,this.amplificationThreshold),n=await Zd.saveAudioFile(i,this.sampleRate,e),a=URL.createObjectURL(n);return this.info(`Created ${r} output blob: ${n.size} bytes`),a}catch(i){throw this.error(`Error saving ${r} output: ${i}`),i}}debugArrayStats(e,t){if(this.logLevel!=="debug")return;let r=0,i=0,n=0,a=0,s=0,u=e.length;for(let c=0;c<u;c++){let f=e[c];if(Number.isNaN(f)){a++;continue}if(!Number.isFinite(f)){s++;continue}let g=Math.abs(f);g>r&&(r=g),i+=g,g>1e-8&&n++}let l=i/u,p=(n/u*100).toFixed(2);console.log(`${a>0?"🚨 NaN":s>0?"⚠️ Inf":r<1e-8?"🤔 Zero":"✅ OK"} ${t}: length=${u}, max=${r.toFixed(6)}, mean=${l.toFixed(6)}, nonZero=${n}/${u} (${p}%)`),a>0&&console.error(`   └─ Contains ${a} NaN values!`),s>0&&console.error(`   └─ Contains ${s} Inf values!`),r<1e-8&&a===0&&console.warn("   └─ Array appears to be essentially zero")}},Qd={UVR_MDXNET_KARA_2:{architecture:"mdx",name:"UVR_MDXNET_KARA_2",downloadUrl:"https://huggingface.co/AI4future/RVC/resolve/main/UVR_MDXNET_KARA_2.onnx",modelData:{compensate:1.065,mdx_dim_f_set:2048,mdx_dim_t_set:8,mdx_n_fft_scale_set:5120,primary_stem:"Instrumental",is_karaoke:!0},description:"Karaoke model: removes lead vocals but keeps backing vocals in the instrumental."},"UVR-MDX-NET-Voc_FT":{architecture:"mdx",name:"UVR-MDX-NET-Voc_FT",downloadUrl:"https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR-MDX-NET-Voc_FT.onnx",modelData:{compensate:1.021,mdx_dim_f_set:3072,mdx_dim_t_set:8,mdx_n_fft_scale_set:7680,primary_stem:"Vocals"},description:"Fine-tuned vocal model: removes all vocals (lead and backing) from the mix."},Kim_Vocal_2:{architecture:"mdx",name:"Kim_Vocal_2",downloadUrl:"https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/Kim_Vocal_2.onnx",modelData:{compensate:1.009,mdx_dim_f_set:3072,mdx_dim_t_set:8,mdx_n_fft_scale_set:7680,primary_stem:"Vocals"},description:"High-accuracy vocal model: removes all vocals (lead and backing) from the mix."},UVR_MDXNET_Main:{architecture:"mdx",name:"UVR_MDXNET_Main",downloadUrl:"https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR_MDXNET_Main.onnx",modelData:{compensate:1.043,mdx_dim_f_set:3072,mdx_dim_t_set:8,mdx_n_fft_scale_set:7680,primary_stem:"Vocals"},description:"General-purpose vocal model: removes all vocals (lead and backing) from the mix."},"UVR-MDX-NET-Inst_HQ_3":{architecture:"mdx",name:"UVR-MDX-NET-Inst_HQ_3",downloadUrl:"https://huggingface.co/Blane187/all_public_uvr_models/resolve/main/UVR-MDX-NET-Inst_HQ_3.onnx",modelData:{compensate:1.022,mdx_dim_f_set:3072,mdx_dim_t_set:8,mdx_n_fft_scale_set:6144,primary_stem:"Instrumental"},description:"High-quality instrumental model: removes all vocals (lead and backing), tuned for cleaner instrumentals."}};function Tv(e,t){let r=Qd[e];if(!r)throw Error(`createSeparator: unknown model "${e}". Known models: ${Object.keys(Qd).join(", ")}`);let i=r.modelData.primary_stem==="Vocals"?"vocals":"instrumental",n=i==="vocals"?"instrumental":"vocals",a={modelPath:r.downloadUrl,modelName:r.name,modelData:r.modelData,modelUrl:r.downloadUrl,primaryStemName:i,secondaryStemName:n,...t?.common};switch(r.architecture){case"mdx":return new Sv(a,t?.mdx??{});default:{let s=r.architecture;throw Error(`createSeparator: unsupported architecture "${s}"`)}}}export{Zd as AudioUtils,yv as CommonSeparator,Sv as MDXSeparator,Qd as MODEL_REGISTRY,kv as PffftSTFT,Ft as SeparationStage,Tv as createSeparator};
