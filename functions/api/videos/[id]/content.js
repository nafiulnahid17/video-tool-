export async function onRequest({request,env,params}) {
 if(request.method!=="GET")return new Response("Method not allowed",{status:405});
 if(!env.OPENROUTER_API_KEY)return Response.json({error:"Missing OPENROUTER_API_KEY Cloudflare secret."},{status:503});
 const id=params.id;if(typeof id!=="string"||!/^[a-zA-Z0-9_-]{1,200}$/.test(id))return Response.json({error:"Invalid video job ID."},{status:400});
 const u=new URL(request.url),index=u.searchParams.get("index")||"0";if(!/^\d{1,3}$/.test(index))return Response.json({error:"Invalid video index."},{status:400});
 try{const r=await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(id)}/content?index=${index}`,{headers:{Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,"HTTP-Referer":u.origin,"X-Title":"FrameForge AI Video Studio"}});
 if(!r.ok)return new Response(await r.text()||"Video download failed.",{status:r.status,headers:{"Content-Type":r.headers.get("Content-Type")||"application/json","Cache-Control":"no-store"}});
 const h=new Headers({"Content-Type":r.headers.get("Content-Type")||"video/mp4","Content-Disposition":'attachment; filename="frameforge-video.mp4"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});const len=r.headers.get("Content-Length");if(len)h.set("Content-Length",len);return new Response(r.body,{status:200,headers:h})
 }catch{return Response.json({error:"Could not download the video. Please retry."},{status:502})}
}