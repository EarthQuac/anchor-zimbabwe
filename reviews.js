const form=document.getElementById("review-form");
const status=document.getElementById("review-status");
const text=document.getElementById("review-text");
const count=document.getElementById("review-count");
const submit=document.getElementById("review-submit");
text.addEventListener("input",()=>count.textContent=`${text.value.length} / 1,200`);
form.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!form.reportValidity())return;
 const data=new FormData(form);
 const payload={displayName:data.get("displayName"),avatar:data.get("avatar"),rating:Number(data.get("rating")),review:data.get("review")};
 submit.disabled=true;submit.textContent="Submitting…";status.className="review-status";status.textContent="";
 try{
  const response=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||"Unable to submit review.");
  status.textContent=result.message;form.reset();count.textContent="0 / 1,200";
 }catch(error){status.className="review-status is-error";status.textContent=error.message||"Something went wrong. Please try again."}
 finally{submit.disabled=false;submit.textContent="Submit review"}
});