const json = (d,s=200) => Response.json(d,{status:s,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export async function onRequest({ request, env }) {
  if(request.method!=="POST") return json({error:"Method not allowed"},405);
  if(!env.OPENROUTER_API_KEY) return json({error:"Missing OPENROUTER_API_KEY Cloudflare secret."},503);
  let x; try{x=await request.json()}catch{return json({error:"Request body must be valid JSON."},400)}
  const prompt=typeof x.prompt==="string"?x.prompt.trim():"",model=typeof x.model==="string"?x.model.trim():"";
  if(!prompt)return json({error:"Describe the video you want to generate."},400);
  if(prompt.length>4000)return json({error:"Prompt must be 4,000 characters or fewer."},400);
  if(!model||model.length>200||!/^[a-zA-Z0-9._/-]+$/.test(model))return json({error:"Choose a valid model from the video catalog."},400);
  const p={model,prompt},ratios=["16:9","9:16","1:1","4:3","3:4","auto"],resolutions=["480p","720p","1080p","4k"];
  if(ratios.includes(x.aspect_ratio))p.aspect_ratio=x.aspect_ratio;
  if(Number.isInteger(x.duration)&&x.duration>=1&&x.duration<=30)p.duration=x.duration;
  if(resolutions.includes(x.resolution))p.resolution=x.resolution;
  if(typeof x.generate_audio==="boolean")p.generate_audio=x.generate_audio;
  try{const r=await fetch("https://openrouter.ai/api/v1/videos",{method:"POST",headers:{Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,"Content-Type":"application/json","HTTP-Referer":new URL(request.url).origin,"X-Title":"FrameForge AI Video Studio"},body:JSON.stringify(p)});return new Response(await r.text(),{status:r.status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}catch{return json({error:"Could not reach OpenRouter. Please try again."},502)}
}