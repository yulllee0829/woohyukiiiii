// Slightly reduce Woohyuk only in the pharmacy scene without changing other scene sprites.
(function(){
  if(typeof ctx==='undefined'||!ctx||typeof ctx.drawImage!=='function')return;
  const original=ctx.drawImage.bind(ctx);
  let pharmacyFrame=false;
  ctx.drawImage=function(...args){
    const source=args[0];
    if(source instanceof HTMLImageElement&&String(source.src||'').includes('/phar.png')){
      pharmacyFrame=true;
      return original(...args);
    }
    // Pharmacy Woohyuk is rendered from a cropped canvas at width 34.
    if(pharmacyFrame&&source instanceof HTMLCanvasElement&&args.length===5&&Math.abs(Number(args[3])-34)<0.1){
      const [,x,y,w,h]=args;
      const nw=30,nh=h*(nw/w);
      pharmacyFrame=false;
      return original(source,x+(w-nw)/2,y+(h-nh),nw,nh);
    }
    return original(...args);
  };
})();