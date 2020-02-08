
var g_stop_render=false;
function stopRender() {
    g_stop_render = true;
}

var g_fullscreen=false;

function makeFullscreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    var requestFullScreen = docEl.requestFullscreen || docEl.requestFullScreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    g_fullscreen=true;
    var scr=document.getElementById("screen");
    window.onresize=onResizeWindow;
    requestFullScreen.call(scr);
}

document.getElementById("screen").addEventListener("mousedown", function(e) {
    pointerLock();
});

function pointerLock() {
    var body = document.body;
    body.requestPointerLock = body.requestPointerLock || body.mozRequestPointerLock || body.webkitRequestPointerLock;
    body.requestPointerLock();
    g_pointer_lock_at=now();
    document.getElementById("screen").style="cursor:none;";
}
function pointerUnlock() {
    document.exitPointerLock = document.exitPointerLock    || document.mozExitPointerLock;
    document.exitPointerLock();
    
}
var g_pointer_locked;
document.onpointerlockchange=function(event) {
    if(document.pointerLockElement) {
        g_pointer_locked=true;
    } else {
        g_pointer_locked=false;
        var elem=document.getElementById("screen");
        if(elem)elem.style="cursor:default;";    
    }
}


function onResizeWindow() {
    var w=window.innerWidth, h=window.innerHeight;
    updateWindowSize(w,h);
}

function updateWindowSize(w,h){
    window.onresize=null;
    g_viewport3d.screen_width=w;
    g_viewport3d.screen_height=h;
    g_viewport2d.screen_width=w;
    g_viewport2d.screen_height=h;
    Moyai.width=w;
    Moyai.height=h;

//    Moyai.canvas.width=w;
//    g_moyai_client.renderer.domElement.height=h;
//    g_moyai_client.renderer.domElement.style="width:"+w+"px;height:"+w+"px;";
//    g_moyai_client.renderer.setSize(w,h);
}






////////////
var SCRW=window.innerWidth, SCRH=window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
SCRW*=pixelRatio;
SCRH*=pixelRatio;
console.log("Screen size:",SCRW,SCRH);
Moyai.init(SCRW,SCRH);
Moyai.clearColor=Color.fromValues(0.5,0.5,0.5,1);
var screen = document.getElementById("screen");
var canvas=Moyai.getDomElement();
canvas.style="width:100%; height:100%";
screen.appendChild(canvas);


var g_keyboard = new Keyboard();
g_keyboard.setupBrowser(window);
var g_mouse = new Mouse();
g_mouse.setupBrowser(window,screen);


var g_viewport3d = new Viewport();
g_viewport3d.setSize(SCRW,SCRH);
g_viewport3d.setClip3D( 0.01, 100 );

var g_viewport2d = new Viewport();
g_viewport2d.setSize(SCRW,SCRH);
g_viewport2d.setScale2D(SCRW,SCRH);

var g_main_layer = new Layer();
Moyai.insertLayer(g_main_layer);
g_main_layer.setViewport(g_viewport3d);

var g_main_camera = new PerspectiveCamera( 45*Math.PI/180 , SCRW / SCRH , 0.1, 1000);
g_main_camera.setLoc(-5,5,0);
g_main_camera.setLookAt(vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));
g_main_layer.setCamera(g_main_camera);
g_main_camera.vel = vec3.fromValues(0,0,0);
g_main_camera.nose = vec3.fromValues(0,0,0);

var g_hud_camera = new OrthographicCamera(-SCRW/2,SCRW/2,SCRH/2,-SCRH/2);
g_hud_camera.setLoc(0,0);

var g_hud_layer = new Layer();
Moyai.insertLayer(g_hud_layer);
g_hud_layer.setViewport(g_viewport2d);
g_hud_layer.setCamera( g_hud_camera );

var g_base_tex = new Texture();
g_base_tex.loadPNG( "./atlas.png", 256,256 );
//g_base_tex.min_filter=Moyai.gl.NEAREST_MIPMAP_NEAREST;  almost no perfomance improvement
var g_base_deck = new TileDeck();
g_base_deck.setTexture(g_base_tex);
g_base_deck.setSize(32,32,8,8);
    






// 
//
//   +y
//    ^
//                     d,d,-d
//     H ------------- G
//    /|              /|
//   / |             / |
//  E ------------- F  |
//  |  |            |  |      -z               7   6
//  |  |            |  |      /               4   5
//  |  D -----------|- C
//  | /             | /
//  |/              |/                         3   2
//  A ------------- B     >   +x              0   1
//  -d,-d,d


var sz=0.5;
var a=vec3.fromValues(-sz,-sz,sz);
var b=vec3.fromValues(sz,-sz,sz);
var c=vec3.fromValues(sz,-sz,-sz);
var d=vec3.fromValues(-sz,-sz,-sz);
var e=vec3.fromValues(-sz,sz,sz);
var f=vec3.fromValues(sz,sz,sz);
var g=vec3.fromValues(sz,sz,-sz);
var h=vec3.fromValues(-sz,sz,-sz);



function setUVByIndex(geom,ind) {
    var uvary = new Float32Array(4);
    g_base_deck.getUVFromIndex(uvary,ind,0,0,0);
    
    var uv_lt=vec2.fromValues(uvary[0],uvary[1]);
    var uv_rt=vec2.fromValues(uvary[2],uvary[1]);
    var uv_lb=vec2.fromValues(uvary[0],uvary[3]);
    var uv_rb=vec2.fromValues(uvary[2],uvary[3]);

    geom.setPosition3v(0,a); geom.setPosition3v(1,b); geom.setPosition3v(2,c); geom.setPosition3v(3,d);//-y
    geom.setPosition3v(4,e); geom.setPosition3v(5,f); geom.setPosition3v(6,g); geom.setPosition3v(7,h);//+y
    geom.setPosition3v(8,a); geom.setPosition3v(9,b); geom.setPosition3v(10,f); geom.setPosition3v(11,e);//+z
    geom.setPosition3v(12,c); geom.setPosition3v(13,d); geom.setPosition3v(14,h); geom.setPosition3v(15,g);//-z
    geom.setPosition3v(16,b); geom.setPosition3v(17,c); geom.setPosition3v(18,g); geom.setPosition3v(19,f);//+x
    geom.setPosition3v(20,d); geom.setPosition3v(21,a); geom.setPosition3v(22,e); geom.setPosition3v(23,h);//-x

    geom.setUV2v(0,uv_lb); geom.setUV2v(1,uv_rb); geom.setUV2v(2,uv_rt); geom.setUV2v(3,uv_lt); // abcd
    geom.setUV2v(4,uv_lb); geom.setUV2v(5,uv_rb); geom.setUV2v(6,uv_rt); geom.setUV2v(7,uv_lt); // efgh
    geom.setUV2v(8,uv_lb); geom.setUV2v(9,uv_rb); geom.setUV2v(10,uv_rt); geom.setUV2v(11,uv_lt); // abfe
    geom.setUV2v(12,uv_lb); geom.setUV2v(13,uv_rb); geom.setUV2v(14,uv_rt); geom.setUV2v(15,uv_lt); // cdhg
    geom.setUV2v(16,uv_lb); geom.setUV2v(17,uv_rb); geom.setUV2v(18,uv_rt); geom.setUV2v(19,uv_lt); // bcgf
    geom.setUV2v(20,uv_lb); geom.setUV2v(21,uv_rb); geom.setUV2v(22,uv_rt); geom.setUV2v(23,uv_lt); // daeh
    
    for(var i=0;i<24;i++) geom.setColor(i, 1,1,1,1);
    
    // bottom
    geom.setFaceInds(0, 0,3,1); // ADB
    geom.setFaceInds(1, 3,2,1); // DCB
    // top
    geom.setFaceInds(2, 7,5,6); // HFG
    geom.setFaceInds(3, 4,5,7); // EFH
    // +z abf, afe
    geom.setFaceInds(4, 8,9,10); // abf
    geom.setFaceInds(5, 8,10,11); // afe
    // -z cdh, chg
    geom.setFaceInds(6, 12,13,14); // cdh
    geom.setFaceInds(7, 12,14,15); // chg
    // front
    geom.setFaceInds(8, 16,17,18); // EAB
    geom.setFaceInds(9, 16,18,19); // EBF
    // rear
    geom.setFaceInds(10, 20,21,22); // HCD
    geom.setFaceInds(11, 20,22,23); // HGC    
}

var g_colshader = new DefaultColorShaderMaterial();
function putCube(loc,ind,col) {
    var geom = new FaceGeometry(6*4,6*2);
    setUVByIndex(geom,ind);
    var p = new Prop3D();
    p.enable_frustum_culling = false;
    p.setGeom(geom);
    p.setMaterial(g_colshader);
    p.setTexture(g_base_tex);
    p.setScl(1,1,1);
    p.setLoc(loc);
    p.setColor(col);
    g_main_layer.insertProp(p);
}
// upside Y is 0
function putGround(x0,z0,x1,z1) {
    for(var z=z0;z<=z1;z++) {
        for(var x=x0;x<=x1;x++) {
            var r=1;
            if((x+z)%2==0) r=0.8;
            var col=vec4.fromValues(0.2*r,0.2*r,0.2*r,1);
            putCube(vec3.fromValues(x+0.5,-1+0.5,z+0.5),4,col);
        }
    }
}

var sz=16;
putGround(-sz,-sz,sz,sz);

function isHitGround(v) {
    return (v[0]>-sz && v[0]<sz+1 && v[1]>0 && v[1]<1 && v[2]>-sz && v[2]<sz+1);
}

// cursor




var linemat=new PrimColorShaderMaterial();
var linegeom = new LineGeometry(24,12);
setLineBoxGeom(linegeom,0.505,0.505,0.505,WHITE);

var g_cursor_prop = new Prop3D();
g_cursor_prop.setGeom(linegeom);
g_cursor_prop.setMaterial(linemat);
g_main_layer.insertProp(g_cursor_prop);
g_cursor_prop.setBlockLoc = function(x,y,z) {
    this.setScl(1.0001,1.0001,1.0001); // 1.0で問題ないはずなのに、ちょっと大きくしないとブロックの中に隠れるようになってしまう。。    
    this.setLoc(Math.floor(x)+0.5,Math.floor(y)+0.5,Math.floor(z)+0.5);
}
g_cursor_prop.setBoundsLoc = function(minv,maxv) {
    var sx=maxv[0]-minv[0], sy=maxv[1]-minv[1], sz=maxv[2]-minv[2];
    this.setScl(sx,sy,sz);
    var d=vec3.fromValues(sx/2,sy/2,sz/2);
    this.setLoc(minv[0]+d[0],minv[1]+d[1],minv[2]+d[2]);
}


g_cursor_prop.prop3DPoll = function(dt) {
    var find_fluid=false;
    var find_spore=false;    


    var cam=g_main_camera.loc;
    var nose = g_main_camera.nose;
    if(!this.dir)this.dir=vec3.create();
    vec3.set(this.dir, nose[0]-cam[0], nose[1]-cam[1], nose[2]-cam[2]);
    if(!this.simray) this.simray=new SimpleRay();
    this.simray.update(cam,this.dir);
    var simray = this.simray;
    var hitpos=[], hitnorm=[], hitbound_minv=null, hitbound_maxv=null;
    var last_hit_pos;
    
    traceVoxelRay( function(x,y,z) {
        if(y==-1) return true; else return false;
    }, cam, this.dir, 15, hitpos, hitnorm );
    var hx=Math.floor(hitpos[0]),hy=Math.floor(hitpos[1]),hz=Math.floor(hitpos[2]);
    if(hitnorm[0]!=0) {
        if(hitnorm[0]==1) hx=hitpos[0]-hitnorm[0]; else hx=hitpos[0];
    } else if(hitnorm[1]!=0) {
        if(hitnorm[1]==1) hy=hitpos[1]-hitnorm[1]; else hy=hitpos[1];
    } else if(hitnorm[2]!=0) {
        if(hitnorm[2]==1) hz=hitpos[2]-hitnorm[2]; else hz=hitpos[2];
    } else {
        //nohit
        this.setVisible(false);
        this.cursor_hit_norm=null;
        return true;
    }

    // カーソル見えてる
    this.setVisible(true);
    this.cursor_hit_norm=hitnorm;

    
    g_cursor_prop.hitbound_minv=hitbound_minv;
    g_cursor_prop.hitbound_maxv=hitbound_maxv;    
    if(hitbound_minv&&hitbound_maxv) {
        g_cursor_prop.setBoundsLoc(vec3.fromValues(hitbound_minv[0],hitbound_minv[1],hitbound_minv[2]),
                                   vec3.fromValues(hitbound_maxv[0],hitbound_maxv[1],hitbound_maxv[2]));
    } else {        
        g_cursor_prop.setBlockLoc(hx,hy,hz);
    }

    return true;
}

///////////////////
var g_cross_prop = new Prop2D();
g_cross_prop.setDeck(g_base_deck);
g_cross_prop.setIndex(5);
g_cross_prop.setScl(32);
g_cross_prop.setLoc(0,0);
g_cross_prop.setColor(Color.fromValues(1,1,1,0.4));
g_hud_layer.insertProp(g_cross_prop);


///////////////////////////////
function tangentMax(theta,absmax) {
    var cs=Math.cos(theta);
    var sn=Math.sin(theta);
    if(cs==0) {
        if(theta>0)return absmax; else return -absmax;
    } else {
        return Math.tan(theta);
    }
}


var last_anim_at = new Date().getTime();
var last_print_at = new Date().getTime();
var fps=0;
var started_at=now();
var pitch=0, yaw=0;
function animate() {
    if(!g_stop_render) requestAnimationFrame(animate);

    fps++;

    var now_time = new Date().getTime();
    var dt = (now_time - last_anim_at) / 1000.0;

    if(now_time > last_print_at+1000) {
        last_print_at=now_time;
        document.getElementById("status").innerHTML = "FPS:"+fps+ "props:" + g_main_layer.props.length + "draw3d:" + Moyai.draw_count_3d + " skip3d:" + Moyai.skip_count_3d;
        fps=0;
    }

    if(g_main_camera) {
        var t=now()-started_at;
        var gravity = -10;
        g_main_camera.vel[1] += gravity * dt;
        var nextloc = vec3.clone(g_main_camera.loc);
        nextloc[0]+=g_main_camera.vel[0] * dt;
        nextloc[1]+=g_main_camera.vel[1] * dt;
        nextloc[2]+=g_main_camera.vel[2] * dt;
        if(isHitGround(nextloc)) {
//        if(nextloc[1]<1) {
            nextloc[1]=1;
            g_main_camera.vel[1]=0;
        }
        vec3.set(g_main_camera.loc,nextloc[0],nextloc[1],nextloc[2]);

        var front=0,side=0;
        if(g_keyboard) {
            if(g_keyboard.getKey('a')) side-=1;
            if(g_keyboard.getKey('d')) side+=1;
            if(g_keyboard.getKey('w')) front+=1;
            if(g_keyboard.getKey('s')) front-=1;
            if(g_keyboard.getKey('Escape')) pointerUnlock();
            if(g_keyboard.getKey(' ')) {
                g_main_camera.vel[1]=3;
            }
        }
        
        if(g_mouse) {
            var dx=g_mouse.movement[0];
            var dy=g_mouse.movement[1];
            g_mouse.clearMovement();
            yaw-=dy/250;
            if(yaw>Math.PI/2) yaw=Math.PI/2;
            if(yaw<-Math.PI/2) yaw=-Math.PI/2;
            pitch+=dx/250;

            g_main_camera.vel[0]*=0.92;
            g_main_camera.vel[2]*=0.92;            

            var side_pitch=pitch;
            if(side<0) side_pitch=pitch-Math.PI/2;
            else if(side>0)side_pitch=pitch+Math.PI/2;
            
            var k=1;
            g_main_camera.vel[0]+=Math.cos(pitch)*k*front + Math.cos(side_pitch)*k*Math.abs(side);
            g_main_camera.vel[2]+=Math.sin(pitch)*k*front + Math.sin(side_pitch)*k*Math.abs(side);

            g_main_camera.nose = vec3.fromValues( g_main_camera.loc[0] + 1.0 * Math.cos(pitch),
                                                  g_main_camera.loc[1] + tangentMax(yaw),
                                                  g_main_camera.loc[2] + 1.0 * Math.sin(pitch) );


            g_main_camera.setLookAt(g_main_camera.nose, vec3.fromValues(0,1,0));            
        }
    }
    
    
    last_anim_at = now_time;    
    Moyai.poll(dt);
    Moyai.render();
}

animate();
