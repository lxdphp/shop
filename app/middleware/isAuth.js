 
module.exports=option=>{
	return async function isAuth(ctx, next){
	
    await next();//放行
    
	}
}
