import{c}from"./createLucideIcon-BzHmKQMo.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],u=c("save",r);async function v(t,{actorUserId:e,action:n,entityType:i,entityId:o=null,metadata:s={}}){const{error:a}=await t.from("admin_audit_events").insert({actor_user_id:e,action:n,entity_type:i,entity_id:o,metadata:s});return(a==null?void 0:a.message)??null}function y(t,e){return e?`${t} Change history was not recorded. Ask a Website owner or CMS manager to review this save: ${e}`:t}export{u as S,v as r,y as w};
