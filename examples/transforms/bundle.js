webpackJsonp([7],[function(e,t,r){function o(){return new a({getUniforms:function(){return{camera:d.computeMatrix()}},factory:function(){var e=100,t=new s.Float(e,4),r=16,o=new s.Float(r,16),n=new c(function(){return"  gl_Position = camera * transforms[int(transform)] * position; \n  f_color = colors[int(color)]; \n"},function(){return"  gl_FragColor = f_color ;\n"});n.attributes.position="vec4",n.attributes.color="float",n.attributes.transform="float",n.varyings.f_color="vec4",n.vertex_uniforms.camera="mat4",n.vertex_uniforms["colors["+e+"]"]="vec4",n.vertex_uniforms["transforms["+r+"]"]="mat4";var a=new i(this,n,100);return a.addAttribute("position",4,"Float32Array",function(e,t){return t.vertices[e]}),a.addAttribute("color",1,"Float32Array",function(e,r){var o=[],n=r.allocations.colors;return n.forEach(function(e){o.push(t.add(e,r,function(){return e.color}))}),o}),a.addAttribute("transform",1,"Float32Array",function(e,t){var r=[],n=t.allocations.transforms;return n.forEach(function(e){r.push(o.add(e,t,function(){return e.getValue()}))}),r}),a.allocations.colors=t,a.uniforms.colors=t.buffer,a.allocations.transforms=o,a.uniforms.transforms=o.buffer,a}})}var n=r(1),a=n.Renderable,i=n.Model,c=(n.shaders,n.Shader),s=n.Allocation,u=n.Transform,l=new n({canvas:document.getElementById("canvas"),frameRate:{element:document.getElementById("framerate")},wasd:{document:document,delta:.05,theta:-Math.PI/120}}),d=l.camera,f=l.screen,m=function(e,t,r,o){return[[e-o,t-o,r,1],[e-o,t+o,r,1],[e+o,t-o,r,1],[e+o,t+o,r,1]]},v={id:"red",color:[1,0,0,1]},h={id:"green",color:[0,1,0,1]},_={id:"blue",color:[0,0,1,1]},p={id:"white",color:[1,1,1,1]},x=[];x.push(new u),f.on("frame",function(){x[0].rotateBy(Math.PI/8/10,0,0),x[0].trigger("change",x[0])});var g=o();f.addRenderable(g),g.add({allocations:{colors:[v],transforms:[x[0]]},vertices:m(.25,0,.7,.05)}),g.add({allocations:{colors:[h],transforms:[x[0]]},vertices:m(0,.25,.7,.05)}),g.add({allocations:{colors:[_],transforms:[x[0]]},vertices:m(0,0,.9,.05)}),g.add({allocations:{colors:[p],transforms:[x[0]]},vertices:m(0,0,.7,.01)}),f.beginFrameRendering(!1)}]);
//# sourceMappingURL=bundle.js.map