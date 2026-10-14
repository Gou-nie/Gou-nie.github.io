import{c as v}from"./chunk-4KE642ED-CfkcOtcu.js";import{p as B}from"./treemap-KMMF4GRG-7ORZ52ND-Dt7x-D8b.js";import{m as f,L as m,aN as C,W as P,p as u,H as z,U as W,j as F,e as S,$ as D,G as E,O as T,r as N,N as L}from"./mermaid.esm.min-BR57E6qB.js";import"./chunk-OMTJKCYW-Dfw8IUmk.js";import"./app-DaYRIQC0.js";var A=N.packet,w=class{constructor(){this.packet=[],this.setAccTitle=z,this.getAccTitle=W,this.setDiagramTitle=F,this.getDiagramTitle=S,this.getAccDescription=D,this.setAccDescription=E}static{f(this,"PacketDB")}getConfig(){let t=m({...A,...T().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){L(),this.packet=[]}},H=1e4,R=f((t,e)=>{v(t,e);let r=-1,i=[],l=1,{bitsPerRow:n}=e.getConfig();for(let{start:a,end:s,bits:c,label:d}of t.blocks){if(a!==void 0&&s!==void 0&&s<a)throw new Error(`Packet block ${a} - ${s} is invalid. End must be greater than start.`);if(a??=r+1,a!==r+1)throw new Error(`Packet block ${a} - ${s??a} is not contiguous. It should start from ${r+1}.`);if(c===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(s??=a+(c??1)-1,c??=s-a+1,r=s,u.debug(`Packet block ${a} - ${r} with label ${d}`);i.length<=n+1&&e.getPacket().length<H;){let[p,o]=j({start:a,end:s,bits:c,label:d},l,n);if(i.push(p),p.end+1===l*n&&(e.pushWord(i),i=[],l++),!o)break;({start:a,end:s,bits:c,label:d}=o)}}e.pushWord(i)},"populate"),j=f((t,e,r)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*r)return[t,void 0];let i=e*r-1,l=e*r;return[{start:t.start,end:i,label:t.label,bits:i-t.start},{start:l,end:t.end,label:t.label,bits:t.end-l}]},"getNextFittingBlock"),$={parser:{yy:void 0},parse:f(async t=>{let e=await B("packet",t),r=$.parser?.yy;if(!(r instanceof w))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");u.debug(e),R(e,r)},"parse")},G=f((t,e,r,i)=>{let l=i.db,n=l.getConfig(),{rowHeight:a,paddingY:s,bitWidth:c,bitsPerRow:d}=n,p=l.getPacket(),o=l.getDiagramTitle(),h=a+s,b=h*(p.length+1)-(o?0:a),k=c*d+2,g=C(e);g.attr("viewbox",`0 0 ${k} ${b}`),P(g,b,k,n.useMaxWidth);for(let[y,x]of p.entries())M(g,x,y,n);g.append("text").text(o).attr("x",k/2).attr("y",b-h/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),M=f((t,e,r,{rowHeight:i,paddingX:l,paddingY:n,bitWidth:a,bitsPerRow:s,showBits:c})=>{let d=t.append("g"),p=r*(i+n)+n;for(let o of e){let h=o.start%s*a+1,b=(o.end-o.start+1)*a-l;if(d.append("rect").attr("x",h).attr("y",p).attr("width",b).attr("height",i).attr("class","packetBlock"),d.append("text").attr("x",h+b/2).attr("y",p+i/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(o.label),!c)continue;let k=o.end===o.start,g=p-2;d.append("text").attr("x",h+(k?b/2:0)).attr("y",g).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(o.start),k||d.append("text").attr("x",h+b).attr("y",g).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(o.end)}},"drawWord"),O={draw:G},Y={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},U=f(({packet:t}={})=>{let e=m(Y,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),J={parser:$,get db(){return new w},renderer:O,styles:U};export{J as diagram};
