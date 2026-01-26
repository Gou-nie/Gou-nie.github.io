import{_ as i}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as n,d as a,o as l}from"./app-sBR6gxrp.js";const e={};function t(p,s){return l(),n("div",null,s[0]||(s[0]=[a(`<h1 id="flowhost" tabindex="-1"><a class="header-anchor" href="#flowhost"><span>FlowHost</span></a></h1><ul><li><ol><li><a href="#first">架构流程</a></li></ol><ul><li>1.1. <a href="#firstPOne">架构流程图</a></li><li>1.2. <a href="#firstPTwo">架构说明</a></li></ul></li><li><ol start="2"><li><a href="#second">功能</a></li></ol><ul><li>2.1. <a href="secondPOne">物理串口通讯</a></li><li>2.1. <a href="secondPTwo">工作流编辑</a></li></ul></li></ul><p><em>一定能成!</em></p><h2 id="_1-架构流程" tabindex="-1"><a class="header-anchor" href="#_1-架构流程"><span>1. <a name="first"></a> 架构流程</span></a></h2><h3 id="_1-1-架构流程图" tabindex="-1"><a class="header-anchor" href="#_1-1-架构流程图"><span>1.1. <a name="firstPOne"></a> 架构流程图</span></a></h3><div class="language-mermaid line-numbers-mode" data-highlighter="shiki" data-ext="mermaid" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">sequenceDiagram</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant User as 前端 (User)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant API as API Server</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant WR as WorkflowRunner</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant SE as ScriptEngine</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant Driver as SerialDriver</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    participant Device as 硬件设备</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    %% 启动阶段</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    User-&gt;&gt;API: POST /api/workflow/run {workflow}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    API-&gt;&gt;WR: execute(workflow)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    activate WR</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    WR--&gt;&gt;API: 200 OK (Started)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    %% 节点执行循环</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    loop 遍历节点 (Node Execution)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        WR-&gt;&gt;WR: 解析节点类型</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        WR-&gt;&gt;User: SSE: node_start (节点开始)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        alt 类型: command/send</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            WR-&gt;&gt;SE: send(command)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            SE-&gt;&gt;Driver: transferOut(data)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            Driver-&gt;&gt;Device: 发送数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        else 类型: parallel</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            WR-&gt;&gt;WR: 分裂多个分支 (Async)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            par 分支 A</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                WR-&gt;&gt;WR: runBranch(A)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            and 分支 B</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                WR-&gt;&gt;WR: runBranch(B)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            end</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        else 类型: delay</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            WR-&gt;&gt;WR: 等待 N 毫秒</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        end</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        WR-&gt;&gt;User: SSE: node_end (节点结束)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    end</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    %% 结束</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    WR-&gt;&gt;User: SSE: finish (工作流完成)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    deactivate WR</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    %% 数据接收 (独立轮询进程)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    par 后台数据轮询</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        loop Every 100ms</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            SE-&gt;&gt;Driver: readAvailable()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            Driver-&gt;&gt;Device: 检查缓冲区</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            Device--&gt;&gt;Driver: 返回数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            Driver--&gt;&gt;SE: Buffer</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            opt 有数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                SE-&gt;&gt;User: SSE: tx (收到数据)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            end</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        end</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    end</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-1-架构说明" tabindex="-1"><a class="header-anchor" href="#_1-1-架构说明"><span>1.1. <a name="firstPTwo"></a> 架构说明</span></a></h3><h2 id="_2-功能" tabindex="-1"><a class="header-anchor" href="#_2-功能"><span>2. <a name="second"></a> 功能</span></a></h2><h3 id="_2-1-物理串口通讯" tabindex="-1"><a class="header-anchor" href="#_2-1-物理串口通讯"><span>2.1. <a name="secondPOne"></a> 物理串口通讯</span></a></h3><h3 id="_2-2-工作流编辑" tabindex="-1"><a class="header-anchor" href="#_2-2-工作流编辑"><span>2.2. <a name="secondPTwo"></a> 工作流编辑</span></a></h3><div class="language-mermaid line-numbers-mode" data-highlighter="shiki" data-ext="mermaid" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">graph TD</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    1((&quot;START&quot;))</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    2{{&quot;PARALLEL&quot;}}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    10[&quot;Set count = 0&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    11[&quot;Log: Loop Start&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    12[&quot;Set count = count + 1&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    13{&quot;IF: count &lt; 3&quot;}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    14[&quot;Log: Loop Finished&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    20[&quot;Log: Waiting for data...&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    21{&quot;Wait Receive&quot;}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    22[&quot;Send: RECEIVED_GO&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    23[&quot;Log: Branch B Done&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    24[&quot;Log: User Stopped Branch B&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    25[&quot;Log: Receive Timeout in Branch B&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    1 --&gt; 2</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    2 --&gt; 10</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    2 --&gt; 20</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    10 --&gt; 11</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    11 --&gt; 12</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    12 --&gt; 13</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    13 --&gt;|True| 11</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    13 --&gt;|False| 14</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    20 --&gt; 21</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    21 --&gt;|GO| 22</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    21 --&gt;|STOP| 24</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    21 --&gt;|Timeout| 25</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    22 --&gt; 23</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,11)]))}const r=i(e,[["render",t]]),k=JSON.parse('{"path":"/content/tool/flowHost.html","title":"FlowHost","lang":"en-US","frontmatter":{"title":"FlowHost","tags":["tool"],"category":["FlowHost"]},"git":{"createdTime":1769137702000,"updatedTime":1769391788000,"contributors":[{"name":"lxs","username":"lxs","email":"liuxs@se-iot.cn","commits":2,"url":"https://github.com/lxs"}]},"readingTime":{"minutes":1.37,"words":410},"filePathRelative":"content/tool/flowHost.md","excerpt":"\\n<ul>\\n<li>\\n<ol>\\n<li><a href=\\"#first\\">架构流程</a></li>\\n</ol>\\n<ul>\\n<li>1.1. <a href=\\"#firstPOne\\">架构流程图</a></li>\\n<li>1.2. <a href=\\"#firstPTwo\\">架构说明</a></li>\\n</ul>\\n</li>\\n<li>\\n<ol start=\\"2\\">\\n<li><a href=\\"#second\\">功能</a></li>\\n</ol>\\n<ul>\\n<li>2.1. <a href=\\"secondPOne\\">物理串口通讯</a></li>\\n<li>2.1. <a href=\\"secondPTwo\\">工作流编辑</a></li>\\n</ul>\\n</li>\\n</ul>"}');export{r as comp,k as data};
