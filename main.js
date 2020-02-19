to_i=Math.floor;

////////////

var SHAPE_CUBE = 0;
var SHAPE_SLOPE = 1;
var IDX_GROUND=0;
var IDX_CROSS=1;


//////////

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


document.addEventListener("keydown", function(e) {
    if(e.code == "Space") e.preventDefault();
});
document.getElementById("screen").addEventListener("mousedown", function(e) {
    pointerLock();
});
document.addEventListener("mousedown", function(e) {
    if(g_cursor_prop.cursor_hit_pos) {
//        console.log("hpos:",g_cursor_prop.cursor_hit_pos, g_cursor_prop.cursor_hit_norm);        
        if(g_cur_tool == TOOL_BLOCK) {
            if(g_cursor_prop.cursor_hit_pos && g_cursor_prop.cursor_hit_norm ) {
                var x=to_i(g_cursor_prop.cursor_hit_pos[0]+g_cursor_prop.cursor_hit_norm[0]*0.5);
                var y=to_i(g_cursor_prop.cursor_hit_pos[1]+g_cursor_prop.cursor_hit_norm[1]*0.5);
                var z=to_i(g_cursor_prop.cursor_hit_pos[2]+g_cursor_prop.cursor_hit_norm[2]*0.5);
                var col=vec4.fromValues(1,1,1,1);//range(0.3,1.0),range(0.3,1.0),range(0.3,1.0),1.0);
                putBlock(x,y,z,g_cur_tool_sub,col);
            }
        } else if(g_cur_tool == TOOL_REMOVE) {
            if(g_cursor_prop.cursor_hit_pos) {
                var x=to_i(g_cursor_prop.cursor_hit_block_pos[0]);
                var y=to_i(g_cursor_prop.cursor_hit_block_pos[1]);
                var z=to_i(g_cursor_prop.cursor_hit_block_pos[2]);
                removeBlock(x,y,z);
            }
        } else if(g_cur_tool == TOOL_PENCIL) {
            if(g_cursor_prop.cursor_hit_block_pos && g_cursor_prop.cursor_hit_norm ) {
                var x=to_i(g_cursor_prop.cursor_hit_block_pos[0]);
                var y=to_i(g_cursor_prop.cursor_hit_block_pos[1]);
                var z=to_i(g_cursor_prop.cursor_hit_block_pos[2]);
                var blk = findBlock(x,y,z);
                if(!blk) console.error("blk must not null");
                
                var vv=getVertSet(blk,g_model_deck);
                console.log("BLK:",blk,vv,g_cursor_prop.cursor_hit_norm);

                // 全部の面について調べるか。
                for(var i=0;i<vv.num_faces;i++) {
                    var face = vv.faces[i];
                    var t={};
                    t.a=vv.positions[vv.faces[i][0]];
                    t.b=vv.positions[vv.faces[i][1]];
                    t.c=vv.positions[vv.faces[i][2]];
                    var p=getPointOnFace(g_cursor_prop.simray,t);
                    if(!p) continue;
                    
                    var uv_a=vv.uvs[vv.faces[i][0]];
                    var uv_b=vv.uvs[vv.faces[i][1]];
                    var uv_c=vv.uvs[vv.faces[i][2]];
                    var uv_ab=vec2.fromValues(uv_b[0]-uv_a[0],uv_b[1]-uv_a[1]);
                    var uv_ac=vec2.fromValues(uv_c[0]-uv_a[0],uv_c[1]-uv_a[1]);
                    var uv_pos=vec2.fromValues(uv_a[0]+uv_ab[0]*p.s+uv_ac[0]*p.t,
                                               uv_a[1]+uv_ab[1]*p.s+uv_ac[1]*p.t);
                    var pix_x = to_i(uv_pos[0]*512);
                    var pix_y = to_i(uv_pos[1]*512);
                    g_model_img.setPixel(pix_x,pix_y,Color.fromValues(1,1,1,1));
                    g_model_tex.setMoyaiImage(g_model_img);
                }                    
            }
        }
    }
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
Moyai.clearColor=Color.fromValues(0.2,0.2,0.2,1);
var screen = document.getElementById("screen");
var canvas=Moyai.getDomElement();
canvas.style="width:100%; height:100%;";
screen.appendChild(canvas);


var g_keyboard = new Keyboard();
g_keyboard.setupBrowser(window);
g_keyboard.preventDefault=true;
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
g_main_camera.flying=false;

var g_hud_camera = new OrthographicCamera(-SCRW/2,SCRW/2,SCRH/2,-SCRH/2);
g_hud_camera.setLoc(0,0);

var g_hud_layer = new Layer();
Moyai.insertLayer(g_hud_layer);
g_hud_layer.setViewport(g_viewport2d);
g_hud_layer.setCamera( g_hud_camera );

var g_atlas_tex = new Texture();
g_atlas_tex.loadPNG( "./atlas.png", 256,256 );
//g_base_tex.min_filter=Moyai.gl.NEAREST_MIPMAP_NEAREST;  almost no perfomance improvement
var g_atlas_deck = new TileDeck();
g_atlas_deck.setTexture(g_atlas_tex);
g_atlas_deck.setSize(16,16,16,16);

var g_model_img = new MoyaiImage();
g_model_img.loadPNG("./modeltex.png",512,512);


var g_model_tex = new Texture();
g_model_img.onload = function() {
    g_model_tex.setMoyaiImage(g_model_img);
    g_model_deck.setTexture(g_model_tex);
}

var g_model_deck = new TileDeck();
g_model_deck.setTexture(g_model_tex);
g_model_deck.setSize(32,32,16,16);

////////////////////////

// model texture UVs allocation
var g_uv_alloc_table = new Int32Array(32*32); 
for(var i in g_uv_alloc_table) g_uv_alloc_table[i]=-1;
function allocateUVIndex() {
    for(var i in g_uv_alloc_table) {
        if(g_uv_alloc_table[i]<0) {
            g_uv_alloc_table[i]=1;
            console.log("allocateUVIndex: found:",i);
            return i;
        }
    }
    console.error("allocateUVIndex: full!");
    return undefined;
}
function freeUVIndex(ind) {
    if(ind===undefined || ind===null) return;
    ind|=0;
    if(ind<0||ind>=g_uv_alloc_table.length) {
        console.error("freeUVIndex: invalid ind:",ind);
        return;
    }
    console.log("freeUVIndex: freed:",ind);
    g_uv_alloc_table[ind]=-1;
}
function getUVIndexSpace() {
    var used=0;
    for(var i=0;i<g_uv_alloc_table.length;i++) {
        if(g_uv_alloc_table[i]==1)used++;
    }
    return g_uv_alloc_table.length-used;
}
////////////////////////

////////////////////

var g_chunks=[];
function findBlock(x,y,z) {
    for(var i in g_chunks) {
        var chk=g_chunks[i];
        var ind = chk.findBlock(x,y,z);
        if(ind>=0) return chk.blocks[ind];
    }
    return null;
}


///////////////

var g_colshader = new DefaultColorShaderMaterial();
var g_collitshader = new DefaultColorLitShaderMaterial();
g_collitshader.setAmbientColor(vec3.fromValues(0.3,0.3,0.3));


function createGroundChunk(x0,z0,x1,z1) {
    var chk=new Chunk(g_atlas_deck);
    for(var z=z0;z<=z1;z++) {
        for(var x=x0;x<=x1;x++) {
            var r=1;
            if((x+z)%2==0) r=0.8;
            r*=0.5;
            var col=vec4.fromValues(r,r,r,1);
            chk.setBlock(x,-1,z,SHAPE_CUBE,col,IDX_GROUND);
        }
    }
    chk.updateMesh();
    g_main_layer.insertProp(chk);
    g_chunks.push(chk);
    return chk;
}
var g_ground_sz=20;
var g_ground_chk=createGroundChunk(-g_ground_sz,-g_ground_sz,g_ground_sz,g_ground_sz);

function getBlockAround6(x,y,z) {
    return [ findBlock(x+1,y,z), findBlock(x-1,y,z),
            findBlock(x,y+1,z), findBlock(x,y-1,z),
            findBlock(x,y,z+1), findBlock(x,y,z-1) ];
}
function findChunkById(id) {
    for(var i in g_chunks) {
        if(g_chunks[i].chunk_id==id) return g_chunks[i];
    }
    return null;
}
function findChunkAt(x,y,z) {
    // check around-6, add when found, otherwise create new chunk
    var blks = getBlockAround6(x,y,z);
    var blk_found;
    for(var i=0;i<6;i++) {
        if(blks[i] && blks[i].chunk_id != g_ground_chk.chunk_id ) {
            blk_found=blks[i];
            break;
        }
    }
    if(!blk_found) return null;
    return findChunkById(blk_found.chunk_id);        
}
function putBlock(x,y,z,shape,col,dkind) {
    var chk = findChunkAt(x,y,z);
    if(chk) {
        chk.setBlock(x,y,z,shape,col,dkind);
        chk.updateMesh();
    } else {
        createNewChunk(x,y,z,shape,col,dkind);        
    }
}

function createNewChunk(x,y,z,shape,col,dkind) {
    var chk=new Chunk(g_model_deck);
    chk.setBlock(x,y,z,shape,col,dkind);
    chk.updateMesh();
    g_main_layer.insertProp(chk);
    g_chunks.push(chk);
    console.log("Created new chunk:",chk.chunk_id);
    return chk;
}

function removeBlock(x,y,z) {
    var blk=findBlock(x,y,z);
    if(!blk) {
        console.log("no block at ",x,y,z);
        return;
    }
    var chk=findChunkById(blk.chunk_id);
    if(!chk) {
        console.error("chk must be found");
        return;
    }
    if(chk.removeBlock(x,y,z)) {
        chk.updateMesh();
    }
}





/////////////////
/////////////////

// cursor


var linemat=new PrimColorShaderMaterial();

var g_cursor_prop = new Prop3D();
//g_cursor_prop.setGeom(linegeom);
g_cursor_prop.setMaterial(linemat);
g_main_layer.insertProp(g_cursor_prop);
g_cursor_prop.setBlockLoc = function(x,y,z) {
    var blk = findBlock(x,y,z);
    if(!blk) {
        console.error("setblockloc: cant find block:",x,y,z);
        return;
    }
    var relv=vec3.fromValues(-x,-y,-z);
    var vv=getVertSet(blk,g_atlas_deck);
    var num_lines = vv.num_faces * 3;
    var linegeom = new LineGeometry(num_lines*2,num_lines);
    for(var i=0;i<vv.num_faces;i++) {
        var a=vec3.clone(vv.positions[vv.faces[i][0]]);
        var b=vec3.clone(vv.positions[vv.faces[i][1]]);
        var c=vec3.clone(vv.positions[vv.faces[i][2]]);
        vec3.add(a,a,relv);
        vec3.add(b,b,relv);
        vec3.add(c,c,relv);        
        
        
//        console.log("AAA:",a,b,c);
        linegeom.setPosition3v(i*6+0,a);
        linegeom.setPosition3v(i*6+1,b);
        linegeom.setPosition3v(i*6+2,b);
        linegeom.setPosition3v(i*6+3,c);
        linegeom.setPosition3v(i*6+4,c);
        linegeom.setPosition3v(i*6+5,a);
        for(var j=0;j<6;j++) {
            linegeom.setColor4v(i*6+j,vec4.fromValues(1,1,1,1));
            linegeom.setIndex(i*6+j,i*6+j);
        }
    }
    this.setGeom(linegeom);
    var mgn=0.002;
    this.setScl(1+mgn*2,1+mgn*2,1+mgn*2); // 1.0で問題ないはずなのに、ちょっと大きくしないとブロックの中に隠れるようになってしまう。。    
    this.setLoc(x-mgn,y-mgn,z-mgn);
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
    var hitpos=[], hitnorm=[], blockpos=[];
    var last_hit_pos;
    
    traceVoxelRay( function(x,y,z) {
        if(x<-g_ground_sz || z<-g_ground_sz || x>g_ground_sz || z>g_ground_sz)return false;
        if(findBlock(x,y,z)) {
            blockpos[0]=x; blockpos[1]=y; blockpos[2]=z;
            return true;
        }
        return false;
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
    this.cursor_hit_pos=hitpos;
    this.cursor_hit_block_pos=blockpos;    
    this.setBlockLoc(hx,hy,hz);


    return true;
}

///////////////////
var g_cross_prop = new Prop2D();
g_cross_prop.setDeck(g_atlas_deck);
g_cross_prop.setIndex(IDX_CROSS);
g_cross_prop.setScl(32);
g_cross_prop.setLoc(0,0);
g_cross_prop.setColor(Color.fromValues(1,1,1,0.7));
g_hud_layer.insertProp(g_cross_prop);


///////////////////////////////
TOOL_BLOCK=1;
TOOL_REMOVE=2;
TOOL_PENCIL=3;

var g_cur_tool_sub;
var g_cur_tool;
function setTool(t,sub) {
    g_cur_tool= t;
    g_cur_tool_sub=sub;
    var nm="unknown";
    if(t==TOOL_BLOCK) nm = "Block";
    else if(t==TOOL_PENCIL) nm="Pencil";
    else if(t==TOOL_REMOVE) nm="Remove";
    document.getElementById("tool").innerHTML="Tool: " + nm + "["+g_cur_tool_sub+"]";
}
setTool(TOOL_BLOCK,SHAPE_CUBE);

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
        document.getElementById("status").innerHTML = "FPS:"+fps+ " props:" + g_main_layer.props.length + " draw3d:" + Moyai.draw_count_3d + " skip3d:" + Moyai.skip_count_3d + " loc:" + g_main_camera.loc + " chk:" + g_chunks.length;
        fps=0;
    }

    if(g_main_camera) {
        var t=now()-started_at;
        var gravity = -10;
        if(g_main_camera.flying) {
            gravity=0;
        } 
        g_main_camera.vel[1] += gravity * dt;        
        var nextloc = vec3.clone(g_main_camera.loc);
        nextloc[0]+=g_main_camera.vel[0] * dt;
        nextloc[1]+=g_main_camera.vel[1] * dt;
        nextloc[2]+=g_main_camera.vel[2] * dt;
        if(nextloc[0]<-g_ground_sz) nextloc[0]=-g_ground_sz;
        if(nextloc[0]>g_ground_sz) nextloc[0]=g_ground_sz;
        if(nextloc[2]<-g_ground_sz) nextloc[2]=-g_ground_sz;
        if(nextloc[2]>g_ground_sz) nextloc[2]=g_ground_sz;
        if(nextloc[1]<1) {
            nextloc[1]=1;
            g_main_camera.vel[1]=0;
        }
        vec3.set(g_main_camera.loc,nextloc[0],nextloc[1],nextloc[2]);

        var front=0,side=0;
        if(g_keyboard) {
            if(g_keyboard.getKey('1')) setTool(TOOL_BLOCK,SHAPE_CUBE);
            if(g_keyboard.getKey('2')) setTool(TOOL_REMOVE);
            if(g_keyboard.getKey('3')) setTool(TOOL_PENCIL);
            if(g_keyboard.getKey('4')) setTool(TOOL_BLOCK,SHAPE_SLOPE);            
            if(g_keyboard.getKey('a')) side-=1;
            if(g_keyboard.getKey('d')) side+=1;
            if(g_keyboard.getKey('w')) front+=1;
            if(g_keyboard.getKey('s')) front-=1;
            if(g_keyboard.getKey('Escape')) pointerUnlock();
            if(g_keyboard.getKey(' ')) {
                g_main_camera.vel[1]=3;
                var t=now();
                if(g_main_camera.jump_at && g_main_camera.last_jump_key==false) {
                    var dt=t-g_main_camera.jump_at;
                    if(dt<0.3) {
                        g_main_camera.flying= !g_main_camera.flying;
                    }
                }
                if(g_main_camera.flying) {
                    if(g_keyboard.mod_shift) {
                        g_main_camera.vel[1]=-2;
                    } else {
                        g_main_camera.vel[1]=2;                        
                    }
                }
                g_main_camera.jump_at=now();
                g_main_camera.last_jump_key=true;
            } else {
                g_main_camera.last_jump_key=false;
                if(g_main_camera.flying) {
                    g_main_camera.vel[1]=0;
                }
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
        var camdir=vec3.fromValues(
            g_main_camera.loc[0] - g_main_camera.nose[0],
            g_main_camera.loc[1] - g_main_camera.nose[1],
            g_main_camera.loc[2] - g_main_camera.nose[2]            
        );
        g_collitshader.setLightDirection(camdir);
    }
    
    
    last_anim_at = now_time;    
    Moyai.poll(dt);
    Moyai.render();
}

animate();

