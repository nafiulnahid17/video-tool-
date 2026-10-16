const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export async function onRequest({request,env,params}) {
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 if(!env.OPENROUTER_API_KEY)return json({error:"Missing OPENROUTER_API_KEY Cloudflare secret."},503);
 const id=params.id;if(typeof id!=="string"||!/^[a-zA-Z0-9_-]{1,200}$/.test(id))return json({error:"Invalid video job ID."},400);
 try{const r=await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,"HTTP-Referer":new URL(request.url).origin,"X-Title":"FrameForge AI Video Studio"}});return new Response(await r.text(),{status:r.status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}catch{return json({error:"Could not check generation status."},502)}
}